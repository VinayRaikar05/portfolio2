/**
 * Certifications Section - Showcase credentials and learning
 */
import { useEffect, useRef, useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';

const certifications = [
    {
        name: 'Postman API Fundamentals Student Expert',
        issuer: 'Postman',
        date: '2025',
        link: '#', // Replace with actual verification link
        status: 'completed',
    },
    {
        name: 'AI & Data Science By IIT INDORE',
        issuer: 'IIT INDORE, Intellipaat',
        date: '2025-26',
        link: '#',
        status: 'in-progress',
    },
    {
        name: 'Oracle cloud Infrastructure 2025 Certified Data Science Professional ',
        issuer: 'Oracle',
        date: '2025',
        link: '#',
        status: 'completed',
    },
    {
        name: 'Oracle cloud Infrastructure 2025 Certified AI Foundations Associate',
        issuer: 'Oracle',
        date: '2025',
        link: '#',
        status: 'completed',
    },
];

const currentlyLearning = [
    'Large Language Models (LLMs)',
    'Reinforcement Learning',
    'MLOps Best Practices',
    'Edge AI Deployment',
];

export default function Certifications() {
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
            id="certifications"
            ref={sectionRef}
            className="relative py-32 lg:py-40 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/20 to-transparent" />

            <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Certifications */}
                        <div>
                            <div
                                className={`flex items-center gap-4 mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}
                            >
                                <div className="w-8 h-px bg-white/20" />
                                <span className="text-xs text-white/60 font-light tracking-[0.3em] uppercase">
                                    Certifications
                                </span>
                            </div>

                            <h2
                                className={`text-4xl sm:text-5xl font-light text-white mb-8 transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                Credentials & <span className="gradient-text">Achievements</span>
                            </h2>

                            <div className="space-y-4">
                                {certifications.map((cert, index) => (
                                    <a
                                        key={cert.name}
                                        href={cert.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                            }`}
                                        style={{ transitionDelay: `${200 + index * 100}ms` }}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-indigo-400/60" />
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="text-white/80 font-medium group-hover:text-white transition-colors">
                                                    {cert.name}
                                                </h3>
                                                {cert.status === 'in-progress' && (
                                                    <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-yellow-500/10 text-yellow-400/60 border border-yellow-500/20">
                                                        In Progress
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-white/60">
                                                <span>{cert.issuer}</span>
                                                <span>•</span>
                                                <span>{cert.date}</span>
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Currently Learning */}
                        <div>
                            <div
                                className={`flex items-center gap-4 mb-8 transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                                    }`}
                            >
                                <div className="w-8 h-px bg-white/20" />
                                <span className="text-xs text-white/60 font-light tracking-[0.3em] uppercase">
                                    Growth
                                </span>
                            </div>

                            <h2
                                className={`text-4xl sm:text-5xl font-light text-white mb-8 transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                Currently <span className="gradient-text">Learning</span>
                            </h2>

                            <p
                                className={`text-white/65 mb-8 leading-relaxed transition-all duration-1000 delay-400 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                Continuous learning is key to staying at the forefront of AI/ML. Here's what I'm currently exploring:
                            </p>

                            <div
                                className={`space-y-3 transition-all duration-1000 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                {currentlyLearning.map((topic, index) => (
                                    <div
                                        key={topic}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                                        style={{ transitionDelay: `${500 + index * 50}ms` }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-indigo-400/60" />
                                        <span className="text-white/70">{topic}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Fun Stats */}
                            <div
                                className={`mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 transition-all duration-1000 delay-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                <div className="text-white/65 text-sm mb-2">Learning Philosophy</div>
                                <p className="text-white/60 text-sm leading-relaxed italic">
                                    "The beautiful thing about learning is that no one can take it away from you."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

