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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
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
        name="PubForm"
        options={{
          title: 'Publicar',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
          href: user ? '/(tabs)/PubForm' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          href: user ? '/(tabs)/profile' : null,
        }}
      />
      <Tabs.Screen
        name="publications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
