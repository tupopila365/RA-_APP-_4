/**
 * Optimized TextInput Component - Bank-grade, Government-ready
 * 
 * This component implements all React Native TextInput performance best practices:
 * - Memoized styles with theme consistency
 * - useCallback for handlers to prevent re-renders
 * - React.memo with custom comparison for optimal performance
 * - Debounced onChangeText support for search/filter scenarios
 * - Performance monitoring in dev mode
 * - Consistent styling with UnifiedFormInput
 * 
 * @example
 * <OptimizedTextInput
 *   value={searchTerm}
 *   onChangeText={setSearchTerm}
 *   debounceMs={300}
 *   placeholder="Type to search..."
 * />
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useDebounce } from '../hooks/useDebounce';
import { spacing } from '../theme/spacing';

// Memoize styles per color scheme
const stylesCache = new Map();

function getStyles(colors) {
  const cacheKey = `${colors.primary}-${colors.text}-${colors.border}`;
  if (stylesCache.has(cacheKey)) {
    return stylesCache.get(cacheKey);
  }

  const styles = StyleSheet.create({
    input: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.text,
      paddingHorizontal: spacing.lg, // 16pt - consistent with form inputs
      paddingVertical: spacing.md,   // 12pt
      minHeight: 44, // Minimum touch target
      ...Platform.select({
        ios: { fontFamily: 'System' },
        android: { fontFamily: 'Roboto' },
      }),
    },
  });

  stylesCache.set(cacheKey, styles);
  return styles;
}

/**
 * Optimized TextInput with performance best practices
 * 
 * @param {Object} props - TextInput props
 * @param {Function} props.onChangeText - Text change handler (will be debounced if debounceMs is set)
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 0 = no debounce)
 * @param {Function} props.onChangeTextImmediate - Immediate text change handler (for controlled input)
 * @param {boolean} props.enablePerformanceMonitoring - Enable performance monitoring in dev mode
 */
export const OptimizedTextInput = React.memo(
  function OptimizedTextInput({
    value,
    onChangeText,
    onChangeTextImmediate,
    debounceMs = 0,
    enablePerformanceMonitoring = __DEV__,
    style,
    ...props
  }) {
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors.primary, colors.text]);
    
    // Local state for immediate UI updates
    const [localValue, setLocalValue] = useState(value || '');
    const onChangeTextRef = useRef(onChangeText);
    
    // Update ref when onChangeText changes
    useEffect(() => {
      onChangeTextRef.current = onChangeText;
    }, [onChangeText]);
    
    // Sync with controlled value
    useEffect(() => {
      if (value !== undefined && value !== localValue) {
        setLocalValue(value);
      }
    }, [value]);
    
    // Debounced value for onChangeText
    const debouncedValue = useDebounce(localValue, debounceMs);
    
    // Call onChangeText when debounced value changes
    useEffect(() => {
      if (debounceMs > 0 && onChangeTextRef.current && debouncedValue !== value) {
        onChangeTextRef.current(debouncedValue);
      }
    }, [debouncedValue, debounceMs, value]);
    
    // Immediate handler for controlled input updates
    const handleChangeText = useCallback((text) => {
      setLocalValue(text);
      
      // Call immediate handler if provided
      if (onChangeTextImmediate) {
        onChangeTextImmediate(text);
      }
      
      // If no debounce, call onChangeText immediately
      if (debounceMs === 0 && onChangeTextRef.current) {
        onChangeTextRef.current(text);
      }
      
      // Performance monitoring
      if (enablePerformanceMonitoring) {
        const startTime = performance.now();
        requestAnimationFrame(() => {
          const latency = performance.now() - startTime;
          if (latency > 16) {
            console.warn(
              `[OptimizedTextInput] Input latency: ${latency.toFixed(2)}ms (target: <16ms)`
            );
          }
        });
      }
    }, [onChangeTextImmediate, debounceMs, enablePerformanceMonitoring]);
    
    // Use local value if uncontrolled, otherwise use prop value
    const inputValue = value !== undefined ? value : localValue;
    
    return (
      <TextInput
        {...props}
        value={inputValue}
        onChangeText={handleChangeText}
        style={[styles.input, style]}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        underlineColorAndroid="transparent"
        maxFontSizeMultiplier={1.3}
      />
    );
  },
  // Custom comparison function for React.memo
  (prevProps, nextProps) => {
    // Re-render if these props change
    if (
      prevProps.value !== nextProps.value ||
      prevProps.placeholder !== nextProps.placeholder ||
      prevProps.editable !== nextProps.editable ||
      prevProps.error !== nextProps.error ||
      prevProps.debounceMs !== nextProps.debounceMs
    ) {
      return false; // Props changed, re-render
    }
    
    // Don't re-render for onChangeText changes (handled by ref)
    return true; // Props are equal, skip re-render
  }
);

OptimizedTextInput.displayName = 'OptimizedTextInput';




