import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  Pressable,
  Keyboard,
  StatusBar as RNStatusBar,
  Animated,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Conditionally import Clipboard - fallback if not available
let Clipboard = null;
try {
  Clipboard = require('expo-clipboard');
} catch (error) {
  console.warn('Clipboard module not available:', error.message);
}

import { RATheme } from '../theme/colors';
import { chatbotService } from '../services/chatbotService';

// Conditionally import Location - fallback if not available
let Location = null;
try {
  Location = require('expo-location');
} catch (error) {
  console.warn('Location module not available:', error.message);
}

import { SkeletonLoader } from '../components/SkeletonLoader';
import { OfficeMessage } from '../components';

const CHAT_HISTORY_KEY = 'chatbot_history';
const SESSION_ID_KEY = 'chatbot_session_id';

// Format bot answer with better parsing for lists and paragraphs
const formatBotAnswer = (text, styles, colors) => {
  if (!text) return null;
  
  // Split into paragraphs for better readability
  return text.split('\n\n').map((paragraph, index) => {
    const trimmedParagraph = paragraph.trim();
    
    // Check if it's a list item (bullet point)
    if (trimmedParagraph.startsWith('•') || trimmedParagraph.startsWith('-')) {
      return (
        <Text key={index} style={[styles.messageText, styles.listItem, { marginVertical: 4, color: colors.text }]} maxFontSizeMultiplier={1.3}>
          {trimmedParagraph}
        </Text>
      );
    }
    
    // Check if it's a numbered item
    if (/^\d+\./.test(trimmedParagraph)) {
      return (
        <Text key={index} style={[styles.messageText, styles.numberedItem, { marginVertical: 4, color: colors.text }]} maxFontSizeMultiplier={1.3}>
          {trimmedParagraph}
        </Text>
      );
    }
    
    // Regular paragraph
    return (
      <Text key={index} style={[styles.messageText, { marginVertical: 4, color: colors.text }]} maxFontSizeMultiplier={1.3}>
        {trimmedParagraph}
      </Text>
    );
  });
};

// Generate quick reply suggestions based on bot response
const generateQuickReplies = (botMessage) => {
  const text = botMessage.toLowerCase();
  
  // Define suggestion patterns
  const suggestions = [];
  
  if (text.includes('vehicle registration') || text.includes('register')) {
    suggestions.push(
      'What documents do I need?',
      'How much does it cost?',
      'How long does it take?'
    );
  } else if (text.includes('license') || text.includes('driving')) {
    suggestions.push(
      'How do I renew my license?',
      'What are the requirements?',
      'Where can I apply?'
    );
  } else if (text.includes('plates') || text.includes('pln')) {
    suggestions.push(
      'How much do custom plates cost?',
      'Can I choose any combination?',
      'How long for delivery?'
    );
  } else if (text.includes('office') || text.includes('location')) {
    suggestions.push(
      'What are the office hours?',
      'Do I need an appointment?',
      'What services are available?'
    );
  } else if (text.includes('fee') || text.includes('cost') || text.includes('nad')) {
    suggestions.push(
      'Are there any discounts?',
      'Can I pay online?',
      'What payment methods accepted?'
    );
  } else if (text.includes('road') || text.includes('traffic')) {
    suggestions.push(
      'Current road conditions?',
      'Any road closures?',
      'Traffic updates?'
    );
  } else {
    // Default suggestions for general responses
    suggestions.push(
      'Tell me more',
      'What else should I know?',
      'Any other requirements?'
    );
  }
  
  // Return up to 3 suggestions
  return suggestions.slice(0, 3);
};

// Quick Reply Component
const QuickReplies = ({ suggestions, onSelect, colors, styles }) => {
  if (!suggestions || suggestions.length === 0) return null;
  
  return (
    <View style={styles.quickRepliesContainer}>
      <Text style={[styles.quickRepliesTitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
        Quick replies:
      </Text>
      <View style={styles.quickRepliesGrid}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickReplyButton, { borderColor: colors.border }]}
            onPress={() => onSelect(suggestion)}
          >
            <Text style={[styles.quickReplyText, { color: colors.primary }]} numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Message Item Component with animations
function MessageItem({ message, colors, styles, feedbackStates, handleFeedback, formatMessageTime, getTypingAnimation, handleStop, setInputText, inputRef }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const typingAnimRef = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Start typing animation if streaming
  useEffect(() => {
    if (message.isStreaming && message.text === '') {
      typingAnimRef.current = getTypingAnimation(message.id);
      typingAnimRef.current.start();
      return () => {
        if (typingAnimRef.current) {
          typingAnimRef.current.stop();
        }
      };
    }
  }, [message.isStreaming, message.text, message.id, getTypingAnimation]);
  
  return (
    <Animated.View
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.botMessage,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onLongPress={() => {
          if (message.text && Clipboard) {
            Clipboard.setStringAsync(message.text).then(() => {
              Alert.alert('Copied', 'Message copied to clipboard');
            }).catch((error) => {
              console.warn('Failed to copy to clipboard:', error);
            });
          }
        }}
      >
        <View
          style={[
            styles.messageBubble,
            message.sender === 'user'
              ? styles.userMessageBubble
              : message.isError
              ? styles.errorMessageBubble
              : styles.botMessageBubble,
          ]}
        >
          {message.isStreaming && message.text === '' ? (
            <View style={styles.typingContainer}>
              <Text style={[styles.messageText, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
                🤖 Thinking...
              </Text>
              <View style={styles.typingDots}>
                <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
              </View>
            </View>
          ) : message.isStreaming && message.text ? (
            <>
              <View>
                {formatBotAnswer(message.text, styles, colors)}
                <View style={styles.streamingIndicator}>
                  <Text style={[styles.streamingText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
                    ✨ Generating...
                  </Text>
                </View>
              </View>
              <View style={styles.loadingContainer}>
                <View style={styles.typingIndicator}>
                  {typingAnimRef.current ? (
                    <>
                      <Animated.View
                        style={[
                          styles.typingDot,
                          { backgroundColor: colors.primary, opacity: typingAnimRef.current.dot1 },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          { backgroundColor: colors.primary, opacity: typingAnimRef.current.dot2 },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          { backgroundColor: colors.primary, opacity: typingAnimRef.current.dot3 },
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      <View style={[styles.typingDot, { backgroundColor: colors.primary, opacity: 0.4 }]} />
                      <View style={[styles.typingDot, { backgroundColor: colors.primary, opacity: 0.4 }]} />
                      <View style={[styles.typingDot, { backgroundColor: colors.primary, opacity: 0.4 }]} />
                    </>
                  )}
                </View>
                {handleStop && (
                  <TouchableOpacity
                    style={[styles.stopButton, { borderColor: colors.error }]}
                    onPress={handleStop}
                    accessibilityLabel="Stop loading"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Check if this is a location query response with office data */}
              {message.metadata?.type === 'location_query' && message.metadata?.offices && message.metadata.offices.length > 0 ? (
                <View style={styles.officesContainer}>
                  {message.metadata.offices.map((office, index) => (
                    <OfficeMessage 
                      key={office.id || index} 
                      office={office} 
                      colors={colors}
                    />
                  ))}
                </View>
              ) : (
                <>
                  {message.sender === 'bot' && !message.isError ? (
                    <View>
                      {formatBotAnswer(message.text, styles, colors)}
                      
                      {/* Quick Replies for completed bot messages */}
                      {!message.isStreaming && message.text && (
                        <QuickReplies
                          suggestions={generateQuickReplies(message.text)}
                          onSelect={(suggestion) => {
                            setInputText(suggestion);
                            inputRef.current?.focus();
                          }}
                          colors={colors}
                          styles={styles}
                        />
                      )}
                    </View>
                  ) : (
                    <Text style={[
                        styles.messageText,
                        message.sender === 'user' || message.isError
                          ? { color: '#FFFFFF' }
                          : { color: colors.text },
                      ]}
                     maxFontSizeMultiplier={1.3}>
                      {message.text}
                    </Text>
                  )}
                  
                  {/* Source References */}
                  {message.sources && message.sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                      <View style={styles.sourcesHeader}>
                        <Ionicons name="document-text" size={16} color={colors.primary} />
                        <Text style={styles.sourcesTitle} maxFontSizeMultiplier={1.3}>Sources ({message.sources.length})</Text>
                      </View>
                      {message.sources.map((source, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.sourceItem}
                          onPress={() => {
                            // Could navigate to document detail if implemented
                            Alert.alert('Source Document', source.title || 'Unknown Document');
                          }}
                          accessibilityLabel={`Source document: ${source.title}`}
                          accessibilityRole="button"
                        >
                          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                          <Text style={styles.sourceText} numberOfLines={2} maxFontSizeMultiplier={1.3}>
                            {source.title || 'Unknown Document'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <Text style={styles.trustSourceText} maxFontSizeMultiplier={1.3}>
                        Based on official Roads Authority documents
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* Feedback Buttons for Bot Messages */}
              {message.sender === 'bot' && !message.isError && !message.isStreaming && message.interactionId && (
                <View style={styles.feedbackContainerOutside}>
                  <View style={styles.feedbackButtons}>
                    <TouchableOpacity
                      style={[
                        styles.feedbackButton,
                        { borderColor: colors.success },
                        feedbackStates[message.id]?.feedback === 'like' && { backgroundColor: colors.success },
                        feedbackStates[message.id]?.submitting && styles.feedbackButtonDisabled,
                      ]}
                      onPress={() => handleFeedback(message.id, 'like')}
                      disabled={feedbackStates[message.id]?.submitting || feedbackStates[message.id]?.submitted}
                      accessibilityLabel="Like this response"
                      accessibilityRole="button"
                    >
                      <Ionicons 
                        name="thumbs-up" 
                        size={16} 
                        color={feedbackStates[message.id]?.feedback === 'like' ? '#FFFFFF' : colors.success} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.feedbackButton,
                        { borderColor: colors.error },
                        feedbackStates[message.id]?.feedback === 'dislike' && { backgroundColor: colors.error },
                        feedbackStates[message.id]?.submitting && styles.feedbackButtonDisabled,
                      ]}
                      onPress={() => handleFeedback(message.id, 'dislike')}
                      disabled={feedbackStates[message.id]?.submitting || feedbackStates[message.id]?.submitted}
                      accessibilityLabel="Dislike this response"
                      accessibilityRole="button"
                    >
                      <Ionicons 
                        name="thumbs-down" 
                        size={16} 
                        color={feedbackStates[message.id]?.feedback === 'dislike' ? '#FFFFFF' : colors.error} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {message.timestamp && (
                <Text style={[
                    styles.messageTimestamp,
                    {
                      color:
                        message.sender === 'user'
                          ? 'rgba(255,255,255,0.7)'
                          : colors.textSecondary,
                    },
                  ]}
                 maxFontSizeMultiplier={1.3}>
                  {formatMessageTime(message.timestamp)}
                </Text>
              )}
            </>
          )}

          {message.isError && (
            <TouchableOpacity
              style={[styles.retryButton, { borderColor: colors.error }]}
              onPress={() => {
                // Retry will be handled by parent component
                if (message.onRetry) {
                  message.onRetry();
                }
              }}
            >
              <Ionicons name="refresh" size={16} color={colors.error} />
              <Text style={[styles.retryButtonText, { color: colors.error }]} maxFontSizeMultiplier={1.3}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ChatbotScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: 'Welcome to RA Assistant\n\nI\'m your official Roads Authority helper. I can answer questions about:\n\n✓ Vehicle Registration & Licensing\n✓ Personalized Number Plates\n✓ Road Conditions & Safety\n✓ Procurement & Tenders\n✓ Office Locations & Services\n\nI answer based only on official Roads Authority documents. If information isn\'t available in our documents, I\'ll let you know.\n\nHow can I help you today?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [feedbackStates, setFeedbackStates] = useState({});
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const scrollViewRef = useRef();
  const inputRef = useRef();
  const typingAnimations = useRef({});
  const abortControllerRef = useRef(null);
  const keyboardTimeoutRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
    loadSessionId();
    requestLocationPermission(false);
  }, []);

  // Request location permission and get current location
  const requestLocationPermission = async (showAlert = false) => {
    try {
      if (!Location) {
        console.warn('Location module not available');
        return false;
      }

      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      if (currentStatus === 'granted') {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 10000,
          });
          
          setUserLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          return true;
        } catch (locationError) {
          console.error('Error getting location:', locationError);
          return false;
        }
      }

      if (currentStatus === 'denied') {
        return false;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return false;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        });
        
        setUserLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        return true;
      } catch (locationError) {
        console.error('Error getting location:', locationError);
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  // Save chat history whenever messages change
  useEffect(() => {
    saveChatHistory();
  }, [saveChatHistory]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Handle keyboard show/hide events - simplified and more reliable
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      
      // Auto-scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'ios' ? 100 : 200);
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
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

  const saveChatHistory = useCallback(async () => {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

  const loadSessionId = async () => {
    try {
      let id = await AsyncStorage.getItem(SESSION_ID_KEY);
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        await AsyncStorage.setItem(SESSION_ID_KEY, id);
      }
      setSessionId(id);
    } catch (error) {
      console.error('Error loading session ID:', error);
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
    }
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
    let receivedMetadata = null;

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Use streaming for real-time response
      await chatbotService.queryStream(question, sessionId, userLocation, {
        abortController,
        onMetadata: (metadataObj) => {
          if (metadataObj.sources) {
            receivedSources = metadataObj.sources.map((source) => ({
              documentId: source.document_id || source.documentId || '',
              title: source.document_title || source.title || 'Unknown Document',
              relevance: source.relevance || source.score || 0,
            }));
          }

          if (metadataObj.metadata) {
            receivedMetadata = metadataObj.metadata;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { 
                    ...msg, 
                    sources: receivedSources,
                    ...(receivedMetadata && { metadata: receivedMetadata })
                  }
                : msg
            )
          );
        },
        onChunk: (chunk, accumulatedAnswer) => {
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
          interactionId = id;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, interactionId: id }
                : msg
            )
          );
        },
        onComplete: (finalAnswer, finalInteractionId, metadata) => {
          fullAnswer = finalAnswer;
          interactionId = finalInteractionId || interactionId;
          receivedMetadata = metadata || null;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: finalAnswer,
                    sources: receivedSources.length > 0 ? receivedSources : msg.sources,
                    interactionId: interactionId,
                    metadata: receivedMetadata,
                    isStreaming: false,
                  }
                : msg
            )
          );

          setIsLoading(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          if (abortController.signal.aborted || error.message === 'Request cancelled') {
            setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
            setIsLoading(false);
            abortControllerRef.current = null;
            return;
          }

          console.error('Chatbot streaming error:', error);

          let errorMessage = 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';

          if (error.message?.includes('503') || error.status === 503) {
            errorMessage = 'The chatbot service is temporarily unavailable. Please try again in a few moments.';
          } else if (error.message?.includes('408') || error.status === 408) {
            errorMessage = 'The request timed out. Please try asking a simpler question.';
          } else if (error.message?.includes('no information') || error.message?.includes('not available')) {
            errorMessage = 'This information is not available in the provided official documents.\n\nFor this information, please:\n• Visit a Roads Authority office\n• Call: 061-123-4567\n• Email: info@ra.org.na';
          }

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
          abortControllerRef.current = null;
        },
      });
    } catch (error) {
      if (abortController.signal.aborted || error.message === 'Request cancelled') {
        setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
        setIsLoading(false);
        abortControllerRef.current = null;
        return;
      }

      console.error('Chatbot error:', error);

      let errorMessage = 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';

      if (error.status === 503) {
        errorMessage = 'The chatbot service is temporarily unavailable. Please try again in a few moments.';
      } else if (error.status === 408) {
        errorMessage = 'The request timed out. Please try asking a simpler question.';
      } else if (error.message?.includes('no information') || error.message?.includes('not available')) {
        errorMessage = 'This information is not available in the provided official documents.\n\nFor this information, please:\n• Visit a Roads Authority office\n• Call: 061-123-4567\n• Email: info@ra.org.na';
      }

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
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isStreaming && lastMessage.text === '') {
          return prev.slice(0, -1);
        }

        return prev.map((msg) =>
          msg.isStreaming
            ? { ...msg, isStreaming: false, text: msg.text || 'Request cancelled by user.' }
            : msg
        );
      });
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getTypingAnimation = useCallback((messageId) => {
    if (!typingAnimations.current[messageId]) {
      const anim1 = new Animated.Value(0.4);
      const anim2 = new Animated.Value(0.4);
      const anim3 = new Animated.Value(0.4);

      const createAnimation = (anim, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      typingAnimations.current[messageId] = {
        dot1: anim1,
        dot2: anim2,
        dot3: anim3,
        start: () => {
          createAnimation(anim1, 0).start();
          createAnimation(anim2, 200).start();
          createAnimation(anim3, 400).start();
        },
        stop: () => {
          anim1.stopAnimation();
          anim2.stopAnimation();
          anim3.stopAnimation();
        },
      };
    }

    return typingAnimations.current[messageId];
  }, []);

  const handleFeedback = useCallback(async (messageId, feedback) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) {
      console.warn('Cannot submit feedback: message not found');
      return;
    }

    setFeedbackStates((prev) => ({
      ...prev,
      [messageId]: { feedback, submitting: true },
    }));

    if (!message.interactionId) {
      setFeedbackStates((prev) => ({
        ...prev,
        [messageId]: { feedback, submitted: false },
      }));
      return;
    }

    try {
      await chatbotService.submitFeedback(message.interactionId, feedback);
      setFeedbackStates((prev) => ({
        ...prev,
        [messageId]: { feedback, submitted: true },
      }));

      Alert.alert(
        'Thank you!',
        'Your feedback has been sent successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackStates((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  }, [messages]);

  const styles = getStyles(colors, screenWidth, colorScheme, insets);

  // Set status bar style when component mounts and when screen is focused
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(colors.primary);
      RNStatusBar.setTranslucent(false);
    }
    RNStatusBar.setBarStyle('light-content');
    RNStatusBar.setHidden(false);
  }, [colors.primary]);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        {/* Messages Area */}
        <View style={styles.messagesArea}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.messagesContainer,
              {
                paddingBottom: keyboardHeight > 0 ? 20 : 80
              }
            ]}
            style={{ flex: 1 }}
            onContentSizeChange={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
              setShowScrollToBottom(!isNearBottom && messages.length > 3);
            }}
            scrollEventThrottle={400}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => {}}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => {
              const messageWithRetry = message.isError
                ? {
                    ...message,
                    onRetry: () => {
                      const userMessageIndex = messages.findIndex((m) => m.id === message.id) - 1;
                      if (userMessageIndex >= 0) {
                        const userMessage = messages[userMessageIndex];
                        setInputText(userMessage.text);
                        setTimeout(() => handleSend(), 100);
                      }
                    },
                  }
                : message;

              return (
                <MessageItem
                  key={message.id}
                  message={messageWithRetry}
                  colors={colors}
                  styles={styles}
                  feedbackStates={feedbackStates}
                  handleFeedback={handleFeedback}
                  formatMessageTime={formatMessageTime}
                  getTypingAnimation={getTypingAnimation}
                  handleStop={message.isStreaming && message.text === '' ? handleStop : null}
                  setInputText={setInputText}
                  inputRef={inputRef}
                />
              );
            })}

            {/* Quick Actions for first time users */}
            {messages.length === 1 && messages[0].id === 'welcome' && (
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle} maxFontSizeMultiplier={1.3}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  {[
                    { icon: 'car-outline', title: 'Vehicle Registration', query: 'How do I register my vehicle?' },
                    { icon: 'card-outline', title: 'Number Plates', query: 'How do I apply for personalized plates?' },
                    { icon: 'map-outline', title: 'Road Status', query: 'How do I check road conditions?' },
                    { icon: 'location-outline', title: 'Find Offices', query: 'Where are your offices located?' },
                  ].map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickActionCard}
                      onPress={() => {
                        setInputText(action.query);
                        inputRef.current?.focus();
                      }}
                    >
                      <View style={styles.quickActionIcon}>
                        <Ionicons name={action.icon} size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.quickActionTitle} numberOfLines={2} maxFontSizeMultiplier={1.3}>
                        {action.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Scroll to Bottom Button */}
          {showScrollToBottom && (
            <TouchableOpacity
              style={[styles.scrollToBottomButton, { bottom: keyboardHeight > 0 ? keyboardHeight + 80 : 80 }]}
              onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              accessibilityLabel="Scroll to bottom"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              onFocus={() => {
                setInputFocused(true);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onBlur={() => setInputFocused(false)}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              returnKeyType="send"
              accessibilityLabel="Message input"
              accessibilityHint="Type your question here"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={isLoading || !inputText.trim()}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              {isLoading ? (
                <SkeletonLoader type="circle" width={16} height={16} />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors, screenWidth, colorScheme, insets) {
  const isTablet = screenWidth > 600;
  const safeBottomPadding = Math.max((insets && insets.bottom) || 0, 8);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface, // Use RA surface color
    },
    
    // Messages Area
    messagesArea: {
      flex: 1,
      position: 'relative',
    },
    messagesContainer: {
      padding: 16,
      paddingTop: 8,
    },

    // Message Items
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 2,
      alignItems: 'flex-end',
      paddingHorizontal: 8,
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    botMessage: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 6,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
      // Add subtle border for definition
      borderWidth: 2,
      borderColor: colors.background,
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 1,
      minHeight: 36,
      justifyContent: 'center',
    },

    // User Message Bubble - WhatsApp style with RA colors
    userMessageBubble: {
      backgroundColor: colors.primary, // RA sky blue
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      marginRight: 8,
      marginLeft: 50,
      position: 'relative',
    },

    // Bot Message Bubble - WhatsApp style with RA colors
    botMessageBubble: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
      marginLeft: 8,
      marginRight: 50,
      position: 'relative',
      // Add subtle RA accent border
      borderLeftWidth: 3,
      borderLeftColor: colors.secondary, // RA yellow accent
    },

    // Error Message Bubble - WhatsApp style with RA error colors
    errorMessageBubble: {
      backgroundColor: colors.error, // RA error color
      borderTopLeftRadius: 2,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
      marginLeft: 8,
      marginRight: 50,
      borderLeftWidth: 3,
      borderLeftColor: colors.error, // RA error color
    },

    messageText: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0.1,
      color: colors.text, // Ensure proper color for dark mode
    },
    listItem: {
      marginLeft: 8,
      color: colors.text,
    },
    numberedItem: {
      marginLeft: 8,
      color: colors.text,
    },
    messageTimestamp: {
      fontSize: 11,
      marginTop: 4,
      fontWeight: '400',
      opacity: 0.6,
      textAlign: 'right',
      marginLeft: 'auto',
      color: colors.textSecondary,
    },

    // Typing Indicator
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    typingDots: {
      flexDirection: 'row',
      marginLeft: 8,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 2,
      backgroundColor: colors.primary,
    },
    streamingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    streamingText: {
      fontSize: 12,
      fontStyle: 'italic',
    },
    stopButton: {
      marginLeft: 12,
      padding: 4,
      borderRadius: 12,
      borderWidth: 1,
    },

    // Sources
    sourcesContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sourcesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sourcesTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 6,
    },
    sourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    sourceText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 6,
      flex: 1,
    },
    trustSourceText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 6,
    },

    // Feedback
    feedbackContainerOutside: {
      marginTop: 8,
      alignItems: 'flex-start',
    },
    feedbackButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    feedbackButton: {
      padding: 8,
      borderRadius: 20,
      borderWidth: 1,
      minWidth: 44,
      alignItems: 'center',
    },
    feedbackButtonDisabled: {
      opacity: 0.6,
    },

    // Retry Button
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
    },
    retryButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },

    // Office Messages
    officesContainer: {
      gap: 8,
    },

    // Quick Actions
    quickActionsContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: 'transparent',
      borderRadius: 0,
    },
    quickActionsTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.textSecondary,
      marginBottom: 12,
      textAlign: 'center',
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    quickActionCard: {
      width: '48%', // Use percentage for better responsiveness
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      marginBottom: 8, // Add margin between rows
      minHeight: 80, // Ensure consistent height
    },
    quickActionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary, // RA sky blue
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    quickActionTitle: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 14,
      numberOfLines: 2, // Allow text wrapping
    },

    // Quick Replies
    quickRepliesContainer: {
      marginTop: 12,
      paddingTop: 8,
    },
    quickRepliesTitle: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
    },
    quickRepliesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    quickReplyButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surface,
      marginRight: 6,
      marginBottom: 6,
    },
    quickReplyText: {
      fontSize: 12,
      fontWeight: '500',
    },

    // Scroll to Bottom
    scrollToBottomButton: {
      position: 'absolute',
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    
    // Input Area - RA style
    inputArea: {
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 4,
      paddingBottom: safeBottomPadding, // Safe area bottom padding
      borderTopWidth: 1,
      borderTopColor: colors.border,
      minHeight: 60, // Ensure minimum height
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.background,
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 6, // Reduced vertical padding
      marginHorizontal: 8,
      marginVertical: 2, // Reduced vertical margin
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      minHeight: 48, // Ensure minimum touch target
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      maxHeight: 100,
      minHeight: 40, // Ensure minimum height
      paddingVertical: 6, // Reduced vertical padding
      paddingRight: 12,
      lineHeight: 20,
      backgroundColor: 'transparent', // Ensure transparent background
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
      backgroundColor: colors.primary, // RA sky blue
    },
  });
}