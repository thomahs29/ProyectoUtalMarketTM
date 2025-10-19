import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

interface Chat {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unread: number;
  messages: Message[];
}

export default function MessagesScreen() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      userName: 'Juan García',
      lastMessage: '¿Aún disponible?',
      timestamp: '10:30',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
      unread: 2,
      messages: [
        {
          id: '1',
          text: 'Hola, ¿tienes ese producto?',
          sender: 'other',
          timestamp: '09:00',
        },
        {
          id: '2',
          text: 'Sí, lo tengo disponible',
          sender: 'me',
          timestamp: '09:05',
        },
        {
          id: '3',
          text: '¿Aún disponible?',
          sender: 'other',
          timestamp: '10:30',
        },
      ],
    },
    {
      id: '2',
      userName: 'María López',
      lastMessage: 'Perfecto, nos vemos mañana',
      timestamp: 'Ayer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      unread: 0,
      messages: [
        {
          id: '1',
          text: 'Hola María, ¿cómo estás?',
          sender: 'me',
          timestamp: '15:30',
        },
        {
          id: '2',
          text: 'Bien, ¿y tú?',
          sender: 'other',
          timestamp: '15:35',
        },
        {
          id: '3',
          text: 'Podemos vernos para recoger el producto',
          sender: 'me',
          timestamp: '16:00',
        },
        {
          id: '4',
          text: 'Perfecto, nos vemos mañana',
          sender: 'other',
          timestamp: '16:05',
        },
      ],
    },
    {
      id: '3',
      userName: 'Carlos Rodríguez',
      lastMessage: 'Gracias por la compra',
      timestamp: '12/10',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      unread: 0,
      messages: [
        {
          id: '1',
          text: 'Hola Carlos, recibí mi orden',
          sender: 'me',
          timestamp: '10:00',
        },
        {
          id: '2',
          text: 'Qué bueno, ¿todo bien?',
          sender: 'other',
          timestamp: '10:05',
        },
        {
          id: '3',
          text: 'Perfecto, muy buen producto',
          sender: 'me',
          timestamp: '10:10',
        },
        {
          id: '4',
          text: 'Gracias por la compra',
          sender: 'other',
          timestamp: '10:15',
        },
      ],
    },
  ]);

  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === selectedChat) {
            const newMessage: Message = {
              id: String(chat.messages.length + 1),
              text: messageText,
              sender: 'me',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: messageText,
              timestamp: 'Ahora',
            };
          }
          return chat;
        })
      );
      setMessageText('');
    }
  };

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
          data={currentChat.messages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleOther,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.sender === 'me' ? styles.messageTextMe : styles.messageTextOther,
                ]}
              >
                {item.text}
              </Text>
              <Text style={styles.messageTime}>{item.timestamp}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
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
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
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
