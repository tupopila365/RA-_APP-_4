import { useRef, useEffect, useCallback } from 'react';
import { Keyboard, Dimensions, Platform } from 'react-native';

// Gap between the bottom of the focused input and the top of the keyboard (keeps input fully visible).
const KEYBOARD_GAP = 120;
const SCROLL_BUFFER = 28; // Extra pixels so input stays fully on top (safe area / rounding).
const MEASURE_DELAY_MS = Platform.OS === 'ios' ? 200 : 350;

/**
 * Returns refs and callback so that when a form input is focused and the keyboard opens,
 * the ScrollView scrolls so the entire input sits fully above the keyboard with a clear gap.
 * Uses measureInWindow only (no measureLayout) to avoid ref warnings.
 */
export function useKeyboardScroll() {
  const scrollViewRef = useRef(null);
  const contentRef = useRef(null);
  const focusedInputRef = useRef(null);
  const timeoutRef = useRef(null);

  const onFocusWithRef = useCallback((inputWrapperRef) => {
    focusedInputRef.current = inputWrapperRef;
  }, []);

  useEffect(() => {
    const onKeyboardShow = (e) => {
      const keyboardHeight = e.endCoordinates?.height ?? 0;
      const windowHeight = Dimensions.get('window').height;
      const visibleHeight = windowHeight - keyboardHeight;

      const runScroll = () => {
        const scrollView = scrollViewRef.current;
        const content = contentRef.current;
        const inputWrap = focusedInputRef.current;
        if (!scrollView || !content || !inputWrap) return;
        if (typeof inputWrap.measureInWindow !== 'function' || typeof content.measureInWindow !== 'function') return;

        const doScroll = (y) => {
          try {
            if (typeof scrollView.scrollTo === 'function') {
              scrollView.scrollTo({ y: Math.round(y), animated: true });
            }
          } catch (_) {}
        };

        inputWrap.measureInWindow((_x, inputY, _w, h) => {
          content.measureInWindow((_cx, contentY) => {
            const relativeY = inputY - contentY;
            // Scroll so the input's bottom sits KEYBOARD_GAP above the keyboard (input fully on top).
            const scrollToY = Math.max(0, relativeY + h - visibleHeight + KEYBOARD_GAP + SCROLL_BUFFER);
            doScroll(scrollToY);
          });
        });
      };

      timeoutRef.current = setTimeout(runScroll, MEASURE_DELAY_MS);
    };

    const sub = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    return () => {
      sub.remove();
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { scrollViewRef, contentRef, onFocusWithRef };
}
