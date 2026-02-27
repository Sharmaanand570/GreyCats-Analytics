import { useState, useEffect, useRef, useCallback } from "react";

interface UseSlideVisibilityOptions {
  /**
   * Extra margin so slides below viewport pre-fetch eagerly.
   * Default "0px 0px 2000px 0px" → prefetches ~2.5 screens ahead.
   * NOTE: IntersectionObserver only accepts px or %, not vh.
   */
  rootMargin?: string;
  /** Once a slide has been visible, keep it marked so data persists (default true) */
  sticky?: boolean;
  /**
   * After this many ms, mark ALL registered slides as visible regardless of scroll.
   * Ensures background prefetch completes even if the user never scrolls.
   * Default: 2000ms (2s after component mounts).
   * ⚠️ This timer fires ONCE and is immune to re-renders.
   */
  fallbackDelay?: number;
}

export function useSlideVisibility(options?: UseSlideVisibilityOptions) {
  const {
    rootMargin = "0px 0px 2000px 0px",
    sticky = true,
    fallbackDelay = 0, // 0 = mark all slides visible immediately on mount so ALL widgets fetch in parallel
  } = options ?? {};

  const [visibleSlideIds, setVisibleSlideIds] = useState<Set<number>>(new Set());
  const elementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Track if the fallback has already fired so it doesn't re-fire on re-renders
  const fallbackFiredRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerSlide = useCallback(
    (slideId: number, element: HTMLElement | null) => {
      if (element) {
        element.setAttribute("data-slide-id", String(slideId));
        elementsRef.current.set(slideId, element);
        observerRef.current?.observe(element);

        // If fallback already fired, mark this slide visible immediately
        if (fallbackFiredRef.current) {
          setVisibleSlideIds((prev) => (prev.has(slideId) ? prev : new Set([...prev, slideId])));
        }
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

  // ✅ Fire-once fallback: after `fallbackDelay` ms, pre-mark ALL slides visible.
  // Uses refs to ensure this timer fires EXACTLY ONCE regardless of how many times
  // the parent re-renders. The old approach used useEffect with [fallbackDelay] deps,
  // which ran clearTimeout on every re-render, resetting the timer and preventing it
  // from ever completing for off-screen slides (GA, GSC, Instagram).
  useEffect(() => {
    // Don't start another timer if we've already fired or one is already running
    if (fallbackFiredRef.current || fallbackTimerRef.current != null) return;

    fallbackTimerRef.current = setTimeout(() => {
      fallbackFiredRef.current = true;
      fallbackTimerRef.current = null;
      setVisibleSlideIds((prev) => {
        const next = new Set(prev);
        let changed = false;
        elementsRef.current.forEach((_, id) => {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        });
        if (changed) {
          console.log(`⚡ [SlideVisibility] Fallback fired: marking all ${elementsRef.current.size} slides visible`);
        }
        return changed ? next : prev;
      });
    }, fallbackDelay);

    // Only clear on unmount (when component is destroyed), NOT on re-renders
    return () => {
      if (fallbackTimerRef.current != null && !fallbackFiredRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = fire-once on mount, never reset on re-render

  const isSlideVisible = useCallback(
    (slideId: number) => visibleSlideIds.has(slideId),
    [visibleSlideIds]
  );

  return { visibleSlideIds, registerSlide, isSlideVisible };
}
