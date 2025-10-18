import { IconSymbol } from '@/components/ui/icon-symbol';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DrawerContentProps extends DrawerContentComponentProps {
  activeScreen?: string;
  onCreatePublication?: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ 
  activeScreen, 
  onCreatePublication, 
  navigation 
}) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Éxito', 'Has cerrado sesión correctamente');
      navigation.closeDrawer();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cerrar la sesión: ' + error.message);
    }
  };

  const menuItems = [
    {
      id: 'publications',
      title: 'Publicaciones',
      icon: 'house.fill',
      screen: 'publications',
      requireAuth: true,
    },
    {
      id: 'create-publication',
      title: 'Ingresar producto',
      icon: 'add-circle.fill',
      action: 'create',
      requireAuth: true,
    },
    {
      id: 'my-publications',
      title: 'Mis Publicaciones',
      icon: 'grid',
      screen: 'publications',
      requireAuth: true,
      isSection: true,
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      icon: 'person.fill',
      screen: 'profile',
      requireAuth: true,
    },
  ];

  const navigateToScreen = (item: any) => {
    if (item.action === 'create' && onCreatePublication) {
      onCreatePublication();
      navigation.closeDrawer();
    } else if (item.screen === 'publications') {
      navigation.navigate('publications');
      navigation.closeDrawer();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header del Drawer */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>UtalcaMarket</Text>
        </View>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userLabel}>Usuario conectado</Text>
          </View>
        )}
      </View>

      {/* Contenido del Menú */}
      <ScrollView style={styles.menuContainer}>
        {user ? (
          <>
            {/* Menú para usuarios autenticados */}
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  activeScreen === item.screen && styles.activeMenuItem,
                ]}
                onPress={() => navigateToScreen(item)}
              >
                <IconSymbol 
                  name={item.icon as any} 
                  size={20} 
                  color={activeScreen === item.screen ? '#3B82F6' : '#6B7280'} 
                />
                <Text 
                  style={[
                    styles.menuItemText,
                    activeScreen === item.screen && styles.activeMenuItemText,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Separador */}
            <View style={styles.separator} />

            {/* Botón de Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <IconSymbol name={"logout" as any} size={20} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.loginPrompt}>
            <IconSymbol name={"person.circle" as any} size={48} color="#9CA3AF" />
            <Text style={styles.loginPromptText}>
              Inicia sesión para acceder a todas las funciones
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>UtalcaMarket v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userInfo: {
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  userLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  activeMenuItem: {
    backgroundColor: '#EFF6FF',
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  activeMenuItemText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '500',
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 32,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default DrawerContent;