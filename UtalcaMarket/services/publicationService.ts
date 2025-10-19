import { CreatePublicationData, Publication } from '@/types/publication';
import { supabase } from '@/utils/supabase';

export class PublicationService {
  // Crear una nueva publicación
  static async createPublication(data: CreatePublicationData): Promise<Publication> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const publicationData = {
      ...data,
      user_id: user.id,
    };

    const { data: publication, error } = await supabase
      .from('publications')
      .insert(publicationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating publication:', error);
      throw new Error(error.message);
    }

    return publication;
  }

  // Obtener todas las publicaciones
  static async getAllPublications(): Promise<Publication[]> {
    const { data: publications, error } = await supabase
      .from('publications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching publications:', error);
      throw new Error(error.message);
    }

    return publications || [];
  }

  // Obtener publicaciones del usuario actual
  static async getUserPublications(): Promise<Publication[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data: publications, error } = await supabase
      .from('publications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user publications:', error);
      throw new Error(error.message);
    }

    return publications || [];
  }

  // Obtener una publicación por ID
  static async getPublicationById(id: string): Promise<Publication | null> {
    const { data: publication, error } = await supabase
      .from('publications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Publicación no encontrada
      }
      console.error('Error fetching publication:', error);
      throw new Error(error.message);
    }

    return publication;
  }

  // Actualizar una publicación
  static async updatePublication(id: string, data: Partial<CreatePublicationData>): Promise<Publication> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data: publication, error } = await supabase
      .from('publications')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id) // Solo el propietario puede actualizar
      .select()
      .single();

    if (error) {
      console.error('Error updating publication:', error);
      throw new Error(error.message);
    }

    return publication;
  }

  // Eliminar una publicación
  static async deletePublication(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { error } = await supabase
      .from('publications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Solo el propietario puede eliminar

    if (error) {
      console.error('Error deleting publication:', error);
      throw new Error(error.message);
    }
  }
}