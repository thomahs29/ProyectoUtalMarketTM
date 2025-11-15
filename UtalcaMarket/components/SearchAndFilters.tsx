import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '@/app/(tabs)/Categories';

export interface SearchFilters {
  searchText: string;
  minPrice: string;
  maxPrice: string;
  categories: string[];
  type: 'all' | 'producto' | 'servicio';
  sortBy: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | 'relevance';
}

interface SearchAndFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export default function SearchAndFilters({ filters, onFiltersChange, onSearch }: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);

  // Sincronizar tempFilters con filters cuando cambian desde fuera
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const getSortLabel = (sortBy: SearchFilters['sortBy']) => {
    const sortLabels = {
      'date_desc': 'Más recientes',
      'date_asc': 'Más antiguos',
      'price_asc': 'Menor precio',
      'price_desc': 'Mayor precio',
      'relevance': 'Relevancia'
    };
    return sortLabels[sortBy];
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setShowFilters(false);
    onSearch();
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      searchText: '',
      minPrice: '',
      maxPrice: '',
      categories: [],
      type: 'all',
      sortBy: 'date_desc',
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setShowFilters(false);
    onSearch();
  };

  const cancelFilters = () => {
    // Restaurar tempFilters a los valores actuales de filters (descartar cambios temporales)
    setTempFilters(filters);
    setShowFilters(false);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.categories.length > 0) count++;
    if (filters.type !== 'all') count++;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos o servicios..."
          value={filters.searchText}
          onChangeText={(text) => {
            onFiltersChange({ ...filters, searchText: text });
          }}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        {filters.searchText.length > 0 && (
          <>
            <TouchableOpacity
              onPress={() => {
                onFiltersChange({ ...filters, searchText: '' });
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSearch}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Botones de filtro y ordenar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={18} color="#707cb4" />
          <Text style={styles.filterButtonText}>Filtros</Text>
          {activeFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Dropdown de ordenamiento */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(true)}
        >
          <Ionicons name="swap-vertical" size={16} color="#707cb4" />
          <Text style={styles.sortButtonText}>{getSortLabel(filters.sortBy)}</Text>
          <Ionicons name="chevron-down" size={16} color="#707cb4" />
        </TouchableOpacity>
      </View>

      {/* Modal de menú de ordenamiento */}
      <Modal
        visible={showSortMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.sortMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.sortMenuContainer}>
            <View style={styles.sortMenuHeader}>
              <Text style={styles.sortMenuTitle}>Ordenar por</Text>
              <TouchableOpacity onPress={() => setShowSortMenu(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {[
              { value: 'date_desc', label: 'Más recientes' },
              { value: 'date_asc', label: 'Más antiguos' },
              { value: 'price_asc', label: 'Menor precio' },
              { value: 'price_desc', label: 'Mayor precio' },
              { value: 'relevance', label: 'Relevancia' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortMenuItem,
                  filters.sortBy === option.value && styles.sortMenuItemActive
                ]}
                onPress={() => {
                  onFiltersChange({ ...filters, sortBy: option.value as SearchFilters['sortBy'] });
                  setShowSortMenu(false);
                }}
              >
                <Text style={[
                  styles.sortMenuItemText,
                  filters.sortBy === option.value && styles.sortMenuItemTextActive
                ]}>{option.label}</Text>
                {filters.sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color="#707cb4" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de filtros */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={cancelFilters}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={cancelFilters}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Filtro de precio */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Rango de precio</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Mínimo</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={tempFilters.minPrice}
                      onChangeText={(text) => updateFilter('minPrice', text)}
                    />
                  </View>
                  <Text style={styles.priceSeparator}>-</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Máximo</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Sin límite"
                      keyboardType="numeric"
                      value={tempFilters.maxPrice}
                      onChangeText={(text) => updateFilter('maxPrice', text)}
                    />
                  </View>
                </View>
              </View>

              {/* Filtro de tipo */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Tipo</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      tempFilters.type === 'all' && styles.typeChipActive
                    ]}
                    onPress={() => updateFilter('type', 'all')}
                  >
                    <Text style={[
                      styles.typeChipText,
                      tempFilters.type === 'all' && styles.typeChipTextActive
                    ]}>Todos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      tempFilters.type === 'producto' && styles.typeChipActive
                    ]}
                    onPress={() => updateFilter('type', 'producto')}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={16}
                      color={tempFilters.type === 'producto' ? '#fff' : '#707cb4'}
                    />
                    <Text style={[
                      styles.typeChipText,
                      tempFilters.type === 'producto' && styles.typeChipTextActive
                    ]}>Productos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      tempFilters.type === 'servicio' && styles.typeChipActive
                    ]}
                    onPress={() => updateFilter('type', 'servicio')}
                  >
                    <Ionicons
                      name="construct-outline"
                      size={16}
                      color={tempFilters.type === 'servicio' ? '#fff' : '#707cb4'}
                    />
                    <Text style={[
                      styles.typeChipText,
                      tempFilters.type === 'servicio' && styles.typeChipTextActive
                    ]}>Servicios</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filtro de categorías */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Categorías</Text>
                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        tempFilters.categories.includes(category) && styles.categoryChipActive
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        tempFilters.categories.includes(category) && styles.categoryChipTextActive
                      ]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#707cb4',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#707cb4',
  },
  filterBadge: {
    backgroundColor: '#707cb4',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    flex: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#707cb4',
    flex: 1,
  },
  sortMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sortMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
  },
  sortMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortMenuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sortMenuItemActive: {
    backgroundColor: '#f0f4ff',
  },
  sortMenuItemText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  sortMenuItemTextActive: {
    color: '#707cb4',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  priceInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  priceSeparator: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e8ff',
  },
  typeChipActive: {
    backgroundColor: '#707cb4',
    borderColor: '#707cb4',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#707cb4',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#707cb4',
    borderColor: '#707cb4',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#707cb4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
