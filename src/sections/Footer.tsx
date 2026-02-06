/**
 * Footer - Minimal, calm ending
 */
export default function Footer() {
  return (
    <footer className="relative py-12 border-t border-white/5">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} AI/ML Engineer
          </p>
          <p className="text-white/20 text-xs">
            Built with React & Three.js
          </p>
        </div>
      </div>
    </footer>
  );
}
