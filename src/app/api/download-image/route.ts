// app/api/download-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Obtener el ID de los parámetros de consulta
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ 
      error: 'ID no proporcionado' 
    }, { status: 400 });
  }
  
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