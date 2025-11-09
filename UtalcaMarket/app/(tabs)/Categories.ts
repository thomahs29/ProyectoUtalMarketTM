export const CATEGORIES = [
  'Alimentos',
  'Arriendos',
  'Transporte',
  'Servicios',
  'Apuntes',
  'Otros',
] as const;

export type Category = (typeof CATEGORIES)[number];