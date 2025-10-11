// app/(tabs)/index.tsx
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
import { Link } from 'expo-router';
import React from 'react';

type Item = { id: string; title: string; subtitle: string };

const MOCK: Item[] = [
  { id: '1', title: 'Title', subtitle: 'Subtitle' },
  { id: '2', title: 'Title', subtitle: 'Subtitle' },
  { id: '3', title: 'Title', subtitle: 'Subtitle' },
  { id: '4', title: 'Title', subtitle: 'Subtitle' },
  { id: '5', title: 'Title', subtitle: 'Subtitle' },
  { id: '6', title: 'Title', subtitle: 'Subtitle' },
];

const HEADER_BG = '#E9DEEF'; // lavanda claro
const PLACEHOLDER = '#cdbfd5';
const CARD_FOOTER = '#F7EFF9';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

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
              <ThemedView style={styles.heroCard}>
                <ThemedText type="title" style={{ marginBottom: 6 }}>AAAA</ThemedText>
                <ThemedText>
                  AAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAA A
                </ThemedText>
              </ThemedView>

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
    padding: 16,
    justifyContent: 'center',
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
