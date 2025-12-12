import { useAuth } from '@/contexts/AuthContext';
import { PublicationService } from '@/services/publicationService';
import { CATEGORIES, Category, CreatePublicationData } from '@/types/publication';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

interface CreatePublicationFormProps {
  onPublicationCreated?: () => void;
}

const CreatePublicationForm: React.FC<CreatePublicationFormProps> = ({ onPublicationCreated }) => {
  const [formData, setFormData] = useState<CreatePublicationData>({
    title: '',
    description: '',
    price: 0,
    category: 'other' as Category,
  });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }
    
    if (formData.price <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para crear una publicación');
      return;
    }

    setLoading(true);
    try {
      await PublicationService.createPublication(formData);
      
      Alert.alert(
        'Éxito',
        'Publicación creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setFormData({
                title: '',
                description: '',
                price: 0,
                category: 'other' as Category,
              });
              
              // Notificar al componente padre
              onPublicationCreated?.();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear la publicación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreatePublicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      console.log('📍 Solicitando permisos de ubicación...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Estado de permisos:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la ubicación para agregar el mapa');
        setLoadingLocation(false);
        return;
      }

      console.log('📍 Obteniendo ubicación actual...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('📍 Ubicación obtenida:', currentLocation.coords);
      
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      
      setLocation(newLocation);
      updateField('location', currentLocation);
      Alert.alert('Éxito', 'Ubicación agregada correctamente');
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación: ' + (error as Error).message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const removeLocation = () => {
    setLocation(null);
    updateField('location', undefined);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('📍 Nueva ubicación seleccionada:', { latitude, longitude });
    
    const newLocation = { latitude, longitude };
    setLocation(newLocation);
    
    // Crear un objeto Location compatible
    const locationObj = {
      coords: {
        latitude,
        longitude,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
    
    updateField('location', locationObj);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear Nueva Publicación</Text>
        <Text style={styles.subtitle}>Completa todos los campos para publicar tu artículo</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: iPhone 13 Pro Max"
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
            maxLength={100}
            editable={!loading}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu artículo, estado, características, etc."
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Precio (CLP) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.price > 0 ? formData.price.toString() : ''}
            onChangeText={(value) => {
              const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
              updateField('price', numericValue);
            }}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.pickerContainer}>
            <Picker<Category>
              selectedValue={formData.category as Category}
              onValueChange={(value: Category) => updateField('category', value)}
              style={styles.picker}
              enabled={!loading}
            >
              {CATEGORIES.map((category) => (
                <Picker.Item
                  key={category.value}
                  label={category.label}
                  value={category.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Sección de ubicación */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Ubicación</Text>
          
          {location ? (
            <View>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={handleMapPress}
                >
                  <Marker
                    coordinate={location}
                    title="Ubicación del producto"
                    draggable
                    onDragEnd={handleMapPress}
                  />
                </MapView>
              </View>
              <Text style={styles.mapHint}>
                Toca el mapa o arrastra el marcador para cambiar la ubicación
              </Text>
              <TouchableOpacity
                style={styles.removeLocationButton}
                onPress={removeLocation}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                <Text style={styles.removeLocationButtonText}>Eliminar ubicación</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="location" size={20} color="#fff" />
                  <Text style={styles.addLocationButtonText}>Agregar ubicación actual</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Crear Publicación</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  map: {
    flex: 1,
  },
  mapHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  addLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  removeLocationButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreatePublicationForm;