import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  HelpCircle,
  ImageIcon,
  Info,
  Loader2,
  ScanBarcode,
  StopCircle,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { analyseBarcode, type ScanResult } from "@/lib/extra-data";
import { decodePhoto, startLiveScanner, type LiveScannerHandle } from "@/lib/barcode-scanner";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "HD Barcode Scanner — Check Product Origin | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Scan any product barcode in about a second with a full-resolution HD scanner, and see the country that registered it — including Israeli (729) registrations.",
      },
      { property: "og:title", content: "HD Product Barcode Origin Scanner | Raah e Hidayath" },
      {
        property: "og:description",
        content: "Instant, HD barcode scanning that tells you which country registered a product.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Scanner,
});

const HISTORY_KEY = "reh-scan-history";

type Caps = {
  zoom?: { min: number; max: number; step?: number };
  torch?: boolean;
};

/** Zoom/torch are real but not in the DOM lib's MediaTrackCapabilities type. */
function capsOf(track: MediaStreamTrack | null | undefined): Caps {
  const get = (track as unknown as { getCapabilities?: () => Caps } | null | undefined)
    ?.getCapabilities;
  try {
    return get ? (get.call(track) ?? {}) : {};
  } catch {
    return {};
  }
}

function Scanner() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [decodingFile, setDecodingFile] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  /* True when the app runs inside an editor/preview frame, where the browser
     withholds the camera unless the frame itself was granted permission. */
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => {
    try {
      setEmbedded(window.self !== window.top);
    } catch {
      setEmbedded(true);
    }
  }, []);



  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
  const [hardwareZoom, setHardwareZoom] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [engine, setEngine] = useState<"native" | "zxing" | null>(null);
  const [scanMs, setScanMs] = useState<number | null>(null);
  const [resolution, setResolution] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleRef = useRef<LiveScannerHandle | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as ScanResult[]);
    } catch {
      /* ignore */
    }
  }, []);

  const remember = useCallback((r: ScanResult) => {
    setHistory((prev) => {
      const next = [r, ...prev.filter((h) => h.code !== r.code)].slice(0, 12);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const check = useCallback(
    (value: string) => {
      const r = analyseBarcode(value);
      if (!r) {
        setResult(null);
        setError("Enter a valid barcode of at least 8 digits (EAN-8, UPC-A or EAN-13).");
        return;
      }
      setError("");
      setResult(r);
      remember(r);
    },
    [remember],
  );

  const stopCamera = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    setScanning(false);
    setStarting(false);
    setZoomRange(null);
    setHardwareZoom(false);
    setTorchAvailable(false);
    setTorchOn(false);
    setZoom(1);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* Hardware zoom where the camera supports it, CSS zoom everywhere else. */
  const applyZoom = useCallback((value: number) => {
    setZoom(value);
    const track = handleRef.current?.track;
    if (!track || !capsOf(track).zoom) return;

    void track
      .applyConstraints({ advanced: [{ zoom: value }] } as unknown as MediaTrackConstraints)
      .catch(() => undefined);
  }, []);

  const toggleTorch = useCallback(() => {
    const track = handleRef.current?.track;
    if (!track) return;
    const next = !torchOn;
    void track
      .applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints)
      .then(() => setTorchOn(next))
      .catch(() => setTorchAvailable(false));
  }, [torchOn]);

  const startCamera = useCallback(async () => {
    setCameraError("");

    /* Inside an editor/preview iframe the browser only hands over the camera
       when the frame itself was granted the permission. Detect it up front so
       the message we show is the one that actually solves the problem. */
    const framed = typeof window !== "undefined" && window.self !== window.top;

    if (!window.isSecureContext) {
      setCameraError(
        "The camera is blocked because this page is not on a secure HTTPS connection. Open the app through its https:// link, then allow camera access — or use a gallery photo below.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        framed
          ? "This preview frame is not allowed to open the camera. Open the scanner in a new tab for full camera access, or use a gallery photo below."
          : "This browser does not allow camera access. Use the gallery photo option below instead.",
      );
      return;
    }


    setStarting(true);
    setScanning(true);
    setScanMs(null);

    // Let React mount the <video> before we attach a stream to it.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const video = videoRef.current;
    if (!video) {
      setStarting(false);
      return;
    }

    startedAt.current = performance.now();

    try {
      const handle = await startLiveScanner({
        video,
        onResult: (text) => {
          setScanMs(Math.round(performance.now() - startedAt.current));
          setInput(text);
          check(text);
          stopCamera();
          if (typeof navigator.vibrate === "function") navigator.vibrate(40);
        },
        onReady: ({ track, native }) => {
          setEngine(native ? "native" : "zxing");
          setStarting(false);
          const settings = track?.getSettings?.();
          if (settings?.width && settings.height) {
            setResolution(`${settings.width}×${settings.height}`);
          }
          const caps = capsOf(track);
          if (caps.zoom) {
            setHardwareZoom(true);
            setZoomRange({ min: caps.zoom.min || 1, max: caps.zoom.max, step: caps.zoom.step || 0.1 });
            setZoom(caps.zoom.min || 1);
          } else {
            setHardwareZoom(false);
            setZoomRange({ min: 1, max: 4, step: 0.1 });
            setZoom(1);
          }
          setTorchAvailable(Boolean(caps.torch));
        },
      });
      handleRef.current = handle;
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraError(
          framed
            ? "This preview window is not allowed to use the camera. Tap “Open scanner in a new tab” below — the camera works with full access there — or scan a gallery photo."
            : "Camera permission was denied. Tap the lock/AA icon in your browser address bar, allow the camera for this site, then try again — or use a gallery photo below.",
        );
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraError("No usable back camera was found on this device. Try the gallery photo option below.");
      } else if (name === "NotReadableError" || name === "AbortError") {
        setCameraError(
          "Another app or tab is already using the camera. Close it, then tap “Try the camera again” — or scan a gallery photo below.",
        );
      } else {
        setCameraError(
          framed
            ? "The camera could not start inside this preview window. Open the scanner in a new tab for full camera access, or use a gallery photo below."
            : "Could not start the camera here. Allow camera permission, make sure you are on the https:// link, or use a gallery photo below.",
        );
      }
      stopCamera();
    }
  }, [check, stopCamera]);


  /* ---- Gallery upload: photograph of the barcode, decoded on-device ---- */
  const readPhoto = useCallback(
    async (file: File | null) => {
      if (!file) return;
      stopCamera();
      setDecodingFile(true);
      setCameraError("");
      const began = performance.now();
      try {
        const text = await decodePhoto(file);
        if (!text) throw new Error("no barcode");
        setScanMs(Math.round(performance.now() - began));
        setInput(text);
        check(text);
      } catch {
        setCameraError(
          "No barcode could be read in that photo. Crop close to the bars, keep them straight and well lit — or type the digits printed under the bars.",
        );
      } finally {
        setDecodingFile(false);
      }
    },
    [check, stopCamera],
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Product Barcode Scanner"
        subtitle="HD, full-resolution scanning — most barcodes verify in about a second"
      />

      <Card className="space-y-4">
        <h2 className="sr-only">Scan a barcode</h2>

        <div className="flex flex-wrap gap-2">
          {!scanning ? (
            <button
              onClick={() => void startCamera()}
              disabled={starting}
              className="inline-flex min-h-11 items-center gap-2 rounded-full gradient-hero px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Camera className="size-4" aria-hidden /> Scan with camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold"
            >
              <StopCircle className="size-4" aria-hidden /> Stop camera
            </button>
          )}

          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:text-primary focus-within:ring-2 focus-within:ring-primary">
            {decodingFile ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ImageIcon className="size-4" aria-hidden />
            )}
            {decodingFile ? "Reading photo…" : "Upload barcode photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void readPhoto(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* Live HD camera feed */}
        <div className={scanning ? "space-y-3" : "hidden"}>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="h-72 w-full origin-center object-cover transition-transform duration-150"
              style={{ transform: hardwareZoom ? undefined : `scale(${zoom})` }}
            />

            {/* Aiming strip: matches the region the decoder actually reads. */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-[27%] bg-black/45" />
              <div className="absolute inset-x-0 bottom-0 h-[27%] bg-black/45" />
              <div className="absolute inset-x-4 top-[27%] h-[46%] rounded-xl border-2 border-accent/80">
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-accent shadow-glow" />
              </div>
            </div>

            {starting && (
              <p className="absolute inset-0 grid place-items-center bg-black/60 text-sm text-primary-foreground">
                <span>
                  <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden /> Starting the HD camera…
                </span>
              </p>
            )}

            {torchAvailable && (
              <button
                onClick={toggleTorch}
                aria-label={torchOn ? "Turn torch off" : "Turn torch on"}
                className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-black/55 text-primary-foreground backdrop-blur"
              >
                {torchOn ? <ZapOff className="size-4" /> : <Zap className="size-4" />}
              </button>
            )}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground">
            <p className="min-w-0 truncate">
              {engine === "native"
                ? "Hardware barcode engine · every frame"
                : "High-precision engine · every frame"}
              {resolution ? ` · ${resolution}` : ""}
            </p>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              HD
            </span>
          </div>

          {zoomRange && (
            <label className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="shrink-0 font-medium">Zoom {zoom.toFixed(1)}×</span>
              <input
                type="range"
                min={zoomRange.min}
                max={zoomRange.max}
                step={zoomRange.step}
                value={zoom}
                onChange={(e) => applyZoom(Number(e.target.value))}
                className="h-11 w-full accent-[hsl(var(--primary))]"
                aria-label="Camera zoom"
              />
            </label>
          )}

          <p className="text-xs text-muted-foreground">
            Fill the bright strip with the bars — hold about 10-15 cm away and keep the phone steady.
          </p>
        </div>

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void readPhoto(e.dataTransfer.files?.[0] ?? null);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-center text-sm transition hover:border-primary hover:text-primary"
        >
          <ImageIcon className="size-5" aria-hidden />
          <span className="font-semibold">
            {decodingFile ? "Reading your image…" : "Upload or drop a barcode image"}
          </span>
          <span className="text-xs text-muted-foreground">
            Any photo, screenshot or gallery image — it is read on your device and scanned instantly.
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void readPhoto(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>

        {cameraError && (
          <div
            role="status"
            className="space-y-3 rounded-2xl border border-accent/50 bg-accent/10 p-4 text-sm shadow-soft"
          >
            <p className="flex items-start gap-2 font-medium text-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {cameraError}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startCamera()}
                className="inline-flex min-h-10 items-center rounded-full gradient-hero px-4 text-xs font-semibold text-primary-foreground"
              >
                Try the camera again
              </button>
              {embedded && (
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
                  className="inline-flex min-h-10 items-center rounded-full border border-primary/40 px-4 text-xs font-semibold text-primary"
                >
                  Open scanner in a new tab
                </button>
              )}
            </div>
          </div>
        )}


        <form
          onSubmit={(e) => {
            e.preventDefault();
            check(input);
          }}
          className="space-y-2"
        >
          <label htmlFor="barcode-input" className="block text-sm font-medium">
            Or type the barcode number
          </label>
          <div className="flex gap-2">
            <input
              id="barcode-input"
              value={input}
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 7290000066318"
              aria-describedby="barcode-help"
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl gradient-hero px-4 text-sm font-semibold text-primary-foreground"
            >
              <ScanBarcode className="size-4" aria-hidden /> Check
            </button>
          </div>
          <p id="barcode-help" className="text-xs text-muted-foreground">
            Works with EAN-13, UPC-A and EAN-8 numbers printed under the bars.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </Card>

      <div aria-live="polite">
        {result && <ResultCard result={result} scanMs={scanMs} />}
      </div>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-lg">
          <HelpCircle className="size-4 text-primary" aria-hidden /> How to read the result
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• The first three digits of a barcode are the GS1 prefix of the country where the company registered the product.</li>
          <li>• <strong className="text-foreground">729</strong> is GS1 Israel.</li>
          <li>• A prefix shows the registering company's country — it does not always match where the item was manufactured, and a multinational may register locally.</li>
          <li>• Use the result as a first check, then confirm with the label or the manufacturer.</li>
        </ul>
      </Card>

      {history.length > 0 && (
        <section aria-labelledby="scan-history" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="scan-history" className="font-display text-xl">
              Recent checks
            </h2>
            <button
              onClick={() => {
                setHistory([]);
                try {
                  localStorage.removeItem(HISTORY_KEY);
                } catch {
                  /* ignore */
                }
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-sm text-muted-foreground hover:text-primary"
            >
              <X className="size-4" aria-hidden /> Clear
            </button>
          </div>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.code}>
                <Card className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-sm">{h.code}</span>
                    <span className="block truncate text-xs text-muted-foreground">{h.country}</span>
                  </span>
                  <VerdictPill verdict={h.verdict} />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function VerdictPill({ verdict }: { verdict: ScanResult["verdict"] }) {
  const map = {
    israeli: { text: "Israeli (729)", cls: "bg-destructive/15 text-destructive" },
    flagged: { text: "Check further", cls: "bg-accent/20 text-accent-foreground" },
    clear: { text: "Not Israeli", cls: "bg-primary/15 text-primary" },
    unknown: { text: "Unknown", cls: "bg-secondary text-muted-foreground" },
  } as const;
  const v = map[verdict];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${v.cls}`}>{v.text}</span>;
}

function ResultCard({ result, scanMs }: { result: ScanResult; scanMs: number | null }) {
  const is729 = result.code.startsWith("729");
  const Icon = is729 ? AlertTriangle : CheckCircle2;
  return (
    <Card className={`space-y-3 ${is729 ? "border-destructive/60" : "border-primary/50"}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <Icon className={`mt-0.5 size-7 shrink-0 ${is729 ? "text-destructive" : "text-primary"}`} aria-hidden />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-display text-xl ${is729 ? "text-destructive" : "text-primary"}`}>
              {is729 ? "Prefix 729 Detected" : "Standard Product Detected"}
            </p>
            <VerdictPill verdict={result.verdict} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
          {scanMs != null && (
            <p className="mt-1 text-xs font-semibold text-primary">
              Verified in {(scanMs / 1000).toFixed(2)}s
            </p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Barcode</dt>
          <dd className="truncate font-mono">{result.code}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">GS1 prefix</dt>
          <dd className="font-mono">{result.prefix}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Registered country</dt>
          <dd className="break-words">{result.country}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Checksum</dt>
          <dd>{result.validChecksum === null ? "Not applicable" : result.validChecksum ? "Valid ✓" : "Invalid ✗"}</dd>
        </div>
      </dl>

      {result.brandNote && <p className="text-sm text-muted-foreground">{result.brandNote}</p>}
    </Card>
  );
}
