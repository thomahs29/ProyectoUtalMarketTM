// app/(tabs)/MisProductos.tsx
import { ModalDrawer } from '@/components/ModalDrawer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PublicationService } from '@/services/publicationService';
import { Publication } from '@/types/publication';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_BG = '#e8f0fe';
const PLACEHOLDER = '#c2d4e8';

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Cargar productos del usuario
  useEffect(() => {
    loadUserPublications();
    subscribeToPublications();
  }, []);

  const loadUserPublications = async () => {
    try {
      setLoading(true);
      const data = await PublicationService.getUserPublications();
      setProductos(data);
    } catch (error) {
      console.error('Error loading publications:', error);
      Alert.alert('Error', 'No se pudieron cargar tus productos');
    } finally {
      setLoading(false);
    }
  };

  // Suscribirse a cambios en tiempo real
  const subscribeToPublications = () => {
    const subscription = supabase
      .channel('user-publications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'publications' },
        (payload) => {
          loadUserPublications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleEliminar = (id: string, titulo: string) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro que deseas eliminar "${titulo}"?`,
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
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const handleEditar = (producto: Publication) => {
    // Navegar a pantalla de edición pasando el producto como parámetro
    router.push({
      pathname: '/(tabs)/publications',
      params: {
        id: producto.id,
        title: producto.title,
        description: producto.description,
        price: producto.price.toString(),
        category: producto.category,
      },
    });
  };

  const handleAgregar = () => {
    router.push('/(tabs)/publications');
  };

  const renderProducto = ({ item }: { item: Publication }) => (
    <View style={styles.card}>
      {/* Botón Eliminar */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleEliminar(item.id, item.title)}
      >
        <Ionicons name="close-circle" size={28} color="#ff4444" />
      </TouchableOpacity>

      {/* Botón Editar */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => handleEditar(item)}
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
        <ThemedText style={styles.categoria}>
          {item.category}
        </ThemedText>
      </View>
    </View>
  );

  const emptyComponent = loading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText style={{ marginTop: 12 }}>Cargando tus productos...</ThemedText>
    </View>
  ) : (
    <View style={styles.centerContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <ThemedText style={{ marginTop: 12, fontSize: 16 }}>
        No tienes productos publicados
      </ThemedText>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleAgregar}
      >
        <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
          Crear producto
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal Drawer */}
      <ModalDrawer 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />

      {/* Header */}
      <ThemedView style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: HEADER_BG }]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerVisible(true)}
        >
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          Mis Productos
        </ThemedText>

        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={handleAgregar}
        >
          <Ionicons name="add-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </ThemedView>

      {/* Lista de productos */}
      {loading && productos.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={{ marginTop: 12 }}>Cargando tus productos...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={emptyComponent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  menuBtn: {
    padding: 8,
  },

  addHeaderBtn: {
    padding: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  addBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },

  column: {
    gap: 12,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },

  deleteBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
  },

  editBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },

  imagePlaceholder: {
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfo: {
    padding: 12,
  },

  precio: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ecc71',
    marginBottom: 4,
  },

  titulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  categoria: {
    fontSize: 12,
    color: '#999',
  },
});
