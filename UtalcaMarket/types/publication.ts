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
  Location?: Location.LocationObject;
  pub_type?: 'producto' | 'servicio';
}

export interface CreatePublicationData {
  title: string;
  description: string;
  price: number;
  category: string;
  media_url?: string[];
  Location?: Location.LocationObject;
  pub_type?: 'producto' | 'servicio';
}

export type Category = 'electronics' | 'books' | 'clothing' | 'home' | 'sports' | 'other';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'electronics', label: 'Electrónicos' },
  { value: 'books', label: 'Libros' },
  { value: 'clothing', label: 'Ropa' },
  { value: 'home', label: 'Hogar' },
  { value: 'sports', label: 'Deportes' },
  { value: 'other', label: 'Otros' },
];