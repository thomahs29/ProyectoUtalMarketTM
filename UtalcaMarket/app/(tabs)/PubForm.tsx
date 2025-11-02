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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";

type PublicationType = "producto" | "servicio" | null;

const CATEGORIAS = [
  "electronics",
  "books",
  "clothing",
  "home",
  "sports",
  "other",
];

// Componente para mostrar vista previa de video
const VideoPreview = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
  });

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />
      <View style={styles.videoTag}>
        <Ionicons name="videocam" size={16} color="#FFF" />
      </View>
    </View>
  );
};

const PubForm = () => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<PublicationType>(null);
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [archivos, setArchivos] = useState<{ uri: string; type: 'image' | 'video' }[]>([]);
  const [ubicacion, setUbicacion] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // Función para seleccionar imágenes y videos
  const seleccionarArchivos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu galería para seleccionar archivos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
      videoMaxDuration: 60, // Máximo 60 segundos de video
    });

    if (!result.canceled) {
      const nuevosArchivos = result.assets
        .filter(asset => asset.type === 'image' || asset.type === 'video')
        .map((asset) => ({
          uri: asset.uri,
          type: asset.type as 'image' | 'video',
        }));
      setArchivos([...archivos, ...nuevosArchivos]);
    }
  };

  // Función para tomar foto con la cámara
  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu cámara para tomar fotos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const nuevaFoto = {
        uri: result.assets[0].uri,
        type: 'image' as 'image' | 'video',
      };
      setArchivos([...archivos, nuevaFoto]);
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

  // Función para eliminar un archivo
  const eliminarArchivo = (index: number) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
  };

  // Función para subir archivos a Supabase Storage
  const subirArchivos = async (): Promise<string[]> => {
    // Si no hay archivos, retornar array vacío
    if (archivos.length === 0) {
      return [];
    }

    // Obtener el usuario y su token de sesión
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuario no autenticado");
    }

    const urls: string[] = [];

    for (const archivo of archivos) {
      try {
        console.log('Procesando archivo:', archivo.uri);

        // Crear FormData para subir el archivo
        const formData = new FormData();
        
        // Generar nombre único para el archivo
        const fileExt = archivo.type === 'video' ? 'mp4' : 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        // Incluir el user_id en la ruta del archivo
        const filePath = `${session.user.id}/${fileName}`;

        // Agregar el archivo al FormData
        // @ts-ignore - FormData acepta uri en React Native
        formData.append('file', {
          uri: archivo.uri,
          type: archivo.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: fileName,
        });

        console.log('Subiendo archivo:', filePath);
        console.log('Token de sesión:', session.access_token.substring(0, 20) + '...');

        // Subir a Supabase Storage usando fetch directo con el token de sesión
        const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/publications/${filePath}`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`, // Usar el token de sesión, no la anon key
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', response.status, errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Archivo subido exitosamente:', result);

        // Obtener URL pública del archivo
        const { data: urlData } = supabase.storage
          .from('publications')
          .getPublicUrl(filePath);

        console.log('URL pública generada:', urlData.publicUrl);
        urls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Error procesando archivo:', error);
        Alert.alert("Error", `No se pudo subir uno de los archivos: ${error}`);
        throw error; // Lanzar el error para detener el proceso
      }
    }

    return urls;
  };

  // Función para enviar el formulario
  const handleSubmit = async () => {
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

    try {
      // Mostrar indicador de carga
      setSubiendo(true);

      // Subir archivos a Supabase Storage
      const archivosUrls = await subirArchivos();

      // Obtener el user_id del usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión para crear una publicación");
        return;
      }

      // Preparar datos para la base de datos según el esquema de publications
      const publicacion = {
        title: nombre,
        description: descripcion,
        price: parseFloat(precio),
        category: categoria,
        pub_type: tipo,
        user_id: user.id, // Reemplazar con user.id cuando esté disponible
        media_url: archivosUrls, // URLs de los archivos multimedia subidos
        location: ubicacion ? {
          latitude: ubicacion.latitude,
          longitude: ubicacion.longitude,
        } : null,
      };

      console.log("Publicación a guardar:", publicacion);
      
      // Guardar en la tabla de publications de Supabase
      const { data, error } = await supabase
        .from('publications')
        .insert([publicacion])
        .select();

      if (error) {
        console.error("Error guardando publicación:", error);
        throw error;
      }

      console.log("Publicación guardada:", data);
      Alert.alert("Éxito", "Publicación creada correctamente");

      // Limpiar formulario
      limpiarFormulario();
    } catch (error) {
      console.error("Error al crear publicación:", error);
      Alert.alert("Error", "No se pudo crear la publicación. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTipo(null);
    setCategoria("");
    setDescripcion("");
    setPrecio("");
    setArchivos([]);
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

        {/* Imágenes y Videos */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Imágenes y Videos</Text>
          
          <View style={styles.mediaButtonsContainer}>
            <TouchableOpacity
              style={[styles.mediaButton, styles.cameraButton]}
              onPress={tomarFoto}
            >
              <Ionicons name="camera" size={24} color="#707cb4ff" />
              <Text style={styles.mediaButtonText}>Tomar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaButton, styles.galleryButton]}
              onPress={seleccionarArchivos}
            >
              <Ionicons name="images" size={24} color="#707cb4ff" />
              <Text style={styles.mediaButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>

          {archivos.length > 0 && (
            <View style={styles.imagenesPreview}>
              {archivos.map((archivo, index) => (
                <View key={index} style={styles.imagenContainer}>
                  {archivo.type === 'image' ? (
                    <Image source={{ uri: archivo.uri }} style={styles.imagen} />
                  ) : (
                    <VideoPreview uri={archivo.uri} />
                  )}
                  <TouchableOpacity
                    style={styles.eliminarImagen}
                    onPress={() => eliminarArchivo(index)}
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
        <TouchableOpacity 
          style={[styles.submitButton, subiendo && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={subiendo}
        >
          {subiendo ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.submitButtonText}>Subiendo archivos...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Publicar</Text>
          )}
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
    paddingTop: 20,
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
  mediaButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#707cb4ff",
  },
  cameraButton: {
    // Estilos específicos para el botón de cámara si es necesario
  },
  galleryButton: {
    // Estilos específicos para el botón de galería si es necesario
  },
  mediaButtonText: {
    fontSize: 14,
    color: "#707cb4ff",
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
  videoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  video: {
    width: 100,
    height: 100,
  },
  videoTag: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    padding: 4,
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
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PubForm;