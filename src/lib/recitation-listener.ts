/**
 * Continuous microphone capture for the Quran teacher.
 *
 * One microphone stream stays open for the whole lesson. The learner's voice is
 * cut into complete, decodable 16 kHz mono WAV clips at natural pauses (or
 * every few seconds of unbroken recitation), so a clip always ends on a word
 * boundary and never on half a word.
 *
 * The capture layer makes no judgement about *what* was recited — it only
 * reports sound, clips, and honest failures.
 */

const TARGET_RATE = 16_000;
/** Longest clip before it is sent even if the learner has not paused. */
const MAX_WINDOW_MS = 2600;
/** A pause this long closes the phrase. */
const SILENCE_MS = 320;
const SILENCE_LEVEL = 0.012;
const MIN_SPEECH_MS = 260;
/** Below this peak over a whole clip the microphone is effectively too quiet. */
const LOW_LEVEL_PEAK = 0.045;

export type ListenerFailure = "denied" | "unsupported" | "no-device" | "lost" | "unknown";

export type ListenerEvents = {
  onClip: (wav: Blob, meta: { peak: number; durationMs: number }) => void;
  /** 0..1 loudness for the live meter. */
  onLevel?: (level: number) => void;
  /** Microphone is receiving sound, but far too quietly to recognise. */
  onLowVolume?: () => void;
  onFailure?: (kind: ListenerFailure, message: string) => void;
};

const MESSAGES: Record<ListenerFailure, string> = {
  denied: "Microphone permission is required for Quran Teacher.",
  unsupported: "Your browser does not support the required voice-recognition feature. Please use a supported browser.",
  "no-device": "No microphone was found on this device.",
  lost: "The microphone disconnected. Reconnecting…",
  unknown: "The microphone could not be started.",
};

export class RecitationListener {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private sink: GainNode | null = null;
  private chunks: Float32Array[] = [];
  private samples = 0;
  private speechSamples = 0;
  private silenceSamples = 0;
  private clipPeak = 0;
  private paused = false;
  private stopped = false;
  private quietClips = 0;

  constructor(private events: ListenerEvents) {}

  get listening() {
    return this.ctx !== null;
  }

  async start() {
    if (this.ctx) return;
    this.stopped = false;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      this.fail("unsupported");
      throw new Error(MESSAGES.unsupported);
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      const kind: ListenerFailure =
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "no-device"
            : "unknown";
      this.fail(kind);
      throw new Error(MESSAGES[kind]);
    }

    this.stream = stream;
    /* If the device is unplugged or the OS takes the mic, recover silently. */
    stream.getAudioTracks().forEach((track) => {
      track.onended = () => {
        if (this.stopped) return;
        this.fail("lost");
        void this.restart();
      };
    });

    const ctx = new AudioContext();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume().catch(() => undefined);

    const source = ctx.createMediaStreamSource(stream);
    this.source = source;
    const node = ctx.createScriptProcessor(4096, 1, 1);
    this.node = node;

    node.onaudioprocess = (e) => {
      if (this.paused || this.stopped) return;
      const input = e.inputBuffer.getChannelData(0);
      const frame = new Float32Array(input.length);
      frame.set(input);
      this.chunks.push(frame);
      this.samples += frame.length;

      let peak = 0;
      for (let i = 0; i < frame.length; i++) {
        const v = Math.abs(frame[i] ?? 0);
        if (v > peak) peak = v;
      }
      if (peak > this.clipPeak) this.clipPeak = peak;
      this.events.onLevel?.(Math.min(1, peak * 3));

      const rate = ctx.sampleRate;
      if (peak > SILENCE_LEVEL) {
        this.speechSamples += frame.length;
        this.silenceSamples = 0;
      } else {
        this.silenceSamples += frame.length;
      }

      const windowMs = (this.samples / rate) * 1000;
      const speechMs = (this.speechSamples / rate) * 1000;
      const silenceMs = (this.silenceSamples / rate) * 1000;

      if (speechMs < MIN_SPEECH_MS) {
        if (windowMs > 2000) this.reset();
        return;
      }
      if (silenceMs >= SILENCE_MS || windowMs >= MAX_WINDOW_MS) this.flush();
    };

    source.connect(node);
    const sink = ctx.createGain();
    sink.gain.value = 0;
    this.sink = sink;
    node.connect(sink);
    sink.connect(ctx.destination);
  }

  /** Stop sending clips (while the teacher's own audio is playing). */
  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.reset();
  }

  private fail(kind: ListenerFailure) {
    this.events.onFailure?.(kind, MESSAGES[kind]);
  }

  /** Rebuild the whole capture chain without touching Quran progress. */
  private async restart() {
    await this.teardown();
    if (this.stopped) return;
    try {
      await this.start();
    } catch {
      /* start() already reported the reason. */
    }
  }

  private reset() {
    this.chunks = [];
    this.samples = 0;
    this.speechSamples = 0;
    this.silenceSamples = 0;
    this.clipPeak = 0;
  }

  private flush() {
    const rate = this.ctx?.sampleRate ?? TARGET_RATE;
    const merged = merge(this.chunks, this.samples);
    const peak = this.clipPeak;
    const durationMs = (this.samples / rate) * 1000;
    this.reset();
    if (!merged.length) return;

    if (peak < LOW_LEVEL_PEAK) {
      this.quietClips += 1;
      if (this.quietClips >= 2) {
        this.quietClips = 0;
        this.events.onLowVolume?.();
      }
      return;
    }
    this.quietClips = 0;

    const wav = encodeWav(downsample(merged, rate, TARGET_RATE), TARGET_RATE);
    if (wav.size < 4000) return;
    this.events.onClip(wav, { peak, durationMs });
  }

  private async teardown() {
    this.reset();
    this.node?.disconnect();
    this.sink?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    if (this.ctx) await this.ctx.close().catch(() => undefined);
    this.node = null;
    this.sink = null;
    this.source = null;
    this.stream = null;
    this.ctx = null;
  }

  async stop() {
    this.stopped = true;
    await this.teardown();
    this.events.onLevel?.(0);
  }
}

function merge(chunks: Float32Array[], total: number) {
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function downsample(input: Float32Array, from: number, to: number) {
  if (to >= from) return input;
  const ratio = from / to;
  const length = Math.floor(input.length / ratio);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j] ?? 0;
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

function encodeWav(samples: Float32Array, rate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function blobToBase64(blob: Blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < buf.length; i += step) {
    binary += String.fromCharCode(...buf.subarray(i, i + step));
  }
  return btoa(binary);
}
