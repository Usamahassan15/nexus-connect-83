import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, RotateCcw, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserId } from "@/lib/rideUser";
import { toast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onVerified: (path: string, percent: number) => void;
};

export default function SelfieVerificationDialog({ open, onOpenChange, onVerified }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [hint, setHint] = useState("Tap Start Camera to begin");
  const [message, setMessage] = useState("Slowly turn your head left, then right");
  const rangeRef = useRef<{ minX: number; maxX: number; minW: number; maxW: number } | null>(null);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!open) {
      stop();
      setPercent(0);
      setStatus("idle");
      setErrorMsg("");
      setHint("Tap Start Camera to begin");
      rangeRef.current = null;
    }
    return () => { if (!open) stop(); };
  }, [open]);

  const startCamera = async () => {
    setStatus("starting");
    setErrorMsg("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMsg("Your browser does not support camera access. Try Chrome or Safari.");
      return;
    }

    // Preview iframe usually blocks camera. Detect it.
    const inIframe = window.self !== window.top;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setStatus("scanning");
      setHint("Keep face centered inside the circle");
      // video element is always mounted, attach on next frame
      requestAnimationFrame(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch {}
        }
        startDetection();
      });
    } catch (e: any) {
      setStatus("error");
      const name = e?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setErrorMsg(
          inIframe
            ? "Camera is blocked inside the preview. Open the app in a new tab (top-right ↗ icon) and try again."
            : "Camera permission denied. Enable camera for this site in your browser settings and reload."
        );
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setErrorMsg("No camera found on this device.");
      } else if (name === "NotReadableError") {
        setErrorMsg("Camera is being used by another app. Close it and try again.");
      } else {
        setErrorMsg(`Couldn't access camera (${name || "unknown error"}). Try opening in a new tab.`);
      }
    }
  };

  const startDetection = () => {
    // @ts-ignore
    const FD = (window as any).FaceDetector;
    const detector = FD ? new FD({ fastMode: true, maxDetectedFaces: 1 }) : null;
    const work = document.createElement("canvas");
    work.width = 48; work.height = 48;
    const wctx = work.getContext("2d", { willReadFrequently: true })!;

    let lastDetected = 0;
    const tick = async () => {
      const v = videoRef.current;
      if (!v || v.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }
      try {
        let nx: number | null = null;
        let nw = 0;

        if (detector) {
          const faces = await detector.detect(v);
          if (faces && faces[0]) {
            const b = faces[0].boundingBox;
            const vw = v.videoWidth || 640;
            nx = (b.x + b.width / 2) / vw;
            nw = b.width / vw;
          }
        } else {
          // Fallback: track horizontal brightness centroid — shifts when head turns
          wctx.drawImage(v, 0, 0, work.width, work.height);
          const { data } = wctx.getImageData(0, 0, work.width, work.height);
          let sum = 0, weighted = 0;
          for (let y = 0; y < work.height; y++) {
            for (let x = 0; x < work.width; x++) {
              const i = (y * work.width + x) * 4;
              const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
              const w = lum * lum;
              sum += w;
              weighted += w * x;
            }
          }
          if (sum > 0.5) {
            nx = weighted / sum / work.width;
            nw = 0.5;
          }
        }

        if (nx !== null) {
          lastDetected = performance.now();
          const r = rangeRef.current ?? { minX: nx, maxX: nx, minW: nw, maxW: nw };
          r.minX = Math.min(r.minX, nx);
          r.maxX = Math.max(r.maxX, nx);
          r.minW = Math.min(r.minW, nw);
          r.maxW = Math.max(r.maxW, nw);
          rangeRef.current = r;

          const xRange = r.maxX - r.minX;
          const target = detector ? 0.32 : 0.14;
          const wRange = detector && r.maxW > 0 ? (r.maxW - r.minW) / r.maxW : 0;
          const raw = detector
            ? (xRange / target) * 0.75 + (wRange / 0.35) * 0.25
            : xRange / target;
          const pct = Math.max(0, Math.min(1, raw)) * 100;
          setPercent(prev => Math.max(prev, Math.round(pct)));

          if (pct < 20) setMessage("Slowly turn your head to the LEFT");
          else if (pct < 55) setMessage("Now turn your head to the RIGHT");
          else if (pct < 95) setMessage("Almost there — complete the turn");
          else setMessage("Great! Verified");
          setHint("Face detected");
        } else if (performance.now() - lastDetected > 1500) {
          setHint("No face detected — center your face");
        }
      } catch {/* ignore */}
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };


  const capture = async () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    const size = 512;
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;
    const vw = v.videoWidth, vh = v.videoHeight;
    const s = Math.min(vw, vh);
    ctx.save();
    ctx.translate(size, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, size, size);
    ctx.restore();
    const blob: Blob = await new Promise(res => c.toBlob(b => res(b!), "image/jpeg", 0.9)!);
    setStatus("uploading");
    const uid = getUserId();
    const path = `${uid}/selfie-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("driver-docs").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      toast({ title: "Upload failed", description: error.message });
      return;
    }
    setStatus("done");
    onVerified(path, percent);
    setTimeout(() => { stop(); onOpenChange(false); }, 800);
  };

  const reset = () => { rangeRef.current = null; setPercent(0); setMessage("Slowly turn your head left, then right"); };

  const R = 130;
  const C = 2 * Math.PI * R;
  const offset = C - (percent / 100) * C;
  const showVideo = status === "scanning" || status === "uploading" || status === "done";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) stop(); onOpenChange(o); }}>
      <DialogContent className="max-w-md p-0 bg-white text-gray-900 border-0 overflow-hidden">
        <div className="relative bg-white flex flex-col items-center py-6 px-4">
          <button onClick={() => { stop(); onOpenChange(false); }} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 z-10">
            <X className="w-5 h-5" />
          </button>
          <DialogTitle className="text-base font-semibold mb-1">360° Selfie Verification</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mb-4">Verify you're human by turning your head</DialogDescription>

          <div className="relative" style={{ width: 300, height: 300 }}>
            <svg width="300" height="300" className="absolute inset-0 -rotate-90">
              <circle cx="150" cy="150" r={R} stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="150" cy="150" r={R}
                stroke={percent >= 100 ? "#10b981" : "hsl(199 100% 50%)"}
                strokeWidth="8" fill="none"
                strokeDasharray={C}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.2s linear" }}
              />
            </svg>
            <div className="absolute inset-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover ${showVideo ? "opacity-100" : "opacity-0"}`}
                style={{ transform: "scaleX(-1)" }}
              />
              {status === "error" ? (
                <div className="relative text-center text-xs text-red-600 px-6">{errorMsg}</div>
              ) : !showVideo ? (
                <div className="relative text-center text-xs text-gray-500 px-6 flex flex-col items-center gap-2">
                  <Camera className="w-10 h-10 text-[hsl(199_100%_50%)]" />
                  {status === "starting" ? "Requesting camera..." : "Tap Start Camera below"}
                </div>
              ) : null}
            </div>

            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full px-3 py-1 text-sm font-bold" style={{ color: percent >= 100 ? "#10b981" : "hsl(199 100% 50%)" }}>
              {percent}%
            </div>
          </div>

          <div className="mt-6 h-10 flex items-center gap-2 text-sm font-medium text-gray-700">
            <RotateCcw className="w-4 h-4 animate-[spin_2.5s_linear_infinite] text-[hsl(199_100%_50%)]" />
            <span key={message} className="animate-fade-in">{showVideo ? message : "Camera required for verification"}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 text-center px-4 min-h-[16px]">{hint}</p>

          <div className="flex gap-2 w-full mt-4">
            {!showVideo ? (
              <Button className="flex-1 h-11" onClick={startCamera} disabled={status === "starting"}>
                {status === "starting" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting</> :
                 status === "error" ? "Retry Camera" : <><Camera className="w-4 h-4 mr-2" /> Start Camera</>}
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={reset} disabled={status === "uploading" || status === "done"}>
                  Reset
                </Button>
                <Button
                  className="flex-1"
                  disabled={percent < 20 || status === "uploading" || status === "done"}
                  onClick={capture}
                >
                  {status === "uploading" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading</> :
                   status === "done" ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Verified</> :
                   percent >= 100 ? "Confirm (100%)" :
                   percent >= 50 ? `Confirm (${percent}%)` :
                   `Turn more (${percent}%)`}
                </Button>
              </>
            )}
          </div>

          {status === "error" && (
            <p className="text-[11px] text-gray-500 mt-3 text-center px-2">
              Tip: If you're inside the Lovable preview, click the <b>↗ open in new tab</b> icon at the top of the preview — browsers block camera access inside embedded iframes.
            </p>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
