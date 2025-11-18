import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

/**
 * Verifica si el dispositivo tiene hardware biométrico disponible
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      console.log('🔐 Hardware biométrico no disponible');
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      console.log('🔐 No hay datos biométricos registrados');
      return false;
    }

    return true;
  } catch (error) {
    console.error('🔐 Error verificando disponibilidad biométrica:', error);
    return false;
  }
};

/**
 * Obtiene los tipos de autenticación biométrica soportados
 */
export const getSupportedAuthenticationTypes = async (): Promise<number[]> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    console.log('🔐 Tipos de autenticación soportados:', types);
    return types;
  } catch (error) {
    console.error('🔐 Error obteniendo tipos de autenticación:', error);
    return [];
  }
};

/**
 * Obtiene el nombre del método de autenticación biométrica disponible
 */
export const getBiometricName = async (): Promise<string> => {
  const types = await getSupportedAuthenticationTypes();
  
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Huella Digital';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Reconocimiento de Iris';
  }
  
  return 'Autenticación Biométrica';
};

/**
 * Solicita autenticación biométrica al usuario
 * @param reason Mensaje que se mostrará al usuario explicando por qué se requiere autenticación
 * @returns Promise<boolean> true si la autenticación fue exitosa, false en caso contrario
 */
export const authenticateWithBiometrics = async (reason: string): Promise<boolean> => {
  try {
    // Verificar si está disponible
    const isAvailable = await isBiometricAvailable();
    
    if (!isAvailable) {
      Alert.alert(
        'Autenticación no disponible',
        'Tu dispositivo no tiene configurada autenticación biométrica. Puedes continuar sin ella.',
        [{ text: 'OK' }]
      );
      // Permitir continuar si no hay biometría disponible
      return true;
    }

    // Solicitar autenticación
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, // Permitir PIN/patrón como alternativa
      fallbackLabel: 'Usar contraseña del dispositivo',
    });

    if (result.success) {
      console.log('🔐 Autenticación biométrica exitosa');
      return true;
    } else {
      console.log('🔐 Autenticación biométrica fallida:', result.error);
      
      // Mostrar mensaje específico según el error
      if (result.error === 'user_cancel') {
        Alert.alert('Autenticación cancelada', 'Debes autenticarte para continuar');
      } else if (result.error === 'lockout') {
        Alert.alert(
          'Demasiados intentos',
          'Has excedido el número de intentos. Por favor, intenta más tarde.'
        );
      } else if (result.error === 'not_enrolled') {
        Alert.alert(
          'Sin configurar',
          'No tienes configurada autenticación biométrica en tu dispositivo.'
        );
      } else {
        Alert.alert('Error de autenticación', 'No se pudo verificar tu identidad');
      }
      
      return false;
    }
  } catch (error) {
    console.error('🔐 Error durante autenticación biométrica:', error);
    Alert.alert(
      'Error',
      'Ocurrió un error durante la autenticación. Por favor, intenta nuevamente.'
    );
    return false;
  }
};

/**
 * Autenticación específica para crear publicación
 */
export const authenticateForPublish = async (): Promise<boolean> => {
  return await authenticateWithBiometrics(
    'Verifica tu identidad para publicar'
  );
};

/**
 * Autenticación específica para editar publicación
 */
export const authenticateForEdit = async (): Promise<boolean> => {
  return await authenticateWithBiometrics(
    'Verifica tu identidad para editar'
  );
};

/**
 * Autenticación específica para eliminar publicación
 */
export const authenticateForDelete = async (): Promise<boolean> => {
  return await authenticateWithBiometrics(
    'Verifica tu identidad para eliminar'
  );
};
