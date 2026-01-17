/**
 * Performance Monitoring Utilities for React Native
 * 
 * Use these tools to diagnose input lag and frame drops
 */

import React from 'react';
import { InteractionManager, Platform } from 'react-native';

/**
 * Measures render time of a component
 */
export function measureRenderTime(componentName) {
  if (!__DEV__) return () => {};
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // More than one frame (16ms at 60fps)
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (target: <16ms)`);
    }
    
    return renderTime;
  };
}

/**
 * Measures input latency
 */
export function measureInputLatency(onChangeText) {
  if (!__DEV__) return onChangeText;
  
  return (text) => {
    const startTime = performance.now();
    
    // Call the original handler
    const result = onChangeText(text);
    
    // Measure latency after the handler completes
    InteractionManager.runAfterInteractions(() => {
      const latency = performance.now() - startTime;
      
      if (latency > 16) {
        console.warn(`[Performance] Input handler took ${latency.toFixed(2)}ms (target: <16ms)`);
      }
    });
    
    return result;
  };
}

/**
 * Frame rate monitor
 */
class FrameRateMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.droppedFrames = 0;
    this.stutters = 0;
    this.isMonitoring = false;
    this.animationFrameId = null;
  }

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.droppedFrames = 0;
    this.stutters = 0;
    
    this.monitor();
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  monitor() {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;
    
    // Expected frame time at 60fps is ~16.67ms
    const expectedFrameTime = 1000 / 60;
    
    if (elapsed > expectedFrameTime * 1.5) {
      // Dropped frames detected
      const dropped = Math.floor((elapsed / expectedFrameTime) - 1);
      this.droppedFrames += dropped;
      
      if (dropped >= 4) {
        this.stutters++;
        console.warn(`[Performance] Stutter detected: ${dropped} frames dropped (${elapsed.toFixed(2)}ms)`);
      }
    }
    
    this.frameCount++;
    this.lastTime = currentTime;
    
    // Calculate FPS every second
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round((1000 / elapsed) * 60);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.monitor());
  }

  getStats() {
    return {
      fps: this.fps,
      droppedFrames: this.droppedFrames,
      stutters: this.stutters,
    };
  }

  reset() {
    this.droppedFrames = 0;
    this.stutters = 0;
    this.frameCount = 0;
  }
}

export const frameRateMonitor = new FrameRateMonitor();

/**
 * Component render counter
 */
export function useRenderCounter(componentName) {
  if (!__DEV__) return;
  
  const renderCount = React.useRef(0);
  renderCount.current++;
  
  React.useEffect(() => {
    console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
  });
}

/**
 * Logs when a component re-renders unnecessarily
 */
export function useWhyDidYouRender(componentName, props) {
  if (!__DEV__) return;
  
  const prevProps = React.useRef();
  
  React.useEffect(() => {
    if (prevProps.current) {
      const changedProps = Object.keys({ ...props, ...prevProps.current }).reduce((acc, key) => {
        if (props[key] !== prevProps.current[key]) {
          acc[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
        }
        return acc;
      }, {});
      
      if (Object.keys(changedProps).length > 0) {
        console.log(`[WhyDidYouRender] ${componentName} re-rendered due to:`, changedProps);
      }
    }
    
    prevProps.current = props;
  });
}

/**
 * Debounce with immediate execution option
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function calls
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Performance profiler hook
 */
export function usePerformanceProfiler(componentName, enabled = __DEV__) {
  if (!enabled) return {};
  
  const renderStartTime = React.useRef(performance.now());
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current++;
    
    if (renderTime > 16) {
      console.warn(
        `[Performance] ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`
      );
    }
  });
  
  return {
    renderCount: renderCount.current,
    measureRender: (fn) => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      
      if (duration > 16) {
        console.warn(`[Performance] ${componentName} operation took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    },
  };
}

