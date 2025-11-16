import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function ChatbotScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m the Roads Authority chatbot. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: 'Thank you for your message. Our team will get back to you soon. For immediate assistance, please contact our offices.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={110}
        style={{ flex: 1 }}
      >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            {message.sender === 'bot' && (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? { color: '#FFFFFF' } : { color: colors.text },
                ]}
              >
                {message.text}
              </Text>
            </View>
            {message.sender === 'user' && (
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Ionicons name="person" size={20} color="#000000" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSend}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
     header: {
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    messagesContainer: {
      padding: 20,
      paddingBottom: 10,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      alignItems: 'flex-end',
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    botMessage: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
    },
    messageBubble: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'flex-end',
    },
    input: {
      flex: 1,
      maxHeight: 100,
      fontSize: 16,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      marginRight: 10,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

