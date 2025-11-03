#!/bin/bash

# Script para compilar la app con Java 17
# Uso: ./build-android.sh

echo "🔧 Configurando Java 17..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "📱 Verificando Java..."
java -version

echo ""
echo "🚀 Compilando app Android..."
npx expo run:android
