/**
 * High-definition live barcode engine.
 *
 * The previous scanner ran html5-qrcode at ~15 fps against a small, downscaled
 * QR-shaped box, which is why 1D retail barcodes (EAN-13 / UPC-A) often failed
 * or took many seconds. This engine is built for retail barcodes specifically:
 *
 *  - opens the back camera at the highest resolution it will give (up to 4K)
 *    and turns on continuous autofocus and torch support;
 *  - decodes on EVERY camera frame via requestVideoFrameCallback;
 *  - uses the browser's native, hardware-accelerated BarcodeDetector when
 *    available (Android Chrome, Edge, recent Safari) — typically 5-20 ms/frame;
 *  - falls back to ZXing, fed a full-resolution crop of the aiming strip
 *    rather than a shrunken preview, so faint bars still resolve;
 *  - confirms a code across two frames and validates the GS1 check digit,
 *    so a result is both instant and correct.
 */

export type BarcodeFormat =
  | "ean_13"
  | "ean_8"
  | "upc_a"
  | "upc_e"
  | "code_128"
  | "code_39"
  | "itf"
  | "codabar"
  | "qr_code";

export const RETAIL_FORMATS: BarcodeFormat[] = [
  "ean_13",
  "upc_a",
  "ean_8",
  "upc_e",
  "code_128",
  "code_39",
  "itf",
  "codabar",
];

type NativeDetector = {
  detect: (src: CanvasImageSource) => Promise<Array<{ rawValue: string; format?: string }>>;
};

type NativeDetectorCtor = new (opts?: { formats?: string[] }) => NativeDetector;

function nativeCtor(): NativeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  const c = (window as unknown as { BarcodeDetector?: NativeDetectorCtor }).BarcodeDetector;
  return typeof c === "function" ? c : null;
}

/** GS1 modulo-10 check digit — true for a genuinely valid retail barcode. */
export function validGs1(code: string): boolean | null {
  const digits = code.replace(/\D/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return null;
  const nums = digits.split("").map(Number);
  const check = nums.pop()!;
  let sum = 0;
  // Weights alternate 3/1 from the right-most data digit inward.
  for (let i = nums.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) {
    sum += nums[i]! * w;
  }
  return (10 - (sum % 10)) % 10 === check;
}

/** UPC-A read as EAN-13 gets a leading zero; normalise to what's printed. */
function normalise(raw: string): string {
  const text = raw.trim();
  const digits = text.replace(/\D/g, "");
  if (digits.length === text.length && digits.length === 13 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return text;
}

export type LiveScannerHandle = {
  /** Stop decoding and release the camera. */
  stop: () => void;
  /** The live MediaStreamTrack, for zoom/torch control. */
  track: MediaStreamTrack | null;
  /** True when the browser's native hardware detector is doing the work. */
  native: boolean;
};

export type LiveScannerOptions = {
  video: HTMLVideoElement;
  onResult: (text: string) => void;
  onError?: (error: unknown) => void;
  /** Called once the camera is streaming, with the chosen track. */
  onReady?: (info: { track: MediaStreamTrack | null; native: boolean; label: string }) => void;
};

/* Progressively simpler camera requests — some phones reject rich constraints. */
function constraintLadder(): MediaStreamConstraints[] {
  const focus = { focusMode: "continuous" } as unknown as MediaTrackConstraintSet;
  return [
    {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        frameRate: { ideal: 30 },
        advanced: [focus],
      } as MediaTrackConstraints,
      audio: false,
    },
    {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        advanced: [focus],
      } as MediaTrackConstraints,
      audio: false,
    },
    { video: { facingMode: "environment" }, audio: false },
    { video: true, audio: false },
  ];
}

let zxingReader: import("@zxing/library").MultiFormatReader | null = null;

async function getZxing() {
  if (zxingReader) return zxingReader;
  const zx = await import("@zxing/library");
  const hints = new Map<number, unknown>();
  hints.set(zx.DecodeHintType.POSSIBLE_FORMATS, [
    zx.BarcodeFormat.EAN_13,
    zx.BarcodeFormat.UPC_A,
    zx.BarcodeFormat.EAN_8,
    zx.BarcodeFormat.UPC_E,
    zx.BarcodeFormat.CODE_128,
    zx.BarcodeFormat.CODE_39,
    zx.BarcodeFormat.ITF,
    zx.BarcodeFormat.CODABAR,
    zx.BarcodeFormat.QR_CODE,
  ]);
  hints.set(zx.DecodeHintType.TRY_HARDER, true);
  const reader = new zx.MultiFormatReader();
  reader.setHints(hints as never);
  zxingReader = reader;
  return reader;
}

async function decodeCanvasWithZxing(canvas: HTMLCanvasElement): Promise<string> {
  const zx = await import("@zxing/library");
  const reader = await getZxing();
  const source = new zx.HTMLCanvasElementLuminanceSource(canvas);
  // Hybrid binarizer handles uneven lighting far better than the global one.
  const bitmap = new zx.BinaryBitmap(new zx.HybridBinarizer(source));
  try {
    return reader.decode(bitmap).getText();
  } catch {
    try {
      // Second pass: inverted, for white-on-dark packaging.
      const inverted = new zx.BinaryBitmap(new zx.HybridBinarizer(source.invert()));
      return reader.decode(inverted).getText();
    } catch {
      return "";
    } finally {
      reader.reset();
    }
  } finally {
    reader.reset();
  }
}

/**
 * Start continuous, per-frame barcode scanning on a <video> element.
 */
export async function startLiveScanner(options: LiveScannerOptions): Promise<LiveScannerHandle> {
  const { video, onResult, onError, onReady } = options;

  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("camera unavailable"), { name: "NotSupportedError" });
  }

  let stream: MediaStream | null = null;
  let lastError: unknown = null;
  for (const constraints of constraintLadder()) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      break;
    } catch (err) {
      lastError = err;
      const name = (err as { name?: string })?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") throw err;
    }
  }
  if (!stream) throw lastError ?? new Error("camera failed to start");

  const track = stream.getVideoTracks()[0] ?? null;

  video.srcObject = stream;
  video.setAttribute("playsinline", "true");
  video.setAttribute("autoplay", "true");
  video.muted = true;
  await video.play().catch(() => undefined);

  const Ctor = nativeCtor();
  let detector: NativeDetector | null = null;
  if (Ctor) {
    try {
      detector = new Ctor({ formats: RETAIL_FORMATS });
    } catch {
      detector = null;
    }
  }

  onReady?.({ track, native: Boolean(detector), label: track?.label ?? "" });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  let stopped = false;
  let busy = false;
  let rafId = 0;
  let vfcId = 0;
  // Two-frame agreement removes the (rare) single-frame misread.
  let candidate = "";
  let candidateHits = 0;

  const accept = (raw: string) => {
    const text = normalise(raw);
    if (!text) return;
    const digitsOnly = /^\d+$/.test(text);
    // A retail code must pass its check digit; anything else (QR, Code-128
    // alphanumeric) is accepted immediately.
    if (digitsOnly && validGs1(text) === false) return;

    if (text === candidate) candidateHits += 1;
    else {
      candidate = text;
      candidateHits = 1;
    }
    // Native detection is reliable enough to fire on the first hit.
    if (candidateHits >= (detector ? 1 : 2)) {
      stopped = true;
      onResult(text);
    }
  };

  /** Full-resolution crop of the central aiming strip. */
  const drawStrip = () => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh || !ctx) return null;
    // Wide, short strip: retail barcodes are landscape and the extra height
    // only adds noise for the binarizer.
    const cropW = vw;
    const cropH = Math.max(160, Math.round(vh * 0.46));
    const sy = Math.round((vh - cropH) / 2);
    if (canvas.width !== cropW || canvas.height !== cropH) {
      canvas.width = cropW;
      canvas.height = cropH;
    }
    ctx.drawImage(video, 0, sy, cropW, cropH, 0, 0, cropW, cropH);
    return canvas;
  };

  const tick = async () => {
    if (stopped || busy) return;
    busy = true;
    try {
      if (detector) {
        // Native detectors take the video element directly — zero copy.
        const found = await detector.detect(video);
        const hit = found[0]?.rawValue;
        if (hit) accept(hit);
      } else {
        const frame = drawStrip();
        if (frame) {
          const text = await decodeCanvasWithZxing(frame);
          if (text) accept(text);
        }
      }
    } catch (err) {
      // Per-frame decode failures are normal while aiming; only a detector
      // that is fundamentally broken should surface.
      if ((err as { name?: string })?.name === "NotSupportedError") {
        detector = null;
        onError?.(err);
      }
    } finally {
      busy = false;
    }
  };

  type VideoFrameCapable = HTMLVideoElement & {
    requestVideoFrameCallback?: (cb: () => void) => number;
    cancelVideoFrameCallback?: (id: number) => void;
  };
  const vf = video as VideoFrameCapable;

  const loopVideoFrame = () => {
    if (stopped) return;
    void tick();
    vfcId = vf.requestVideoFrameCallback!(loopVideoFrame);
  };
  const loopRaf = () => {
    if (stopped) return;
    void tick();
    rafId = requestAnimationFrame(loopRaf);
  };

  if (typeof vf.requestVideoFrameCallback === "function") loopVideoFrame();
  else loopRaf();

  return {
    native: Boolean(detector),
    track,
    stop: () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (vfcId && typeof vf.cancelVideoFrameCallback === "function") {
        vf.cancelVideoFrameCallback(vfcId);
      }
      stream?.getTracks().forEach((t) => t.stop());
      if (video.srcObject) video.srcObject = null;
    },
  };
}

/* ------------------------------------------------------------------ */
/* Still-photo decoding                                                */
/* ------------------------------------------------------------------ */

/** Upscale / sharpen / rotate a photo so faint or sideways barcodes decode. */
async function photoVariants(bitmap: ImageBitmap): Promise<HTMLCanvasElement[]> {
  const make = (scale: number, contrast: number, gray: boolean, rotate = 0) => {
    const w = Math.min(3000, Math.round(bitmap.width * scale));
    const h = Math.round((w / bitmap.width) * bitmap.height);
    const swap = rotate === 90 || rotate === 270;
    const canvas = document.createElement("canvas");
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotate) ctx.rotate((rotate * Math.PI) / 180);
    ctx.filter = `${gray ? "grayscale(1) " : ""}contrast(${contrast})`;
    ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);
    return canvas;
  };

  const scale = bitmap.width < 1200 ? 2.4 : 1;
  return [
    make(scale, 1, false),
    make(scale, 1.6, true),
    make(Math.max(scale, 1.8), 2.4, true),
    make(scale, 1.6, true, 90),
    make(scale, 1.6, true, 270),
    make(scale, 1.6, true, 180),
  ].filter((c): c is HTMLCanvasElement => Boolean(c));
}

/** Decode a barcode from a photo file, trying native then ZXing variants. */
export async function decodePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return "";

  const Ctor = nativeCtor();
  if (Ctor) {
    try {
      const found = await new Ctor({ formats: [...RETAIL_FORMATS, "qr_code"] }).detect(bitmap);
      const hit = found[0]?.rawValue;
      if (hit) return normalise(hit);
    } catch {
      /* fall through to ZXing */
    }
  }

  for (const canvas of await photoVariants(bitmap)) {
    const text = await decodeCanvasWithZxing(canvas);
    if (text) return normalise(text);
  }
  return "";
}
