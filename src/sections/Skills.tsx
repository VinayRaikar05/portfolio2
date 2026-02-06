/**
 * Skills Section - Calm tech stack display with intentional reveals
 * 
 * WHY: Skills should feel organized and confident.
 * Key principles:
 * - No 3D tilt effects
 * - Progress bars animate with purpose
 * - Hover effects are subtle
 * - Content hierarchy is clear
 */
import { useEffect, useRef, useState } from 'react';
import { Code2, Database, Cloud, Brain, Layers, BarChart3 } from 'lucide-react';

const skillCategories = [
  {
    name: 'Languages',
    icon: Code2,
    skills: [
      { name: 'Python', level: 95 },
      { name: 'SQL', level: 90 },
      { name: 'R', level: 80 },
      { name: 'JavaScript', level: 75 },
    ],
  },
  {
    name: 'Frameworks',
    icon: Brain,
    skills: [
      { name: 'PyTorch', level: 92 },
      { name: 'TensorFlow', level: 90 },
      { name: 'Scikit-learn', level: 95 },
      { name: 'Keras', level: 88 },
    ],
  },
  {
    name: 'Cloud & Infra',
    icon: Cloud,
    skills: [
      { name: 'AWS', level: 85 },
      { name: 'Docker', level: 82 },
      { name: 'Kubernetes', level: 75 },
      { name: 'GCP', level: 78 },
    ],
  },
  {
    name: 'Data',
    icon: Database,
    skills: [
      { name: 'Pandas', level: 95 },
      { name: 'NumPy', level: 92 },
      { name: 'Spark', level: 78 },
      { name: 'Kafka', level: 70 },
    ],
  },
  {
    name: 'Visualization',
    icon: BarChart3,
    skills: [
      { name: 'Matplotlib', level: 90 },
      { name: 'Plotly', level: 85 },
      { name: 'Tableau', level: 80 },
      { name: 'D3.js', level: 70 },
    ],
  },
  {
    name: 'MLOps',
    icon: Layers,
    skills: [
      { name: 'MLflow', level: 85 },
      { name: 'Airflow', level: 80 },
      { name: 'Git', level: 90 },
      { name: 'CI/CD', level: 82 },
    ],
  },
];

const tools = [
  'Jupyter', 'VS Code', 'GitHub', 'Docker', 'Weights & Biases', 
  'TensorBoard', 'Anaconda', 'DVC', 'Feast'
];

interface SkillCardProps {
  category: typeof skillCategories[0];
  index: number;
  isInView: boolean;
}

function SkillCard({ category, index, isInView }: SkillCardProps) {
  const [animatedLevels, setAnimatedLevels] = useState<number[]>([]);

  useEffect(() => {
    if (!isInView) return;
    
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    category.skills.forEach((skill, skillIndex) => {
      const timeout = setTimeout(() => {
        setAnimatedLevels((prev) => {
          const newLevels = [...prev];
          newLevels[skillIndex] = skill.level;
          return newLevels;
        });
      }, 200 + skillIndex * 80);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isInView, category.skills]);

  return (
    <div
      className={`relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:border-white/10 hover:bg-white/[0.03] transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className="mb-5">
        <category.icon className="w-5 h-5 text-white/40" />
      </div>

      {/* Title */}
      <h3 className="text-sm text-white/60 font-medium tracking-wide uppercase mb-5">
        {category.name}
      </h3>

      {/* Skills list */}
      <div className="space-y-3">
        {category.skills.map((skill, skillIndex) => (
          <div key={skillIndex}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/70 text-sm">{skill.name}</span>
              <span className="text-white/40 text-xs">{animatedLevels[skillIndex] || 0}%</span>
            </div>
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500/60 to-indigo-400/40 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${animatedLevels[skillIndex] || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-32 lg:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/20 to-transparent" />

      <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div 
            className={`flex items-center justify-center gap-4 mb-8 transition-all duration-1000 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-8 h-px bg-white/20" />
            <span className="text-xs text-white/40 font-light tracking-[0.3em] uppercase">
              Skills
            </span>
            <div className="w-8 h-px bg-white/20" />
          </div>

          <h2 
            className={`text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 transition-all duration-1000 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Technical <span className="gradient-text">Expertise</span>
          </h2>

          <p 
            className={`text-lg text-white/40 max-w-xl mx-auto font-light transition-all duration-1000 delay-200 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            A comprehensive toolkit built over years of delivering production-ready ML solutions
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-6xl mx-auto">
          {skillCategories.map((category, index) => (
            <SkillCard 
              key={category.name} 
              category={category} 
              index={index} 
              isInView={isInView}
            />
          ))}
        </div>

        {/* Tools */}
        <div 
          className={`text-center transition-all duration-1000 delay-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Tools & Platforms</p>
          <div className="flex flex-wrap justify-center gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-white/50 text-xs hover:border-white/10 hover:text-white/70 transition-all duration-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
