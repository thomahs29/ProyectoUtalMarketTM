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
    console.log('📤 Subiendo archivo:', { conversationId, userId, fileUri, mediaType });

    // Determinar el tipo MIME basado en el tipo de media
    let mimeType = 'application/octet-stream';
    let fileExtension = '';

    if (mediaType === 'image') {
      mimeType = 'image/jpeg';
      fileExtension = 'jpg';
    } else if (mediaType === 'video') {
      mimeType = 'video/mp4';
      fileExtension = 'mp4';
    } else if (mediaType === 'audio') {
      mimeType = 'audio/m4a';
      fileExtension = 'm4a';
    }

    const fileName = `${conversationId}/${userId}_${Date.now()}.${fileExtension}`;
    
    // Usar XMLHttpRequest para leer el archivo local como blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log('❌ Error en XHR:', e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', fileUri, true);
      xhr.send(null);
    });

    console.log('📦 Blob creado, tamaño:', blob.size, 'tipo:', blob.type);

    // Convertir blob a ArrayBuffer usando FileReader (compatible con React Native)
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    console.log('🔄 ArrayBuffer creado, tamaño:', arrayBuffer.byteLength);

    // Subir usando ArrayBuffer
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('❌ Error de Supabase Storage:', error);
      throw error;
    }

    console.log('✅ Archivo subido:', data);

    // Obtener URL pública del archivo
    const { data: publicData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);

    console.log('🔗 URL pública:', publicData?.publicUrl);

    return publicData?.publicUrl || null;
  } catch (error) {
    console.error('💥 Error en uploadChatMedia:', error);
    return null;
  }
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
  currentUserId: string,
  conversationData?: any
): Promise<any | null> {
  try {
    console.log('🔍 getOtherParticipant llamado:', { conversationId, currentUserId, hasConvData: !!conversationData });
    
    // Validar inputs
    if (!conversationId || !currentUserId) {
      console.log('⚠️ Inputs inválidos');
      return {
        id: 'unknown',
        full_name: 'Usuario Desconocido',
        email: 'unknown@example.com',
        avatar_url: null,
      };
    }

    let conversation = conversationData;
    
    // Si no tenemos los datos de conversación, obtenerlos
    if (!conversation) {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      console.log('📋 Conversación obtenida:', { convData, error: convError });

      if (convError || !convData) {
        console.log('❌ Error obteniendo conversación');
        return {
          id: 'unknown',
          full_name: 'Usuario Desconocido',
          email: 'unknown@example.com',
          avatar_url: null,
        };
      }
      conversation = convData;
    }

    const otherUserId =
      conversation.participant_1_id === currentUserId
        ? conversation.participant_2_id
        : conversation.participant_1_id;

    console.log('👤 ID del otro usuario:', otherUserId);

    if (!otherUserId) {
      console.log('❌ No se pudo determinar el otro usuario');
      return {
        id: 'unknown',
        full_name: 'Usuario Desconocido',
        email: 'unknown@example.com',
        avatar_url: null,
      };
    }

    // SOLUCIÓN: Usar la función RPC en Supabase
    console.log('🔍 Intentando obtener perfil usando RPC...');
    
    const { data: rpcProfiles, error: rpcError } = await supabase
      .rpc('get_user_profile', { user_id: otherUserId });

    console.log('📦 Respuesta RPC completa:', { rpcProfiles, error: rpcError });

    if (rpcProfiles && Array.isArray(rpcProfiles) && rpcProfiles.length > 0 && !rpcError) {
      const profile = rpcProfiles[0];
      console.log('✅ Perfil obtenido vía RPC:', {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url
      });
      return profile;
    }

    console.log('⚠️ RPC no disponible o falló:', rpcError?.message);

    // Fallback: devolver información básica con el ID
    console.log('⚠️ Retornando perfil genérico');
    return {
      id: otherUserId,
      email: `user_${otherUserId.substring(0, 8)}@unknown.com`,
      full_name: `Usuario ${otherUserId.substring(0, 8)}`,
      avatar_url: null,
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
