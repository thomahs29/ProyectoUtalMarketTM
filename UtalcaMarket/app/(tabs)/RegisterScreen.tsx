import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;
      if (!user) throw new Error('No se pudo crear el usuario.');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim() })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      Alert.alert(
        'Registro exitoso',
        '¡Bienvenido! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.'
      );
      // Redirigimos al login para que el usuario inicie sesión después de confirmar su correo
      router.replace('/(tabs)/LoginScreen');
    } catch (error: any) {
      Alert.alert('Error de registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          Regístrate en{'\n'}
          <Text style={styles.brand}>UtalcaMarket</Text>
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPwdBtn}
          >
            <Text style={styles.showPwdText}>{showPassword ? 'Ocultar' : 'Mostrar'} contraseñas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#22223b" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)/LoginScreen')}>
            <Text style={styles.loginLink}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A5B4FC',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 36,
    color: '#22223b',
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: '#22223b',
  },
  form: {},
  label: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
    color: '#22223b',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  showPwdBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  showPwdText: {
    color: '#22223b',
  },
  button: {
    width: '100%',
    backgroundColor: '#ffa726',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.17,
    shadowRadius: 4.65,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#22223b',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginLink: {
    marginTop: 20,
    fontSize: 15,
    color: '#22223b',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default RegisterScreen;