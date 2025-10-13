import { useAuth } from '@/contexts/AuthContext';
import { PublicationService } from '@/services/publicationService';
import { CATEGORIES, Publication } from '@/types/publication';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PublicationItemProps {
  publication: Publication;
}

const PublicationItem: React.FC<PublicationItemProps> = ({ publication }) => {
  const categoryLabel = CATEGORIES.find(cat => cat.value === publication.category)?.label || 'Otros';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.publicationCard}>
      <View style={styles.publicationHeader}>
        <Text style={styles.publicationTitle}>{publication.title}</Text>
        <Text style={styles.publicationPrice}>{formatPrice(publication.price)}</Text>
      </View>
      
      <Text style={styles.publicationDescription} numberOfLines={3}>
        {publication.description}
      </Text>
      
      <View style={styles.publicationFooter}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
        <Text style={styles.publicationDate}>{formatDate(publication.created_at)}</Text>
      </View>
    </View>
  );
};

interface PublicationsListProps {
  userOnly?: boolean;
  onRefresh?: () => void;
}

const PublicationsList: React.FC<PublicationsListProps> = ({ userOnly = false, onRefresh }) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadPublications = async () => {
    try {
      let data: Publication[];
      
      if (userOnly) {
        data = await PublicationService.getUserPublications();
      } else {
        data = await PublicationService.getAllPublications();
      }
      
      setPublications(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las publicaciones: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPublications();
    onRefresh?.();
  };

  useEffect(() => {
    if (user || !userOnly) {
      loadPublications();
    }
  }, [user, userOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </View>
    );
  }

  if (publications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {userOnly ? 'No tienes publicaciones' : 'No hay publicaciones disponibles'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {userOnly 
            ? 'Crea tu primera publicación para comenzar a vender'
            : 'Sé el primero en publicar algo'
          }
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={publications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PublicationItem publication={item} />}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3B82F6']}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  publicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  publicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  publicationTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  publicationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  publicationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  publicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  publicationDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PublicationsList;