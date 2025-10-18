
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

// Verificar que las variables de entorno estén disponibles
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
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

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: authConfig,
})