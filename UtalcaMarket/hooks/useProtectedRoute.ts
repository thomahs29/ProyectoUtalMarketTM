import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const previousUserRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Solo ejecutar después de que el loading termina
    if (loading) return;

    const hasUser = !!user;
    const hadUser = previousUserRef.current;

    // Si pasó de tener usuario a no tener usuario, redirige
    if (hadUser === true && hasUser === false) {
      console.log('Logout detectado, redirigiendo a LoginScreen');
      try {
        router.replace('/(tabs)/LoginScreen');
      } catch (error) {
        console.error('Error redirecting:', error);
      }
    }

    previousUserRef.current = hasUser;
  }, [user, loading, router]);
}
