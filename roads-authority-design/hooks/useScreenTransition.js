import { useCallback, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 1100;

export function useScreenTransition(defaultDuration = DEFAULT_DURATION_MS) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Loading…');
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const transitionTo = useCallback(
    (navigate, transitionMessage = 'Loading…', duration = defaultDuration) => {
      clearTimer();
      setMessage(transitionMessage);
      setVisible(true);

      timerRef.current = setTimeout(() => {
        navigate();
        timerRef.current = setTimeout(() => {
          setVisible(false);
          timerRef.current = null;
        }, 280);
      }, duration);
    },
    [defaultDuration]
  );

  return {
    transitionVisible: visible,
    transitionMessage: message,
    transitionTo,
    clearTransition: () => {
      clearTimer();
      setVisible(false);
    },
  };
}
