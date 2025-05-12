// app/api/upload-blob/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Obtener la imagen desde la solicitud
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ninguna imagen' }, { status: 400 });
    }
    
    // Convertir File a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Crear un nombre de archivo único
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileName = `totem-fotos/${uniqueId}.jpg`;
    
    // Subir el archivo a Vercel Blob
    const blob = await put(fileName, buffer, {
      access: 'public', // Acceso público para que pueda ser descargado
      contentType: 'image/jpeg',
    });
    
    // Devolver las URLs de acceso
    return NextResponse.json({
      success: true,
      url: blob.url,           // URL para ver la imagen
      downloadUrl: blob.downloadUrl, // URL para descargar la imagen
    });
  } catch (error) {
    console.error('Error al subir imagen a Vercel Blob:', error);
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}