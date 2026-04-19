"use client";

import { useEffect, useState, type RefObject } from "react";

export function useInViewOnce<T extends Element>(
  ref: RefObject<T | null>,
  threshold = 0.3
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, ref, threshold]);

  return isVisible;
}
