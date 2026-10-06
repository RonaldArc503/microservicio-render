require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fal } = require('@fal-ai/client');
const { getHaircutPrompt, getHaircutsList } = require('./haircuts');
const { resolveMaskUrl } = require('./maskHelper');

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_MODEL_ENDPOINT = process.env.FAL_MODEL_ENDPOINT || 'fal-ai/flux-lora-fill';

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Configurar credenciales de Fal.ai si existen en variables de entorno
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY.trim()
  });
}

// Logger simple para peticiones
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ==========================================
// RUTAS
// ==========================================

/**
 * Ruta raíz: Información básica del microservicio
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Guerrero Barber Shop - AI Haircut Microservice',
    version: '1.0.0',
    status: 'running',
    model: FAL_MODEL_ENDPOINT,
    endpoints: {
      health: 'GET /health',
      cortes: 'GET /api/cortes',
      generarCorte: 'POST /api/generar-corte'
    }
  });
});

/**
 * GET /health
 * Endpoint de monitoreo y keep-alive para Render (evita suspensión en plan gratuito)
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/cortes
 * Retorna el catálogo de estilos y peinados soportados por el microservicio
 */
app.get('/api/cortes', (req, res) => {
  res.json({
    success: true,
    total: getHaircutsList().length,
    cortes: getHaircutsList()
  });
});

/**
 * POST /api/generar-corte
 * Recibe la foto del cliente, el corte elegido y opcionalmente el tipo de rostro.
 * Invoca el modelo de Inpainting de FLUX en Fal.ai y retorna la URL con el resultado.
 */
app.post('/api/generar-corte', async (req, res) => {
  try {
    const { imageUrl, corteId, tipoRostro, maskUrl } = req.body || {};

    // 1. Validaciones de entrada
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'imageUrl' es obligatorio y debe ser una URL válida."
      });
    }

    if (!corteId || typeof corteId !== 'string' || corteId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'corteId' es obligatorio (ej: 'textured_crop', 'mid_fade_pompadour')."
      });
    }

    const trimmedImageUrl = imageUrl.trim();
    if (!trimmedImageUrl.startsWith('http://') && !trimmedImageUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'imageUrl' debe comenzar con http:// o https://"
      });
    }

    // 2. Validar que la API Key de Fal.ai esté configurada
    const falKey = process.env.FAL_KEY ? process.env.FAL_KEY.trim() : '';
    if (!falKey) {
      console.error('[GenerarCorte] FAL_KEY no está configurada en las variables de entorno.');
      return res.status(500).json({
        success: false,
        error: 'El servidor no tiene configurada la clave FAL_KEY en las variables de entorno de Render.'
      });
    }

    // Asegurar configuración del cliente Fal
    fal.config({ credentials: falKey });

    // 3. Construir prompt optimizado según corte y forma de rostro
    const prompt = getHaircutPrompt(corteId, tipoRostro);
    console.log(`[GenerarCorte] Procesando corte '${corteId}' (rostro: ${tipoRostro || 'N/A'})`);
    console.log(`[GenerarCorte] Prompt generado: "${prompt}"`);

    // 4. Preparar payload para Fal.ai según especificación oficial de flux-lora-fill
    const inputPayload = {
      prompt,
      image_url: trimmedImageUrl,
      paste_back: true,               // Conserva el rostro original intacto
      resize_to_original: true,       // Mantiene resolución y aspect ratio original
      acceleration: 'regular',        // Generación rápida
      num_inference_steps: 28,
      guidance_scale: 30,
      output_format: 'jpeg'
    };

    // Si el modelo es de inpainting / fill, resolvemos la máscara (enviada o generada)
    const effectiveMaskUrl = await resolveMaskUrl(maskUrl);
    if (effectiveMaskUrl) {
      inputPayload.mask_url = effectiveMaskUrl;
    }

    console.log(`[GenerarCorte] Invocando '${FAL_MODEL_ENDPOINT}' (paste_back: true, resize_to_original: true)...`);

    // 5. Llamada a Fal.ai usando el cliente oficial
    const result = await fal.subscribe(FAL_MODEL_ENDPOINT, {
      input: inputPayload,
      logs: false
    });

    // 6. Extraer URL de la imagen resultante según el schema documentado (result.data.images[0].url)
    const resultadoUrl =
      result?.data?.images?.[0]?.url ||
      result?.images?.[0]?.url ||
      result?.data?.image?.url;

    if (!resultadoUrl) {
      console.error('[GenerarCorte] La respuesta de Fal.ai no contiene una URL de imagen válida:', JSON.stringify(result));
      return res.status(500).json({
        success: false,
        error: 'Fal.ai procesó la solicitud pero no retornó una URL de imagen en el formato esperado.',
        detalles: result?.data || result
      });
    }

    console.log(`[GenerarCorte] Imagen generada con éxito: ${resultadoUrl}`);

    // 7. Responder al cliente
    return res.status(200).json({
      success: true,
      resultadoUrl,
      corteId,
      tipoRostro: tipoRostro || null,
      promptUsado: prompt,
      requestId: result?.requestId || null
    });

  } catch (error) {
    console.error('[GenerarCorte] Error en la generación del corte:', error);

    // Formatear mensaje claro de error
    const errorMessage = error?.message || 'Error desconocido al invocar la API de Fal.ai';
    return res.status(500).json({
      success: false,
      error: `Error al generar el corte con Fal.ai: ${errorMessage}`
    });
  }
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('[Servidor] Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.',
    detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`💈 Guerrero Barber Shop - Microservicio de IA`);
  console.log(`🚀 Servidor escuchando en el puerto: ${PORT}`);
  console.log(`🌐 Modelo Fal.ai configurado: ${FAL_MODEL_ENDPOINT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`✂️ Catálogo de cortes: http://localhost:${PORT}/api/cortes`);
  console.log(`====================================================`);
});
