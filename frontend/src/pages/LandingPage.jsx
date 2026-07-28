import { Link } from 'react-router-dom';
import { Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Zap size={32} className="text-secondary-500 mb-4" />,
      title: 'Lightning Fast',
      description: 'Go from an idea to a live website in under 60 seconds. No technical skills required.'
    },
    {
      icon: <Sparkles size={32} className="text-accent-500 mb-4" />,
      title: 'AI-Powered Content',
      description: 'Our integrated Gemini AI writes compelling copy tailored specifically for your business niche.'
    },
    {
      icon: <ShieldCheck size={32} className="text-emerald-500 mb-4" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade infrastructure ensures your business site is always fast, secure, and online.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-primary-900">BizWiz</span>
        </div>
        <div>
          <Link to="/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="badge-blue mb-6">
            <Sparkles size={14} />
            <span>AI Website Builder</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-900 max-w-4xl tracking-tight mb-6">
            Launch Your Business Online in <span className="gradient-text">60 Seconds</span> with AI.
          </h1>
          <p className="text-lg md:text-xl text-primary-600 max-w-2xl mb-10 leading-relaxed">
            Stop worrying about hosting, design, and copywriting. Tell our AI about your business, and get a beautifully crafted, conversion-optimized website instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="btn-primary text-base px-8 py-4">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-4">
              Explore Features
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white border-t border-primary-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">Built for Local Businesses</h2>
              <p className="section-sub mx-auto">Everything you need to establish a professional online presence, without the usual headaches.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="card-flat hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 border border-primary-100">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                  <p className="text-primary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-primary-200 text-primary-500 text-sm">
        <p>&copy; {new Date().getFullYear()} BizWiz. All rights reserved.</p>
      </footer>
    </div>
  );
}
