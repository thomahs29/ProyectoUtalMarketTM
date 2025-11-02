// app/(tabs)/MisProductos.tsx
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Publication } from '@/types/publication';
import { PublicationService } from '@/services/publicationService';

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para cargar productos del usuario
  const loadUserProducts = async () => {
    try {
      const data = await PublicationService.getUserPublications();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar tus productos');
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProducts();
    setRefreshing(false);
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadUserProducts();
  }, []);

  const handleEliminar = async (id: string) => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await PublicationService.deletePublication(id);
              setProductos(productos.filter(p => p.id !== id));
              Alert.alert('Éxito', 'Producto eliminado correctamente');
            } catch (error) {
              console.error('Error eliminando producto:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const handleEditar = (id: string) => {
    Alert.alert('Editar Producto', `Editando producto ID: ${id}`);
    // TODO: Navegar a pantalla de edición
  };

  const renderProducto = ({ item }: { item: Publication }) => (
    <View style={styles.card}>
      {/* Botón Eliminar */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleEliminar(item.id)}
      >
        <Ionicons name="close-circle" size={28} color="#ff4444" />
      </TouchableOpacity>

      {/* Botón Editar */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => handleEditar(item.id)}
      >
        <Ionicons name="create-outline" size={24} color="#333" />
      </TouchableOpacity>

      {/* Imagen del producto */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={48} color="#999" />
      </View>

      {/* Información del producto */}
      <View style={styles.cardInfo}>
        <ThemedText style={styles.precio}>
          ${item.price.toLocaleString('es-CL')}
        </ThemedText>
        <ThemedText style={styles.titulo} numberOfLines={2}>
          {item.title}
        </ThemedText>
      </View>
    </View>
  );

  // Mostrar indicador de carga inicial
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#707cb4ff" />
          <ThemedText style={styles.loadingText}>Cargando tus productos...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Grid de productos */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              No tienes productos publicados
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

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

  // Header
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addBtn: {
    padding: 4,
  },

  // Lista
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Tarjeta de producto
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'visible',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  // Botones de acción
  deleteBtn: {
    position: 'absolute',
    top: -8,
    left: -8,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  editBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  // Imagen
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  // Información
  cardInfo: {
    padding: 12,
    gap: 4,
  },
  precio: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  titulo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },

  // Estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
