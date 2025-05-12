// /app/api/download-image/route.ts
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
    // Verificar si el ID ya es una URL completa
    let blobUrl = id;
    if (!id.startsWith('http')) {
      blobUrl = `https://deprb6wblgolesjs.public.blob.vercel-storage.com/totem-fotos/${id}`;
    }
    
    // Obtener la imagen del blob
    const imageResponse = await fetch(blobUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ 
        error: `No se pudo obtener la imagen: ${imageResponse.status}` 
      }, { status: 404 });
    }
    
    // Obtener el buffer de la imagen
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Crear una respuesta con los headers adecuados para forzar la descarga
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="gastos_fantasmas.jpg"',
        'Cache-Control': 'no-cache'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error al procesar la descarga:', error);
    return NextResponse.json({ 
      error: 'No se pudo procesar la descarga de la imagen' 
    }, { status: 500 });
  }
}