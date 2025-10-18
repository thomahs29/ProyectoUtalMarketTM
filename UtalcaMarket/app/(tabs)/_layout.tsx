import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useState } from 'react';

import AuthRedirect from '@/components/AuthRedirect';
import DrawerContent from '@/components/DrawerContent';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from './LoginScreen';
import PublicationsScreen from './publications';

const Drawer = createDrawerNavigator();

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
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#FFFFFF',
            width: 280,
          },
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        {user ? (
          <>
            <Drawer.Screen
              name="publications"
              options={{
                drawerLabel: 'Publicaciones',
              }}
            >
              {() => (
                <PublicationsScreen 
                  showCreateModal={showCreateModal} 
                  setShowCreateModal={setShowCreateModal} 
                />
              )}
            </Drawer.Screen>
          </>
        ) : (
          <Drawer.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{
              drawerLabel: 'Iniciar Sesión',
            }}
          />
        )}
      </Drawer.Navigator>
    </AuthRedirect>
  );
}
