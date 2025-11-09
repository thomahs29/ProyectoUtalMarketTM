import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

// Verificar que las variables de entorno estén disponibles
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Configuración diferente para web vs native
const authConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: Platform.OS === 'web',
  ...(Platform.OS !== 'web' && {
    storage: AsyncStorage,
  }),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: authConfig,
})