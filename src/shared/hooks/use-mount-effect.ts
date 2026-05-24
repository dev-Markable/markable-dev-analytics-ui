import { useEffect, useRef } from 'react';

export function useMountEffect(effect: () => void | (() => void)): void {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
