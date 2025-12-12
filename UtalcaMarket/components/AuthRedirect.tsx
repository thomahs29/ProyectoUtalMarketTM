import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const currentScreen = segments[1];

    console.log('AuthRedirect:', { segments, currentScreen, user: !!user });

    const isAuthRoute = currentScreen === 'LoginScreen' || currentScreen === 'RegisterScreen';

    // Usuario autenticado en pantalla de login/register -> redirigir a home
    if (user && isAuthRoute && !hasRedirected.current) {
      console.log('Usuario autenticado en login, redirigiendo a home...');
      hasRedirected.current = true;
      // Usar ruta relativa simple
      setTimeout(() => {
        router.replace('/home');
      }, 100);
    }
    // Usuario no autenticado en pantalla protegida -> redirigir a login
    else if (!user && inTabsGroup && !isAuthRoute && !hasRedirected.current) {
      console.log('Redirigiendo a login...');
      hasRedirected.current = true;
      // Usar ruta relativa simple
      setTimeout(() => {
        router.replace('/LoginScreen');
      }, 100);
    }
    // Resetear flag si el estado cambió apropiadamente
    else if ((user && !isAuthRoute) || (!user && isAuthRoute)) {
      hasRedirected.current = false;
    }
  }, [user, loading, segments, router]);

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