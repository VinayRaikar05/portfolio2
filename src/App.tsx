/**
 * App - Root component with persistent WebGL layer
 * 
 * WHY: Single canvas mounts once and never unmounts.
 * All section transitions are driven by WebGL camera movement and shader uniforms.
 * No CSS page transitions - pure GPU-driven motion.
 */
import { useEffect } from 'react';
import { AnimationProvider } from './context/AnimationContext';
import './App.css';

// Persistent WebGL layer
import CanvasLayer from './components/CanvasLayer';
import ScrollController from './components/ScrollController';
import GPUCursor from './components/GPUCursor';
import SimpleMotionTrail from './components/SimpleMotionTrail';
import NeuralMorphParticles from './components/NeuralMorphParticles';

// DOM Content
import Navigation from './components/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

function AppContent() {
  // Reduced motion detection
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Persistent WebGL Canvas Layer */}
      <CanvasLayer />

      {/* Neural Network Morphing Particles */}
      <NeuralMorphParticles enabled={true} />

      {/* Scroll Controller */}
      <ScrollController />

      {/* GPU Cursor - field-based influence */}
      <GPUCursor />

      {/* Subtle grain */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* DOM Content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AnimationProvider>
      <AppContent />
    </AnimationProvider>
  );
}

export default App;
