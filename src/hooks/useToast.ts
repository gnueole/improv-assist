/**
 * @file useToast.ts
 * @description React hook that manages toast notification state and auto-dismiss timer.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import { useState, useCallback, useRef, useEffect } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToastMessage(message);
    timerRef.current = setTimeout(() => {
      setToastMessage(null);
      timerRef.current = null;
    }, 4000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    toastMessage,
    showToast,
    setToastMessage
  };
}
