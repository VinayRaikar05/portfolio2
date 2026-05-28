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
    uniformsRef,
  } = useAnimation();
  
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const velocityRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isActiveRef = useRef(true);
  
  // Smoothed velocity for calmer feel
  const smoothedVelocityRef = useRef(0);
  const currentSectionRef = useRef('home');

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

  // Main scroll handler (ultra-light, directly writes to uniforms and CSS variables)
  const handleScroll = useCallback(() => {
    if (!isActiveRef.current) return;

    const now = Date.now();
    const currentScrollY = window.scrollY;
    const deltaTime = Math.max(1, now - lastScrollTime.current);
    
    // Calculate raw velocity
    const deltaY = currentScrollY - lastScrollY.current;
    const rawVelocity = Math.abs(deltaY / deltaTime) * 1000;
    
    // Smooth raw velocity accumulation
    velocityRef.current = velocityRef.current * 0.5 + rawVelocity * 0.5;

    // Calculate progress
    const progress = calculateScrollProgress();
    const section = getCurrentSection(progress);
    const sectionProgress = calculateSectionProgress(progress, section);

    // Update WebGL uniforms directly (runs in GPU space, zero React overhead)
    uniformsRef.current.uScrollProgress = progress;
    uniformsRef.current.uSectionProgress = sectionProgress;
    
    const sectionMap: Record<string, number> = {
      home: 0,
      about: 1,
      skills: 2,
      projects: 3,
      experience: 4,
      contact: 5,
    };
    uniformsRef.current.uSectionIndex = sectionMap[section.id] ?? 0;

    // Calculate calm factor (increases with progress)
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
    uniformsRef.current.uTransitionProgress = transitionProgress;

    // Direct DOM CSS Variables updates (GPU-accelerated, zero React re-renders)
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
    document.documentElement.style.setProperty('--hero-section-progress', (section.id === 'home' ? sectionProgress : (progress > 0.15 ? 1 : 0)).toFixed(4));
    document.documentElement.style.setProperty('--about-section-progress', (section.id === 'about' ? sectionProgress : (progress < 0.15 ? 0 : 1)).toFixed(4));

    // Update React state ONLY when active section actually changes (low frequency, max 6 times per page scroll)
    if (currentSectionRef.current !== section.id) {
      currentSectionRef.current = section.id;
      setSection(section.id);
    }

    // Update refs for next iteration
    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;
  }, [
    calculateScrollProgress, 
    getCurrentSection, 
    calculateSectionProgress,
    setSection,
    uniformsRef,
  ]);

  // Single Animation Frame Loop for decay and uTime updates
  useEffect(() => {
    let lastFrameTime = Date.now();
    
    const updateLoop = () => {
      if (!isActiveRef.current) {
        rafRef.current = requestAnimationFrame(updateLoop);
        return;
      }
      
      const now = Date.now();
      const deltaTime = Math.max(1, now - lastFrameTime);
      lastFrameTime = now;
      
      // Decay velocity smoothly with delta-time compatibility
      velocityRef.current *= Math.pow(0.92, deltaTime / 16.6);
      smoothedVelocityRef.current += (velocityRef.current - smoothedVelocityRef.current) * (1 - Math.pow(0.85, deltaTime / 16.6));
      
      // Write smoothed velocity directly to uniforms
      uniformsRef.current.uScrollVelocity = Math.min(smoothedVelocityRef.current / 800, 1);
      
      // Update global time uniform for continuous particle morphing
      uniformsRef.current.uTime = now * 0.001;
      
      rafRef.current = requestAnimationFrame(updateLoop);
    };
    
    rafRef.current = requestAnimationFrame(updateLoop);
    
    return () => cancelAnimationFrame(rafRef.current);
  }, [uniformsRef]);

  // Passive scroll listener for maximum browser responsiveness
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Visibility change handler to suspend animation frame loop when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return null;
}

