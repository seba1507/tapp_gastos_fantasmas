'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface BienvenidaScreenProps {
  onNavigate: () => void;
}

const BienvenidaScreen: React.FC<BienvenidaScreenProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Fondo */}
      <Image
        src="/images/background.jpg"
        alt="Fondo de bienvenida"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* Título principal - en posición absoluta centrada */}
      <div className="absolute top-2/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-10">
        <h1 className="font-bold tracking-tight leading-none" style={{ fontFamily: 'Futura Std', fontWeight: 'bold' }}>
          {/* Primera línea más pequeña */}
          <div className="text-title-sm">¿TIENES GASTOS</div>

          {/* Segunda línea más grande con fantasma integrado */}
          <div className="text-title-lg mt-2">
            FANTASM
            <span className="inline-flex items-center relative" style={{ 
                transform: 'translateY(3px)',
                margin: '0 -8px' 
            }}>
                <Image 
                src="/images/fantasma.png"
                alt="Fantasma"
                width={45}
                height={47}
                priority
                style={{ 
                    objectFit: 'contain',
                    width: 'auto',
                    height: '1em', // Alinea con la altura del texto
                    position: 'relative',
                    bottom: '0.0em' // Ajuste fino de la alineación vertical
                }}
                className="inline"
                />
            </span>
            S?
          </div>
        </h1>
        
        {/* Subtítulo */}
        <p className="text-subtitle font-normal mt-4">
          Descúbrelo en esta experiencia
        </p>
      </div>
      
      {/* Botón - posición absoluta ajustada hacia arriba */}
      <div className="absolute top-[70%] left-1/2 -translate-x-1/2 z-10">
        <Button onClick={onNavigate}>
          Iniciar
        </Button>
      </div>
    </div>
  );
};

export default BienvenidaScreen;