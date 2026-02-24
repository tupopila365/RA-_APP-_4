import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import { borderRadius } from '../theme/borderRadius';
import { queryChatbot } from '../services/chatbotService';

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hello! How can we help you today?', fromUser: false, time: '09:00' },
  { id: '2', text: 'You can ask about road status, permits, or report an issue.', fromUser: false, time: '09:01' },
];

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function ChatScreen({ onBack }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || loading) return;
    const userMsg = {
      id: Date.now().toString(),
      text: trimmed,
      fromUser: true,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    try {
      const answer = await queryChatbot(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, text: answer, fromUser: false, time: now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, text: 'Sorry, I couldn’t get a response. Please check your connection and try again.', fromUser: false, time: now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.bubbleWrap, msg.fromUser ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}
          >
            <View style={[styles.bubble, msg.fromUser ? styles.bubbleUser : styles.bubbleSupport]}>
              <Text style={[styles.bubbleText, msg.fromUser && styles.bubbleTextUser]}>{msg.text}</Text>
              <Text style={[styles.time, msg.fromUser && styles.timeUser]}>{msg.time}</Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubbleWrap, styles.bubbleWrapLeft]}>
            <View style={[styles.bubble, styles.bubbleSupport]}>
              <ActivityIndicator size="small" color={PRIMARY} />
              <Text style={styles.time}>...</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, inputFocused && styles.inputFocused]}
          placeholder="Type a message..."
          placeholderTextColor={NEUTRAL_COLORS.gray400}
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons name="send" size={22} color={NEUTRAL_COLORS.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  bubbleWrap: {
    marginBottom: spacing.md,
  },
  bubbleWrapLeft: {
    alignItems: 'flex-start',
  },
  bubbleWrapRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  bubbleUser: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
  },
  bubbleTextUser: {
    color: NEUTRAL_COLORS.white,
  },
  time: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.xs,
    fontSize: 10,
  },
  timeUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: NEUTRAL_COLORS.gray200,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
  },
  inputFocused: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
