import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, ScanLine, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  html5-qrcode loader (QR only)                                      */
/* ------------------------------------------------------------------ */

type Html5QrcodeInstance = {
  start: (
    camera: MediaTrackConstraints | { facingMode: string },
    config: { fps: number; qrbox?: { width: number; height: number }; aspectRatio?: number; disableFlip?: boolean },
    onSuccess: (decodedText: string) => void,
    onError: (message: string) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => void;
  scanFile(imageFile: File, showImage?: boolean): Promise<string>;
};

type Html5QrcodeStatic = new (
  elementId: string,
  config: { formatsToSupport: number[]; verbose: boolean; useBarCodeDetectorIfSupported?: boolean },
) => Html5QrcodeInstance;

type Html5QrcodeWindow = {
  Html5Qrcode?: Html5QrcodeStatic;
  Html5QrcodeSupportedFormats?: Record<string, number>;
};

const LIB_URL = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
const READER_ID = "family-qr-reader";

let libPromise: Promise<{ Ctor: Html5QrcodeStatic; formats: Record<string, number> }> | null = null;

function loadLib() {
  if (!libPromise) {
    libPromise = new Promise((resolve, reject) => {
      const w = window as unknown as Html5QrcodeWindow;
      if (w.Html5Qrcode && w.Html5QrcodeSupportedFormats) {
        resolve({ Ctor: w.Html5Qrcode, formats: w.Html5QrcodeSupportedFormats });
        return;
      }
      const script = document.createElement("script");
      script.src = LIB_URL;
      script.async = true;
      script.onload = () => {
        if (w.Html5Qrcode && w.Html5QrcodeSupportedFormats) {
          resolve({ Ctor: w.Html5Qrcode, formats: w.Html5QrcodeSupportedFormats });
        } else reject(new Error("scanner failed to initialise"));
      };
      script.onerror = () => reject(new Error("Could not download the scanner"));
      document.head.appendChild(script);
    });
    libPromise.catch(() => {
      libPromise = null;
    });
  }
  return libPromise;
}

/* ------------------------------------------------------------------ */

export type QrCodeScannerProps = {
  open: boolean;
  onClose: () => void;
  /** Called once with the decoded text; the modal closes itself right after. */
  onResult: (text: string) => void;
  title?: string;
  hint?: string;
};

/** Camera QR scanner in a sheet, with a gallery-photo fallback. */
export function QrCodeScanner({ open, onClose, onResult, title = "Scan invite QR", hint }: QrCodeScannerProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [decodingFile, setDecodingFile] = useState(false);
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const doneRef = useRef(false);

  const stop = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      /* already stopped */
    }
    try {
      scanner.clear();
    } catch {
      /* ignore */
    }
  }, []);

  const finish = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      void stop().then(() => {
        onResult(text.trim());
        onClose();
      });
    },
    [onClose, onResult, stop],
  );

  useEffect(() => {
    if (!open) return;
    doneRef.current = false;
    setError("");
    let cancelled = false;

    void (async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setError("Camera access isn't available here — pick a saved QR photo instead.");
        return;
      }
      setStarting(true);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      try {
        const { Ctor, formats } = await loadLib();
        if (cancelled) return;
        const qr = formats["QR_CODE"];
        const scanner = new Ctor(READER_ID, {
          formatsToSupport: typeof qr === "number" ? [qr] : [],
          verbose: false,
          useBarCodeDetectorIfSupported: true,
        });
        scannerRef.current = scanner;
        const attempts: Array<MediaTrackConstraints | { facingMode: string }> = [
          { facingMode: { ideal: "environment" } } as MediaTrackConstraints,
          { facingMode: "environment" },
          { facingMode: "user" },
        ];
        let started = false;
        let lastError: unknown = null;
        for (const camera of attempts) {
          try {
            await scanner.start(
              camera,
              { fps: 15, qrbox: { width: 240, height: 240 }, disableFlip: false },
              (text) => finish(text),
              () => {
                /* normal while aiming */
              },
            );
            started = true;
            break;
          } catch (attemptError) {
            lastError = attemptError;
            const name = (attemptError as { name?: string })?.name ?? "";
            if (name === "NotAllowedError" || name === "SecurityError") break;
          }
        }
        if (!started) throw lastError ?? new Error("camera failed to start");
        const video = document.querySelector<HTMLVideoElement>(`#${READER_ID} video`);
        video?.setAttribute("playsinline", "true");
      } catch {
        if (!cancelled) setError("We couldn't open the camera. Allow camera access, or use a saved QR photo.");
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      void stop();
    };
  }, [open, finish, stop]);

  const fromFile = async (file: File | undefined) => {
    if (!file) return;
    setDecodingFile(true);
    setError("");
    try {
      const { Ctor, formats } = await loadLib();
      const qr = formats["QR_CODE"];
      const reader = new Ctor(`${READER_ID}-file`, {
        formatsToSupport: typeof qr === "number" ? [qr] : [],
        verbose: false,
      });
      const text = await reader.scanFile(file, false);
      finish(text);
    } catch {
      setError("No QR code found in that photo. Try a clearer, closer picture.");
    } finally {
      setDecodingFile(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-rise w-full max-w-md space-y-4 rounded-t-3xl border border-border bg-card p-5 shadow-soft sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg">
            <ScanLine className="size-4 text-primary" /> {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close scanner"
            className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:bg-accent/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-secondary/60">
          <div id={READER_ID} className="[&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
          <div id={`${READER_ID}-file`} className="hidden" />
          {(starting || decodingFile) && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {decodingFile ? "Reading photo…" : "Starting camera…"}
            </div>
          )}
          {!starting && !decodingFile && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-52 rounded-2xl border-2 border-accent/70" />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {hint ?? "Point the camera at the family invite QR — you'll join the circle automatically."}
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold transition hover:bg-accent/10">
          <ImageIcon className="size-3.5" /> Use a saved QR photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void fromFile(e.target.files?.[0])}
          />
        </label>
      </div>
    </div>
  );
}

export default QrCodeScanner;
