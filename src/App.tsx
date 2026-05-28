/**
 * App - Root component with persistent WebGL layer
 * 
 * WHY: Single canvas mounts once and never unmounts.
 * All section transitions are driven by WebGL camera movement and shader uniforms.
 * No CSS page transitions - pure GPU-driven motion.
 */
import { useEffect, useState } from 'react';
import { AnimationProvider } from './context/AnimationContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// Persistent WebGL layer

import ScrollController from './components/ScrollController';
import GPUCursor from './components/GPUCursor';

import NeuralMorphParticles from './components/NeuralMorphParticles';


// DOM Content
import Navigation from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import Certifications from './sections/Certifications';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  // Reduced motion detection
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}


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
        <Certifications />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <AppContent />
      </AnimationProvider>
    </ErrorBoundary>
  );
}

export default App;

