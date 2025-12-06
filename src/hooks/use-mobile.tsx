import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set the initial value
    onChange();

    // Listen for changes
    mql.addEventListener("change", onChange);

    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
