// app/api/download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// En Next.js App Router, la sintaxis correcta para rutas dinámicas es diferente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Este es el formato correcto que espera Next.js
) {
  const id = params.id;
  
  try {
    // Construye la URL de Vercel Blob con el ID proporcionado
    const blobUrl = `https://deprb6wblgolesjs.public.blob.vercel-storage.com/totem-fotos/gasto_fantasma_${id}.jpg`;
    
    // Redirige a la URL de Vercel Blob
    return NextResponse.redirect(blobUrl);
  } catch (error) {
    console.error('Error al redirigir a la imagen:', error);
    return NextResponse.json({ 
      error: 'No se pudo encontrar la imagen solicitada' 
    }, { status: 404 });
  }
}