import { createDrawerNavigator, DrawerHeaderProps } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import AuthRedirect from '@/components/AuthRedirect';
import DrawerContent from '@/components/DrawerContent';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from './LoginScreen';
import PublicationsScreen from './publications';

const Drawer = createDrawerNavigator();

function CustomDrawerHeader(props: DrawerHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
      <TouchableOpacity onPress={() => props.navigation.toggleDrawer()}>
        <MaterialIcons name="menu" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerLayout() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePublication = () => {
    setShowCreateModal(true);
  };

  return (
    <AuthRedirect>
      <Drawer.Navigator
        drawerContent={(props) => (
          <DrawerContent 
            {...props} 
            onCreatePublication={handleCreatePublication} 
          />
        )}
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
