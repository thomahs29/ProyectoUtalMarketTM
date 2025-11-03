import { supabase } from '@/utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Conversation {
  id?: string;
  conversation_id?: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  read_at?: string | null;
}

/**
 * Obtener o crear una conversación entre dos usuarios
 */
export async function getOrCreateConversation(
  otherUserId: string,
  currentUserId: string
): Promise<Conversation | null> {
  try {
    // Buscar conversación existente
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1_id.eq.${currentUserId},participant_2_id.eq.${otherUserId}),` +
        `and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${currentUserId})`
      )
      .single();

    if (data) return data as Conversation;

    // Si no existe, crear nueva conversación
    if (error?.code === 'PGRST116') {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: currentUserId,
          participant_2_id: otherUserId,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newConversation as Conversation;
    }

    throw error;
  } catch (error) {
    console.error('Error en getOrCreateConversation:', error);
    return null;
  }
}

/**
 * Crear o obtener una conversación y devolver su ID
 */
export async function createOrGetConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  try {
    const conversation = await getOrCreateConversation(otherUserId, currentUserId);
    if (!conversation) {
      throw new Error('No se pudo crear la conversación');
    }
    return conversation.id || conversation.conversation_id || '';
  } catch (error) {
    console.error('Error en createOrGetConversation:', error);
    throw error;
  }
}

/**
 * Obtener todas las conversaciones del usuario actual
 */
export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_with_last_message')
      .select('*')
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_time', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data || []) as Conversation[];
  } catch (error) {
    console.error('Error en getUserConversations:', error);
    return [];
  }
}

/**
 * Obtener mensajes de una conversación
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []).reverse() as Message[];
  } catch (error) {
    console.error('Error en getConversationMessages:', error);
    return [];
  }
}

/**
 * Enviar un mensaje (con soporte opcional para media)
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'audio'
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        media_url: mediaUrl || null,
        media_type: mediaType || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  } catch (error) {
    console.error('Error en sendMessage:', error);
    return null;
  }
}

/**
 * Subir archivo de media al chat (imagen, video o audio)
 */
export async function uploadChatMedia(
  conversationId: string,
  userId: string,
  fileUri: string,
  mediaType: 'image' | 'video' | 'audio'
): Promise<string | null> {
  try {
    // Obtener el archivo como blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Generar nombre único para el archivo
    const fileName = `${conversationId}/${userId}_${Date.now()}.${getFileExtension(mediaType, blob.type)}`;

    // Subir a Storage
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (error) throw error;

    // Obtener URL pública del archivo
    const { data: publicData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);

    return publicData?.publicUrl || null;
  } catch (error) {
    console.error('Error en uploadChatMedia:', error);
    return null;
  }
}

/**
 * Obtener extensión del archivo según tipo MIME
 */
function getFileExtension(mediaType: string, mimeType: string): string {
  if (mediaType === 'image') {
    if (mimeType.includes('jpeg')) return 'jpg';
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('gif')) return 'gif';
    if (mimeType.includes('webp')) return 'webp';
  }
  if (mediaType === 'video') {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('quicktime')) return 'mov';
    if (mimeType.includes('webm')) return 'webm';
  }
  if (mediaType === 'audio') {
    if (mimeType.includes('mpeg')) return 'mp3';
    if (mimeType.includes('wav')) return 'wav';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('aac')) return 'm4a';
  }
  return 'bin';
}

/**
 * Marcar mensaje como leído
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error en markMessageAsRead:', error);
    return false;
  }
}

/**
 * Suscribirse a nuevos mensajes en una conversación (Realtime)
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Desuscribirse de actualizaciones de mensajes
 */
export async function unsubscribeFromMessages(
  channel: RealtimeChannel
): Promise<void> {
  await supabase.removeChannel(channel);
}

/**
 * Obtener información del otro participante
 */
export async function getOtherParticipant(
  conversationId: string,
  currentUserId: string
): Promise<any | null> {
  try {
    // Validar inputs
    if (!conversationId || !currentUserId) {
      return {
        id: 'unknown',
        full_name: 'Usuario Desconocido',
        email: 'unknown@example.com',
      };
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return {
        id: 'unknown',
        full_name: 'Usuario Desconocido',
        email: 'unknown@example.com',
      };
    }

    const otherUserId =
      conversation.participant_1_id === currentUserId
        ? conversation.participant_2_id
        : conversation.participant_1_id;

    if (!otherUserId) {
      return {
        id: 'unknown',
        full_name: 'Usuario Desconocido',
        email: 'unknown@example.com',
      };
    }

    // Intentar obtener del perfil primero
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId)
      .single();

    if (profile) return profile;

    // Si no existe perfil, devolver nombre genérico con ID
    return {
      id: otherUserId,
      full_name: `Usuario ${otherUserId.substring(0, 8)}`,
      email: otherUserId,
    };
  } catch (error) {
    console.error('Error en getOtherParticipant:', error);
    return {
      id: 'unknown',
      full_name: 'Usuario Desconocido',
      email: 'unknown@example.com',
    };
  }
}
