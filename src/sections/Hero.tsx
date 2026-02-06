/**
 * Hero Section - Calm, premium entrance with clear visual hierarchy
 * 
 * WHY: Text is the anchor. Animation is contextual background.
 * Key principles:
 * - Text remains visually stable at all times
 * - Background initializes quietly, then text fades in
 * - No bouncing, scaling, or aggressive reveals
 * - Subtle letter spacing relaxation on load
 * - Faint luminance breathing (very slow, almost imperceptible)
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { useAnimation } from '../context/AnimationContext';

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState('');
  const [textState, setTextState] = useState<'waiting' | 'scrambling' | 'complete'>('waiting');
  const { state } = useAnimation();
  const fullText = 'VINAY RAIKAR';

  // Calm text reveal sequence
  useEffect(() => {
    // Wait for background to initialize (calm, quiet start)
    const initDelay = setTimeout(() => {
      setTextState('scrambling');

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let iteration = 0;
      const maxIterations = fullText.length * 3;

      const interval = setInterval(() => {
        setDisplayText(
          fullText
            .split('')
            .map((char, index) => {
              // Characters settle one by one
              const settleThreshold = (iteration / maxIterations) * fullText.length;
              if (index < settleThreshold) return fullText[index];
              if (char === '/' || char === ' ') return char;
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iteration++;
        if (iteration >= maxIterations) {
          clearInterval(interval);
          setDisplayText(fullText);
          setTextState('complete');
        }
      }, 60);

      return () => clearInterval(interval);
    }, 1200); // Longer delay for background to settle

    return () => clearTimeout(initDelay);
  }, []);

  const handleScrollDown = () => {
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Subtle parallax - very gentle
  const parallaxY = state.sectionProgress * -20;
  const opacity = Math.max(0.3, 1 - state.sectionProgress * 1.5);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Content - clear z-index above WebGL canvas */}
      <div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{
          transform: `translateY(${parallaxY}px)`,
          opacity,
        }}
      >
        {/* Greeting - subtle, minimal */}
        <div
          className={`mb-8 transition-all duration-1000 ease-out ${textState !== 'waiting' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
        >
          <span className="text-sm sm:text-base text-white/50 font-light tracking-[0.3em] uppercase">
            Hello, I'm
          </span>
        </div>

        {/* Main Title - the anchor */}
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-tight mb-8 transition-all duration-1000 ${textState !== 'waiting' ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            letterSpacing: textState === 'complete' ? '-0.02em' : '0.1em',
            transition: 'letter-spacing 1.5s ease-out, opacity 1s ease-out',
          }}
        >
          <span className="gradient-text" style={{
            textShadow: textState === 'complete'
              ? '0 0 40px rgba(79, 70, 229, 0.15), 0 0 80px rgba(79, 70, 229, 0.08)'
              : 'none',
            transition: 'text-shadow 2s ease-out 0.5s',
          }}>
            {displayText || '\u00A0'}
          </span>
        </h1>

        {/* Subtitle - calm, confident */}
        <p
          className={`text-lg sm:text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light transition-all duration-1000 delay-500 ${textState === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          Building intelligent systems that learn, adapt, and evolve
        </p>

        {/* CTA Buttons - minimal, intentional */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-700 ${textState === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            Explore Work
            <ArrowDown className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* Scroll Indicator - subtle, minimal */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-1000 ${textState === 'complete' ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <button
          onClick={handleScrollDown}
          className="flex flex-col items-center gap-3 text-white/30 hover:text-white/50 transition-colors duration-500"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-current opacity-30" />
        </button>
      </div>
    </section>
  );
}
