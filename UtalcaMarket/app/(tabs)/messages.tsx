import { useAuth } from '@/contexts/AuthContext';
import {
    getConversationMessages,
    getOtherParticipant,
    getUserConversations,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
} from '@/utils/messagingService';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
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

export default function MessagesScreen() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const loadMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      const msgs = await getConversationMessages(selectedChat, 50, 0);
      setMessages(msgs.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
      })));
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }, [selectedChat]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Suscribirse a mensajes cuando se selecciona un chat
  useEffect(() => {
    if (selectedChat && user?.id) {
      loadMessages();
      // Suscribirse a nuevos mensajes en tiempo real
      const channel = subscribeToMessages(selectedChat, (newMessage) => {
        setMessages((prev) => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          sender_id: newMessage.sender_id,
          created_at: newMessage.created_at,
        }]);
      });

      return () => {
        if (channel) {
          unsubscribeFromMessages(channel);
        }
      };
    }
  }, [selectedChat, user?.id, loadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user?.id) return;

    try {
      setSendingMessage(true);
      await sendMessage(selectedChat, user.id, messageText);
      setMessageText('');
      
      // Recargar mensajes inmediatamente después de enviar
      // (Realtime puede no estar habilitado o tener latencia)
      setTimeout(async () => {
        const msgs = await getConversationMessages(selectedChat, 50, 0);
        setMessages(msgs.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
        })));
      }, 500);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setSendingMessage(false);
    }
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
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.messageTextMe : styles.messageTextOther,
                  ]}
                >
                  {item.content}
                </Text>
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

        {/* Input */}
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
});
