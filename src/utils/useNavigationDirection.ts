import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export type NavigationDirection = "back" | "forward" | "reload";

export function useNavigationDirection(
  callback: (direction: NavigationDirection) => void
): void {
  const location = useLocation();
  const prevIndex = useRef<number | undefined>(window.history.state?.idx);

  useEffect(() => {
    const currentIndex: number | undefined = window.history.state?.idx;

    if (prevIndex.current !== undefined && currentIndex !== undefined) {
      if (currentIndex < prevIndex.current) {
        callback("back");
      } else if (currentIndex > prevIndex.current) {
        callback("forward");
      } else {
        callback("reload");
      }
    } else {
      // Edge case: index missing → treat as reload
      callback("reload");
    }

    prevIndex.current = currentIndex;
  }, [location]);
}
