#!/bin/bash

echo "🧹 Limpiando caché y reconstruyendo app..."

# Limpiar caché de Metro
rm -rf node_modules/.cache
rm -rf .expo

# Limpiar build de Android
cd android
./gradlew clean
cd ..

# Configurar Java 17
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "✅ Caché limpiado"
echo "🚀 Iniciando rebuild..."

# Reconstruir y ejecutar
npx expo run:android

echo "✨ ¡Listo!"
