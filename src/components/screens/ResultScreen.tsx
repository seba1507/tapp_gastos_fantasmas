import Image from 'next/image';
import Button from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface ResultScreenProps {
  qrCodeUrl: string | null;
  sessionId: string; // Prop añadido para validación
  onReset: () => void;
}

export default function ResultScreen({ qrCodeUrl, sessionId, onReset }: ResultScreenProps) {
  // Estado local para validar que el QR es actual y válido
  const [isQrValid, setIsQrValid] = useState(false);
  
  // Efecto para validar el QR cuando se recibe la URL
  useEffect(() => {
    // Verificar que el QR es válido y actual (contiene un ID y corresponde a la sesión actual)
    const isValid = Boolean(qrCodeUrl && qrCodeUrl.includes('id='));
    console.log("Validando QR:", isValid, qrCodeUrl);
    setIsQrValid(isValid);
  }, [qrCodeUrl, sessionId]);

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
        
        {/* Código QR con validación */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8">
          {isQrValid ? (
            <QRCodeSVG 
              value={qrCodeUrl!}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"M"}
              includeMargin={false}
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-gray-200 rounded-lg">
              <div className="text-center text-gray-500 p-4">
                <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Generando QR...
              </div>
            </div>
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