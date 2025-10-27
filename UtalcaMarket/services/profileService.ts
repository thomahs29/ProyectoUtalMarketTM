import { UpdateProfileData, UserProfile } from '@/types/profile';
import { supabase } from '@/utils/supabase';

export class ProfileService {
  // Obtener perfil del usuario actual
  static async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Perfil no existe, crear uno nuevo
        return await this.createProfile(user.id, user.email || '');
      }
      console.error('Error fetching profile:', error);
      throw new Error(error.message);
    }

    return profile;
  }

  // Crear un perfil nuevo
  static async createProfile(userId: string, email: string): Promise<UserProfile> {
    const newProfile = {
      id: userId,
      email: email,
      full_name: null,
      phone: null,
      avatar_url: null,
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(error.message);
    }

    return profile;
  }

  // Actualizar perfil del usuario
  static async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }

    return profile;
  }

  // Cambiar contraseña
  static async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error changing password:', error);
      throw new Error(error.message);
    }
  }

  // Subir foto de perfil
  static async uploadAvatar(uri: string): Promise<string> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Obtener la extensión del archivo
      const ext = uri.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${ext}`;
      const filePath = `avatars/${fileName}`;

      // Convertir URI a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      throw new Error('No se pudo subir la imagen: ' + error.message);
    }
  }

  // Eliminar foto de perfil anterior
  static async deleteOldAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = avatarUrl.split('/avatars/');
      if (urlParts.length < 2) return;

      const filePath = `avatars/${urlParts[1].split('?')[0]}`;

      await supabase.storage
        .from('avatars')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      // No lanzar error, es una operación no crítica
    }
  }
}
