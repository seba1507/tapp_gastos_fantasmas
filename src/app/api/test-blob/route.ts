// En una ruta API temporal, por ejemplo app/api/test-blob/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    // Intenta crear un blob simple
    const blob = await put('test.txt', 'Este es un archivo de prueba', {
      access: 'public',
    });
    
    console.log("Blob creado con éxito:", blob);
    
    return NextResponse.json({ success: true, blobUrl: blob.url });
  } catch (error) {
    console.error("Error al conectar con Vercel Blob:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}