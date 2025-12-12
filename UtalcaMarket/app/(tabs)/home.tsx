// app/(tabs)/index.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Publication } from '@/types/publication';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import SearchAndFilters, { SearchFilters } from '@/components/SearchAndFilters';

// Constantes de colores
const HEADER_BG = '#e8f0fe';
const CARD_FOOTER = '#f9fbfd';

export default function HomeScreen() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
    minPrice: '',
    maxPrice: '',
    categories: [],
    type: 'all',
    sortBy: 'date_desc',
  });

  // Estado para controlar cuándo se ejecuta realmente la búsqueda
  const [activeSearchText, setActiveSearchText] = useState('');

  // Crear una clave estable para las categorías
  const categoriesKey = React.useMemo(() => filters.categories.join(','), [filters.categories]);

  // Limpiar la búsqueda activa cuando se borra el texto
  useEffect(() => {
    if (filters.searchText === '') {
      setActiveSearchText('');
    }
  }, [filters.searchText]);

  // Función para cargar publicaciones con filtros
  const loadPublications = async () => {
    if (!refreshing) {
      setLoading(true);
    }
    try {
      let query = supabase.from('publications').select('*');

      // Aplicar búsqueda por texto (usando activeSearchText)
      if (activeSearchText.trim()) {
        query = query.or(`title.ilike.%${activeSearchText}%,description.ilike.%${activeSearchText}%`);
      }

      // Aplicar filtro de precio mínimo
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice)) {
          query = query.gte('price', minPrice);
        }
      }

      // Aplicar filtro de precio máximo
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice)) {
          query = query.lte('price', maxPrice);
        }
      }

      // Aplicar filtro de categorías
      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      // Aplicar filtro de tipo (producto/servicio)
      if (filters.type !== 'all') {
        query = query.eq('pub_type', filters.type);
      }

      // Aplicar ordenamiento
      switch (filters.sortBy) {
        case 'date_desc':
          query = query.order('created_at', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'relevance':
          // Para relevancia, podríamos usar un score basado en vistas, favoritos, etc.
          // Por ahora, usar fecha descendente como fallback
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setPublications(data as Publication[]);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para refrescar
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPublications();
  };

  // Función para ejecutar la búsqueda (activar el texto de búsqueda)
  const executeSearch = () => {
    setActiveSearchText(filters.searchText);
  };

  // Cargar publicaciones al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSearchText, // Solo recargar cuando se active la búsqueda
    filters.minPrice,
    filters.maxPrice,
    categoriesKey, // Usar la clave estable
    filters.type,
    filters.sortBy,
  ]);

  // Mostrar indicador de carga inicial
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StatusBar style="dark" translucent={false} />
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
      <StatusBar style="dark" translucent={false} />

      {/* Componente de búsqueda y filtros */}
      <SearchAndFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={executeSearch}
      />

      {/* Lista principal */}
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
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              No se encontraron resultados
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Intenta ajustar tus filtros de búsqueda
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => <Card item={item} />}
      />
    </SafeAreaView>
  );
}

function Card({ item }: { item: Publication }) {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  // Obtener la primera imagen si existe
  // Si media_url es un string JSON, parsearlo a array
  let mediaArray: string[] = [];
  if (item.media_url) {
    if (typeof item.media_url === 'string') {
      try {
        mediaArray = JSON.parse(item.media_url);
      } catch (e) {
        console.log('Error parseando media_url:', e);
      }
    } else if (Array.isArray(item.media_url)) {
      mediaArray = item.media_url;
    }
  }
  
  const imageUrl = mediaArray.length > 0 ? mediaArray[0] : null;

  return (
    <Link href={`/ProductDetail?id=${item.id}`} asChild>
      <Pressable style={{ flex: 1 }}>
        <ThemedView style={styles.card}>
      <View style={styles.cardImage}>
        {imageUrl ? (
          <>
            {imageLoading && !imageError && (
              <View style={styles.loadingImageContainer}>
                <ActivityIndicator size="small" color="#707cb4ff" />
              </View>
            )}
            <Image 
              source={{ uri: imageUrl }} 
              style={[styles.productImage, imageLoading && { opacity: 0 }]}
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onError={(error) => {
                console.log('❌ Error cargando imagen:', imageUrl, error.nativeEvent.error);
                setImageLoading(false);
                setImageError(true);
              }}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
            />
            {imageError && (
              <>
                <Ionicons name="image-outline" size={48} color="#999" />
                <ThemedText style={styles.noImageText}>Error al cargar</ThemedText>
              </>
            )}
          </>
        ) : (
          <>
            <Ionicons name="image-outline" size={48} color="#999" />
            <ThemedText style={styles.noImageText}>Sin imagen</ThemedText>
          </>
        )}
      </View>

      <ThemedView style={styles.cardFooter}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={styles.priceText}>{formatPrice(item.price)}</ThemedText>
        <ThemedText style={{ opacity: 0.7, fontSize: 12 }} numberOfLines={2}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </ThemedView>
    </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  categoryContainer: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: '#E3F2FF',
    borderColor: '#707cb4ff',
  },
  categoryText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#707cb4ff',
    fontWeight: '700',
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
    width: '100%',
    backgroundColor: HEADER_BG,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingImageContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
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
