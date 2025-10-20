import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Si aún está cargando, no hacer nada
    if (loading) return;

    // Si no hay usuario y no hemos redirigido aún, redirige a login
    if (!user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      try {
        router.replace('/(tabs)/LoginScreen');
      } catch (error) {
        console.error('Error redirecting to login:', error);
      }
    }
    
    // Si hay usuario nuevamente, reset el flag
    if (user && hasRedirectedRef.current) {
      hasRedirectedRef.current = false;
    }
  }, [user, loading, router]);
}
