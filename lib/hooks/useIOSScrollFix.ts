import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export const useIOSScrollFix = () => {
  const pathname = usePathname();

  const scrollToTop = useCallback(() => {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Force scroll to top
      window.scrollTo(0, 0);
      
      // Prevent scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // Additional iOS Safari fix with timeout
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      
      // Extra fix for stubborn iOS Safari
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 200);
    }
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [pathname, scrollToTop]);

  // Also fix scroll on window focus (for when user returns to the app)
  useEffect(() => {
    const handleFocus = () => {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return scrollToTop;
}; 