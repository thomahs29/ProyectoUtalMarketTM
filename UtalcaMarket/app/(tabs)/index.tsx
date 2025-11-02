// app/(tabs)/index.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Publication } from '@/types/publication';
import { PublicationService } from '@/services/publicationService';

// Constantes de colores
const HEADER_BG = '#e8f0fe';
const PLACEHOLDER = '#c2d4e8';
const CARD_FOOTER = '#f9fbfd';

export default function HomeScreen() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para cargar publicaciones
  const loadPublications = async () => {
    try {
      const data = await PublicationService.getAllPublications();
      setPublications(data);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPublications();
    setRefreshing(false);
  };

  // Cargar publicaciones al montar el componente
  useEffect(() => {
    loadPublications();
  }, []);

  // Mostrar indicador de carga inicial
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StatusBar style="dark" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#707cb4ff" />
          <ThemedText style={styles.loadingText}>Cargando productos...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>

      {/* Status bar acorde al header */}
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* Lista principal; usamos ListHeaderComponent para hero/encabezado */}
      <FlatList
        data={publications}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#707cb4ff']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No hay productos disponibles
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Sé el primero en publicar
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => <Card item={item} />}
      />
    </SafeAreaView>
  );
}

function Card({ item }: { item: Publication }) {
  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.cardImage}>
        <View style={styles.imgShapeLarge} />
        <View style={styles.imgShapeSmall} />
      </View>

      <ThemedView style={styles.cardFooter}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={styles.priceText}>{formatPrice(item.price)}</ThemedText>
        <ThemedText style={{ opacity: 0.7, fontSize: 12 }} numberOfLines={2}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  column: { gap: 12 },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },

  // Card
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: {
    height: 140,
    backgroundColor: HEADER_BG,
    padding: 12,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgShapeLarge: { width: 64, height: 46, borderRadius: 8, backgroundColor: PLACEHOLDER },
  imgShapeSmall: { width: 32, height: 32, borderRadius: 6, backgroundColor: PLACEHOLDER },
  cardFooter: { 
    padding: 12, 
    backgroundColor: CARD_FOOTER,
    gap: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#707cb4ff',
  },
});
