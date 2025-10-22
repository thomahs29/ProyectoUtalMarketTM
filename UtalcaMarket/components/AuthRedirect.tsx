import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // No hacer nada mientras carga

    const currentPath = segments.join('/');
    const isInLoginScreen = currentPath.includes('LoginScreen');

    if (user && isInLoginScreen) {
      // Usuario autenticado pero en login - redirigir a publicaciones
      router.replace('/publications');
    } else if (!user && !isInLoginScreen && segments.length > 0) {
      // Usuario no autenticado pero no en login - redirigir a login
      router.replace('/LoginScreen');
    }
  }, [user, loading, segments, router]);

  // Mostrar loading mientras se determina el estado de auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A5B4FC" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A5B4FC',
  },
});

export default AuthRedirect;