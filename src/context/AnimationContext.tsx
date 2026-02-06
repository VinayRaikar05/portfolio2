/**
 * AnimationContext - Global animation controller for WebGL-driven transitions
 * 
 * WHY: Provides a single source of truth for all WebGL animation state.
 * All sections communicate through this context to drive camera, shaders, and geometry.
 */
import { createContext, useContext, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

export interface AnimationState {
  // Current section identifier for camera positioning
  currentSection: string;
  // Global scroll progress (0-1 across entire page)
  scrollProgress: number;
  // Section-specific progress (0-1 within current section)
  sectionProgress: number;
  // Cursor position in normalized device coordinates (-1 to 1)
  cursorPosition: { x: number; y: number };
  // Scroll velocity for motion intensity
  scrollVelocity: number;
  // Transition state between sections
  isTransitioning: boolean;
  transitionProgress: number;
}

interface AnimationContextType {
  state: AnimationState;
  // Actions
  setSection: (sectionId: string) => void;
  setScrollProgress: (progress: number) => void;
  setSectionProgress: (progress: number) => void;
  setCursorPosition: (x: number, y: number) => void;
  setScrollVelocity: (velocity: number) => void;
  setTransitionProgress: (progress: number) => void;
  // Refs for direct WebGL access (avoiding React re-renders)
  uniformsRef: React.MutableRefObject<{
    uTime: number;
    uScrollProgress: number;
    uSectionProgress: number;
    uCursorPosition: [number, number];
    uScrollVelocity: number;
    uTransitionProgress: number;
    uSectionIndex: number;
    uCalmFactor: number;
    uVelocityField?: THREE.Texture; // Motion vector field texture
  }>;
}

const defaultState: AnimationState = {
  currentSection: 'home',
  scrollProgress: 0,
  sectionProgress: 0,
  cursorPosition: { x: 0, y: 0 },
  scrollVelocity: 0,
  isTransitioning: false,
  transitionProgress: 0,
};

const AnimationContext = createContext<AnimationContextType | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnimationState>(defaultState);

  // Uniforms ref for direct WebGL access - updated every frame without React re-renders
  const uniformsRef = useRef({
    uTime: 0,
    uScrollProgress: 0,
    uSectionProgress: 0,
    uCursorPosition: [0, 0] as [number, number],
    uScrollVelocity: 0,
    uTransitionProgress: 0,
    uSectionIndex: 0,
    uCalmFactor: 0, // Increases as user progresses (training → convergence)
  });

  const setSection = useCallback((sectionId: string) => {
    setState((prev) => ({ ...prev, currentSection: sectionId }));
    // Map section to index for shaders
    const sectionMap: Record<string, number> = {
      home: 0,
      about: 1,
      skills: 2,
      projects: 3,
      experience: 4,
      contact: 5,
    };
    uniformsRef.current.uSectionIndex = sectionMap[sectionId] ?? 0;
  }, []);

  const setScrollProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, scrollProgress: progress }));
    uniformsRef.current.uScrollProgress = progress;
  }, []);

  const setSectionProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, sectionProgress: progress }));
    uniformsRef.current.uSectionProgress = progress;
  }, []);

  const setCursorPosition = useCallback((x: number, y: number) => {
    setState((prev) => ({ ...prev, cursorPosition: { x, y } }));
    uniformsRef.current.uCursorPosition = [x, y];
  }, []);

  const setScrollVelocity = useCallback((velocity: number) => {
    setState((prev) => ({ ...prev, scrollVelocity: velocity }));
    uniformsRef.current.uScrollVelocity = velocity;
  }, []);

  const setTransitionProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      transitionProgress: progress,
      isTransitioning: progress > 0 && progress < 1
    }));
    uniformsRef.current.uTransitionProgress = progress;
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        state,
        setSection,
        setScrollProgress,
        setSectionProgress,
        setCursorPosition,
        setScrollVelocity,
        setTransitionProgress,
        uniformsRef,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}
