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
          header: (props) => <CustomDrawerHeader {...props} />,
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
