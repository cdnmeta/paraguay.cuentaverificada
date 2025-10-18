// sanitize-ticket.ts
export interface SanitizeOptions {
  allowEmojis?: boolean;      // por defecto: false (los elimina)
  allowNewlines?: boolean;    // por defecto: true (conserva saltos de línea)
  maxLength?: number;         // por defecto: sin corte
  normalize?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD'; // por defecto: 'NFKC'
}

export function sanitizeTexto(
  input: unknown,
  opts: SanitizeOptions = {}
): string {
  const {
    allowEmojis = false,
    allowNewlines = true,
    maxLength,
    normalize = 'NFKC',
  } = opts;

  // 1) A string y normalizar
  let s = (input ?? '').toString().normalize(normalize);

  // 2) Preservar saltos de línea de <br> / <p> básicos antes de quitar HTML
  s = s.replace(/<\s*br\s*\/?>/gi, '\n');
  s = s.replace(/<\s*\/p\s*>\s*<\s*p[^>]*>/gi, '\n');

  // 3) Quitar TODAS las etiquetas HTML
  s = s.replace(/<[^>]*>/g, '');

  // 4) “Decodificar” entidades comunes o, al menos, neutralizarlas
  // (opción simple sin dependencias)
  const entitiesMap: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  s = s.replace(/&[a-z#0-9]+;/gi, (m) => entitiesMap[m] ?? ' ');

  // 5) Eliminar caracteres invisibles / de control
  // - U+200B–U+200D zero-width, U+FEFF BOM, controles ASCII
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');
  s = s.replace(/[\u0000-\u001F\u007F]/g, '');

  // 6) Quitar emojis (a menos que se permitan)
  if (!allowEmojis) {
    // Soporte moderno: Unicode property escapes.
    // Incluye pictogramas y presentación de emoji; también quitamos VS16 y ZWJ.
    s = s
      .replace(
        /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu,
        ''
      )
      .replace(/[\u200D\uFE0F]/g, ''); // ZWJ + variation selectors
  }

  // 7) Normalizar saltos de línea (si no permitimos, convertir a espacios)
  if (!allowNewlines) {
    s = s.replace(/[\r\n]+/g, ' ');
  } else {
    // compactar saltos múltiples a uno
    s = s.replace(/(?:\r?\n){3,}/g, '\n\n'); // máx. 1 línea en blanco
  }

  // 8) Colapsar espacios (sin tocar los \n si se permiten)
  if (allowNewlines) {
    // Colapsar espacios/tab dentro de líneas
    s = s
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .join('\n');
  } else {
    s = s.replace(/\s+/g, ' ').trim();
  }

  // 9) Cortar longitud si aplica
  if (typeof maxLength === 'number' && maxLength > 0 && s.length > maxLength) {
    s = s.slice(0, maxLength);
  }

  return s;
}
