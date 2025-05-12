"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image"; // Importación correcta
import Button from "@/components/ui/Button";

interface CameraScreenProps {
  onStartCountdown: () => void;
}

export default function CameraScreen({ onStartCountdown }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);

  /* ------------------------------ Cámara ------------------------------ */
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      } catch (e) {
        console.error("Error cámara:", e);
        // Consider adding state to show an error message to the user
      }
    };
    startCamera();

    // Capture videoElement here for cleanup
    const videoElement = videoRef.current;

    return () => {
      // Use the captured videoElement in the cleanup
      const stream = videoElement?.srcObject as MediaStream | null;
      if (stream) { // Use if statement instead of &&
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []); // Empty dependency array is correct for mount/unmount

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
        <h1 className="text-title-sm font-bold text-center mt-12 mb-8 text-white drop-shadow">PONTE EN POSICIÓN
          <p className="text-title-sm font-bold text-center mb-4">
            Y PREPÁRATE
          </p>
        </h1>

        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[65vh] bg-black rounded-2xl overflow-hidden shadow-xl relative">
          <video ref={videoRef} autoPlay playsInline muted className="-scale-x-100 w-full h-full object-cover" />
        </div>

        <p className="text-subtitle mt-6 mb-6 text-center text-white drop-shadow">Cuando estés listo, presiona:</p> {/* Added text-white */}
        <Button onClick={onStartCountdown} disabled={!cameraReady}>
          Tomar foto
        </Button>
      </div>
    </div>
  );
}