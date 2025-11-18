import { useAuth } from '@/contexts/AuthContext';
import { PublicationService } from '@/services/publicationService';
import { CATEGORIES, Category, CreatePublicationData, Publication } from '@/types/publication';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

interface EditPublicationFormProps {
  publication: Publication;
  onPublicationUpdated?: () => void;
}

const EditPublicationForm: React.FC<EditPublicationFormProps> = ({ 
  publication, 
  onPublicationUpdated 
}) => {
  const [formData, setFormData] = useState<CreatePublicationData>({
    title: '',
    description: '',
    price: 0,
    category: 'Otros' as Category,
    media_url: [],
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { user } = useAuth();

  // Inicializar el formulario con los datos de la publicación
  useEffect(() => {
    // Procesar imágenes
    let mediaArray: string[] = [];
    if (publication.media_url) {
      if (typeof publication.media_url === 'string') {
        try {
          mediaArray = JSON.parse(publication.media_url);
        } catch (e) {
          console.log('Error parseando media_url:', e);
        }
      } else if (Array.isArray(publication.media_url)) {
        mediaArray = publication.media_url;
      }
    }
    
    // Procesar ubicación
    let locationData = null;
    if (publication.location) {
      if (typeof publication.location === 'string') {
        try {
          locationData = JSON.parse(publication.location);
        } catch (e) {
          console.log('Error parseando location:', e);
        }
      } else if (typeof publication.location === 'object') {
        locationData = publication.location;
      }
    }
    
    if (locationData?.latitude && locationData?.longitude) {
      setLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
    } else if (locationData?.coords) {
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
    }
    
    setFormData({
      title: publication.title,
      description: publication.description,
      price: publication.price,
      category: publication.category,
      media_url: mediaArray,
      location: locationData || undefined,
    });
    setImages(mediaArray);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publication.id]);

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
      Alert.alert('Error', 'Debes estar autenticado para editar una publicación');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar datos para enviar (excluir 'Location' con mayúscula)
      const { Location, ...dataToSend } = formData;
      await PublicationService.updatePublication(publication.id, dataToSend);
      Alert.alert('Éxito', 'Publicación actualizada correctamente');
      onPublicationUpdated?.();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la publicación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreatePublicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (value: string) => {
    // Remover caracteres no numéricos
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      updateField('price', 0);
      return;
    }
    
    const price = parseInt(numericValue, 10);
    updateField('price', price);
  };

  const formatPriceDisplay = (price: number) => {
    if (price === 0) return '';
    return new Intl.NumberFormat('es-CL').format(price);
  };

  const pickImage = async () => {
    try {
      console.log('🖼️ Solicitando permisos de galería...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🖼️ Estado de permisos:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para seleccionar imágenes');
        return;
      }

      const maxImages = 5 - images.length;
      console.log('🖼️ Abriendo galería. Imágenes disponibles:', maxImages);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages,
      });

      console.log('🖼️ Resultado de galería:', result);

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        console.log('🖼️ Nuevas imágenes seleccionadas:', newImages);
        const updatedImages = [...images, ...newImages].slice(0, 5);
        console.log('🖼️ Imágenes actualizadas:', updatedImages);
        setImages(updatedImages);
        updateField('media_url', updatedImages);
        Alert.alert('Éxito', `${newImages.length} imagen(es) agregada(s)`);
      } else {
        console.log('🖼️ Galería cancelada o sin imágenes');
      }
    } catch (error) {
      console.error('❌ Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen: ' + (error as Error).message);
    }
  };

  const takePhoto = async () => {
    try {
      console.log('📷 Solicitando permisos de cámara...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 Estado de permisos:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la cámara para tomar fotos');
        return;
      }

      console.log('📷 Abriendo cámara...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      console.log('📷 Resultado de la cámara:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0].uri;
        console.log('📷 Nueva imagen capturada:', newImage);
        const updatedImages = [...images, newImage].slice(0, 5);
        console.log('📷 Imágenes actualizadas:', updatedImages);
        setImages(updatedImages);
        updateField('media_url', updatedImages);
        Alert.alert('Éxito', 'Imagen agregada correctamente');
      } else {
        console.log('📷 Cámara cancelada o sin imágenes');
      }
    } catch (error) {
      console.error('❌ Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto: ' + (error as Error).message);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    updateField('media_url', updatedImages);
  };

  const showImageOptions = () => {
    if (images.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes agregar hasta 5 imágenes');
      return;
    }

    Alert.alert(
      'Agregar imagen',
      'Selecciona una opción',
      [
        { text: 'Cámara', onPress: takePhoto },
        { text: 'Galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
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
      updateField('Location', currentLocation);
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
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        
        {/* Sección de imágenes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Imágenes ({images.length}/5)</Text>
          
          <View style={styles.imagesContainer}>
            <FlatList
              data={images}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyImagesContainer}>
                  <Ionicons name="images-outline" size={48} color="#999" />
                  <Text style={styles.emptyImagesText}>Sin imágenes</Text>
                </View>
              }
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.addImageButton, images.length >= 5 && styles.addImageButtonDisabled]}
            onPress={showImageOptions}
            disabled={images.length >= 5}
          >
            <Ionicons name="camera" size={20} color={images.length >= 5 ? '#999' : '#fff'} />
            <Text style={[styles.addImageButtonText, images.length >= 5 && styles.addImageButtonTextDisabled]}>
              {images.length >= 5 ? 'Máximo alcanzado' : 'Agregar imagen'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
            placeholder="Ej: iPhone 15 Pro Max"
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Describe tu producto en detalle..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Precio (CLP) *</Text>
          <TextInput
            style={styles.input}
            value={formatPriceDisplay(formData.price)}
            onChangeText={handlePriceChange}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => updateField('category', value)}
              style={styles.picker}
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
        <View style={styles.inputGroup}>
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
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Actualizar Publicación</Text>
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
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    maxHeight: 150,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Estilos para imágenes
  imagesContainer: {
    marginBottom: 12,
    minHeight: 120,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  emptyImagesContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyImagesText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  addImageButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addImageButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  addImageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addImageButtonTextDisabled: {
    color: '#999',
  },
  // Estilos para ubicación/mapa
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
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
    gap: 8,
  },
  removeLocationButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EditPublicationForm;