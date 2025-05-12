"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface CountdownScreenProps {
  onCapture: (data: string) => void;
}

export default function CountdownScreen({ onCapture }: CountdownScreenProps) {
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ------------------------------ Cámara ------------------------------ */
  useEffect(() => {
    // Indicar que estamos cargando
    setCameraLoading(true);
    
    const initCamera = async () => {
      try {
        console.log("Iniciando cámara para cuenta regresiva...");
        
        // Opciones optimizadas para inicio rápido
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            frameRate: { ideal: 30 }
          },
        });
        
        console.log("Stream obtenido, configurando video...");
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Metadata de video cargada");
            videoRef.current?.play().then(() => {
              console.log("Video reproduciendo");
              setCameraReady(true);
              setCameraLoading(false);
            }).catch(err => {
              console.error("Error al reproducir video:", err);
              setCameraError("Error al iniciar la cámara");
              setCameraLoading(false);
            });
          };
        }
      } catch (error) {
        console.error("Error al iniciar cámara para cuenta regresiva:", error);
        setCameraError("No se pudo acceder a la cámara");
        setCameraLoading(false);
      }
    };

    // Iniciar cámara inmediatamente
    initCamera();

    // Captura referencia para limpieza
    const videoElement = videoRef.current;

    return () => {
      // Limpiar recursos
      const stream = videoElement?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        console.log("Recursos de cámara liberados en CountdownScreen");
      }
    };
  }, []);

  /* ----------------------------- Captura ------------------------------ */
  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Refs not available for capture");
      return;
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
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.restore();

    onCapture(c.toDataURL("image/jpeg", 0.9));
  }, [onCapture]);

  /* --------------------- Lógica unificada de temporizador -------------- */
  useEffect(() => {
    // No iniciar la cuenta regresiva hasta que la cámara esté lista
    if (!cameraReady) return;
    
    if (count === 0) {
      // Momento "flash" => capturar y avisar al padre
      setFlash(true);
      capture();
      const off = setTimeout(() => setFlash(false), 120);
      return () => clearTimeout(off);
    }

    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, capture, cameraReady]);

  /* -------------------------------- UI -------------------------------- */
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Background Image */}
      <Image
        src="/images/background.jpg"
        alt="Fondo"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-title-sm font-bold text-center mb-8 text-white drop-shadow">¡PREPÁRATE!</h1>

        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[65vh] bg-black rounded-2xl overflow-hidden shadow-xl relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="-scale-x-100 w-full h-full object-cover"
          />

          {/* Estado de carga de la cámara */}
          {cameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Iniciando cámara...</p>
              </div>
            </div>
          )}
          
          {/* Error de cámara */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <div className="text-center p-4">
                <p className="text-white text-lg mb-4">{cameraError}</p>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Número de cuenta regresiva */}
          {cameraReady && count > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-white font-bold z-20 drop-shadow-lg"
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