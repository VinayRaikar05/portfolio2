import { useRef, useState } from 'react';
import { Mail, Linkedin, Github, Instagram } from 'lucide-react';
import emailjs from '@emailjs/browser';

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/vinay-raikar-aa0b3a32b' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/VinayRaikar05' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/vinayraikar._?igsh=MThudDdrZ3UxMjUwcw==' }
];

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isInView, setIsInView] = useState(false);

  // Intersection observer
  const observeRef = (node: HTMLDivElement | null) => {
    if (!node || isInView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Using environment variables for security
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration missing. Check .env file.');
      }

      await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current,
        publicKey
      );

      setIsSubmitted(true);
      if (formRef.current) formRef.current.reset();

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError('Failed to send message. Please try again or email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-32 lg:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/30 to-void/50" />

      <div ref={observeRef} className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-4 mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <div className="w-8 h-px bg-white/20" />
            <span className="text-xs text-white/40 font-light tracking-[0.3em] uppercase">
              Contact
            </span>
            <div className="w-8 h-px bg-white/20" />
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            Let's <span className="gradient-text">Connect</span>
          </h2>

          <p
            className={`text-lg text-white/40 max-w-xl mx-auto font-light transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            Have a project in mind? I'd love to hear about it.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div
            className={`transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            <div className="space-y-6 mb-10">
              <a
                href="mailto:vinayraikar091@gmail.com"
                className="flex items-center gap-4 text-white/60 hover:text-white transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm">vinayraikar091@gmail.com</span>
              </a>
            </div>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/10 transition-all duration-300"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Availability */}
            <div className="mt-10 p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400/60" />
                <span className="text-white/70 text-sm">Available for work</span>
              </div>
              <p className="text-white/30 text-xs">
                Open to new opportunities and collaborations
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className={`transition-all duration-1000 delay-400 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  name="user_name" // EmailJS standard name
                  required
                  placeholder="Name"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-white placeholder-white/30 text-sm focus:border-indigo-500/30 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="user_email" // EmailJS standard email
                  required
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-white placeholder-white/30 text-sm focus:border-indigo-500/30 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="message" // EmailJS standard message
                  required
                  rows={4}
                  placeholder="Message"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-white placeholder-white/30 text-sm focus:border-indigo-500/30 focus:outline-none transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isSubmitted
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {isSubmitting ? 'Sending...' : isSubmitted ? 'Message Sent' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
