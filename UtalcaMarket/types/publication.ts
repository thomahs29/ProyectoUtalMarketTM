export interface Publication {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePublicationData {
  title: string;
  description: string;
  price: number;
  category: string;
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