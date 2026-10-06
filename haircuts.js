/**
 * Catálogo de cortes de barbería y mapeo a prompts optimizados en inglés
 * para el modelo de Inpainting FLUX en Fal.ai.
 */

const BASE_NEGATIVE_PRESERVATION = 
  "preserve identical facial features, same face, same eyes, nose and mouth, same skin tone, seamless natural hairline, barbershop quality, professional photography, hyperrealistic portrait, 8k resolution, sharp focus";

const HAIRCUTS = {
  textured_crop: {
    id: "textured_crop",
    nombre: "Textured Crop con High Fade",
    descripcion: "Corte moderno texturizado arriba con flequillo corto y degradado alto a piel.",
    rostrosRecomendados: ["OVAL", "SQUARE", "RECTANGULAR", "HEART"],
    prompt:
      `man with a modern textured crop haircut, choppy matte texture on top, short blunt forward fringe, high clean skin fade on sides and back, sharp natural hairline, ${BASE_NEGATIVE_PRESERVATION}`
  },

  mid_fade_pompadour: {
    id: "mid_fade_pompadour",
    nombre: "Pompadour con Mid Fade",
    descripcion: "Volumen clásico elevado hacia atrás con degradado medio limpio.",
    rostrosRecomendados: ["OVAL", "ROUND", "SQUARE", "DIAMOND"],
    prompt:
      `man with a classic modern pompadour hairstyle, high volume swept-back hair on top, clean mid taper fade on temples and sides, neat contours, professional barbershop styling, ${BASE_NEGATIVE_PRESERVATION}`
  },

  buzz_cut_fade: {
    id: "buzz_cut_fade",
    nombre: "Buzz Cut Militar con Skin Fade",
    descripcion: "Corte militar al ras con degradado alto y contornos muy definidos.",
    rostrosRecomendados: ["OVAL", "SQUARE", "DIAMOND"],
    prompt:
      `man with a sharp military buzz cut, very short uniform hair on top, high skin fade on sides and back, razor-sharp clean hairline and temples, minimalist aesthetic, ${BASE_NEGATIVE_PRESERVATION}`
  },

  quiff_taper: {
    id: "quiff_taper",
    nombre: "Quiff Texturizado con Taper Bajo",
    descripcion: "Frente elevado con movimiento y caída natural, patillas y nuca desvanecidas.",
    rostrosRecomendados: ["OVAL", "ROUND", "SQUARE", "HEART"],
    prompt:
      `man with a stylish textured quiff haircut, front hair swept upwards with natural volume and separation, low taper fade on sideburns and neckline, natural hair flow, ${BASE_NEGATIVE_PRESERVATION}`
  },

  low_fade_side_part: {
    id: "low_fade_side_part",
    nombre: "Peinado Lateral Clásico con Low Fade",
    descripcion: "Estilo formal de raya al costado con degradado bajo sutil y elegante.",
    rostrosRecomendados: ["OVAL", "SQUARE", "RECTANGULAR", "TRIANGULAR"],
    prompt:
      `man with a classic gentleman side part hairstyle, neatly combed parted hair with natural shine, subtle low taper fade around ears and neck, crisp parting line, polished barbershop look, ${BASE_NEGATIVE_PRESERVATION}`
  },

  curly_fade: {
    id: "curly_fade",
    nombre: "Rizos Naturales con Drop Fade",
    descripcion: "Rizos definidos con volumen superior y caída de degradado en la nuca.",
    rostrosRecomendados: ["OVAL", "ROUND", "SQUARE", "TRIANGULAR"],
    prompt:
      `man with defined natural curly hair on top, medium volume curls with moisture and texture, clean drop fade on sides and back, sharp temple line-up, ${BASE_NEGATIVE_PRESERVATION}`
  },

  modern_mullet: {
    id: "modern_mullet",
    nombre: "Mullet Moderno Texturizado",
    descripcion: "Textura superior y flequillo moderno con volumen extendido hacia la nuca y laterales degradados.",
    rostrosRecomendados: ["OVAL", "ROUND", "TRIANGULAR", "DIAMOND"],
    prompt:
      `man with a modern stylish mullet haircut, textured messy top, short faded sides, extended tapered hair flowing down the back, edgy contemporary barbershop cut, ${BASE_NEGATIVE_PRESERVATION}`
  },

  slick_back_taper: {
    id: "slick_back_taper",
    nombre: "Slick Back con Taper Fade",
    descripcion: "Cabello peinado completamente hacia atrás con textura fluida y laterales limpios.",
    rostrosRecomendados: ["OVAL", "DIAMOND", "TRIANGULAR", "SQUARE"],
    prompt:
      `man with a smooth slicked back hairstyle, medium length hair brushed backwards with natural matte hold, low taper fade on sides, clean neckline, sophisticated look, ${BASE_NEGATIVE_PRESERVATION}`
  },

  french_crop: {
    id: "french_crop",
    nombre: "French Crop con Flequillo Corto",
    descripcion: "Corte europeo compacto con textura sutil y laterales muy limpios.",
    rostrosRecomendados: ["OVAL", "SQUARE", "RECTANGULAR", "HEART"],
    prompt:
      `man with a clean French crop haircut, dense short textured hair on top, straight clean forward fringe, high skin fade on sides, crisp hairline, ${BASE_NEGATIVE_PRESERVATION}`
  }
};

// Aliases en español y variantes para máxima compatibilidad con frontend y apps móviles
const ALIASES = {
  // Aliases en español
  crop_texturizado: "textured_crop",
  pompadour_fade: "mid_fade_pompadour",
  pompadour: "mid_fade_pompadour",
  corte_militar: "buzz_cut_fade",
  corte_militar_fade: "buzz_cut_fade",
  rapado: "buzz_cut_fade",
  quiff_ondulado: "quiff_taper",
  quiff: "quiff_taper",
  peinado_lateral: "low_fade_side_part",
  peinado_lateral_fade: "low_fade_side_part",
  rizos_fade: "curly_fade",
  rizos_degradado: "curly_fade",
  mullet: "modern_mullet",
  mullet_taper: "modern_mullet",
  peinado_atras: "slick_back_taper",
  slick_back: "slick_back_taper",
  french_crop_fade: "french_crop",

  // Variantes con guiones en vez de guiones bajos
  "textured-crop": "textured_crop",
  "mid-fade-pompadour": "mid_fade_pompadour",
  "buzz-cut-fade": "buzz_cut_fade",
  "quiff-taper": "quiff_taper",
  "low-fade-side-part": "low_fade_side_part",
  "curly-fade": "curly_fade",
  "modern-mullet": "modern_mullet",
  "slick-back-taper": "slick_back_taper",
  "french-crop": "french_crop"
};

// Modificadores de balance según la forma de rostro
const FACE_SHAPE_MODIFIERS = {
  ROUND: "styled with extra vertical height and tight faded sides to elongate a round face",
  SQUARE: "styled with clean textured soft edges accentuating a masculine square jawline",
  OVAL: "styled with harmonious balanced proportions complementing an oval face shape",
  RECTANGULAR: "styled with controlled top height and neat sides to balance an elongated face shape",
  ALARGADO: "styled with controlled top height and neat sides to balance an elongated face shape",
  DIAMOND: "styled with soft temple volume and natural flow balancing prominent cheekbones",
  HEART: "styled with forward fringe and balanced side volume complementing a heart-shaped face",
  TRIANGULAR: "styled with full top volume and soft taper balancing a wide jawline"
};

/**
 * Obtiene el prompt final optimizado para un corte y tipo de rostro opcional.
 */
function getHaircutPrompt(corteId, tipoRostro) {
  const normalizedId = String(corteId || "").trim().toLowerCase();
  const canonicalId = ALIASES[normalizedId] || normalizedId;
  const haircut = HAIRCUTS[canonicalId];

  let prompt;
  if (haircut) {
    prompt = haircut.prompt;
  } else {
    // Si envían un ID no registrado en el diccionario, construimos un prompt genérico de alta calidad
    const readableName = normalizedId.replace(/[_-]+/g, " ");
    prompt = `man with a professional modern ${readableName} haircut, barbershop clean fade, crisp hairline, natural hair texture, ${BASE_NEGATIVE_PRESERVATION}`;
  }

  // Si se incluye tipo de rostro, añadimos contexto geométrico que guíe el balance de la IA
  if (tipoRostro) {
    const shapeKey = String(tipoRostro).trim().toUpperCase();
    const modifier = FACE_SHAPE_MODIFIERS[shapeKey];
    if (modifier) {
      prompt = `${prompt}, ${modifier}`;
    }
  }

  return prompt;
}

/**
 * Retorna la lista de cortes disponibles para consulta de la app móvil.
 */
function getHaircutsList() {
  return Object.values(HAIRCUTS).map(({ id, nombre, descripcion, rostrosRecomendados }) => ({
    id,
    nombre,
    descripcion,
    rostrosRecomendados
  }));
}

module.exports = {
  HAIRCUTS,
  ALIASES,
  getHaircutPrompt,
  getHaircutsList
};
