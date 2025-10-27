import { Tabs } from 'expo-router';
import React from 'react';

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
        href: user ? '/(tabs)' : null,
      }}
    />
    <Tabs.Screen
      name="LoginScreen"
      options={{
        title: 'Cuenta',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        href: !user ? '/(tabs)/LoginScreen' : null,
      }}
    />
    <Tabs.Screen
      name="MisProductos"
      options={{
        title: 'Mis Productos',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="grid" color={color} />,
        href: user ? '/(tabs)/MisProductos' : null,
      }}
    />
    <Tabs.Screen
      name="messages"
      options={{
        title: 'Mensajes',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        href: user ? '/(tabs)/messages' : null,
      }}
    />
    <Tabs.Screen
      name="explore"
      options={{
        title: 'Explore',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        href: user ? '/(tabs)/explore' : null,
      }}
    />
    <Tabs.Screen
      name="RegisterScreen"
      options={{
        title: 'Registro',
        href: null,
      }}
    />
  </Tabs>
</AuthRedirect>
  );
}
