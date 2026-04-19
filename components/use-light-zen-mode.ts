'use client';

import { useCallback, useEffect, useState } from 'react';

export function useLightZenMode() {
  const [isZen, setIsZen] = useState(false);

  const toggleZen = useCallback(() => {
    setIsZen((current) => !current);
  }, []);

  const exitZen = useCallback(() => {
    setIsZen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setIsZen((current) => (current ? false : current));
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return { isZen, toggleZen, exitZen };
}
