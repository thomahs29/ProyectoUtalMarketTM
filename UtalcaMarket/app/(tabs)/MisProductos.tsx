// app/(tabs)/MisProductos.tsx
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tipo para los productos
type Producto = {
  id: string;
  titulo: string;
  precio: number;
  imagen?: string;
};

// Datos de ejemplo (simulando productos del vendedor)
const PRODUCTOS_INICIALES: Producto[] = [
  { id: '1', titulo: 'Casa Amoblada Sector ...', precio: 260000 },
  { id: '2', titulo: 'Casa Amoblada Sector ...', precio: 260000 },
  { id: '3', titulo: 'Casa Amoblada Sector ...', precio: 260000 },
  { id: '4', titulo: 'Casa Amoblada Sector ...', precio: 260000 },
  { id: '5', titulo: 'Casa Amoblada Sector ...', precio: 260000 },
  { id: '6', titulo: 'Casa Amoblada Sector ...', precio: 260000 },
];

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_INICIALES);

  const handleEliminar = (id: string) => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProductos(productos.filter(p => p.id !== id));
          },
        },
      ]
    );
  };

  const handleEditar = (id: string) => {
    Alert.alert('Editar Producto', `Editando producto ID: ${id}`);
    // TODO: Navegar a pantalla de edición
  };

  const renderProducto = ({ item }: { item: Producto }) => (
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
          ${item.precio.toLocaleString('es-CL')}
        </ThemedText>
        <ThemedText style={styles.titulo} numberOfLines={2}>
          {item.titulo}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => Alert.alert('Menú', 'Abrir menú lateral')}
        >
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        
        <ThemedText type="title" style={styles.headerTitle}>
          Mis Productos
        </ThemedText>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('Agregar', 'Agregar nuevo producto')}
        >
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Grid de productos */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
