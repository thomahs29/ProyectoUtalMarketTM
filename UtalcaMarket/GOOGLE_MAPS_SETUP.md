# Configuración de Google Maps API Key

Este documento explica cómo configurar Google Maps para que funcione en la aplicación UtalcaMarket.

## 📋 Archivos importantes

- `android/app/src/main/res/values/google_maps_api.xml` - Contiene tu API Key (NO subir a Git)
- `android/app/src/main/res/values/google_maps_api.xml.example` - Archivo de ejemplo
- `android/app/src/main/AndroidManifest.xml` - Ya configurado para usar la API Key

## 🔑 Obtener una Google Maps API Key

### 1. Crear/Seleccionar proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente
   - Click en el selector de proyectos (arriba)
   - Click en "NEW PROJECT"
   - Nombre: `UtalcaMarket` (o el que prefieras)
   - Click en "CREATE"

### 2. Habilitar Maps SDK for Android

1. En el menú lateral, ve a **APIs & Services** → **Library**
2. Busca "Maps SDK for Android"
3. Click en el resultado
4. Click en **ENABLE**

### 3. Crear API Key

1. Ve a **APIs & Services** → **Credentials**
2. Click en **+ CREATE CREDENTIALS**
3. Selecciona **API Key**
4. Se creará una key - copia el valor mostrado

### 4. (Recomendado) Restringir la API Key

Para seguridad, es importante restringir tu API key:

1. En la pantalla de la key recién creada, click en **RESTRICT KEY**
2. En "Application restrictions":
   - Selecciona **Android apps**
   - Click en **+ Add an item**
   - Package name: `com.anonymous.UtalcaMarket`
   - SHA-1 certificate fingerprint: (ver sección siguiente)
3. En "API restrictions":
   - Selecciona **Restrict key**
   - Marca solo **Maps SDK for Android**
4. Click en **SAVE**

### 5. Obtener SHA-1 Fingerprint

El fingerprint SHA-1 identifica tu app de forma única:

```bash
cd android
./gradlew signingReport
```

Busca en la salida algo como:
```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: androiddebugkey
MD5: XX:XX:XX...
SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
SHA-256: ...
```

Copia el valor de **SHA1** y úsalo en el paso anterior.

### 6. Configurar la API Key en el proyecto

1. Abre el archivo: `android/app/src/main/res/values/google_maps_api.xml`
2. Reemplaza `YOUR_API_KEY_HERE` con tu API Key real:

```xml
<string name="google_maps_key" templateMergeStrategy="preserve" translatable="false">AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</string>
```

3. **IMPORTANTE**: Este archivo NO debe subirse a Git (ya está en .gitignore)

## 🚀 Compilar y ejecutar

Una vez configurada la API Key:

```bash
# Asegúrate de estar en la carpeta del proyecto
cd /home/artulita/Documents/ProyectoUtalMarketTM/UtalcaMarket

# Compila e instala en dispositivo/emulador Android
npx expo run:android
```

## 🔒 Seguridad

### ⚠️ NUNCA hagas esto:
- ❌ Subir `google_maps_api.xml` a Git/GitHub
- ❌ Compartir tu API Key públicamente
- ❌ Dejar la API Key sin restricciones en producción

### ✅ Buenas prácticas:
- ✅ Usa el archivo `.example` como plantilla
- ✅ Restringe la API Key a tu package name
- ✅ Agrega el SHA-1 fingerprint
- ✅ Restringe a solo Maps SDK
- ✅ Monitorea el uso en Google Cloud Console

## 💰 Costos

Google Maps tiene un plan gratuito generoso:
- $200 de crédito mensual gratis
- Primeras 28,500 cargas de mapa = GRATIS
- Solo pagas si excedes el límite gratuito

Para desarrollo/testing, no deberías tener cargos.

## 🐛 Troubleshooting

### "Authorization failure" o mapa en blanco

1. Verifica que la API Key esté correctamente copiada
2. Asegúrate de que Maps SDK for Android esté habilitado
3. Si restringiste la key, verifica:
   - Package name correcto: `com.anonymous.UtalcaMarket`
   - SHA-1 fingerprint correcto
4. Espera 5-10 minutos después de crear/modificar la key

### "This app won't run without Google Play Services"

Esto es normal en emuladores sin Google Play. Usa:
- Un dispositivo físico Android
- Un emulador con Google Play Services instalado

## 📚 Recursos adicionales

- [Documentación oficial de Google Maps Platform](https://developers.google.com/maps/documentation/android-sdk/overview)
- [Precios de Google Maps Platform](https://mapsplatform.google.com/pricing/)
- [react-native-maps en GitHub](https://github.com/react-native-maps/react-native-maps)

---

¿Problemas? Revisa la consola de Google Cloud para ver errores de API.
