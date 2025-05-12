// Función para solicitar permisos de cámara
export const requestCameraPermission = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1080 },
        height: { ideal: 1920 }
      }
    });
    return stream;
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    throw error;
  }
};

// Función para detener la cámara
export const stopCamera = (stream: MediaStream): void => {
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
};

// Función para capturar una imagen desde un elemento de video
export const captureImage = (
  videoElement: HTMLVideoElement,
  flip: boolean = true
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');
  
  if (flip) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.9);
};