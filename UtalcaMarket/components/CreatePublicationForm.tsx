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
});

export default CreatePublicationForm;