#!/bin/bash

# Script para generar APK de producción
# Uso: ./generate-apk.sh

echo "🔧 Configurando Java 17..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "📱 Verificando Java..."
java -version

echo ""
echo "🧹 Limpiando build anterior..."
cd android
./gradlew clean

echo ""
echo "📦 Generando APK de release..."
./gradlew assembleRelease

echo ""
echo "✅ APK generado!"
echo ""
echo "📍 Ubicación del APK:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📲 Para instalar en tu celular:"
echo "   1. Conecta tu celular por USB"
echo "   2. Ejecuta: adb install -r android/app/build/outputs/apk/release/app-release.apk"
echo "   O copia el APK a tu celular y ábrelo para instalarlo"
