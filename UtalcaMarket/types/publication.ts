import * as Location from 'expo-location';
export interface Publication {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  media_url?: string[] | string; // Puede ser array o string JSON
  Location?: Location.LocationObject; // Formato antiguo
  location?: string | {  // Puede ser string JSON o objeto
    latitude: number;
    longitude: number;
    coords?: {
      latitude: number;
      longitude: number;
    };
  };
  pub_type?: 'producto' | 'servicio';
}

export interface CreatePublicationData {
  title: string;
  description: string;
  price: number;
  category: string;
  media_url?: string[];
  Location?: Location.LocationObject; // Legacy - mantener para compatibilidad
  location?: Location.LocationObject | string; // Columna actual en la base de datos
  pub_type?: 'producto' | 'servicio';
}

export type Category = 'Alimentos' | 'Arriendos' | 'Transporte' | 'Servicios' | 'Apuntes' | 'Otros';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'Alimentos', label: 'Alimentos' },
  { value: 'Arriendos', label: 'Arriendos' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Apuntes', label: 'Apuntes' },
  { value: 'Otros', label: 'Otros' },
];