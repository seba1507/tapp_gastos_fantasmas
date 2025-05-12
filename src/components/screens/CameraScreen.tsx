"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface CameraScreenProps {
  onStartCountdown: () => void;
}

export default function CameraScreen({ onStartCountdown }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  /* ------------------------------ Cámara ------------------------------ */
  useEffect(() => {
    // Indicar carga mientras se inicializa
    setCameraLoading(true);
    
    // Intentar iniciar antes de que se muestre la pantalla
    const startCamera = async () => {
      try {
        // Opciones con prioridad en calidad y velocidad
        const constraints = {
          video: { 
            facingMode: "user", 
            width: { ideal: 1080 }, 
            height: { ideal: 1920 },
            // Añadir configuraciones para mejorar velocidad de inicio
            frameRate: { ideal: 30 }
          }
        };
        
        console.log("Solicitando permisos de cámara...");
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log("Permisos de cámara obtenidos, configurando video...");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Mostrar el feed tan pronto como metadata esté disponible
          videoRef.current.onloadedmetadata = () => {
            console.log("Metadata de video cargada");
            videoRef.current?.play().then(() => {
              console.log("Video reproduciendo");
              setCameraReady(true);
              setCameraLoading(false);
            }).catch(err => {
              console.error("Error al reproducir video:", err);
              setCameraError("No se pudo iniciar la cámara. Intenta reiniciar la aplicación.");
              setCameraLoading(false);
            });
          };
        }
      } catch (e) {
        console.error("Error al inicializar cámara:", e);
        setCameraError(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "Permisos de cámara denegados. Por favor, permite el acceso a la cámara."
            : "No se pudo acceder a la cámara. Verifica que tu dispositivo tenga una cámara disponible."
        );
        setCameraLoading(false);
      }
    };
    
    // Iniciar cámara inmediatamente
    startCamera();

    // Captura videoElement para limpieza
    const videoElement = videoRef.current;

    return () => {
      // Limpiar recursos de cámara
      const stream = videoElement?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        console.log("Recursos de cámara liberados");
      }
    };
  }, []);

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
        <h1 className="text-title-sm font-bold text-center mt-12 mb-8 text-white drop-shadow">PONTE EN POSICIÓN
          <p className="text-title-sm font-bold text-center mb-4">
            Y PREPÁRATE
          </p>
        </h1>

        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[65vh] bg-black rounded-2xl overflow-hidden shadow-xl relative">
          {/* Video con UI de carga */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="-scale-x-100 w-full h-full object-cover" 
          />
          
          {/* Estado de carga */}
          {cameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Iniciando cámara...</p>
              </div>
            </div>
          )}
          
          {/* Estado de error */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <div className="text-center p-4">
                <svg 
                  className="w-16 h-16 mx-auto mb-4 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
        </div>

        <p className="text-subtitle mt-6 mb-6 text-center text-white drop-shadow">Cuando estés listo, presiona:</p>
        <Button onClick={onStartCountdown} disabled={!cameraReady || cameraLoading || !!cameraError}>
          Tomar foto
        </Button>
      </div>
    </div>
  );
}