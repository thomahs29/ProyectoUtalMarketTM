// app/(tabs)/index.tsx
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Definición de tipos
type Item = {
  id: string;
  title: string;
  subtitle: string;
};

// Constantes de colores
const HEADER_BG = '#e8f0fe';
const PLACEHOLDER = '#c2d4e8';
const CARD_FOOTER = '#f9fbfd';

// Datos de ejemplo
const MOCK: Item[] = [
  { id: '1', title: 'Producto 1', subtitle: 'Descripción del producto 1' },
  { id: '2', title: 'Producto 2', subtitle: 'Descripción del producto 2' },
  { id: '3', title: 'Producto 3', subtitle: 'Descripción del producto 3' },
  { id: '4', title: 'Producto 4', subtitle: 'Descripción del producto 4' },
  { id: '5', title: 'Producto 5', subtitle: 'Descripción del producto 5' },
  { id: '6', title: 'Producto 6', subtitle: 'Descripción del producto 6' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>

      {/* Status bar acorde al header */}
      <StatusBar style="dark" backgroundColor={HEADER_BG} />

      {/* Lista principal; usamos ListHeaderComponent para hero/encabezado */}
      <FlatList
        data={MOCK}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header custom respetando notch */}
            <ThemedView style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: HEADER_BG }]}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => { /* TODO: abrir drawer */ }} />
              <ThemedText type="title" style={styles.headerTitle}>UtalcaMarket</ThemedText>
              <View style={styles.headerActions}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
              </View>
            </ThemedView>

            {/* Hero + barra lateral */}
            <View style={styles.heroRow}>
              <TouchableOpacity 
                style={styles.heroCard} 
                onPress={() => router.push('/MisProductos')}
              >
                <ThemedView style={styles.heroCardContent}>
                  <ThemedText type="title" style={{ marginBottom: 6 }}>
                    Mis Productos 📦
                  </ThemedText>
                  <ThemedText>
                    Ver y administrar tus productos publicados
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>

              <ThemedView style={styles.heroSide}>
                <View style={styles.sideIcon} />
                <View style={styles.sideIcon} />
                <View style={styles.sideIcon} />
              </ThemedView>
            </View>

            <View style={styles.divider} />
          </>
        }
        renderItem={({ item }) => <Card item={item} />}
      />
    </SafeAreaView>
  );
}

function Card({ item }: { item: Item }) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.cardImage}>
        <View style={styles.imgShapeLarge} />
        <View style={styles.imgShapeSmall} />
      </View>

      <ThemedView style={styles.cardFooter}>
        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={{ opacity: 0.7 }}>{item.subtitle}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  column: { gap: 12 },

  // Header
  header: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerBtn: {
    width: 28, height: 18, borderRadius: 3, backgroundColor: PLACEHOLDER, marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#1c1b1f',
  },
  headerActions: { width: 44, flexDirection: 'row', justifyContent: 'space-between' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PLACEHOLDER },

  // Hero
  heroRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  heroCard: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    backgroundColor: HEADER_BG,
  },
  heroCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: HEADER_BG,
    borderRadius: 14,
  },
  heroSide: {
    width: 64,
    height: 160,
    borderRadius: 14,
    backgroundColor: HEADER_BG,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  sideIcon: { width: 28, height: 28, borderRadius: 6, backgroundColor: PLACEHOLDER },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },

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
  cardFooter: { padding: 12, backgroundColor: CARD_FOOTER },
});
