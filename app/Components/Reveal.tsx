"use client";

import React, { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  style?: React.CSSProperties;
}

export default function Reveal({ children, className = "", threshold = 0.1, style }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealVisible');
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold,
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before entry
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  return (
    <div ref={elementRef} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
