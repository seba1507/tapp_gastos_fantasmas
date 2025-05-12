"use client";

// Eliminado: import { useState } from "react";
import Image from "next/image"; // Asegúrate de que esté importado
import Button from "@/components/ui/Button";

interface ReviewScreenProps {
  imageUrl: string | null;
  onAccept: () => void;
  onRetake: () => void;
}

export default function ReviewScreen({ imageUrl, onAccept, onRetake }: ReviewScreenProps) {
  if (!imageUrl) return null;

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
        <h1 className="text-title-sm font-bold text-center mb-12 text-white drop-shadow">¿TE GUSTA TU FOTO?</h1> {/* Added text-white */}

        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[65vh] bg-white rounded-2xl overflow-hidden shadow-xl relative">
          {/* Reemplazado <img> con <Image /> */}
          <Image
            src={imageUrl}
            alt="Foto capturada"
            fill // Usa fill para que se ajuste al contenedor con object-cover
            sizes="100vw" // Añade sizes prop
            className="object-cover"
            // Nota: Usar data URLs directamente con <Image> puede generar advertencias
            // de rendimiento en la consola de Next.js. La solución ideal es subir
            // la imagen capturada temporalmente antes de la pantalla de revisión.
            // Pero para corregir el error/warning actual, esto funciona.
          />
        </div>

        <div className="flex gap-8 mt-8">
          <Button
            onClick={onRetake}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Repetir
          </Button>
          <Button onClick={onAccept}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}