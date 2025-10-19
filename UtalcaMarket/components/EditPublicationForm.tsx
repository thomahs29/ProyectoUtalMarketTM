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
} from 'react-native';

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
    category: 'other' as Category,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Inicializar el formulario con los datos de la publicación
  useEffect(() => {
    setFormData({
      title: publication.title,
      description: publication.description,
      price: publication.price,
      category: publication.category,
    });
  }, [publication]);

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
      await PublicationService.updatePublication(publication.id, formData);
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

  const formatPrice = (value: string) => {
    // Remover caracteres no numéricos excepto punto y coma
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      updateField('price', 0);
      return '';
    }
    
    const price = parseInt(numericValue, 10);
    updateField('price', price);
    
    // Formatear con separadores de miles
    return new Intl.NumberFormat('es-CL').format(price);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Editar Publicación</Text>
        
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
            value={formData.price > 0 ? formatPrice(formData.price.toString()) : ''}
            onChangeText={formatPrice}
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
});

export default EditPublicationForm;