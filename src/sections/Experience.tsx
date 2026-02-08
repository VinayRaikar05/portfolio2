/**
 * Experience Section - Calm timeline with intentional reveals
 * 
 * WHY: Experience should feel stable and credible.
 * Key principles:
 * - Timeline is clear and readable
 * - Entries reveal with purpose
 * - No aggressive animations
 * - Content hierarchy is strong
 */
import { useEffect, useRef, useState } from 'react';

const experiences = [
  {
    title: 'AI/ML Intern',
    company: 'Visvesvaraya Research and Innovation Foundation',
    period: '2025 — Present',
    description: 'Completed a "hands-on internship" focusing on machine learning model development, data preprocessing, and real-world AI applications, strengthening my practical understanding of AI/ML workflows.',
    highlights: ['Developed ML models', 'Optimized data pipelines'],
  },

];

const education = [
  {
    degree: 'Bachelor of Engineering',
    school: 'S G Balekundri Institute of Technology',
    period: '2022 - 2026',
    detail: 'Specialization in Computer Science and Engineering',
  },
  {
    degree: 'Pre University',
    school: 'Govindram Seksaria Science College',
    period: '2020 — 2022',
    detail: 'Physics Chemistry Mathematics',
  },
];

const certifications = [
  'AI & Data Science By IIT INDORE',
  'Postman API Student Expert',
  'Oracle Certified Data Science professional 2025',
];

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-32 lg:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/20 to-transparent" />

      <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-4 mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <div className="w-8 h-px bg-white/20" />
            <span className="text-xs text-white/40 font-light tracking-[0.3em] uppercase">
              Experience
            </span>
            <div className="w-8 h-px bg-white/20" />
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            Career <span className="gradient-text">Journey</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Work Experience */}
          <div>
            <h3
              className={`text-xs text-white/30 uppercase tracking-wider mb-8 transition-all duration-1000 ${isInView ? 'opacity-100' : 'opacity-0'
                }`}
            >
              Work Experience
            </h3>

            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <div
                  key={exp.title}
                  className={`relative pl-6 border-l border-white/10 transition-all duration-700 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Dot */}
                  <div className="absolute left-0 top-0 w-2 h-2 -translate-x-[5px] rounded-full bg-white/20" />

                  {/* Content */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h4 className="text-white/80 font-medium">{exp.title}</h4>
                    <span className="text-white/30 text-sm">{exp.period}</span>
                  </div>

                  <p className="text-white/50 text-sm mb-2">{exp.company}</p>
                  <p className="text-white/40 text-sm leading-relaxed mb-3">{exp.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {exp.highlights.map((highlight) => (
                      <span key={highlight} className="text-[10px] text-white/30 bg-white/[0.03] px-2 py-1 rounded">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Certs */}
          <div>
            <h3
              className={`text-xs text-white/30 uppercase tracking-wider mb-8 transition-all duration-1000 delay-300 ${isInView ? 'opacity-100' : 'opacity-0'
                }`}
            >
              Education
            </h3>

            <div className="space-y-6 mb-12">
              {education.map((edu, index) => (
                <div
                  key={edu.degree}
                  className={`flex items-baseline justify-between transition-all duration-700 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div>
                    <h4 className="text-white/70 font-medium">{edu.degree}</h4>
                    <p className="text-white/40 text-sm">{edu.school}</p>
                    <p className="text-white/30 text-xs">{edu.detail}</p>
                  </div>
                  <span className="text-white/30 text-sm">{edu.period}</span>
                </div>
              ))}
            </div>

            <h3
              className={`text-xs text-white/30 uppercase tracking-wider mb-6 transition-all duration-1000 delay-500 ${isInView ? 'opacity-100' : 'opacity-0'
                }`}
            >
              Certifications
            </h3>

            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-white/50 text-xs transition-all duration-500 ${isInView ? 'opacity-100' : 'opacity-0'
                    }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
