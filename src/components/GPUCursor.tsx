/**
 * GPUCursor - Intelligent cursor that modifies fields, not positions
 * 
 * WHY: Cursor interaction should feel predictive and intelligent.
 * Key principles:
 * - Cursor never directly moves particles
 * - Cursor modifies distortion fields
 * - Effect radius is soft, not sharp
 * - Cursor influence decays slowly (lingers)
 * - Motion has inertia (1-2 frame lag)
 * 
 * Think: "force field", not "magnet"
 */
import { useEffect, useRef, useCallback } from 'react';
import { useAnimation } from '../context/AnimationContext';

export default function GPUCursor() {
  const { setCursorPosition, uniformsRef } = useAnimation();
  
  // Target and current positions for inertia
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  
  const rafRef = useRef<number>(0);
  const isTouch = useRef(false);
  const lastMoveTime = useRef(0);

  // Smooth cursor interpolation with inertia
  const animateCursor = useCallback(() => {
    // Spring-damper system for smooth, inertial movement
    const stiffness = 0.06;
    const damping = 0.75;
    
    // Calculate spring force toward target
    const dx = targetRef.current.x - currentRef.current.x;
    const dy = targetRef.current.y - currentRef.current.y;
    
    // Apply spring force to velocity
    velocityRef.current.x += dx * stiffness;
    velocityRef.current.y += dy * stiffness;
    
    // Apply damping
    velocityRef.current.x *= damping;
    velocityRef.current.y *= damping;
    
    // Update position
    currentRef.current.x += velocityRef.current.x;
    currentRef.current.y += velocityRef.current.y;

    // Update uniforms directly (no React re-render)
    uniformsRef.current.uCursorPosition = [currentRef.current.x, currentRef.current.y];
    
    // Also update React state for any DOM components that need it
    setCursorPosition(currentRef.current.x, currentRef.current.y);

    rafRef.current = requestAnimationFrame(animateCursor);
  }, [setCursorPosition, uniformsRef]);

  useEffect(() => {
    // Detect touch device
    isTouch.current = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastMoveTime.current = Date.now();
      
      // Convert to world-space coordinates
      // Center is (0, 0), edges are around ±8
      const aspect = window.innerWidth / window.innerHeight;
      const x = ((e.clientX / window.innerWidth) * 2 - 1) * aspect * 8;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      targetRef.current = { x, y };
    };

    // Start animation loop
    rafRef.current = requestAnimationFrame(animateCursor);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animateCursor]);

  // No visual output - cursor influence is purely through uniforms
  return null;
}
