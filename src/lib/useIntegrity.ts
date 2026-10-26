import { useState, useEffect, useRef, useCallback } from 'react';

export function useIntegrity() {
  const [pastedChars, setPastedChars] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setHiddenCount((c) => c + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const onPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData?.getData('text') || '';
    setPastedChars((prev) => prev + text.length);
  }, []);

  const onBeforeInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputEvt = e.nativeEvent as any;
    if (inputEvt.inputType === 'insertText' && inputEvt.data) {
      setTypedChars((prev) => prev + inputEvt.data.length);
    }
  }, []);

  const resetIntegrity = useCallback(() => {
    setPastedChars(0);
    setTypedChars(0);
    setHiddenCount(0);
  }, []);

  return {
    textareaRef,
    signals: { pastedChars, typedChars, hiddenCount },
    onPaste,
    onBeforeInput,
    resetIntegrity,
  };
}
