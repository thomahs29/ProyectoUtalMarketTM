import { useAuth } from '@/contexts/AuthContext';
import {
    getConversationMessages,
    getOtherParticipant,
    getUserConversations,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    uploadChatMedia,
} from '@/utils/messagingService';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, Audio } from 'expo-av';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal } from 'react-native';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio';
}

interface Chat {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unread: number;
  participant_id: string;
}

// Componente para reproducir audio
function AudioPlayer({ audioUri }: { audioUri: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [audioUri]);

  const loadAudio = async () => {
    try {
      const { sound, status } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;
      if ('durationMillis' in status && status.durationMillis) {
        setDuration(Math.floor(status.durationMillis / 1000));
      }
    } catch (error) {
      console.error('Error cargando audio:', error);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!soundRef.current) return;
      
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
        // Actualizar posición cada 100ms
        const interval = setInterval(async () => {
          const status = await soundRef.current?.getStatusAsync();
          if (status && 'isPlaying' in status && status.isPlaying) {
            setPosition(Math.floor(('positionMillis' in status ? status.positionMillis : 0) / 1000));
          } else {
            clearInterval(interval);
          }
        }, 100);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.audioPlayerContainer}>
      <MaterialIcons name="audiotrack" size={64} color="#007AFF" />
      <TouchableOpacity 
        style={styles.audioPlayButton}
        onPress={togglePlayPause}
      >
        <MaterialIcons 
          name={isPlaying ? "pause-circle-filled" : "play-circle-filled"} 
          size={48} 
          color="#007AFF" 
        />
      </TouchableOpacity>
      <Text style={styles.audioTime}>
        {formatTime(position)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [expandedAudio, setExpandedAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Cargar conversaciones cuando se monta el componente
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const conversations = await getUserConversations(user.id);
      
      // Convertir conversaciones a formato de chat
      const chatsList: Chat[] = await Promise.all(
        conversations.map(async (conv) => {
          const otherParticipantId =
            conv.participant_1_id === user.id
              ? conv.participant_2_id
              : conv.participant_1_id;

          const conversationId = conv.conversation_id || conv.id;
          const otherUser = await getOtherParticipant(conversationId || '', user.id);
          const userName = otherUser?.full_name || otherUser?.email?.split('@')[0] || 'Usuario';
          const avatarSeed = otherUser?.email || otherUser?.id || 'user';

          return {
            id: conversationId || '',
            userName: userName,
            lastMessage: conv.last_message || 'Sin mensajes',
            timestamp: conv.last_message_time
              ? formatTime(new Date(conv.last_message_time))
              : 'Ahora',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
            unread: 0,
            participant_id: otherParticipantId,
          };
        })
      );

      setChats(chatsList);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Suscribirse a mensajes cuando se selecciona un chat
  useEffect(() => {
    if (selectedChat && user?.id) {
      // Cargar mensajes inmediatamente
      (async () => {
        try {
          const msgs = await getConversationMessages(selectedChat, 50, 0);
          setMessages(msgs.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            created_at: msg.created_at,
            media_url: (msg as any).media_url,
            media_type: (msg as any).media_type,
          })));
        } catch (error) {
          console.error('Error cargando mensajes:', error);
        }
      })();

      // Suscribirse a nuevos mensajes en tiempo real
      const channel = subscribeToMessages(selectedChat, (newMessage) => {
        setMessages((prev) => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          sender_id: newMessage.sender_id,
          created_at: newMessage.created_at,
          media_url: (newMessage as any).media_url,
          media_type: (newMessage as any).media_type,
        }]);
      });

      return () => {
        if (channel) {
          unsubscribeFromMessages(channel);
        }
      };
    }
  }, [selectedChat, user?.id]);

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedMediaUri) || !selectedChat || !user?.id) return;

    try {
      setSendingMessage(true);
      let mediaUrl: string | undefined;

      // Si hay media seleccionada, subirla primero
      if (selectedMediaUri && selectedMediaType) {
        mediaUrl = (await uploadChatMedia(
          selectedChat,
          user.id,
          selectedMediaUri,
          selectedMediaType
        )) || undefined;

        if (!mediaUrl) {
          Alert.alert('Error', 'No se pudo subir el archivo. Intenta de nuevo.');
          setSendingMessage(false);
          return;
        }
      }

      // Enviar mensaje con media opcional
      await sendMessage(
        selectedChat,
        user.id,
        messageText,
        mediaUrl,
        selectedMediaType || undefined
      );

      setMessageText('');
      setSelectedMediaUri(null);
      setSelectedMediaType(null);

      // Recargar mensajes inmediatamente después de enviar
      setTimeout(async () => {
        const msgs = await getConversationMessages(selectedChat, 50, 0);
        setMessages(msgs.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          media_url: (msg as any).media_url,
          media_type: (msg as any).media_type,
        } as Message)));
      }, 500);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMediaUri(result.assets[0].uri);
        setSelectedMediaType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMediaUri(result.assets[0].uri);
        setSelectedMediaType('video');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el video.');
    }
  };

  const handlePickAudio = async () => {
    try {
      if (isRecording) {
        // Detener grabación
        await recordingRef.current?.stopAndUnloadAsync();
        const uri = recordingRef.current?.getURI();
        recordingRef.current = null;
        setIsRecording(false);

        if (uri) {
          setSelectedMediaUri(uri);
          setSelectedMediaType('audio');
          Alert.alert('Éxito', 'Audio grabado. Presiona enviar para compartirlo.');
        }
      } else {
        // Iniciar grabación
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert('Permiso denegado', 'Se necesita permiso para grabar audio.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await recording.startAsync();
        recordingRef.current = recording;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error con audio:', error);
      Alert.alert('Error', 'No se pudo grabar el audio.');
      setIsRecording(false);
    }
  };

  const clearSelectedMedia = () => {
    setSelectedMediaUri(null);
    setSelectedMediaType(null);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === new Date(today.getTime() - 86400000).getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && !selectedChat) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const currentChat = chats.find(c => c.id === selectedChat);

  if (selectedChat && currentChat) {
    return (
      <View style={styles.chatContainer}>
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Image source={{ uri: currentChat.avatar }} style={styles.chatHeaderAvatar} />
            <Text style={styles.chatHeaderName}>{currentChat.userName}</Text>
          </View>
          <MaterialIcons name="more-vert" size={24} color="#333" />
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={({ item }) => {
            const isMine = item.sender_id === user?.id;
            return (
              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.messageBubbleMe : styles.messageBubbleOther,
                ]}
              >
                {/* Mostrar media si existe */}
                {item.media_url && item.media_type === 'image' && (
                  <TouchableOpacity 
                    onPress={() => {
                      // Pequeño delay para asegurar que el estado se actualiza
                      setTimeout(() => setExpandedImage(item.media_url!), 0);
                    }}
                  >
                    <Image
                      source={{ uri: item.media_url }}
                      style={styles.messageMedia}
                    />
                  </TouchableOpacity>
                )}
                {item.media_url && item.media_type === 'video' && (
                  <TouchableOpacity 
                    onPress={() => {
                      setTimeout(() => setExpandedVideo(item.media_url!), 0);
                    }}
                  >
                    <View style={styles.videoPlaceholder}>
                      <MaterialIcons name="play-circle-filled" size={48} color="#FFFFFF" />
                      <Text style={styles.videoText}>Video</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {item.media_url && item.media_type === 'audio' && (
                  <TouchableOpacity 
                    onPress={() => {
                      setTimeout(() => setExpandedAudio(item.media_url!), 0);
                    }}
                  >
                    <View style={styles.audioPlaceholder}>
                      <MaterialIcons name="play-circle-filled" size={32} color="#FFFFFF" />
                      <Text style={styles.audioText}>Audio</Text>
                    </View>
                  </TouchableOpacity>
                )}
                
                {/* Texto del mensaje */}
                {item.content && (
                  <Text
                    style={[
                      styles.messageText,
                      isMine ? styles.messageTextMe : styles.messageTextOther,
                    ]}
                  >
                    {item.content}
                  </Text>
                )}
                
                <Text style={styles.messageTime}>
                  {formatTime(new Date(item.created_at))}
                </Text>
              </View>
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          ListEmptyComponent={
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: '#999' }}>Sin mensajes aún</Text>
            </View>
          }
        />

        {/* Preview de media seleccionada */}
        {selectedMediaUri && (
          <View style={styles.mediaPreview}>
            {selectedMediaType === 'image' && (
              <Image
                source={{ uri: selectedMediaUri }}
                style={styles.previewImage}
              />
            )}
            {selectedMediaType === 'video' && (
              <View style={styles.previewVideo}>
                <MaterialIcons name="movie" size={40} color="#FFF" />
              </View>
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={clearSelectedMedia}
            >
              <MaterialIcons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputSection}>
          {/* Media Buttons */}
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handlePickImage}
              disabled={sendingMessage}
            >
              <MaterialIcons name="image" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handlePickVideo}
              disabled={sendingMessage}
            >
              <MaterialIcons name="videocam" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handlePickAudio}
              disabled={sendingMessage}
            >
              <MaterialIcons name="mic" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              editable={!sendingMessage}
            />
            <TouchableOpacity 
              onPress={handleSendMessage} 
              style={[styles.sendButton, sendingMessage && { opacity: 0.6 }]}
              disabled={sendingMessage}
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal para ver imagen ampliada */}
        <Modal
          visible={!!expandedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setExpandedImage(null)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => setExpandedImage(null)}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setExpandedImage(null)}
            >
              <MaterialIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            {expandedImage && (
              <Image
                source={{ uri: expandedImage }}
                style={styles.expandedImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </Modal>

        {/* Modal para reproducir video */}
        <Modal
          visible={!!expandedVideo}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setExpandedVideo(null)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => setExpandedVideo(null)}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setExpandedVideo(null)}
            >
              <MaterialIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            {expandedVideo && (
              <Video
                source={{ uri: expandedVideo }}
                style={styles.expandedVideo}
                useNativeControls
                isLooping
              />
            )}
          </TouchableOpacity>
        </Modal>

        {/* Modal para reproducir audio */}
        <Modal
          visible={!!expandedAudio}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setExpandedAudio(null)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => setExpandedAudio(null)}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setExpandedAudio(null)}
            >
              <MaterialIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            {expandedAudio && (
              <AudioPlayer audioUri={expandedAudio} />
            )}
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
        <TouchableOpacity>
          <MaterialIcons name="add-circle-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => setSelectedChat(item.id)}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader2}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              <Text
                style={[
                  styles.lastMessage,
                  item.unread > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        scrollEnabled={true}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Chat view styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageBubble: {
    marginVertical: 4,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
  },
  messageBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Nuevos estilos para media
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  mediaButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  mediaButton: {
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  mediaPreview: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  previewVideo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageMedia: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  videoPlaceholder: {
    width: 200,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  videoText: {
    color: '#FFF',
    marginTop: 8,
    fontSize: 12,
  },
  audioPlaceholder: {
    width: 200,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  audioText: {
    color: '#FFF',
    marginTop: 8,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: '90%',
    height: '90%',
  },
  expandedVideo: {
    width: '90%',
    height: '90%',
  },
  audioPlayerContainer: {
    width: '80%',
    paddingVertical: 30,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  audioPlayButton: {
    padding: 10,
  },
  audioTime: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
});
