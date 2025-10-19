import { Tabs } from 'expo-router';
import React from 'react';

import AuthRedirect from '@/components/AuthRedirect';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <AuthRedirect>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            href: user ? '/(tabs)' : null, // Solo mostrar si está autenticado
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
            href: user ? '/(tabs)/explore' : null, // Solo mostrar si está autenticado
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            href: user ? '/(tabs)/profile' : null, // Solo mostrar si está autenticado
          }}
        />
        <Tabs.Screen
          name="LoginScreen"
          options={{
            title: 'Login',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            href: !user ? '/(tabs)/LoginScreen' : null, // Solo mostrar si NO está autenticado
          }}
        />
      </Tabs>
    </AuthRedirect>
  );
}
