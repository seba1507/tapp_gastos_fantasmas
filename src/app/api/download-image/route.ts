// /app/api/download-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    
    // Detectar si es un user agent de iOS
    const userAgent = request.headers.get('user-agent') || '';
    const isiOS = /iPhone|iPad|iPod/i.test(userAgent);
    
    // Crear nombre de archivo sin extensión para iOS
    const filename = isiOS ? "gastos_fantasmas" : "gastos_fantasmas.jpg";
    
    // Headers específicos para iOS
    const headers: HeadersInit = {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Configurar Content-Disposition según plataforma
    if (isiOS) {
      // Para iOS, usar un formato más simple
      headers['Content-Disposition'] = `attachment; filename=${filename}`;
    } else {
      // Para otros dispositivos, usar el formato estándar
      headers['Content-Disposition'] = `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
    }
    
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: headers
    });
    
    return response;
  } catch (error) {
    console.error('Error al procesar la descarga:', error);
    return NextResponse.json({ 
      error: 'No se pudo procesar la descarga de la imagen' 
    }, { status: 500 });
  }
}