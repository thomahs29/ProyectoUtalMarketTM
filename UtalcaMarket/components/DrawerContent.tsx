import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DrawerContentProps {
  navigation?: any;
  onClose?: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation, onClose }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Éxito', 'Has cerrado sesión correctamente');
      onClose?.();
      navigation?.closeDrawer();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cerrar la sesión: ' + error.message);
    }
  };

  const handleNavigate = (route: string) => {
    router.push(route);
    navigation?.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Header del Drawer - Botón para ir a Home */}
      <TouchableOpacity
        style={styles.drawerHeader}
        onPress={() => handleNavigate('/(tabs)')}
      >
        <Text style={styles.logoText}>UtalcaMarket</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userLabel}>Conectado</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Contenido del Menú */}
      <ScrollView style={styles.menuContainer}>
        {user ? (
          // Menú para usuarios autenticados
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/profile')}
            >
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/publications')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.menuText}>Ingresar Producto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/MisProductos')}
            >
              <Ionicons name="grid" size={24} color="#fff" />
              <Text style={styles.menuText}>Mis Productos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/messages')}
            >
              <Ionicons name="mail" size={24} color="#fff" />
              <Text style={styles.menuText}>Mensajes</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Opciones', 'Aún no configurado')}
            >
              <Ionicons name="settings" size={24} color="#fff" />
              <Text style={styles.menuText}>Opciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutBtn]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#ff4444" />
              <Text style={[styles.menuText, { color: '#ff4444' }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Menú para usuarios NO autenticados
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/LoginScreen')}
            >
              <Ionicons name="log-in" size={24} color="#fff" />
              <Text style={styles.menuText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/LoginScreen')}
            >
              <Ionicons name="person-add" size={24} color="#fff" />
              <Text style={styles.menuText}>Registrarse</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Opciones', 'Aún no configurado')}
            >
              <Ionicons name="settings" size={24} color="#fff" />
              <Text style={styles.menuText}>Opciones</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a3a4e',
  },

  drawerHeader: {
    backgroundColor: '#2a2a3e',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a5e',
  },

  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },

  userInfo: {
    marginTop: 12,
  },

  userEmail: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 4,
  },

  userLabel: {
    fontSize: 12,
    color: '#999',
  },

  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginVertical: 12,
  },

  logoutBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
});

export { DrawerContent };
