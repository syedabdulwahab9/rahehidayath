import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";

/**
 * Voice search mic — identical in look and behaviour to the mic inside the
 * home page SearchBar: live interim results, several alternatives for better
 * accuracy, a soft pulsing ring while listening and plain-language errors.
 */

type SpeechResultLike = { isFinal: boolean; 0: { transcript: string } };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<SpeechResultLike> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

export function VoiceSearchButton({
  onResult,
  lang = "en-US",
  label = "Search by voice",
}: {
  onResult: (text: string) => void;
  lang?: string;
  label?: string;
}) {
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recRef.current?.abort(), []);

  const startMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setMicError("Voice search isn't supported in this browser.");
      return;
    }
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    setMicError("");

    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        const text = r[0]?.transcript ?? "";
        if (r.isFinal) finalText += text;
        else interim += text;
      }
      onResult((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      setListening(false);
      setMicError(
        e.error === "not-allowed"
          ? "Microphone permission is blocked. Allow it in your browser settings."
          : e.error === "no-speech"
            ? "I didn't catch that — please try again."
            : "Voice search didn't work. Please try again.",
      );
    };
    rec.onend = () => {
      setListening(false);
      const said = finalText.trim();
      if (said) onResult(said);
    };
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={listening ? "Stop voice search" : label}
        aria-pressed={listening}
        title={label}
        onClick={startMic}
        className={`relative rounded-full p-2 transition ${listening ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
      >
        {listening && <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" aria-hidden />}
        <Mic className="relative size-4" />
      </button>

      {(listening || micError) && (
        <span
          role="status"
          className={`absolute right-0 top-full mt-1.5 whitespace-nowrap px-2 text-xs ${listening ? "text-primary" : "text-destructive"}`}
        >
          {listening ? "Listening… speak now" : micError}
        </span>
      )}
    </>
  );
}
