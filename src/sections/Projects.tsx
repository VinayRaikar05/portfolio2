/**
 * Projects Section - Calm project showcase with subtle interactions
 * 
 * WHY: Projects should feel curated and premium.
 * Key principles:
 * - Hover changes shader state, not card transforms
 * - Selection feels like "zooming attention"
 * - No aggressive card animations
 * - Content is the focus
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const projects = [
  {
    title: 'Sentiment Analysis API',
    description: 'Production-ready REST API for real-time sentiment analysis using BERT transformers.',
    tags: ['Python', 'BERT', 'FastAPI', 'AWS'],
    link: '#',
  },
  {
    title: 'Computer Vision Platform',
    description: 'End-to-end platform for object detection and image segmentation with real-time processing.',
    tags: ['PyTorch', 'OpenCV', 'YOLO', 'Redis'],
    link: '#',
  },
  {
    title: 'Predictive Analytics Dashboard',
    description: 'Interactive dashboard for time-series forecasting and anomaly detection.',
    tags: ['React', 'D3.js', 'Python', 'PostgreSQL'],
    link: '#',
  },
  {
    title: 'NLP Document Processor',
    description: 'Intelligent document processing with OCR, NER, and automated summarization.',
    tags: ['spaCy', 'Tesseract', 'Transformers', 'MongoDB'],
    link: '#',
  },
  {
    title: 'Recommendation Engine',
    description: 'Scalable recommendation system handling millions of users with sub-100ms latency.',
    tags: ['TensorFlow', 'Spark', 'Elasticsearch', 'Kafka'],
    link: '#',
  },
  {
    title: 'MLOps Pipeline Framework',
    description: 'Complete MLOps solution with automated training, versioning, and deployment.',
    tags: ['Kubeflow', 'MLflow', 'Airflow', 'Prometheus'],
    link: '#',
  },
];

interface ProjectCardProps {
  project: typeof projects[0];
  index: number;
  isInView: boolean;
}

function ProjectCard({ project, index, isInView }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={project.link}
      className={`group block p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.03] transition-all duration-500 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-white/80 group-hover:text-white transition-colors duration-300">
          {project.title}
        </h3>
        <ArrowUpRight 
          className={`w-4 h-4 text-white/30 transition-all duration-300 ${
            isHovered ? 'text-indigo-400/60 translate-x-0.5 -translate-y-0.5' : ''
          }`} 
        />
      </div>

      {/* Description */}
      <p className="text-white/40 text-sm leading-relaxed mb-5 group-hover:text-white/50 transition-colors duration-300">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-[10px] uppercase tracking-wider rounded bg-white/[0.03] text-white/40 border border-white/5"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

export default function Projects() {
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
      id="projects"
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
              Projects
            </span>
            <div className="w-8 h-px bg-white/20" />
          </div>

          <h2 
            className={`text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 transition-all duration-1000 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Selected <span className="gradient-text">Works</span>
          </h2>

          <p 
            className={`text-lg text-white/40 max-w-xl mx-auto font-light transition-all duration-1000 delay-200 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            A collection of projects showcasing expertise in intelligent systems
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.title} 
              project={project} 
              index={index} 
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
