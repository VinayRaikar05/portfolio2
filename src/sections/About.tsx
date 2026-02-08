/**
 * About Section - Calm, stable content with minimal motion
 * 
 * WHY: Motion quiets down in About section.
 * Key principles:
 * - Minimal background motion
 * - Content feels stable and resolved
 * - Stats animate with purpose
 * - No aggressive reveals
 */
import { useEffect, useRef, useState } from 'react';
import { Brain, Code2, Database, LineChart } from 'lucide-react';
import { useAnimation } from '../context/AnimationContext';

const stats = [
  { value: 1, suffix: '+', label: 'Years' },
  { value: 5, suffix: '+', label: 'Projects' },
  { value: '∞', suffix: '', label: 'Coffee' },
  { value: 99, suffix: '%', label: 'Satisfaction' },
];

const expertise = [
  { icon: Brain, title: 'Deep Learning', description: 'Neural networks, CNNs, RNNs, Transformers' },
  { icon: Code2, title: 'ML Systems', description: 'End-to-end pipelines, model deployment, scaling' },
  { icon: Database, title: 'Data Visualization', description: 'Matplotlib, Seaborn, Plotly, Power BI' },
  { icon: LineChart, title: 'MLOps', description: 'CI/CD, monitoring, production systems' },
];


function Counter({ value, suffix, isVisible }: { value: number | string; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return;

    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isVisible]);

  return <span>{count}{suffix}</span>;
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const { state } = useAnimation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Very subtle parallax
  const parallaxY = (state.sectionProgress - 0.5) * 15;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-32 lg:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/30 to-transparent" />

      <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
          {/* Content */}
          <div style={{ transform: `translateY(${parallaxY}px)` }}>
            {/* Section Label */}
            <div
              className={`flex items-center gap-4 mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
            >
              <div className="w-8 h-px bg-white/20" />
              <span className="text-xs text-white/40 font-light tracking-[0.3em] uppercase">
                About
              </span>
            </div>

            {/* Heading */}
            <h2
              className={`text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-8 leading-tight transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
            >
              Passionate about
              <span className="gradient-text block mt-2">intelligent systems</span>
            </h2>

            {/* Description */}
            <div
              className={`space-y-4 text-white/50 text-lg leading-relaxed mb-12 font-light transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
            >
              <p>
                I specialize in developing end-to-end machine learning solutions
                that solve real-world problems. From research to production, I bring
                ideas to life through code.
              </p>
              <p>
                With expertise in deep learning, computer vision, and NLP, I thrive
                on turning complex data into actionable insights.
              </p>
            </div>

            {/* Stats - minimal, intentional */}
            <div
              className={`grid grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-light text-white mb-1">
                    <Counter value={stat.value} suffix={stat.suffix} isVisible={isInView} />
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Expertise Grid */}
            <div
              className={`grid grid-cols-2 gap-4 transition-all duration-1000 delay-400 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
            >
              {expertise.map((item, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500"
                  style={{ transitionDelay: `${400 + index * 50}ms` }}
                >
                  <item.icon className="w-5 h-5 text-white/40 mb-3 group-hover:text-indigo-400/60 transition-colors" />
                  <h3 className="text-white/80 font-medium text-sm mb-1">{item.title}</h3>
                  <p className="text-white/30 text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual - minimal, calm */}
          <div
            className={`relative transition-all duration-1000 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            style={{ transform: `translateY(${-parallaxY * 0.3}px)` }}
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl" />

              {/* Neural network visualization - minimal */}
              <div className="relative h-full rounded-3xl border border-white/5 bg-white/[0.02] p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 mx-auto">
                    <Brain className="w-8 h-8 text-indigo-400/60" />
                  </div>
                  <h3 className="text-xl font-light text-white/80 mb-2">AI/ML Engineer</h3>
                  <p className="text-white/30 text-sm">
                    Building intelligent systems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
