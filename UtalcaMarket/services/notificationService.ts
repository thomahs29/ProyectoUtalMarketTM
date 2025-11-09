import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushToken {
  user_id: string;
  push_token: string;
  device_type: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Registra el dispositivo para recibir notificaciones push
 * y guarda el token en Supabase
 */
export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  if (!Device.isDevice) {
    console.log('Las notificaciones push solo funcionan en dispositivos físicos');
    return null;
  }

  try {
    // Verificar y solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se otorgaron permisos para notificaciones push');
      return null;
    }

    // Obtener el token de Expo Push
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? '',
    });
    token = tokenData.data;

    console.log('Push token obtenido:', token);

    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Mensajes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#707cb4ff',
        sound: 'default',
      });
    }

    // Guardar el token en Supabase
    if (token) {
      await savePushToken(token);
    }

    return token;
  } catch (error) {
    console.error('Error al registrar notificaciones push:', error);
    return null;
  }
}

/**
 * Guarda el token de push en la base de datos
 */
async function savePushToken(pushToken: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No hay usuario autenticado');
      return;
    }

    const deviceType = Platform.OS;

    // Insertar o actualizar el token
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        user_id: user.id,
        push_token: pushToken,
        device_type: deviceType,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,device_type'
      });

    if (error) {
      console.error('Error guardando push token:', error);
    } else {
      console.log('Push token guardado exitosamente');
    }
  } catch (error) {
    console.error('Error en savePushToken:', error);
  }
}

/**
 * Elimina el token de push del usuario (cuando cierra sesión)
 */
export async function removePushToken(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('device_type', Platform.OS);

    if (error) {
      console.error('Error eliminando push token:', error);
    } else {
      console.log('Push token eliminado');
    }
  } catch (error) {
    console.error('Error en removePushToken:', error);
  }
}

/**
 * Envía una notificación push a un usuario específico
 */
export async function sendPushNotification(
  recipientUserId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    // Obtener el token del destinatario desde Supabase
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('push_token')
      .eq('user_id', recipientUserId);

    if (error || !tokens || tokens.length === 0) {
      console.log('No se encontraron tokens para el usuario:', recipientUserId);
      return;
    }

    // Enviar notificación a todos los dispositivos del usuario
    const messages = tokens.map(({ push_token }) => ({
      to: push_token,
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
      channelId: 'messages',
      priority: 'high',
    }));

    // Enviar mediante la API de Expo Push Notifications
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Notificación enviada:', result);
  } catch (error) {
    console.error('Error enviando notificación push:', error);
  }
}

/**
 * Envía notificación cuando llega un nuevo mensaje
 */
export async function sendMessageNotification(
  recipientUserId: string,
  senderName: string,
  messageText: string,
  conversationId: string
): Promise<void> {
  const title = `Nuevo mensaje de ${senderName}`;
  const body = messageText.length > 100 
    ? messageText.substring(0, 100) + '...' 
    : messageText;

  await sendPushNotification(
    recipientUserId,
    title,
    body,
    {
      type: 'message',
      conversationId: conversationId,
      screen: 'messages',
    }
  );
}

/**
 * Configura listeners para responder a notificaciones
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  // Listener para cuando llega una notificación mientras la app está abierta
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Listener para cuando el usuario toca una notificación
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  // Función de limpieza
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
