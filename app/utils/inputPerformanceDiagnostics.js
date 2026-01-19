/**
 * Input Performance Diagnostics
 * 
 * Run this script to identify TextInput performance bottlenecks
 * 
 * Usage:
 * 1. Import this in your component
 * 2. Wrap your TextInput with diagnosticHOC
 * 3. Check console for performance warnings
 */

import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { measureInputLatency, frameRateMonitor } from './performanceMonitor';

/**
 * Diagnostic wrapper for TextInput
 */
export function withInputDiagnostics(TextInputComponent, componentName = 'TextInput') {
  return React.forwardRef((props, ref) => {
    const renderCount = useRef(0);
    const onChangeTextCalls = useRef(0);
    const lastChangeTime = useRef(0);
    
    renderCount.current++;
    
    useEffect(() => {
      if (__DEV__) {
        console.log(`[Diagnostics] ${componentName} mounted`);
      }
    }, []);
    
    useEffect(() => {
      if (__DEV__ && renderCount.current > 1) {
        console.warn(`[Diagnostics] ${componentName} re-rendered (count: ${renderCount.current})`);
      }
    });
    
    const originalOnChangeText = props.onChangeText;
    const diagnosticOnChangeText = (text) => {
      onChangeTextCalls.current++;
      const now = performance.now();
      const timeSinceLastChange = now - lastChangeTime.current;
      
      if (__DEV__) {
        if (timeSinceLastChange < 16 && lastChangeTime.current > 0) {
          console.warn(
            `[Diagnostics] ${componentName} onChangeText called too frequently: ${timeSinceLastChange.toFixed(2)}ms since last call`
          );
        }
        
        const startTime = performance.now();
        
        if (originalOnChangeText) {
          originalOnChangeText(text);
        }
        
        const handlerTime = performance.now() - startTime;
        
        if (handlerTime > 16) {
          console.error(
            `[Diagnostics] ${componentName} onChangeText handler took ${handlerTime.toFixed(2)}ms (target: <16ms)`
          );
        }
      } else {
        if (originalOnChangeText) {
          originalOnChangeText(text);
        }
      }
      
      lastChangeTime.current = now;
    };
    
    return (
      <TextInputComponent
        {...props}
        ref={ref}
        onChangeText={diagnosticOnChangeText}
      />
    );
  });
}

/**
 * Checklist for common TextInput performance issues
 */
export const INPUT_PERFORMANCE_CHECKLIST = {
  // Component-level issues
  component: [
    '✓ Is getStyles() being called on every render? (Should be memoized)',
    '✓ Are inline functions being created in render? (Use useCallback)',
    '✓ Is the component wrapped in React.memo?',
    '✓ Are props changing unnecessarily? (Check with useWhyDidYouRender)',
  ],
  
  // onChangeText handler issues
  onChangeText: [
    '✓ Is onChangeText doing heavy synchronous work? (Should be async/debounced)',
    '✓ Is onChangeText causing parent re-renders? (Use useCallback)',
    '✓ Is onChangeText filtering large arrays? (Use useMemo with debounce)',
    '✓ Is onChangeText making API calls? (Should be debounced)',
  ],
  
  // Parent component issues
  parent: [
    '✓ Is parent component re-rendering on every keystroke?',
    '✓ Are large lists re-rendering when input changes?',
    '✓ Is Context value changing unnecessarily?',
    '✓ Are expensive calculations running in render? (Use useMemo)',
  ],
  
  // State management issues
  state: [
    '✓ Are multiple state updates happening in onChangeText? (Batch with React 18)',
    '✓ Is state causing cascading re-renders?',
    '✓ Are useEffect dependencies causing infinite loops?',
  ],
};

/**
 * Diagnostic report generator
 */
export function generateDiagnosticReport(componentName, props) {
  const report = {
    componentName,
    timestamp: new Date().toISOString(),
    issues: [],
    recommendations: [],
  };
  
  // Check for inline functions
  const inlineFunctionProps = Object.keys(props).filter(key => {
    const value = props[key];
    return typeof value === 'function' && value.toString().includes('=>');
  });
  
  if (inlineFunctionProps.length > 0) {
    report.issues.push({
      type: 'inline_functions',
      props: inlineFunctionProps,
      severity: 'medium',
      message: 'Inline functions in props cause re-renders. Use useCallback.',
    });
  }
  
  // Check onChangeText
  if (props.onChangeText) {
    const onChangeTextStr = props.onChangeText.toString();
    
    if (onChangeTextStr.includes('.filter(') || onChangeTextStr.includes('.map(')) {
      report.issues.push({
        type: 'heavy_computation',
        severity: 'high',
        message: 'onChangeText contains array operations. Move to useMemo with debounce.',
      });
    }
    
    if (onChangeTextStr.includes('fetch') || onChangeTextStr.includes('axios')) {
      report.issues.push({
        type: 'api_call',
        severity: 'high',
        message: 'onChangeText contains API calls. Should be debounced.',
      });
    }
  }
  
  return report;
}

/**
 * Hook to diagnose input performance
 */
export function useInputDiagnostics(componentName, props) {
  useEffect(() => {
    if (__DEV__) {
      const report = generateDiagnosticReport(componentName, props);
      
      if (report.issues.length > 0) {
        console.group(`[Diagnostics] ${componentName} Performance Issues`);
        report.issues.forEach(issue => {
          console[issue.severity === 'high' ? 'error' : 'warn'](
            `[${issue.severity.toUpperCase()}] ${issue.message}`,
            issue
          );
        });
        console.groupEnd();
      }
    }
  }, [componentName, props]);
}




