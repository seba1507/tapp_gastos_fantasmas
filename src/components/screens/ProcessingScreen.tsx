'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ProcessingScreenProps {
  imageUrl: string | null;
  onProcessingComplete: (downloadUrl: string) => void;  // Solo recibe la URL de descarga
  onProcessingError: (error: string) => void;
}

export default function ProcessingScreen({ 
  imageUrl, 
  onProcessingComplete, 
  onProcessingError 
}: ProcessingScreenProps) {
  const [processingStatus, setProcessingStatus] = useState<string>("Preparando imagen...");
  
  // En ProcessingScreen.tsx
// En ProcessingScreen.tsx - simplificado para pasar solo la URL de descarga
// components/screens/ProcessingScreen.tsx
useEffect(() => {
  if (!imageUrl) {
    onProcessingError("No hay imagen para procesar");
    return;
  }
  
  const processImage = async () => {
    try {
      setProcessingStatus("Enviando imagen a procesar...");
      
      // Convertir la dataURL a un Blob para enviarla
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Crear un FormData y añadir la imagen
      const formData = new FormData();
      formData.append('image', blob, 'captured-image.jpg');

      // Enviar a la API de procesamiento
      setProcessingStatus("Procesando imagen con IA...");
      const processResponse = await fetch('/api/process-comfy', {
        method: 'POST',
        body: formData,
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Error al procesar la imagen');
      }

      const data = await processResponse.json();
      
      if (!data.success) {
        throw new Error('Error en el procesamiento de la imagen');
      }

      setProcessingStatus("¡Imagen lista!");
      
      // Crear la URL personalizada usando nuestra propia API
      const downloadUrl = window.location.origin + `/api/download/${data.imageId}`;
      
      // Pequeña pausa para que se vea el mensaje de éxito
      setTimeout(() => {
        // Pasamos la URL personalizada
        onProcessingComplete(downloadUrl);
      }, 1000);
      
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      setProcessingStatus("Error al procesar la imagen");
      
      onProcessingError(
        error instanceof Error 
          ? error.message 
          : 'Ocurrió un error inesperado al procesar la imagen'
      );
    }
  };
  
  // Iniciar procesamiento con un leve retraso para que se vea la pantalla
  const timer = setTimeout(() => {
    processImage();
  }, 500);
  
  return () => clearTimeout(timer);
}, [imageUrl, onProcessingComplete, onProcessingError]);





  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Fondo */}
      <Image
        src="/images/background.jpg"
        alt="Fondo de procesamiento"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 
          className="text-title-sm font-bold mb-8 text-center px-6"
          style={{ fontFamily: 'Futura Std' }}
        >
          DETECTANDO GASTOS
        </h1> 
        <h1 
          className="text-title-sm font-bold mb-8 text-center px-6"
          style={{ fontFamily: 'Futura Std' }}
        >
          FANTASMAS
        </h1>
        
        {/* Animación de carga */}
        <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
        
        {/* Estado de procesamiento */}
        <p className="text-subtitle text-center px-8 max-w-md">
          {processingStatus}
        </p>
      </div>
    </div>
  );
}