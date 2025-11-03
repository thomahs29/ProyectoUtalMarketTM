#!/bin/bash

# Script para configurar Google Maps API Key
# Uso: ./setup-maps.sh TU_API_KEY_AQUI

API_KEY=$1
FILE_PATH="android/app/src/main/res/values/google_maps_api.xml"

if [ -z "$API_KEY" ]; then
    echo "❌ Error: Debes proporcionar una API Key"
    echo ""
    echo "Uso: ./setup-maps.sh TU_API_KEY_AQUI"
    echo ""
    echo "Para obtener una API Key:"
    echo "1. Ve a https://console.cloud.google.com/"
    echo "2. Crea un proyecto"
    echo "3. Habilita 'Maps SDK for Android'"
    echo "4. Crea una API Key en Credentials"
    echo ""
    echo "Más info en: GOOGLE_MAPS_SETUP.md"
    exit 1
fi

# Crear el archivo con la API Key
cat > "$FILE_PATH" << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Google Maps API Key -->
    <string name="google_maps_key" templateMergeStrategy="preserve" translatable="false">$API_KEY</string>
</resources>
EOF

echo "✅ API Key configurada exitosamente en $FILE_PATH"
echo ""
echo "Próximos pasos:"
echo "1. Verifica que Maps SDK for Android esté habilitado en Google Cloud"
echo "2. Compila la app: npx expo run:android"
echo "3. (Opcional) Restringe la API Key para mayor seguridad"
echo ""
echo "⚠️  IMPORTANTE: Este archivo NO se subirá a Git (está en .gitignore)"
