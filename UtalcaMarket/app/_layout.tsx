import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { setupNotificationListeners } from '@/services/notificationService';
import React, { useEffect } from 'react';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  useProtectedRoute();

  useEffect(() => {
    // Configurar listeners de notificaciones
    const cleanup = setupNotificationListeners(
      // onNotificationReceived: cuando llega una notificación con la app abierta
      (notification) => {
        console.log('Notificación recibida:', notification);
        // Aquí podrías actualizar el UI, mostrar un badge, etc.
      },
      // onNotificationResponse: cuando el usuario toca la notificación
      (response) => {
        console.log('Usuario tocó la notificación:', response);
        const conversationId = response.notification.request.content.data?.conversationId as string;
        
        // Navegar a la conversación si hay un ID
        if (conversationId) {
          router.push({
            pathname: '/(tabs)/messages',
            params: { conversationId: conversationId }
          });
        }
      }
    );

    return cleanup;
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
