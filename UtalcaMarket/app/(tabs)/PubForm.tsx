import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

type PublicationType = "producto" | "servicio" | null;

const CATEGORIAS = [
  "Electrónica",
  "Ropa y Moda",
  "Hogar y Jardín",
  "Deportes",
  "Libros",
  "Juguetes",
  "Alimentos",
  "Salud y Belleza",
  "Automóviles",
  "Servicios Profesionales",
  "Otro",
];

const PubForm = () => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<PublicationType>(null);
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [ubicacion, setUbicacion] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Función para seleccionar imágenes
  const seleccionarImagenes = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu galería para seleccionar imágenes"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const nuevasImagenes = result.assets.map((asset) => asset.uri);
      setImagenes([...imagenes, ...nuevasImagenes]);
    }
  };

  // Función para obtener geolocalización
  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu ubicación para este servicio"
      );
      return;
    }

    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUbicacion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      Alert.alert("Éxito", "Ubicación obtenida correctamente");
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una imagen
  const eliminarImagen = (index: number) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    setImagenes(nuevasImagenes);
  };

  // Función para enviar el formulario
  const handleSubmit = () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }
    if (!tipo) {
      Alert.alert("Error", "Selecciona si es producto o servicio");
      return;
    }
    if (!categoria) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert("Error", "La descripción es requerida");
      return;
    }
    if (!precio.trim()) {
      Alert.alert("Error", "El precio es requerido");
      return;
    }

    // Aquí iría la lógica para guardar en Supabase
    const publicacion = {
      nombre,
      tipo,
      categoria,
      descripcion,
      precio: parseFloat(precio),
      imagenes,
      ubicacion,
    };

    console.log("Publicación:", publicacion);
    Alert.alert("Éxito", "Publicación creada correctamente");

    // Limpiar formulario
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTipo(null);
    setCategoria("");
    setDescripcion("");
    setPrecio("");
    setImagenes([]);
    setUbicacion(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nueva Publicación</Text>

        {/* Campo Nombre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del producto o servicio"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        {/* Tipo: Producto o Servicio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkboxButton,
                tipo === "producto" && styles.checkboxButtonActive,
              ]}
              onPress={() => setTipo("producto")}
            >
              <Ionicons
                name={tipo === "producto" ? "checkbox" : "square-outline"}
                size={24}
                color={tipo === "producto" ? "#707cb4ff" : "#666"}
              />
              <Text style={styles.checkboxText}>Producto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.checkboxButton,
                tipo === "servicio" && styles.checkboxButtonActive,
              ]}
              onPress={() => setTipo("servicio")}
            >
              <Ionicons
                name={tipo === "servicio" ? "checkbox" : "square-outline"}
                size={24}
                color={tipo === "servicio" ? "#707cb4ff" : "#666"}
              />
              <Text style={styles.checkboxText}>Servicio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categoría */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.categoriaContainer}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoriaButton,
                  categoria === cat && styles.categoriaButtonActive,
                ]}
                onPress={() => setCategoria(cat)}
              >
                <Text
                  style={[
                    styles.categoriaText,
                    categoria === cat && styles.categoriaTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu producto o servicio"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Precio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Precio *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 15000"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
          />
        </View>

        {/* Imágenes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Imágenes</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={seleccionarImagenes}
          >
            <Ionicons name="images" size={24} color="#707cb4ff" />
            <Text style={styles.imageButtonText}>Seleccionar Imágenes</Text>
          </TouchableOpacity>

          {imagenes.length > 0 && (
            <View style={styles.imagenesPreview}>
              {imagenes.map((uri, index) => (
                <View key={index} style={styles.imagenContainer}>
                  <Image source={{ uri }} style={styles.imagen} />
                  <TouchableOpacity
                    style={styles.eliminarImagen}
                    onPress={() => eliminarImagen(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Geolocalización */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ubicación</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={obtenerUbicacion}
            disabled={loading}
          >
            <Ionicons name="location" size={24} color="#707cb4ff" />
            <Text style={styles.locationButtonText}>
              {ubicacion
                ? `Lat: ${ubicacion.latitude.toFixed(4)}, Lon: ${ubicacion.longitude.toFixed(4)}`
                : "Obtener Ubicación"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón Enviar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    gap: 15,
  },
  checkboxButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    flex: 1,
  },
  checkboxButtonActive: {
    borderColor: "#707cb4ff",
    backgroundColor: "#E3F2FF",
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
  categoriaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoriaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  categoriaButtonActive: {
    backgroundColor: "#707cb4ff",
    borderColor: "#707cb4ff",
  },
  categoriaText: {
    fontSize: 14,
    color: "#333",
  },
  categoriaTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#707cb4ff",
    borderStyle: "dashed",
  },
  imageButtonText: {
    fontSize: 16,
    color: "#707cb4ff",
    fontWeight: "600",
  },
  imagenesPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  imagenContainer: {
    position: "relative",
  },
  imagen: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  eliminarImagen: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#707cb4ff",
  },
  locationButtonText: {
    fontSize: 16,
    color: "#707cb4ff",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#707cb4ff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PubForm;