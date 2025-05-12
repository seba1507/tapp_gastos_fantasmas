"use client";

import { useRef, useEffect, useState, useCallback } from "react"; // Import useCallback
import Image from "next/image"; // Importación correcta

interface CountdownScreenProps {
  onCapture: (data: string) => void;
}

export default function CountdownScreen({ onCapture }: CountdownScreenProps) {
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ------------------------------ Cámara ------------------------------ */
  // Moved camera setup to CameraScreen. This effect now only handles cleanup if stream is set
  // Although it seems you *also* set up the camera here. This might be a source of bugs
  // if both components are trying to access the camera. For now, fixing the linting:
   useEffect(() => {
    // Capture videoElement here for cleanup
    const videoElement = videoRef.current;

    // Note: Ideally camera setup should be in one place (e.g., CameraScreen)
    // If this screen needs to start the camera too, the logic below is fine,
    // but consider managing the stream higher up if possible.
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
      })
      .then((s) => {
        if (videoElement) videoElement.srcObject = s; // Use captured element
      })
      .catch(console.error);


    return () => {
       // Use the captured videoElement in the cleanup
       const stream = videoElement?.srcObject as MediaStream | null;
       if (stream) { // Use if statement instead of &&
         stream.getTracks().forEach((t) => t.stop());
       }
    };
  }, []); // Empty dependency array is correct for mount/unmount cleanup

  /* ----------------------------- Captura ------------------------------ */
  // Wrap capture in useCallback because it's used in useEffect deps
  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Refs not available for capture");
      return; // Add a guard clause
    }

    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = 1080;
    c.height = 1920;

    const ctx = c.getContext("2d")!;
    const aspectTarget = 9 / 16;
    const aspectVideo = v.videoWidth / v.videoHeight;

    let sx = 0,
      sy = 0,
      sw = v.videoWidth,
      sh = v.videoHeight;

    if (aspectVideo > aspectTarget) {
      // Recortar horizontal
      sh = v.videoHeight;
      sw = sh * aspectTarget;
      sx = (v.videoWidth - sw) / 2;
    } else {
      // Recortar vertical
      sw = v.videoWidth;
      sh = sw / aspectTarget;
      sy = (v.videoHeight - sh) / 2;
    }

    ctx.save();
    ctx.translate(c.width, 0); // espejo
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.restore();

    onCapture(c.toDataURL("image/jpeg", 0.9));
  }, [onCapture]); // Dependency array for useCallback

  /* --------------------- Lógica unificada de temporizador -------------- */
  useEffect(() => {
    if (count === 0) {
      // Momento “flash” ⇒ capturar y avisar al padre
      setFlash(true);
      capture(); // capture is now a dependency
      const off = setTimeout(() => setFlash(false), 120); // destello muy breve
      return () => clearTimeout(off);
    }

    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, capture]); // Added 'capture' to dependencies

  /* -------------------------------- UI -------------------------------- */
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Background Image */}
      <Image
        src="/images/background.jpg"
        alt="Fondo"
        fill
        priority
        sizes="100vw" // Added sizes prop
        className="object-cover"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-title-sm font-bold text-center mb-8 text-white drop-shadow">¡PREPÁRATE!</h1> {/* Added text-white */}

        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[65vh] bg-black rounded-2xl overflow-hidden shadow-xl relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="-scale-x-100 w-full h-full object-cover"
          />

          {count > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-white font-bold z-20 drop-shadow-lg" // Added drop-shadow-lg
                style={{
                  fontFamily: "Futura Std",
                  fontSize: "180px",
                  textShadow: "0 0 15px #000",
                }}
              >
                {count}
              </span>
            </div>
          )}
        </div>
      </div>

      {flash && (
        <div className="absolute inset-0 bg-white z-30 animate-[blink_120ms_ease-out]" />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}