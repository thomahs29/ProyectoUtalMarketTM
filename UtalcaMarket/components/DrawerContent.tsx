import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';

interface DrawerContentProps {
  navigation?: any;
  onClose?: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Éxito', 'Has cerrado sesión correctamente');
      onClose?.();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cerrar la sesión: ' + error.message);
    }
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
    onClose?.();
  };

  const menuItems = user ? [
    { icon: 'person', label: 'Mi Perfil', route: '/(tabs)/profile' },
    { icon: 'add-circle', label: 'Ingresar Producto', route: '/(tabs)/publications' },
    { icon: 'grid', label: 'Mis Productos', route: '/(tabs)/MisProductos' },
    { icon: 'mail', label: 'Mensajes', route: '/(tabs)/messages' },
    { icon: 'settings', label: 'Opciones', route: null },
  ] : [
    { icon: 'log-in', label: 'Iniciar Sesión', route: '/(tabs)/LoginScreen' },
    { icon: 'person-add', label: 'Registrarse', route: '/(tabs)/LoginScreen' },
    { icon: 'settings', label: 'Opciones', route: null },
  ];

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => navigateTo('/(tabs)')}>
        <Text style={styles.logo}>UtalcaMarket</Text>
        {user && <Text style={styles.userEmail}>{user.email}</Text>}
      </Pressable>

      <ScrollView style={styles.scrollView}>
        {menuItems.map((item, idx) => (
          <Pressable
            key={idx}
            style={styles.menuItem}
            onPress={() => item.route ? navigateTo(item.route) : Alert.alert('Opciones', 'Aún no configurado')}
          >
            <Ionicons name={item.icon as any} size={20} color="#fff" />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
        
        {user && (
          <Pressable style={styles.logoutItem} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ff4444" />
            <Text style={styles.logoutLabel}>Cerrar Sesión</Text>
          </Pressable>
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
  header: {
    backgroundColor: '#2a2a3e',
    padding: 16,
    paddingTop: 32,
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  logoutItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
});

export { DrawerContent };
