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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { RATheme } from '../theme/colors';
import { chatbotService } from '../services/chatbotService';

const CHAT_HISTORY_KEY = 'chatbot_history';
const SESSION_ID_KEY = 'chatbot_session_id';

export default function ChatbotScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: 'Hello! I\'m the Roads Authority chatbot. I can answer questions about our services, policies, and procedures based on official documents. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollViewRef = useRef();

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
    loadSessionId();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    saveChatHistory();
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await SecureStore.getItemAsync(CHAT_HISTORY_KEY);
      if (history) {
        const parsedHistory = JSON.parse(history);
        if (parsedHistory.length > 0) {
          setMessages(parsedHistory);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async () => {
    try {
      await SecureStore.setItemAsync(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const loadSessionId = async () => {
    try {
      let id = await SecureStore.getItemAsync(SESSION_ID_KEY);
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await SecureStore.setItemAsync(SESSION_ID_KEY, id);
      }
      setSessionId(id);
    } catch (error) {
      console.error('Error loading session ID:', error);
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  };

  const clearChatHistory = async () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(CHAT_HISTORY_KEY);
              setMessages([
                {
                  id: 'welcome',
                  text: 'Hello! I\'m the Roads Authority chatbot. I can answer questions about our services, policies, and procedures based on official documents. How can I assist you today?',
                  sender: 'bot',
                  timestamp: new Date().toISOString(),
                },
              ]);
            } catch (error) {
              console.error('Error clearing chat history:', error);
            }
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatbotService.query(userMessage.text, sessionId);
      
      const botMessage = {
        id: `bot_${Date.now()}`,
        text: response.answer || response.message || 'I apologize, but I couldn\'t generate a response. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        sources: response.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      let errorMessage = 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';
      
      if (error.status === 503) {
        errorMessage = 'The chatbot service is temporarily unavailable. Please try again in a few moments.';
      } else if (error.status === 408) {
        errorMessage = 'The request timed out. Please try asking a simpler question.';
      }

      const errorBotMessage = {
        id: `bot_error_${Date.now()}`,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourcePress = (source) => {
    Alert.alert(
      'Document Source',
      `Title: ${source.title}\nDocument ID: ${source.documentId}\nRelevance: ${(source.relevance * 100).toFixed(0)}%`,
      [
        { text: 'OK', style: 'default' },
      ]
    );
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearChatHistory}
            accessibilityLabel="Clear chat history"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
              Clear History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
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
                    : message.isError
                    ? { backgroundColor: colors.error, opacity: 0.9 }
                    : { backgroundColor: colors.card },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' || message.isError
                      ? { color: '#FFFFFF' }
                      : { color: colors.text },
                  ]}
                >
                  {message.text}
                </Text>
                
                {message.sources && message.sources.length > 0 && (
                  <View style={styles.sourcesContainer}>
                    <Text style={[styles.sourcesTitle, { color: colors.textSecondary }]}>
                      Sources:
                    </Text>
                    {message.sources.map((source, index) => (
                      <TouchableOpacity
                        key={`${message.id}_source_${index}`}
                        style={[styles.sourceItem, { borderColor: colors.border }]}
                        onPress={() => handleSourcePress(source)}
                        accessibilityLabel={`View source: ${source.title}`}
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={14}
                          color={colors.primary}
                          style={styles.sourceIcon}
                        />
                        <Text
                          style={[styles.sourceText, { color: colors.primary }]}
                          numberOfLines={1}
                        >
                          {source.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {message.sender === 'user' && (
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="person" size={20} color="#000000" />
                </View>
              )}
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              </View>
              <View style={[styles.messageBubble, { backgroundColor: colors.card }]}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Thinking...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            placeholder="Ask me anything about Roads Authority..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            accessibilityLabel="Message input"
            accessibilityHint="Type your question here"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            accessibilityLabel="Send message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !inputText.trim() || isLoading }}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.textSecondary}
            />
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
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    clearButtonText: {
      fontSize: 14,
      marginLeft: 6,
      fontWeight: '500',
    },
    messagesContainer: {
      padding: 16,
      paddingBottom: 10,
      flexGrow: 1,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 16,
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
      flexShrink: 0,
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
      lineHeight: 22,
    },
    sourcesContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sourcesTitle: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 4,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.background,
    },
    sourceIcon: {
      marginRight: 6,
      flexShrink: 0,
    },
    sourceText: {
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    loadingText: {
      fontSize: 14,
      marginLeft: 10,
      fontStyle: 'italic',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 12,
      borderTopWidth: 1,
      alignItems: 'flex-end',
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 100,
      fontSize: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 22,
      marginRight: 8,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
  });
}

