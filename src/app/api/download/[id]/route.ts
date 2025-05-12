// app/api/download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Definir el tipo para el segundo argumento (el objeto de contexto)
type RouteContext = {
  params: { id: string };
};

export async function GET(
  request: NextRequest,
  context: RouteContext // Aplica el tipo al parámetro completo
) {
  const id = context.params.id; // Accede a id a través del objeto context

  try {
    // Construye la URL de Vercel Blob con el ID proporcionado
    // Nota: Asegúrate de que la URL base (deprb6wblgolesjs.public.blob.vercel-storage.com)
    // sea la correcta para tu Vercel Blob Store. Puedes obtenerla del dashboard de Vercel.
    const blobUrl = `https://deprb6wblgolesjs.public.blob.vercel-storage.com/totem-fotos/gasto_fantasma_${id}.jpg`;

    // Redirige a la URL de Vercel Blob
    // La URL de Vercel Blob ya tiene configurados los headers correctos para descarga
    // Si necesitas forzar la descarga en lugar de mostrarla, puedes usar el downloadUrl
    // que obtuviste al subir el blob, o podrías potencialmente modificar headers aquí
    // si Vercel Blob lo permitiera (usualmente la URL pública ya está optimizada para servir).
    // Redirigir es una buena estrategia ya que delega la entrega del archivo a Vercel Blob CDN.
    return NextResponse.redirect(blobUrl);

  } catch (error) {
    console.error('Error al redirigir a la imagen:', error);
    // Considera verificar si el error es 404 del blob store para dar un mensaje más preciso
    return NextResponse.json({
      error: 'No se pudo encontrar la imagen solicitada o error interno'
    }, { status: 404 }); // O 500 si fue un error inesperado
  }
}