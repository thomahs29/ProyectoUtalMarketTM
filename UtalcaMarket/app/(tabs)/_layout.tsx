import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="MisProductos" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="publications" />
      <Stack.Screen name="PubForm" />
      <Stack.Screen name="RegisterScreen" />
    </Stack>
  );
}
