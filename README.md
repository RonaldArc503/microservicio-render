# 💈 Guerrero Barber Shop — Microservicio de IA para Cortes de Cabello

Microservicio REST desarrollado en **Node.js (Express)** listo para desplegar en **Render** (plan gratuito como Web Service). 

Su propósito es recibir la fotografía de un cliente (URL pública de Cloudinary u otro CDN) y el estilo de corte seleccionado, invocar el modelo de **Inpainting de FLUX** en **Fal.ai** (`fal-ai/flux-pro/v1/fill` o `fal-ai/flux-lora/inpainting`) para transformar el cabello manteniendo intactos los rasgos faciales, y devolver la URL de la imagen generada.

---

## 🚀 Características

- **Listo para Render:** Configurado con `process.env.PORT || 3000`, scripts `npm start` y CORS habilitado.
- **Endpoint Keep-Alive (`/health`):** Ideal para servicios de ping (como UptimeRobot o cron jobs) y evitar que el contenedor gratuito de Render se suspenda tras 15 minutos de inactividad.
- **Catálogo de Cortes Optimizado:** Diccionario de estilos masculinos (`haircuts.js`) con prompts en inglés diseñados para realismo fotográfico 8k, degradados limpios y preservación estricta de identidad facial.
- **Soporte para Formas de Rostro:** Moduladores para balancear el corte según el tipo de rostro (`OVAL`, `ROUND`, `SQUARE`, `RECTANGULAR`, `DIAMOND`, `HEART`, `TRIANGULAR`).
- **Resolución Inteligente de Máscaras (`maskHelper.js`):** Acepta máscaras personalizadas (`maskUrl`) o genera automáticamente una máscara capilar de inpainting sin librerías nativas pesadas.

---

## 📁 Estructura del Proyecto

```text
microservicio-render/
├── package.json         # Dependencias: express, cors, dotenv, @fal-ai/client
├── server.js            # Servidor Express, CORS, rutas y lógica principal
├── haircuts.js          # Diccionario de peinados, alias en español y prompts
├── maskHelper.js        # Generador y resolutor de máscaras para inpainting
├── test-server.js       # Script de pruebas automáticas locales
├── .env.example         # Plantilla de variables de entorno
├── .env                 # Variables locales (ignorado por Git)
├── .gitignore           # Excluye node_modules, .env, logs
└── README.md            # Documentación completa de uso y despliegue
```

---

## 🛠️ Instalación y Uso Local

### 1. Clonar o abrir el proyecto
```bash
cd C:\Users\HP VICTUS\Desktop\microservicio-render
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```env
# Clave de API de Fal.ai (Obtenla en https://fal.ai/dashboard/keys)
FAL_KEY=tu_api_key_aqui

# Puerto local
PORT=3000

# Endpoint del modelo (opcional, por defecto: fal-ai/flux-pro/v1/fill)
FAL_MODEL_ENDPOINT=fal-ai/flux-pro/v1/fill
```

### 4. Probar endpoints localmente
```bash
npm test
```

### 5. Iniciar el servidor
```bash
npm start
# O en modo desarrollo con auto-recarga:
npm run dev
```

---

## 📡 Endpoints de la API

### 1. `GET /health`
Monitoreo de estado y keep-alive para Render.

**Respuesta (`200 OK`):**
```json
{
  "status": "ok",
  "uptime": 124,
  "timestamp": "2026-10-06T22:30:00.000Z"
}
```

---

### 2. `GET /api/cortes`
Devuelve el listado completo de cortes soportados con sus nombres, descripciones y formas de rostro recomendadas.

**Respuesta (`200 OK`):**
```json
{
  "success": true,
  "total": 9,
  "cortes": [
    {
      "id": "textured_crop",
      "nombre": "Textured Crop con High Fade",
      "descripcion": "Corte moderno texturizado arriba con flequillo corto y degradado alto a piel.",
      "rostrosRecomendados": ["OVAL", "SQUARE", "RECTANGULAR", "HEART"]
    },
    {
      "id": "mid_fade_pompadour",
      "nombre": "Pompadour con Mid Fade",
      "descripcion": "Volumen clásico elevado hacia atrás con degradado medio limpio.",
      "rostrosRecomendados": ["OVAL", "ROUND", "SQUARE", "DIAMOND"]
    }
  ]
}
```

---

### 3. `POST /api/generar-corte`
Genera el nuevo corte de cabello sobre la foto del cliente.

**Headers:**
`Content-Type: application/json`

**Body (JSON):**
```json
{
  "imageUrl": "https://res.cloudinary.com/drz8epbgr/image/upload/v1780604399/barber/photos/hombre/foto_cliente.jpg",
  "corteId": "textured_crop",
  "tipoRostro": "OVAL",
  "maskUrl": "https://url-opcional-a-mascara-personalizada.png"
}
```

*Parámetros:*
- `imageUrl` *(string, obligatorio)*: URL pública accesible por internet de la foto del cliente.
- `corteId` *(string, obligatorio)*: Identificador del corte (ej. `textured_crop`, `mid_fade_pompadour`, `buzz_cut_fade`, `quiff_taper`, `low_fade_side_part`, etc., o sus alias en español como `crop_texturizado`, `pompadour_fade`, `corte_militar`).
- `tipoRostro` *(string, opcional)*: Forma facial para modular el equilibrio del corte (`OVAL`, `ROUND`, `SQUARE`, `RECTANGULAR`, `DIAMOND`, `HEART`, `TRIANGULAR`).
- `maskUrl` *(string, opcional)*: URL de máscara binaria personalizada. Si no se envía, el backend genera una máscara capilar automática y la gestiona con Fal Storage.

**Respuesta Exitosa (`200 OK`):**
```json
{
  "success": true,
  "resultadoUrl": "https://v3.fal.media/files/monkey/abc123xyz_output.png",
  "corteId": "textured_crop",
  "tipoRostro": "OVAL",
  "promptUsado": "man with a modern textured crop haircut...",
  "requestId": "12345678-abcd-ef01-2345-6789abcdef01"
}
```

**Respuesta de Error de Validación (`400 Bad Request`):**
```json
{
  "success": false,
  "error": "El parámetro 'imageUrl' es obligatorio y debe ser una URL válida."
}
```

**Respuesta de Error de Fal.ai (`500 Internal Server Error`):**
```json
{
  "success": false,
  "error": "Error al generar el corte con Fal.ai: [detalle del error]"
}
```

---

## ✂️ Catálogo de Cortes y Alias Soportados

| ID Canónico | Nombre | Alias Aceptados |
| :--- | :--- | :--- |
| `textured_crop` | Textured Crop High Fade | `crop_texturizado`, `french_crop_fade`, `textured-crop` |
| `mid_fade_pompadour`| Pompadour con Mid Fade | `pompadour`, `pompadour_fade`, `mid-fade-pompadour` |
| `buzz_cut_fade` | Buzz Cut Militar Skin Fade | `corte_militar`, `corte_militar_fade`, `rapado`, `buzz-cut-fade` |
| `quiff_taper` | Quiff Texturizado Taper | `quiff`, `quiff_ondulado`, `quiff-taper` |
| `low_fade_side_part`| Peinado Lateral Low Fade | `peinado_lateral`, `peinado_lateral_fade`, `low-fade-side-part` |
| `curly_fade` | Rizos Naturales Drop Fade | `rizos_fade`, `rizos_degradado`, `curly-fade` |
| `modern_mullet` | Mullet Moderno Texturizado | `mullet`, `mullet_taper`, `modern-mullet` |
| `slick_back_taper` | Slick Back Taper Fade | `slick_back`, `peinado_atras`, `slick-back-taper` |
| `french_crop` | French Crop Clásico | `french-crop` |

*Nota: Si se envía un `corteId` personalizado que no esté en la tabla, el backend genera automáticamente un prompt profesional de barbería utilizando el nombre del corte.*

---

## 🌐 Paso a Paso: Subir a GitHub y Desplegar en Render

### Paso 1: Subir el proyecto a GitHub
1. Abre una terminal en la carpeta del microservicio:
   ```bash
   cd "C:\Users\HP VICTUS\Desktop\microservicio-render"
   ```
2. Inicializa el repositorio git:
   ```bash
   git init
   git add .
   git commit -m "feat: microservicio inicial para barbería con Fal.ai y Express"
   ```
3. Crea un repositorio nuevo en tu cuenta de GitHub (ejemplo: `guerrero-ai-service`).
4. Conecta el repositorio remoto y sube los archivos:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/guerrero-ai-service.git
   git push -u origin main
   ```

---

### Paso 2: Crear el Web Service en Render
1. Inicia sesión en [render.com](https://render.com).
2. En el panel principal, haz clic en **New +** y selecciona **Web Service**.
3. Elige la opción **Build and deploy from a Git repository** y conecta tu cuenta de GitHub.
4. Selecciona el repositorio que acabas de subir (`guerrero-ai-service`).
5. Configura los parámetros del servicio:
   - **Name:** `guerrero-barbershop-ai` (o el nombre que elijas)
   - **Region:** Elige la más cercana (ej: `Oregon (US West)` u `Ohio (US East)`)
   - **Branch:** `main`
   - **Root Directory:** *(dejar en blanco)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

---

### Paso 3: Configurar Variables de Entorno en Render
En la misma pantalla de configuración (o en la pestaña **Environment** del servicio una vez creado):

1. Añade la variable requerida:
   - **Key:** `FAL_KEY`
   - **Value:** `tu_clave_de_fal_ai_aqui` (ej: `fal_xxxxxxxx...`)
2. *(Opcional)* Si deseas cambiar el modelo por defecto:
   - **Key:** `FAL_MODEL_ENDPOINT`
   - **Value:** `fal-ai/flux-pro/v1/fill`
3. Haz clic en **Create Web Service** (o **Save Changes**).

---

### Paso 4: Verificación del Despliegue
Render compilará el proyecto en aproximadamente 1-2 minutos. Una vez completado el despliegue, obtendrás una URL pública como:
`https://guerrero-barbershop-ai.onrender.com`

Puedes comprobar que está funcionando accediendo desde tu navegador o terminal:
```bash
curl https://guerrero-barbershop-ai.onrender.com/health
```

Debe responder:
```json
{"status":"ok","uptime":12,"timestamp":"..."}
```

> **Consejo para el Plan Gratuito:** Los Web Services gratuitos de Render se suspenden tras 15 minutos sin tráfico. Para mantenerlo activo con tiempos de respuesta instantáneos para la app móvil, puedes configurar un monitor gratuito en [UptimeRobot](https://uptimerobot.com) que haga una petición `GET` a tu URL `/health` cada 10 minutos.
