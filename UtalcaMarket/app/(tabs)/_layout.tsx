import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import AuthRedirect from '@/components/AuthRedirect';

const DRAWER_WIDTH = 280;

export default function TabLayout() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [fadeAnim] = useState(new Animated.Value(0));

  const toggleDrawer = () => {
    if (!isDrawerOpen) {
      // Abrir drawer
      setIsDrawerOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Cerrar drawer
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsDrawerOpen(false);
      });
    }
  };

  const navigateTo = (route: string) => {
    setIsDrawerOpen(false);
    router.push(route as any);
  };

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthRedirect>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header con botón de menú */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
            <IconSymbol name={"line.horizontal.3" as any} size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>UtalcaMarket</Text>
          
          <View style={styles.spacer} />
        </View>

        {/* Menú desplegable (Drawer) */}
        <Modal
          visible={isDrawerOpen}
          transparent={true}
          animationType="none"
          onRequestClose={toggleDrawer}
        >
          <View style={styles.drawerOverlay}>
            <Animated.View 
              style={[
                styles.drawerBackdrop,
                {
                  opacity: fadeAnim,
                }
              ]} 
            >
              <TouchableOpacity 
                style={{ flex: 1 }}
                activeOpacity={1} 
                onPress={toggleDrawer}
              />
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.drawerContainer,
                {
                  transform: [{ translateX: slideAnim }],
                }
              ]}
            >
              {/* Header del drawer */}
              <View style={styles.drawerHeader}>
                <TouchableOpacity onPress={toggleDrawer} style={styles.closeButton}>
                  <IconSymbol name={"xmark" as any} size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.drawerHeaderTitle}>UtalcaMarket</Text>
                {user && (
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                )}
              </View>

              {/* Contenido del menú */}
              <ScrollView style={styles.drawerContent}>
                {user ? (
                  <>
                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)')}
                    >
                      <IconSymbol name={"house.fill" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Inicio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)/PubForm')}
                    >
                      <IconSymbol name={"plus.circle.fill" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Agregar Producto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)/MisProductos')}
                    >
                      <IconSymbol name={"grid" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Mis Productos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)/messages')}
                    >
                      <IconSymbol name={"paperplane.fill" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Mensajes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)/profile')}
                    >
                      <IconSymbol name={"person.fill" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Mi Perfil</Text>
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity 
                      style={[styles.drawerItem, styles.logoutItem]}
                      onPress={handleLogout}
                    >
                      <IconSymbol name={"power" as any} size={20} color="#EF4444" />
                      <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)/LoginScreen')}
                    >
                      <IconSymbol name={"person.fill" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Iniciar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/(tabs)/RegisterScreen')}
                    >
                      <IconSymbol name={"person.badge.plus" as any} size={20} color="#6B7280" />
                      <Text style={styles.drawerItemText}>Registrarse</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>

              {/* Footer */}
              <View style={styles.drawerFooter}>
                <Text style={styles.footerText}>UtalcaMarket v1.0.0</Text>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Stack Navigation - Sin barra de tabs inferior */}
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="LoginScreen" />
          <Stack.Screen name="RegisterScreen" />
          <Stack.Screen name="MisProductos" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="PubForm" />
        </Stack>
      </SafeAreaView>
    </AuthRedirect>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  drawerOverlay: {
    flex: 1,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  drawerHeader: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  drawerHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userInfo: {
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  drawerContent: {
    flex: 1,
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
