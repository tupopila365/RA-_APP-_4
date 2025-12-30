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
  Pressable,
  Keyboard,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
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
  const [feedbackStates, setFeedbackStates] = useState({}); // Track feedback state per message
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef();
  const inputRef = useRef();

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

    // Handle keyboard show/hide events
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const keyboardWillShowListener = Keyboard.addListener(
      showEvent,
      (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        // Scroll to bottom when keyboard appears to show typing indicator
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, Platform.OS === 'ios' ? 100 : 300);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      hideEvent,
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

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
    const question = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Create a streaming bot message that will update in real-time
    const botMessageId = `bot_${Date.now()}`;
    const initialBotMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      sources: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialBotMessage]);

    let fullAnswer = '';
    let receivedSources = [];
    let interactionId = null;

    try {
      // Use streaming for real-time response
      await chatbotService.queryStream(question, sessionId, {
        onMetadata: (metadata) => {
          // Update sources when metadata arrives
          if (metadata.sources) {
            receivedSources = metadata.sources.map((source) => ({
              documentId: source.document_id || source.documentId || '',
              title: source.document_title || source.title || 'Unknown Document',
              relevance: source.relevance || source.score || 0,
            }));
            
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, sources: receivedSources }
                  : msg
              )
            );
          }
        },
        onChunk: (chunk, accumulatedAnswer) => {
          // Update message text as chunks arrive
          fullAnswer = accumulatedAnswer;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: accumulatedAnswer }
                : msg
            )
          );
        },
        onInteractionId: (id) => {
          // Update interactionId when received
          interactionId = id;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, interactionId: id }
                : msg
            )
          );
        },
        onComplete: (finalAnswer, finalInteractionId) => {
          fullAnswer = finalAnswer;
          interactionId = finalInteractionId || interactionId;

          // Update final message state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: finalAnswer,
                    sources: receivedSources.length > 0 ? receivedSources : msg.sources,
                    interactionId: interactionId,
                    isStreaming: false,
                  }
                : msg
            )
          );
          
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Chatbot streaming error:', error);
          
          let errorMessage = 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';
          
          if (error.message?.includes('503') || error.status === 503) {
            errorMessage = 'The chatbot service is temporarily unavailable. Please try again in a few moments.';
          } else if (error.message?.includes('408') || error.status === 408) {
            errorMessage = 'The request timed out. Please try asking a simpler question.';
          }

          // Replace streaming message with error message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    id: botMessageId,
                    text: errorMessage,
                    sender: 'bot',
                    timestamp: new Date().toISOString(),
                    isError: true,
                    isStreaming: false,
                  }
                : msg
            )
          );
          
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      
      let errorMessage = 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';
      
      if (error.status === 503) {
        errorMessage = 'The chatbot service is temporarily unavailable. Please try again in a few moments.';
      } else if (error.status === 408) {
        errorMessage = 'The request timed out. Please try asking a simpler question.';
      }

      // Replace streaming message with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                id: botMessageId,
                text: errorMessage,
                sender: 'bot',
                timestamp: new Date().toISOString(),
                isError: true,
                isStreaming: false,
              }
            : msg
        )
      );
      
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

  const handleFeedback = async (messageId, feedback) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || !message.interactionId) {
      console.warn('Cannot submit feedback: interactionId not found');
      return;
    }

    // Update local state immediately for UI feedback
    setFeedbackStates((prev) => ({
      ...prev,
      [messageId]: { feedback, submitting: true },
    }));

    try {
      await chatbotService.submitFeedback(message.interactionId, feedback);
      // Update state to show feedback was submitted
      setFeedbackStates((prev) => ({
        ...prev,
        [messageId]: { feedback, submitted: true },
      }));
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Reset state on error
      setFeedbackStates((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const styles = getStyles(colors);

  // Set status bar style when component mounts and when screen is focused
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(colors.primary);
      RNStatusBar.setTranslucent(false);
    }
    RNStatusBar.setBarStyle('light-content');
    RNStatusBar.setHidden(false);
  }, [colors.primary]);

  // Ensure status bar is set when screen is focused (important for tab navigator)
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setBackgroundColor(colors.primary);
        RNStatusBar.setTranslucent(false);
      }
      RNStatusBar.setBarStyle('light-content');
      RNStatusBar.setHidden(false);
    }, [colors.primary])
  );

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ flex: 1 }}
          enabled={true}
        >
          {/* Modern floating header with gradient */}
          <View style={styles.modernHeader}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <View style={styles.botAvatarContainer}>
                <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.botInfo}>
                  <Text style={[styles.botName, { color: '#FFFFFF' }]}>RA Assistant</Text>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.statusText}>Online</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowMenu(!showMenu)}
                accessibilityLabel="Open menu"
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <Pressable
                style={styles.menuOverlay}
                onPress={() => setShowMenu(false)}
                accessibilityLabel="Close menu"
              />
              <View style={[styles.menuDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    clearChatHistory();
                  }}
                  accessibilityLabel="Clear chat history"
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={20} color={colors.text} />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>Clear Chat</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.messagesContainer,
              { 
                paddingBottom: Platform.OS === 'android' && keyboardHeight > 0 
                  ? keyboardHeight + 100 
                  : keyboardHeight > 0 
                  ? 100 
                  : 80 
              }
            ]}
            style={{ flex: 1 }}
            onContentSizeChange={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setShowMenu(false)}
            showsVerticalScrollIndicator={true}
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
                  <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
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
                {message.isStreaming && message.text === '' ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Thinking...
                    </Text>
                  </View>
                ) : (
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
                )}
                
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

                {/* Feedback buttons for bot messages with interactionId - hide after feedback is submitted */}
                {message.sender === 'bot' && 
                 message.interactionId && 
                 !message.isError &&
                 !feedbackStates[message.id]?.submitted && (
                  <View style={[styles.feedbackContainer, { borderTopColor: colors.border }]}>
                    <View style={styles.feedbackButtons}>
                      <TouchableOpacity
                        style={[
                          styles.feedbackButton,
                          { 
                            borderColor: feedbackStates[message.id]?.feedback === 'like' 
                              ? colors.primary 
                              : colors.border,
                            backgroundColor: feedbackStates[message.id]?.feedback === 'like' 
                              ? colors.primary + '15' 
                              : 'transparent',
                            marginRight: 8,
                          },
                          feedbackStates[message.id]?.submitting && styles.feedbackButtonDisabled,
                        ]}
                        onPress={() => handleFeedback(message.id, 'like')}
                        disabled={feedbackStates[message.id]?.submitting || feedbackStates[message.id]?.submitted}
                        accessibilityLabel="Like this answer"
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name={feedbackStates[message.id]?.feedback === 'like' ? 'thumbs-up' : 'thumbs-up-outline'}
                          size={16}
                          color={feedbackStates[message.id]?.feedback === 'like' ? colors.primary : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.feedbackButtonText,
                            { 
                              color: feedbackStates[message.id]?.feedback === 'like' 
                                ? colors.primary 
                                : colors.textSecondary 
                            },
                          ]}
                        >
                          Helpful
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.feedbackButton,
                          { 
                            borderColor: feedbackStates[message.id]?.feedback === 'dislike' 
                              ? colors.error 
                              : colors.border,
                            backgroundColor: feedbackStates[message.id]?.feedback === 'dislike' 
                              ? colors.error + '15' 
                              : 'transparent',
                          },
                          feedbackStates[message.id]?.submitting && styles.feedbackButtonDisabled,
                        ]}
                        onPress={() => handleFeedback(message.id, 'dislike')}
                        disabled={feedbackStates[message.id]?.submitting || feedbackStates[message.id]?.submitted}
                        accessibilityLabel="Dislike this answer"
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name={feedbackStates[message.id]?.feedback === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'}
                          size={16}
                          color={feedbackStates[message.id]?.feedback === 'dislike' ? colors.error : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.feedbackButtonText,
                            { 
                              color: feedbackStates[message.id]?.feedback === 'dislike' 
                                ? colors.error 
                                : colors.textSecondary 
                            },
                          ]}
                        >
                          Not helpful
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              {message.sender === 'user' && (
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="person" size={22} color="#000000" />
                </View>
              )}
            </View>
          ))}
          </ScrollView>

          <View 
            style={[
              styles.inputContainer, 
              { 
                borderTopColor: colors.border, 
                backgroundColor: colors.card,
              }
            ]}
          >
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { 
                  color: colors.text,
                },
              ]}
              placeholder="Ask me anything about Roads Authority..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              onFocus={() => {
                // Scroll to bottom when input is focused to show typing indicator
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, Platform.OS === 'ios' ? 300 : 400);
              }}
              accessibilityLabel="Message input"
              accessibilityHint="Type your question here"
            />
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={() => setInputText('')}
                style={styles.clearInputButton}
                accessibilityLabel="Clear input"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border,
                shadowColor: inputText.trim() && !isLoading ? colors.primary : 'transparent',
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            accessibilityLabel="Send message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !inputText.trim() || isLoading }}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modernHeader: {
      paddingTop: 8,
      paddingBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 10,
    },
    headerGradient: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    botAvatarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    botAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    botInfo: {
      flex: 1,
    },
    botName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      color: '#FFFFFF',
      opacity: 0.9,
      fontWeight: '500',
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    menuDropdown: {
      position: 'absolute',
      top: 70,
      right: 20,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      minWidth: 160,
      paddingVertical: 8,
      zIndex: 1000,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    menuItemText: {
      fontSize: 15,
      fontWeight: '500',
      marginLeft: 12,
    },
    messagesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 16,
      flexGrow: 1,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      alignItems: 'flex-end',
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    botMessage: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
      flexShrink: 0,
    },
    messageBubble: {
      maxWidth: '78%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: 0.2,
    },
    sourcesContainer: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sourcesTitle: {
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      opacity: 0.7,
    },
    sourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginTop: 6,
      borderRadius: 10,
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
      paddingVertical: 2,
    },
    loadingText: {
      fontSize: 14,
      marginLeft: 12,
      fontStyle: 'italic',
      opacity: 0.7,
    },
    inputContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderTopWidth: 1,
      alignItems: 'flex-end',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 5,
      backgroundColor: colors.card,
      ...(Platform.OS === 'android' && {
        width: '100%',
      }),
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 24,
      borderWidth: 1,
      marginRight: 10,
      minHeight: 48,
      maxHeight: 120,
    },
    input: {
      flex: 1,
      minHeight: 48,
      maxHeight: 120,
      fontSize: 15,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    clearInputButton: {
      padding: 8,
      marginRight: 8,
    },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    feedbackContainer: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    feedbackLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
    },
    feedbackButtons: {
      flexDirection: 'row',
    },
    feedbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      backgroundColor: 'transparent',
    },
    feedbackButtonDisabled: {
      opacity: 0.5,
    },
    feedbackButtonText: {
      fontSize: 13,
      fontWeight: '600',
      marginLeft: 6,
      letterSpacing: 0.2,
    },
  });
}

