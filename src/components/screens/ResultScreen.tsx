import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

interface ResultScreenProps {
  qrCodeUrl: string | null;
  // Eliminamos sessionId si no lo vamos a usar
  onReset: () => void;
}

export default function ResultScreen({ qrCodeUrl, onReset }: ResultScreenProps) {
  const [isQrLoading, setIsQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);
  
  // Verificar que la URL del QR es válida
  useEffect(() => {
    if (!qrCodeUrl) {
      setIsQrLoading(true);
      return;
    }
    
    // Validación básica de URL
    const isValidUrl = qrCodeUrl.startsWith('http');
    console.log("URL del QR recibida:", qrCodeUrl);
    
    // Comprobar si la URL es accesible
    const checkUrl = async () => {
      try {
        const response = await fetch(qrCodeUrl, { method: 'HEAD' });
        if (response.ok) {
          setIsQrLoading(false);
          setQrError(null);
        } else {
          console.error("URL del QR no accesible:", response.status);
          setQrError(`Error: La imagen no está disponible (${response.status})`);
          setIsQrLoading(false);
        }
      } catch (error) {
        console.error("Error al verificar la URL:", error);
        setQrError("Error al acceder a la imagen");
        setIsQrLoading(false);
      }
    };
    
    if (isValidUrl) {
      checkUrl();
    } else {
      setQrError("URL de QR no válida");
      setIsQrLoading(false);
    }
  }, [qrCodeUrl]);

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Fondo */}
      <Image
        src="/images/background.jpg"
        alt="Fondo de resultado"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <h1 
          className="text-title-sm font-bold mb-8"
          style={{ fontFamily: 'Futura Std' }}
        >
          ¡LISTO!
        </h1>
        
        {/* Código QR con estado de carga y manejo de errores */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8 min-w-44 min-h-44">
          {isQrLoading ? (
            <div className="w-44 h-44 flex items-center justify-center">
              <div className="text-center text-gray-500 p-4">
                <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Generando QR...
              </div>
            </div>
          ) : qrError ? (
            <div className="w-44 h-44 flex items-center justify-center bg-red-100 rounded-lg">
              <div className="text-center text-red-600 p-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {qrError}
                <button 
                  onClick={() => {
                    setIsQrLoading(true);
                    setQrError(null);
                    // Intentar nuevamente en 2 segundos
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <QRCodeSVG 
              value={qrCodeUrl || ''}
              size={400}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"M"}
              includeMargin={false}
            />
          )}
        </div>

        {/* Mensaje e instrucciones */}
        <div className="text-center mb-6">
          <p 
            className="text-subtitle mb-2"
            style={{ fontFamily: 'Futura Std' }}
          >
            Escanea el código y descubre
          </p>
          <p className="text-subtitle mb-4">
            a quién tenías detrás…
          </p>
        </div>
        
        {/* Botón para reiniciar */}
        <Button onClick={onReset}>
          REINICIAR
        </Button>
      </div>
    </div>
  );
}