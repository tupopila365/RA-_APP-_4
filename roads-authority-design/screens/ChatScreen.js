import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import { queryChatbot } from '../services/chatbotService';

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hello! How can we help you today?', fromUser: false, time: '09:00' },
  { id: '2', text: 'You can ask about road status, permits, or report an issue.', fromUser: false, time: '09:01' },
];

const INPUT_BAR_HEIGHT = 64;

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function ChatScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: 'Sorry, I couldn’t get a response. Please check your connection and try again.',
          fromUser: false,
          time: now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToEnd();
    }
  }, [messages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event) => {
      const { screenY } = event.endCoordinates;
      const windowHeight = Dimensions.get('window').height;
      const offset = Math.max(windowHeight - screenY, 0);
      setKeyboardOffset(offset);
      scrollToEnd();
    };

    const onHide = () => setKeyboardOffset(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const inputBottom = keyboardOffset > 0 ? keyboardOffset : Math.max(insets.bottom, spacing.xs);
  const scrollBottomPad = INPUT_BAR_HEIGHT + inputBottom + spacing.sm;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
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
        {loading ? (
          <View style={[styles.bubbleWrap, styles.bubbleWrapLeft]}>
            <View style={[styles.bubble, styles.bubbleSupport]}>
              <ActivityIndicator size="small" color={PRIMARY} />
              <Text style={styles.time}>...</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.inputRow, { bottom: inputBottom }]}>
        <TextInput
          style={[styles.input, inputFocused && styles.inputFocused]}
          placeholder="Type a message..."
          placeholderTextColor={NEUTRAL_COLORS.gray400}
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => {
            setInputFocused(true);
            scrollToEnd();
          }}
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
          <Ionicons name="send" size={20} color={NEUTRAL_COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
    maxWidth: '84%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderBottomLeftRadius: 6,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  bubbleUser: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 6,
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
    marginTop: 6,
    fontSize: 10,
  },
  timeUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: INPUT_BAR_HEIGHT,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    backgroundColor: '#F6FAFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    paddingHorizontal: spacing.md,
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
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
