"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface CountdownScreenProps {
  onCapture: (data: string) => void;
}

export default function CountdownScreen({ onCapture }: CountdownScreenProps) {
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ------------------------------ Cámara ------------------------------ */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
      })
      .then((s) => {
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(console.error);

    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach((t) => t.stop());
    };
  }, []);

  /* --------------------- Lógica unificada de temporizador -------------- */
  useEffect(() => {
    if (count === 0) {
      // Momento “flash” ⇒ capturar y avisar al padre
      setFlash(true);
      capture();
      const off = setTimeout(() => setFlash(false), 120); // destello muy breve
      return () => clearTimeout(off);
    }

    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count]);

  /* ----------------------------- Captura ------------------------------ */
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

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
  };

  /* -------------------------------- UI -------------------------------- */
  return (
    <div className="relative flex flex-col h-full w-full">
      <Image
        src="/images/background.jpg"
        alt="Fondo"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-title-sm font-bold text-center mb-8">¡PREPÁRATE!</h1>

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
                className="text-white font-bold z-20"
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
