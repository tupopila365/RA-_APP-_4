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
  ActivityIndicator,
  Alert,
  Pressable,
  Keyboard,
  StatusBar as RNStatusBar,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
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
import { OfficeMessage } from '../components';

const CHAT_HISTORY_KEY = 'chatbot_history';
const SESSION_ID_KEY = 'chatbot_session_id';

// Message Item Component with animations
function MessageItem({ message, colors, styles, feedbackStates, handleFeedback, formatMessageTime, getTypingAnimation, handleStop }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingAnimRef = useRef(null);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Start typing animation if streaming
  useEffect(() => {
    if (message.isStreaming && message.text === '') {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:53',message:'Typing animation init',data:{messageId:message.id,isStreaming:message.isStreaming,text:message.text,getTypingAnimationExists:!!getTypingAnimation},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      typingAnimRef.current = getTypingAnimation(message.id);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:55',message:'Typing animation ref set',data:{messageId:message.id,refCurrentExists:!!typingAnimRef.current,hasDot1:!!(typingAnimRef.current?.dot1),hasStart:!!(typingAnimRef.current?.start)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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
        { opacity: fadeAnim },
      ]}
    >
      {message.sender === 'bot' && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
        </View>
      )}
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
              ? { backgroundColor: colors.primary }
              : message.isError
              ? { backgroundColor: colors.error, opacity: 0.9 }
              : { backgroundColor: colors.card },
            // Make office messages wider
            message.metadata?.type === 'location_query' && message.metadata?.offices?.length > 0
              ? { maxWidth: '95%' }
              : {},
          ]}
        >
          {message.isStreaming && message.text === '' ? (
            <View style={styles.loadingContainer}>
              <View style={styles.typingIndicator}>
                {(() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:100',message:'Typing animation render check',data:{messageId:message.id,refCurrentExists:!!typingAnimRef.current,hasDot1:!!(typingAnimRef.current?.dot1),hasStart:!!(typingAnimRef.current?.start)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                  return typingAnimRef.current;
                })() ? (
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
              {message.timestamp && (
                <Text
                  style={[
                    styles.messageTimestamp,
                    {
                      color:
                        message.sender === 'user'
                          ? 'rgba(255,255,255,0.7)'
                          : colors.textSecondary,
                    },
                  ]}
                >
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
              <Text style={[styles.retryButtonText, { color: colors.error }]}>Retry</Text>
            </TouchableOpacity>
          )}

          {/* Feedback buttons for bot messages with interactionId - hide after feedback is submitted */}
          {(() => {
            // #region agent log
            const feedbackState = feedbackStates[message.id];
            fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:182',message:'Feedback states access check',data:{messageId:message.id,feedbackStatesExists:!!feedbackStates,feedbackStateExists:!!feedbackState,feedbackStateValue:feedbackState,submitted:feedbackState?.submitted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            return message.sender === 'bot' && 
             message.interactionId && 
             !message.isError &&
             !feedbackStates[message.id]?.submitted;
          })() && (
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
                    size={18}
                    color={feedbackStates[message.id]?.feedback === 'like' ? colors.primary : colors.textSecondary}
                  />
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
                    size={18}
                    color={feedbackStates[message.id]?.feedback === 'dislike' ? colors.error : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Pressable>
      {message.sender === 'user' && (
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Ionicons name="person" size={22} color={colors.text} />
        </View>
      )}
    </Animated.View>
  );
}

export default function ChatbotScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const scrollViewRef = useRef();
  const inputRef = useRef();
  const typingAnimations = useRef({});
  const abortControllerRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
    loadSessionId();
    requestLocationPermission(false); // Silent request on mount
  }, []);

  // Request location permission and get current location
  const requestLocationPermission = async (showAlert = false) => {
    try {
      if (!Location) {
        console.warn('Location module not available');
        return false;
      }

      // Check current permission status first
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      if (currentStatus === 'granted') {
        // Permission already granted, just get location
        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 10000, // 10 second timeout
          });
          setUserLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          return true;
        } catch (locationError) {
          console.error('Error getting location:', locationError);
          if (showAlert) {
            Alert.alert(
              'Location Error',
              'We couldn\'t get your current location. You can still ask about office locations, but we won\'t be able to show distances.',
              [{ text: 'OK' }]
            );
          }
          return false;
        }
      }

      if (currentStatus === 'denied') {
        if (showAlert) {
          Alert.alert(
            'Location Permission Required',
            'To find the nearest offices, we need your location. Please enable location access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }
        return false;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (showAlert) {
          Alert.alert(
            'Location Permission',
            'Location access is optional but helps us show you the nearest offices. You can still ask about office locations without it.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }

      // Get current location
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000, // 10 second timeout
        });

        setUserLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        return true;
      } catch (locationError) {
        console.error('Error getting location:', locationError);
        if (showAlert) {
          Alert.alert(
            'Location Error',
            'We couldn\'t get your location. You can still ask about office locations, but we won\'t be able to show distances.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      if (showAlert) {
        Alert.alert(
          'Location Error',
          'We couldn\'t access your location. You can still ask about office locations, but we won\'t be able to show distances.',
          [{ text: 'OK' }]
        );
      }
      return false;
    }
  };

  // Refresh location manually
  const refreshLocation = async () => {
    const success = await requestLocationPermission(true);
    if (success) {
      // Optionally show success message
      // Alert.alert('Success', 'Location updated successfully');
    }
  };

  // Save chat history whenever messages change
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:303',message:'SaveChatHistory useEffect triggered',data:{messagesLength:messages.length,messagesCount:messages?.length,firstMessageId:messages[0]?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    saveChatHistory();
  }, [saveChatHistory]);

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

  const saveChatHistory = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:357',message:'SaveChatHistory called',data:{messagesLength:messages.length,messagesCount:messages?.length,firstMessageId:messages[0]?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      await SecureStore.setItemAsync(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

  const loadSessionId = async () => {
    try {
      let id = await SecureStore.getItemAsync(SESSION_ID_KEY);
      if (!id) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:368',message:'Using substring method',data:{calledBefore:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        await SecureStore.setItemAsync(SESSION_ID_KEY, id);
      }
      setSessionId(id);
    } catch (error) {
      console.error('Error loading session ID:', error);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:374',message:'Using substring method in error handler',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
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
    let receivedMetadata = null;

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Use streaming for real-time response
      await chatbotService.queryStream(question, sessionId, userLocation, {
        abortController,
        onMetadata: (metadataObj) => {
          // Update sources when metadata arrives
          if (metadataObj.sources) {
            receivedSources = metadataObj.sources.map((source) => ({
              documentId: source.document_id || source.documentId || '',
              title: source.document_title || source.title || 'Unknown Document',
              relevance: source.relevance || source.score || 0,
            }));
          }
          
          // Update metadata (e.g., location_query metadata)
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
        onComplete: (finalAnswer, finalInteractionId, metadata) => {
          fullAnswer = finalAnswer;
          interactionId = finalInteractionId || interactionId;
          receivedMetadata = metadata || null;

          // Update final message state
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
          // Don't show error if request was cancelled
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
          abortControllerRef.current = null;
        },
      });
    } catch (error) {
      // Don't show error if request was cancelled
      if (abortController.signal.aborted || error.message === 'Request cancelled') {
        // Remove the streaming message
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
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      // Remove the streaming message
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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:581',message:'GetTypingAnimation called',data:{messageId,exists:!!typingAnimations.current[messageId]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:624',message:'HandleFeedback called',data:{messageId,feedback,messagesLength:messages.length,allMessageIds:messages.map(m=>m.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const message = messages.find((m) => m.id === messageId);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatbotScreen.js:625',message:'HandleFeedback message found',data:{messageId,messageExists:!!message,interactionId:message?.interactionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
  }, [messages]);

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
      <SafeAreaView style={styles.container} edges={[]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ flex: 1 }}
          enabled={true}
        >
          {/* Modern floating header with gradient */}
          <View style={styles.modernHeader}>
          <View style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}>
            <View style={styles.headerContent}>
              <View style={styles.botAvatarContainer}>
                <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.botInfo}>
                  <Text style={[styles.botName, { color: '#FFFFFF' }]}>RA Assistant</Text>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
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
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
              setShowScrollToBottom(!isNearBottom && messages.length > 3);
            }}
            scrollEventThrottle={400}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setShowMenu(false)}
            showsVerticalScrollIndicator={true}
          >
          {messages.map((message) => {
            // Add retry handler to error messages
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
              />
            );
          })}
          
          {/* Suggested Questions */}
          {messages.length === 1 && messages[0].id === 'welcome' && (
            <View style={styles.suggestedQuestionsContainer}>
              <Text style={styles.suggestedQuestionsTitle}>Try asking:</Text>
              {[
                'How do I apply for a personalized number plate?',
                'What documents do I need for vehicle registration?',
                'How do I report road damage?',
              ].map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestedQuestion, { borderColor: colors.primary }]}
                  onPress={() => {
                    setInputText(question);
                    inputRef.current?.focus();
                  }}
                >
                  <Text style={[styles.suggestedQuestionText, { color: colors.primary }]}>
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          </ScrollView>
          
          {/* Scroll to Bottom Button */}
          {showScrollToBottom && (
            <TouchableOpacity
              style={[styles.scrollToBottomButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
                setShowScrollToBottom(false);
              }}
            >
              <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <View 
            style={[
              styles.inputContainer, 
              { 
                borderTopColor: colors.border, 
                backgroundColor: colors.card,
              }
            ]}
          >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: inputFocused ? colors.primary : colors.border,
                borderWidth: inputFocused ? 2 : 1,
              },
            ]}
          >
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
                setInputFocused(true);
                // Scroll to bottom when input is focused to show typing indicator
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, Platform.OS === 'ios' ? 300 : 400);
              }}
              onBlur={() => setInputFocused(false)}
              accessibilityLabel="Message input"
              accessibilityHint="Type your question here"
            />
            {inputText.length > 0 && (
              <>
                <View style={styles.charCountContainer}>
                  <Text
                    style={[
                      styles.charCount,
                      { color: inputText.length > 450 ? colors.error : colors.textSecondary },
                    ]}
                  >
                    {inputText.length}/500
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setInputText('')}
                  style={styles.clearInputButton}
                  accessibilityLabel="Clear input"
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </>
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
      paddingBottom: 16,
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
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
      flexShrink: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: 0.2,
    },
    officesContainer: {
      gap: 12,
      marginVertical: 4,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      gap: 10,
    },
    stopButton: {
      padding: 6,
      borderRadius: 16,
      borderWidth: 1.5,
      marginLeft: 8,
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginRight: 8,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    loadingText: {
      fontSize: 14,
      fontStyle: 'italic',
      opacity: 0.8,
    },
    messageTimestamp: {
      fontSize: 11,
      marginTop: 4,
      opacity: 0.6,
    },
    suggestedQuestionsContainer: {
      marginTop: 20,
      marginBottom: 16,
      padding: 16,
      backgroundColor: colors.surface || colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },
    suggestedQuestionsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    suggestedQuestion: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    suggestedQuestionText: {
      fontSize: 14,
      fontWeight: '500',
    },
    charCountContainer: {
      position: 'absolute',
      bottom: 8,
      right: 12,
    },
    charCount: {
      fontSize: 11,
      fontWeight: '500',
    },
    scrollToBottomButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      alignSelf: 'flex-start',
      gap: 6,
    },
    retryButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    inputContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
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
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border + '40',
    },
    feedbackLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
    },
    feedbackButtons: {
      flexDirection: 'row',
      gap: 16,
    },
    feedbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      backgroundColor: 'transparent',
      minWidth: 40,
      minHeight: 40,
    },
    feedbackButtonDisabled: {
      opacity: 0.5,
    },
    feedbackButtonText: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  });
}

