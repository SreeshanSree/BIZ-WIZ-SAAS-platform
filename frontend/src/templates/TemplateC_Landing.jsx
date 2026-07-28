import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Mail } from 'lucide-react';

export default function TemplateC_Landing({ data, isPreview = false }) {
  const { 
    businessName, heroHeadline, aboutText, primaryColor, backgroundImageUrl, supportEmail, location, items = [],
    fontFamily = 'sans', buttonShape = 'rounded', colorMode = 'dark'
  } = data;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  // Extract a darker variant of the primary color for gradients
  const darkPrimary = `${primaryColor}cc`;
  
  const btnClass = buttonShape === 'pill' ? 'rounded-full' : buttonShape === 'square' ? 'rounded-none' : 'rounded-xl';
  const isLight = colorMode === 'light';
  const themeBg = isLight ? 'bg-slate-50' : 'bg-[#050505]';
  const themeText = isLight ? 'text-slate-800' : 'text-slate-300';
  const themeNav = isLight ? 'text-slate-900 border-slate-300 hover:bg-slate-200 bg-white/50 backdrop-blur-md' : 'text-white border-white/20 hover:bg-white/10 bg-black/20 backdrop-blur-md';
  
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-600' : 'text-slate-400';
  const cardBg = isLight ? 'bg-white border border-slate-200 shadow-xl' : 'bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl';
  const heroGradient = isLight ? 'bg-gradient-to-b from-white/90 via-white/50 to-slate-50' : 'bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]';
  const heroCard = isLight ? 'bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl' : 'bg-black/40 backdrop-blur-md border border-white/10';
  const gridSectionBg = isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0a0a0a] border-white/5';
  const itemCardBg = isLight ? 'bg-white border border-slate-200 hover:border-primary-500 hover:shadow-lg' : 'bg-white/5 border border-white/10 hover:bg-white/10';
  const inputBg = isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500' : 'bg-white/5 border-white/20 text-white placeholder-slate-500 focus:border-white/40';
  const footerText = isLight ? 'text-slate-600' : 'text-white/80';
  const footerBorder = isLight ? 'border-slate-200' : 'border-white/5';

  return (
    <div className={`min-h-screen ${themeBg} ${themeText} font-${fontFamily} selection:bg-black/10`}>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center mix-blend-difference">
        <h1 className={`font-display font-black text-2xl tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>{businessName}</h1>
        <a 
          href="#waitlist" 
          className={`px-5 py-2 ${btnClass} font-semibold text-sm border transition-colors ${themeNav}`}
        >
          Join Waitlist
        </a>
      </nav>

      {/* Massive Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-12 pt-24 overflow-hidden">
        {backgroundImageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${backgroundImageUrl})`, filter: isLight ? 'grayscale(20%) opacity(40%)' : 'grayscale(50%) contrast(1.2)' }}
          />
        )}
        <div className={`absolute inset-0 ${heroGradient}`}></div>
        
        {/* Dramatic background glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse-soft"
          style={{ backgroundColor: primaryColor }}
        />
        
        <div className={`relative z-10 max-w-5xl mx-auto text-center mt-12 rounded-[3rem] p-8 md:p-16 ${heroCard}`}>
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white/5 border-white/10 text-white'}`}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            Coming Soon
          </div>
          
          <h1 className={`font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter mb-8 ${headingText}`}>
            {heroHeadline || 'The Future is Here.'}
          </h1>
          
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 font-light ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {aboutText}
          </p>
          
          <a 
            href="#waitlist" 
            className={`inline-flex items-center gap-3 px-8 py-4 ${btnClass} text-white font-bold text-lg hover:scale-105 transition-transform shadow-xl`}
            style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${darkPrimary})` }}
          >
            Get Early Access <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Showcase Grid */}
      {items.length > 0 && (
        <section className={`py-32 px-6 md:px-12 border-t relative z-10 ${gridSectionBg}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className={`font-display text-3xl md:text-5xl font-bold mb-16 text-center ${headingText}`}>What to Expect</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, i) => (
                <div 
                  key={item._id} 
                  className={`group rounded-3xl p-8 transition-all duration-300 relative overflow-hidden ${itemCardBg}`}
                >
                  <div 
                    className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ backgroundColor: primaryColor }} 
                  />
                  <div className={`text-5xl mb-6 font-black transition-opacity ${isLight ? 'opacity-10 group-hover:opacity-100' : 'opacity-20 group-hover:opacity-100'}`} style={{ color: primaryColor }}>
                    0{i + 1}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${headingText}`}>{item.title}</h3>
                  <p className={`leading-relaxed mb-6 flex-1 ${subText}`}>
                    {item.description}
                  </p>
                  <div className={`text-xl font-bold whitespace-nowrap ${headingText}`}>
                    ₹{item.price}{item.priceUnit ? <span className="text-sm font-normal opacity-60 ml-1">{item.priceUnit}</span> : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Email Capture / Waitlist */}
      <section id="waitlist" className="py-32 px-6 relative overflow-hidden flex items-center justify-center">
        {/* Decorative corner glows */}
        <div className="absolute bottom-0 left-0 w-96 h-96 blur-[100px] opacity-10" style={{ backgroundColor: primaryColor }} />
        <div className="absolute top-0 right-0 w-96 h-96 blur-[100px] opacity-10" style={{ backgroundColor: primaryColor }} />

        <div className={`relative z-10 w-full max-w-2xl text-center rounded-[3rem] p-10 md:p-16 ${cardBg}`}>
          <Mail size={48} className="mx-auto mb-6 opacity-80" style={{ color: primaryColor }} />
          <h2 className={`font-display text-4xl md:text-5xl font-bold mb-4 ${headingText}`}>Join the Revolution</h2>
          <p className={`mb-10 text-lg ${subText}`}>Subscribe to get notified the moment we launch.</p>
          
          {status === 'success' ? (
            <div className={`rounded-2xl p-6 flex flex-col items-center animate-fade-in ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/10 border border-white/20'}`}>
              <CheckCircle2 size={32} className="mb-3" style={{ color: primaryColor }} />
              <h3 className={`text-xl font-bold ${headingText}`}>You're on the list!</h3>
              <p className={`text-sm mt-1 ${subText}`}>Keep an eye on your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                className={`flex-1 border rounded-full px-6 py-4 focus:outline-none transition-colors ${inputBg}`}
              />
              <button 
                type="submit" 
                disabled={status === 'loading' || isPreview}
                className={`px-8 py-4 ${btnClass} font-bold text-white flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100`}
                style={{ backgroundColor: primaryColor }}
              >
                {status === 'loading' ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Subscribe <ChevronRight size={18} /></>
                )}
              </button>
            </form>
          )}
          <p className={`text-xs mt-6 ${subText}`}>No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t relative z-10 ${footerBorder}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className={`font-display font-black text-xl mb-2 ${footerText}`}>{businessName}</div>
            <div className={`text-sm ${subText}`}>© {new Date().getFullYear()} All rights reserved. Powered by BizWiz.</div>
          </div>
          
          <div className={`flex gap-6 text-sm ${subText}`}>
            {supportEmail && <span>{supportEmail}</span>}
            {location && <span>{location}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
