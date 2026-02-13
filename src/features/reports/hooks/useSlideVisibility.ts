import { useState, useEffect, useRef, useCallback } from "react";

interface UseSlideVisibilityOptions {
  /** Extra margin so slides slightly below viewport pre-fetch (default "0px 0px 300px 0px") */
  rootMargin?: string;
  /** Once a slide has been visible, keep it marked so data persists (default true) */
  sticky?: boolean;
}

export function useSlideVisibility(options?: UseSlideVisibilityOptions) {
  const { rootMargin = "0px 0px 300px 0px", sticky = true } = options ?? {};

  const [visibleSlideIds, setVisibleSlideIds] = useState<Set<number>>(new Set());
  const elementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const registerSlide = useCallback(
    (slideId: number, element: HTMLElement | null) => {
      if (element) {
        element.setAttribute("data-slide-id", String(slideId));
        elementsRef.current.set(slideId, element);
        observerRef.current?.observe(element);
      } else {
        const prev = elementsRef.current.get(slideId);
        if (prev) observerRef.current?.unobserve(prev);
        elementsRef.current.delete(slideId);
      }
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSlideIds((prev) => {
          const next = new Set(prev);
          let changed = false;

          entries.forEach((entry) => {
            const idStr = entry.target.getAttribute("data-slide-id");
            if (!idStr) return;
            const id = Number(idStr);

            if (entry.isIntersecting && !next.has(id)) {
              next.add(id);
              changed = true;
            } else if (!entry.isIntersecting && !sticky && next.has(id)) {
              next.delete(id);
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      },
      { root: null, rootMargin, threshold: 0 }
    );

    observerRef.current = observer;

    // Observe any elements already registered before the observer was created
    elementsRef.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rootMargin, sticky]);

  const isSlideVisible = useCallback(
    (slideId: number) => visibleSlideIds.has(slideId),
    [visibleSlideIds]
  );

  return { visibleSlideIds, registerSlide, isSlideVisible };
}
