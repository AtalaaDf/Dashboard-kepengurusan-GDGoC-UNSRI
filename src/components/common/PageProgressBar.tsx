import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const PageProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isFirstRender = useRef(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }

    if (prevPath.current === location.pathname) {
      return;
    }

    prevPath.current = location.pathname;

    setIsVisible(true);
    setProgress(20);

    const step1 = setTimeout(() => {
      setProgress(65);
    }, 80);

    const step2 = setTimeout(() => {
      setProgress(88);
    }, 180);

    const step3 = setTimeout(() => {
      setProgress(100);
    }, 320);

    const fadeOut = setTimeout(() => {
      setIsVisible(false);
    }, 480);

    const reset = setTimeout(() => {
      setProgress(0);
    }, 680);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(fadeOut);
      clearTimeout(reset);
    };
  }, [location.pathname]);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#6ba3f7] to-[#57caff] shadow-[0_0_8px_rgba(87,202,255,0.85)] will-change-transform"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
          transition:
            progress === 0
              ? 'none'
              : isVisible
              ? 'width 180ms ease-out, opacity 120ms ease-in'
              : 'width 80ms ease-out, opacity 200ms ease-out',
        }}
      />
    </div>
  );
};
