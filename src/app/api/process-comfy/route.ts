import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { put } from '@vercel/blob';
import { format } from 'date-fns'; // Importamos date-fns

// URL del servidor ComfyUI en RunPod
const SERVER_ADDRESS = "https://pprd3ktfpb0lfj-7860.proxy.runpod.net";
const JPTR_ADDRESS = "https://pprd3ktfpb0lfj-8888.proxy.runpod.net";

export async function POST(request: NextRequest) {
  console.log('Recibida solicitud en API process-comfy');
  
  try {
    // Obtener datos de la petición
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json({ error: 'No se proporcionó ninguna imagen válida' }, { status: 400 });
    }
    
    // Convertir imagen a base64 (sin el prefijo data:image/...)
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    console.log(`Imagen convertida a base64, longitud: ${base64Image.length} bytes`);

    // Cargar el prompt data con el formato requerido por ComfyUI
    // Usar el nodo LoadImageFromBase64 en lugar de LoadImageFromUrlOrPath
    const promptData = {
      "2": {
        "inputs": {
          "image": "fantasma.png",
          "upload": "image"
        },
        "class_type": "LoadImage",
        "_meta": {
          "title": "Load Base Image"
        }
      },
      "20": {
        "inputs": {
          "strength": 1,
          "blend_mode": "mix: normal",
          "base_image": [
            "2",
            0
          ],
          "blend_image": [
            "48",
            0
          ],
          "mask": [
            "2",
            1
          ]
        },
        "class_type": "ImageBlender",
        "_meta": {
          "title": "ImageBlender"
        }
      },
      "21": {
        "inputs": {
          "threshold": 0.5,
          "torchscript_jit": "default",
          "image": [
            "58",
            0
          ]
        },
        "class_type": "InspyrenetRembgAdvanced",
        "_meta": {
          "title": "Inspyrenet Rembg Advanced"
        }
      },
      "27": {
        "inputs": {
          "strength": 1,
          "blend_mode": "mix: normal",
          "base_image": [
            "58",
            0
          ],
          "blend_image": [
            "20",
            0
          ],
          "mask": [
            "30",
            0
          ]
        },
        "class_type": "ImageBlender",
        "_meta": {
          "title": "ImageBlender"
        }
      },
      "30": {
        "inputs": {
          "mask": [
            "21",
            1
          ]
        },
        "class_type": "InvertMask",
        "_meta": {
          "title": "InvertMask"
        }
      },
      "40": {
        "inputs": {
          "blur_radius": 10,
          "sigma": 1,
          "image": [
            "58",
            0
          ]
        },
        "class_type": "ImageBlur",
        "_meta": {
          "title": "Image Blur"
        }
      },
      "48": {
        "inputs": {
          "strength": 1,
          "blend_mode": "mix: normal",
          "base_image": [
            "58",
            0
          ],
          "blend_image": [
            "40",
            0
          ],
          "mask": [
            "2",
            1
          ]
        },
        "class_type": "ImageBlender",
        "_meta": {
          "title": "ImageBlender"
        }
      },
      "51": {
        "inputs": {
          "move_watermark": false,
          "move_watermark_step": 10,
          "watermark_text": "",
          "font": "",
          "font_size": 1,
          "logo_scale_percentage": 100,
          "x_padding": 0,
          "y_padding": 0,
          "rotation": 0,
          "opacity": 0,
          "image": [
            "27",
            0
          ],
          "logo_image": [
            "52",
            0
          ],
          "mask": [
            "52",
            1
          ]
        },
        "class_type": "KimaraAIWatermarker",
        "_meta": {
          "title": "Kimara.ai Advanced Watermarker"
        }
      },
      "52": {
        "inputs": {
          "image": "frame.png",
          "upload": "image"
        },
        "class_type": "LoadImage",
        "_meta": {
          "title": "Load Image"
        }
      },
      "53": {
        "inputs": {
          "filename_prefix": "tapp",
          "images": [
            "51",
            0
          ]
        },
        "class_type": "SaveImage",
        "_meta": {
          "title": "Save Image"
        }
      },
      "58": {
        "inputs": {
          "data": base64Image
        },
        "class_type": "LoadImageFromBase64",
        "_meta": {
          "title": "Load Image From Base64"
        }
      }
    };
    // Verificar conexión con ComfyUI
    console.log('Verificando conexión con ComfyUI...');
    try {
      await axios.get(`${SERVER_ADDRESS}/system_stats`, { timeout: 5000 });
      console.log('Servidor ComfyUI activo y respondiendo');
    } catch (error) {
      console.error('Error al verificar estado del servidor:', error);
      return NextResponse.json({
        error: "No se puede conectar al servidor ComfyUI. Verifique que esté activo."
      }, { status: 503 });
    }
    
    // Enviar el prompt a ComfyUI
    console.log('Enviando prompt a ComfyUI...');
    const promptResponse = await axios.post(`${SERVER_ADDRESS}/prompt`, { 
      prompt: promptData
    }, { 
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 segundos de timeout
    });


    if (promptResponse.status !== 200) {
      console.error('Error en la respuesta de ComfyUI:', promptResponse.data);
      return NextResponse.json({ 
        error: 'Error al enviar el prompt a ComfyUI', 
        details: promptResponse.data 
      }, { status: 500 });
    }
    
    const promptId = promptResponse.data.prompt_id;
    console.log(`Prompt enviado con ID: ${promptId}`);
    
    // Consultar periódicamente el historial para obtener el resultado
    let historyData = null;
    let imagesFound = false;
    let startTime = 0;
    
    // Máximo 180 intentos (3 minutos) para obtener el resultado
    for (let i = 0; i < 180; i++) {
      try {
        const historyResponse = await axios.get(`${SERVER_ADDRESS}/history/${promptId}`);
        
        if (historyResponse.status === 200) {
          historyData = historyResponse.data;
          
          // Verificar si hay mensajes de error
          if (historyData[promptId]?.status?.messages) {
            const messages = historyData[promptId].status.messages;
            
            for (const message of messages) {
              if (message[0] === "execution_error") {
                console.error("Error de ejecución en ComfyUI:", message[1]);
                return NextResponse.json({ 
                  error: 'Error durante el procesamiento en ComfyUI',
                  details: message[1]?.exception_message || 'Error desconocido'
                }, { status: 422 });
              }
            }
          }
          
          // Verificar si se generaron imágenes
          if (historyData[promptId]?.outputs?.['53']?.images) {
            if (!imagesFound) {
              imagesFound = true;
              startTime = Date.now();
              console.log('Imágenes encontradas en el nodo 53. Esperando 3 segundos...');
            }
            
            // Esperar 3 segundos después de encontrar las imágenes
            if (Date.now() - startTime >= 3000) {
              console.log('Han pasado 3 segundos. Continuando con la descarga.');
              break;
            }
          } else if (imagesFound) {
            imagesFound = false;
            console.log('Las imágenes ya no están presentes. Reiniciando el temporizador.');
          }
        }
      } catch (error) {
        console.error(`Error al obtener el historial:`, error);
      }
      
      // Esperar 1 segundo antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Verificar si se encontraron imágenes
    if (!historyData || !historyData[promptId]?.outputs?.['53']?.images) {
      console.error('No se encontraron imágenes en la respuesta después de esperar');
      return NextResponse.json({ 
        error: 'Tiempo de espera agotado. No se encontraron imágenes generadas.' 
      }, { status: 500 });
    }
    
   const outputs = historyData[promptId].outputs;
    const images = outputs['53'].images;
    
    if (images && images.length > 0) {
      // Usaremos la primera imagen
      const image = images[0];
      const imageName = image.filename;
      const imageUrl = `${JPTR_ADDRESS}/files/workspace/ComfyUI/output/${imageName}`;
      console.log(`Imagen generada: ${imageName}, URL: ${imageUrl}`);
      
      try {
        // Obtener la imagen desde ComfyUI
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // Generar un nombre único y personalizado para la imagen
        const timestamp = format(new Date(), 'ddMMyyyyHHmmss');
        const randomSuffix = Math.random().toString(36).substring(2, 9);

const customFileName = `gasto_fantasma_${timestamp}_${randomSuffix}.jpg`;
        
        // Crear la ruta dentro de Vercel Blob (mantiene organización por carpetas)
        const filePath = `totem-fotos/${customFileName}`;
        
        // Subir la imagen a Vercel Blob con nombre personalizado
        console.log('Subiendo imagen a Vercel Blob como:', customFileName);
const blob = await put(filePath, imageResponse.data, {
  access: 'public',
  contentType: 'image/jpeg'
});
        
        console.log(`Imagen subida a Vercel Blob. URL: ${blob.url}`);
        
        // Extraer el timestamp para la URL personalizada
        // Devolver también un ID que usaremos en nuestra API personalizada
        return NextResponse.json({ 
          success: true,
          blobUrl: blob.url,
          downloadUrl: blob.downloadUrl,
          imageId: timestamp // Este ID lo usamos para la URL personalizada
        });
      } catch (err) {
        console.error('Error al procesar la imagen final:', err);
        return NextResponse.json({ 
          error: 'Error al guardar la imagen procesada',
          details: err instanceof Error ? err.message : 'Error desconocido'
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        error: 'No se encontraron imágenes en la respuesta de ComfyUI.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error general:", error);
    
    // Manejo seguro del error desconocido
    let errorMessage = 'Error general en el procesamiento';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: 'Ocurrió un error al procesar la imagen'
    }, { status: 500 });
  }
}