import Image from 'next/image';
import Button from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

interface ResultScreenProps {
  qrCodeUrl: string | null;  // Solo necesitamos la URL de descarga
  onReset: () => void;
}

export default function ResultScreen({ qrCodeUrl, onReset }: ResultScreenProps) {
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
        
        {/* Código QR */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8">
          {qrCodeUrl ? (
            <QRCodeSVG 
              value={qrCodeUrl}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"M"}
              includeMargin={false}
            />
          ) : (
            <div className="w-44 h-44 bg-gray-300 animate-pulse rounded-lg"></div>
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