// app/ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Publication } from '@/types/publication';
import { PublicationService } from '@/services/publicationService';
import { useAuth } from '@/contexts/AuthContext';
import { createOrGetConversation } from '@/utils/messagingService';

// Importación condicional de react-native-maps (opcional para desarrollo)
let MapView: any = null;
let Marker: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch {
  console.log('react-native-maps no disponible');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const loadProduct = React.useCallback(async () => {
    try {
      if (!id) return;
      const data = await PublicationService.getPublicationById(id);
      
      // Parsear location si viene como string JSON
      if (data?.location && typeof data.location === 'string') {
        try {
          data.location = JSON.parse(data.location);
        } catch (e) {
          console.log('❌ Error parseando location:', e);
        }
      }
      
      setProduct(data);
      
      // Procesar imágenes
      if (data?.media_url) {
        let mediaArray: string[] = [];
        if (typeof data.media_url === 'string') {
          try {
            mediaArray = JSON.parse(data.media_url);
          } catch (e) {
            console.log('Error parseando media_url:', e);
          }
        } else if (Array.isArray(data.media_url)) {
          mediaArray = data.media_url;
        }
        setImages(mediaArray);
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleContactSeller = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para contactar al vendedor');
      return;
    }

    if (!product) return;

    // No permitir contactarse a sí mismo
    if (product.user_id === user.id) {
      Alert.alert('Aviso', 'No puedes contactarte a ti mismo');
      return;
    }

    try {
      // Crear o obtener conversación con el vendedor
      const conversationId = await createOrGetConversation(user.id, product.user_id);
      
      // Navegar a la pantalla de mensajes con la conversación abierta
      router.push(`/messages?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Error creando conversación:', error);
      Alert.alert('Error', 'No se pudo iniciar la conversación');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      electronics: 'Electrónicos',
      books: 'Libros',
      clothing: 'Ropa',
      home: 'Hogar',
      sports: 'Deportes',
      other: 'Otros',
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#707cb4ff" />
        <ThemedText style={styles.loadingText}>Cargando producto...</ThemedText>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <ThemedText style={styles.errorText}>Producto no encontrado</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Volver</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Detalle del Producto</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Galería de imágenes */}
        {images.length > 0 ? (
          <View style={styles.imageGallery}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
            >
              {images.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {/* Indicador de páginas */}
            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
            <ThemedText style={styles.noImageText}>Sin imágenes</ThemedText>
          </View>
        )}

        {/* Información del producto */}
        <View style={styles.contentContainer}>
          {/* Precio */}
          <ThemedText style={styles.price}>{formatPrice(product.price)}</ThemedText>

          {/* Título */}
          <ThemedText style={styles.title}>{product.title}</ThemedText>

          {/* Categoría */}
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag-outline" size={16} color="#707cb4ff" />
            <ThemedText style={styles.category}>{getCategoryLabel(product.category)}</ThemedText>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
            <ThemedText style={styles.description}>{product.description}</ThemedText>
          </View>

          {/* Ubicación en el mapa */}
          {product.location && typeof product.location !== 'string' && (product.location.latitude || product.location.coords) && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Ubicación Aproximada</ThemedText>
              {MapView ? (
                <>
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: product.location.coords?.latitude || product.location.latitude,
                        longitude: product.location.coords?.longitude || product.location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: product.location.coords?.latitude || product.location.latitude,
                          longitude: product.location.coords?.longitude || product.location.longitude,
                        }}
                        title={product.title}
                      >
                        <Ionicons name="location" size={32} color="#707cb4ff" />
                      </Marker>
                    </MapView>
                  </View>
                  <View style={styles.locationInfo}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <ThemedText style={styles.locationText}>
                      {(product.location.coords?.latitude || product.location.latitude).toFixed(4)}, {(product.location.coords?.longitude || product.location.longitude).toFixed(4)}
                    </ThemedText>
                  </View>
                </>
              ) : (
                <View style={styles.locationInfo}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <ThemedText style={styles.locationText}>
                    Ubicación: {(product.location.coords?.latitude || product.location.latitude).toFixed(4)}, {(product.location.coords?.longitude || product.location.longitude).toFixed(4)}
                  </ThemedText>
                  <ThemedText style={[styles.locationText, { fontSize: 12, color: '#999', marginTop: 4 }]}>
                    (Mapa no disponible - usar dispositivo físico)
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Información adicional */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Información Adicional</ThemedText>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <ThemedText style={styles.infoText}>
                Tipo: {product.pub_type === 'producto' ? 'Producto' : 'Servicio'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <ThemedText style={styles.infoText}>
                Publicado: {new Date(product.created_at).toLocaleDateString('es-CL')}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de contactar al vendedor */}
      {product.user_id !== user?.id && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <ThemedText style={styles.contactButtonText}>Contactar al vendedor</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#707cb4ff',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  noImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contentContainer: {
    padding: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#707cb4ff',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  category: {
    fontSize: 14,
    color: '#707cb4ff',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#707cb4ff',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
