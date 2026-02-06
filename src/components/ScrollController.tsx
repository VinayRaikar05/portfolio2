/**
 * ScrollController - Refined scroll-driven animation controller
 * 
 * WHY: Scroll should control camera and motion intensity, not DOM.
 * Key principles:
 * - Scroll controls camera depth and position
 * - Scroll velocity affects motion intensity (subtle destabilization)
 * - Fast scroll → slight destabilization
 * - Slow scroll → stabilization
 * - Never visually punish the user
 * - Motion always settles gracefully
 */
import { useEffect, useRef, useCallback } from 'react';
import { useAnimation } from '../context/AnimationContext';

// Section definitions with their scroll ranges
const SECTIONS = [
  { id: 'home', start: 0, end: 0.15 },
  { id: 'about', start: 0.15, end: 0.30 },
  { id: 'skills', start: 0.30, end: 0.45 },
  { id: 'projects', start: 0.45, end: 0.65 },
  { id: 'experience', start: 0.65, end: 0.80 },
  { id: 'contact', start: 0.80, end: 1.0 },
];

export default function ScrollController() {
  const { 
    setSection, 
    setScrollProgress, 
    setSectionProgress, 
    setScrollVelocity,
    setTransitionProgress,
    uniformsRef,
  } = useAnimation();
  
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const velocityRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isActiveRef = useRef(true);
  
  // Smoothed velocity for calmer feel
  const smoothedVelocityRef = useRef(0);

  // Calculate scroll progress
  const calculateScrollProgress = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / docHeight));
  }, []);

  // Determine current section
  const getCurrentSection = useCallback((progress: number) => {
    for (const section of SECTIONS) {
      if (progress >= section.start && progress < section.end) {
        return section;
      }
    }
    return SECTIONS[SECTIONS.length - 1];
  }, []);

  // Calculate section-local progress
  const calculateSectionProgress = useCallback((progress: number, section: typeof SECTIONS[0]) => {
    const sectionRange = section.end - section.start;
    if (sectionRange <= 0) return 0;
    return Math.max(0, Math.min(1, (progress - section.start) / sectionRange));
  }, []);

  // Main scroll handler
  const handleScroll = useCallback(() => {
    if (!isActiveRef.current) return;

    const now = Date.now();
    const currentScrollY = window.scrollY;
    const deltaTime = now - lastScrollTime.current;
    
    // Calculate raw velocity
    if (deltaTime > 0) {
      const deltaY = currentScrollY - lastScrollY.current;
      const rawVelocity = Math.abs(deltaY / deltaTime) * 1000;
      // Gentler velocity accumulation
      velocityRef.current = velocityRef.current * 0.7 + rawVelocity * 0.3;
    }

    // Calculate progress
    const progress = calculateScrollProgress();
    const section = getCurrentSection(progress);
    const sectionProgress = calculateSectionProgress(progress, section);

    // Smooth velocity for calmer feel
    smoothedVelocityRef.current += (velocityRef.current - smoothedVelocityRef.current) * 0.15;

    // Update React state
    setScrollProgress(progress);
    setSectionProgress(sectionProgress);
    setScrollVelocity(Math.min(smoothedVelocityRef.current / 800, 1));
    setSection(section.id);

    // Calculate calm factor (increases with progress)
    // Home: 0.0, Contact: ~0.85
    const targetCalm = progress * 0.7 + SECTIONS.findIndex(s => s.id === section.id) * 0.05;
    uniformsRef.current.uCalmFactor = Math.min(targetCalm, 0.9);

    // Calculate transition progress
    let transitionProgress = 0;
    if (sectionProgress < 0.15) {
      transitionProgress = sectionProgress / 0.15;
    } else if (sectionProgress > 0.85) {
      transitionProgress = 1 - (sectionProgress - 0.85) / 0.15;
    } else {
      transitionProgress = 1;
    }
    
    setTransitionProgress(transitionProgress);

    // Update refs
    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;

    // Velocity decay
    rafRef.current = requestAnimationFrame(() => {
      velocityRef.current *= 0.92;
      smoothedVelocityRef.current += (velocityRef.current - smoothedVelocityRef.current) * 0.1;
      setScrollVelocity(Math.min(smoothedVelocityRef.current / 800, 1));
    });
  }, [
    calculateScrollProgress, 
    getCurrentSection, 
    calculateSectionProgress,
    setScrollProgress, 
    setSectionProgress, 
    setScrollVelocity, 
    setSection,
    setTransitionProgress,
    uniformsRef,
  ]);

  // Passive scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return null;
}
