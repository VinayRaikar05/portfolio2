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
    title: 'Rural Care- AI-ready Telemedicine Platform',
    description: 'Engineered a scalable telemedicine platform enabling secure patient data workflows and real-time health record management.',
    tags: ['TypeScript', 'React', 'Node.js', 'Zod', 'Docker'],
    link: 'https://github.com/VinayRaikar05/Health_care.git',
    highlights: [
      'Structured ML-ready datasets with Zod schema validation, improving data quality and model training reliability by 30%',
      'Designed AI-powered symptom triage and multilingual interfaces to enhance accessibility for rural users',
    ],
    gradient: 'from-[#f12711] to-[#f5af19]',
  },
  {
    title: 'Radiology Discrepancy Checker',
    description: 'Developed an NLP-based clinical insight extraction system to identify discrepancies in radiology reports.',
    tags: ['Python', 'NLP', 'Embeddings', 'Groq LPU'],
    link: 'https://github.com/VinayRaikar05/radiology_discrepancy_checker.git',
    highlights: [
      'Enhanced discrepancy detection accuracy using structured text embeddings and custom scoring algorithms',
      'Integrated Groq LPU inference for high-speed medical text analysis, delivering real-time diagnostic feedback',
    ],
    gradient: 'from-[#00c6ff] to-[#0072ff]',
  },
  {
    title: 'Deepfake Detection and Prevention using AI',
    description: 'Designed and trained a deepfake detection pipeline achieving 95% accuracy on a custom face-swap dataset.',
    tags: ['Python', 'TensorFlow', 'Streamlit'],
    link: 'https://github.com/VinayRaikar05/Deepfake-detection-using-AI.git',
    highlights: [
      'Optimized inference via frame sampling, model pruning, and quantization for real-time performance',
      'Built an interactive Streamlit dashboard for deepfake analysis and model explainability visualization',
    ],
    gradient: 'from-[#43C6AC] to-[#191654]',
  },
  {
    title: 'Emotion driven AI Story Narration',
    description: 'Implemented multi-character detection with dynamic voice modulation for interactive storytelling.',
    tags: ['Python', 'LLMs', 'HuggingFace', 'FastAPI', 'React.js', 'TailwindCSS'],
    link: 'https://github.com/VinayRaikar05/emotion-driven-story-teller.git',
    highlights: [
      'Achieved over 87% accuracy in gender detection and integrated emotion detection using the j-hartmann model',
      'Enabled user-provided story inputs and fine-tuned audio output using Librosa and FFmpeg',
    ],
    gradient: 'from-[#FF6B6B] to-[#556270]',
  },
  {
    title: 'Receipt Vision',
    description: 'Automated receipt digitization and parsing system using OCR and Large Language Models.',
    tags: ['Python', 'Flask', 'Tesseract', 'Groq API'],
    link: 'https://receipt-vision.onrender.com',
    highlights: [
      'Implemented OCR extraction using Tesseract and AI parsing with Groq API for structured data',
      'Built a drag-and-drop web interface for easy receipt upload and JSON export',
    ],
    gradient: 'from-[#11998e] to-[#38ef7d]',
  },
];

interface ProjectCardProps {
  project: typeof projects[0];
  index: number;
  isInView: boolean;
}

function ProjectCard({ project, index, isInView }: ProjectCardProps) {


  return (
    <a
      href={project.link}
      className={`group relative flex flex-col h-full rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Image / Gradient Area */}
      <div className={`h-48 w-full bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-[10px] text-white font-medium uppercase tracking-wider flex items-center gap-1">
            View Project <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow p-6">
        <div className="mb-4">
          <h3 className="text-xl font-medium text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Highlights */}
        <div className="mb-6 flex-grow">
          <ul className="space-y-2">
            {project.highlights?.map((highlight, i) => (
              <li key={i} className="text-white/50 text-xs flex items-start gap-2 leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400/50 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-white/[0.03] text-white/40 border border-white/5 group-hover:border-white/10 group-hover:text-white/60 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
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
            className={`flex items-center justify-center gap-4 mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <div className="w-8 h-px bg-white/20" />
            <span className="text-xs text-white/40 font-light tracking-[0.3em] uppercase">
              Projects
            </span>
            <div className="w-8 h-px bg-white/20" />
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            Selected <span className="gradient-text">Works</span>
          </h2>

          <p
            className={`text-lg text-white/40 max-w-xl mx-auto font-light transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            A collection of projects showcasing expertise in intelligent systems
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
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
