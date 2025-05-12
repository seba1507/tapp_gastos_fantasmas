"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface ReviewScreenProps {
  imageUrl: string | null;
  onAccept: () => void;  // Cambiado: ya no recibe la imagen procesada
  onRetake: () => void;
}

export default function ReviewScreen({ imageUrl, onAccept, onRetake }: ReviewScreenProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative flex flex-col h-full w-full">
      <Image src="/images/background.jpg" alt="Fondo" fill priority sizes="100vw" className="object-cover" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-title-sm font-bold text-center mb-12">¿TE GUSTA TU FOTO?</h1>

        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[65vh] bg-white rounded-2xl overflow-hidden shadow-xl relative">
          <img src={imageUrl} alt="Foto capturada" className="w-full h-full object-cover" />
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