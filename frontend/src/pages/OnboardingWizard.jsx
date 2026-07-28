import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LayoutTemplate, Settings2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import client from '../api/client';
import ThemeToggle from '../components/ThemeToggle';

const THEMES = [
  { id: 'ecommerce', label: 'E-Commerce / Retail', desc: 'Product grid, shopping cart, WhatsApp checkout' },
  { id: 'booking', label: 'Service & Booking', desc: 'Services list, pricing, appointment form' },
  { id: 'landing', label: 'Event Landing Page', desc: 'Bold hero, features list, email capture' },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    businessName: '',
    niche: '',
    themeType: 'ecommerce',
    primaryColor: '#3b82f6',
    supportEmail: '',
    location: '',
    backgroundImageUrl: '',
    heroHeadline: '',
    aboutText: '',
  });

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleNext = () => {
    if (step === 1 && (!form.businessName || !form.niche)) {
      setError('Please provide your business name and niche.');
      return;
    }
    setError('');
    
    if (step === 3) {
      // Step 3 -> 4 transition: trigger AI generation
      generateAiContent();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const generateAiContent = async () => {
    setIsLoading(true);
    setStep(4); // Move to AI Generation loading step
    try {
      const { data } = await client.post('/ai/generate', {
        businessName: form.businessName,
        niche: form.niche,
      });
      setForm((prev) => ({
        ...prev,
        heroHeadline: data.heroHeadline,
        aboutText: data.aboutText,
      }));
      setStep(5); // Move to Review step
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('AI generation failed. Please try again or provide details manually.');
      setStep(3); // Send back to details step on error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setError('');
    try {
      const slug = generateSlug(form.businessName);
      
      // Send all captured data
      await client.post('/tenant', {
        businessName: form.businessName,
        businessSlug: slug,
        themeType: form.themeType,
        primaryColor: form.primaryColor,
        supportEmail: form.supportEmail,
        location: form.location,
        backgroundImageUrl: form.backgroundImageUrl,
        heroHeadline: form.heroHeadline,
        aboutText: form.aboutText,
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish site. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-12 relative transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl animate-fade-in">
        
        {/* Progress Tracker */}
        <div className="mb-10 flex items-center justify-between px-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${step === num ? 'bg-secondary-500 text-white shadow-blue scale-110' 
                : step > num ? 'bg-emerald-500 text-white' 
                : 'bg-primary-100 text-primary-400'}`}>
                {step > num ? <CheckCircle2 size={18} /> : num}
              </div>
            </div>
          ))}
        </div>

        <div className="card p-8 bg-white dark:bg-slate-900 border border-primary-200 dark:border-slate-800">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-slide-up">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6 text-primary-900 dark:text-white">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg"><Settings2 size={24} className="dark:text-primary-400" /></div>
                <h2 className="text-2xl font-display font-bold">Business Details</h2>
              </div>
              <p className="text-primary-600 dark:text-slate-400 mb-8">Tell us what you do, and our AI will handle the rest.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="input-label">Business Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. John's Bakery"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Business Niche / Industry</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Vegan Pastries & Coffee"
                    value={form.niche}
                    onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleNext} className="btn-primary w-full sm:w-auto">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Theme */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6 text-primary-900 dark:text-white">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg"><LayoutTemplate size={24} className="dark:text-primary-400" /></div>
                <h2 className="text-2xl font-display font-bold">Choose a Theme</h2>
              </div>
              <p className="text-primary-600 dark:text-slate-400 mb-8">Select the layout that best fits your goals. You can change this later.</p>

              <div className="space-y-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setForm({ ...form, themeType: theme.id })}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4
                      ${form.themeType === theme.id 
                        ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30 shadow-sm' 
                        : 'border-primary-100 bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-primary-300 dark:hover:border-slate-700'}`}
                  >
                    <div className={`mt-0.5 rounded-full border-2 w-5 h-5 flex items-center justify-center flex-shrink-0
                      ${form.themeType === theme.id ? 'border-secondary-500' : 'border-primary-300'}`}>
                      {form.themeType === theme.id && <div className="w-2.5 h-2.5 bg-secondary-500 rounded-full" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-900 dark:text-white mb-1">{theme.label}</h3>
                      <p className="text-sm text-primary-600 dark:text-slate-400">{theme.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleBack} className="btn-secondary w-full sm:w-auto">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handleNext} className="btn-primary w-full sm:w-auto ml-auto">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Personalization & Details */}
          {step === 3 && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6 text-primary-900 dark:text-white">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg"><Sparkles size={24} className="dark:text-primary-400" /></div>
                <h2 className="text-2xl font-display font-bold">Personalize Your Site</h2>
              </div>
              <p className="text-primary-600 dark:text-slate-400 mb-8">Let's make it yours. Add your contact info and brand colors.</p>

              <div className="space-y-6">
                <div>
                  <label className="input-label">Theme Color</label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="color"
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer border border-primary-200 dark:border-slate-700 dark:bg-slate-800"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    />
                    <span className="text-sm font-mono text-primary-500 dark:text-slate-400">{form.primaryColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="input-label">Support Email <span className="text-primary-400 font-normal">(Optional)</span></label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="contact@yourbusiness.com"
                    value={form.supportEmail}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Store Location <span className="text-primary-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="123 Main St, City"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Background Image URL <span className="text-primary-400 font-normal">(Optional)</span></label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                    value={form.backgroundImageUrl}
                    onChange={(e) => setForm({ ...form, backgroundImageUrl: e.target.value })}
                  />
                  <p className="text-xs text-primary-400 mt-2">Provide a link to an image to use as your hero background.</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleBack} className="btn-secondary w-full sm:w-auto">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handleNext} className="btn-primary w-full sm:w-auto ml-auto">
                  Generate with AI <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Loading AI */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-accent-200 blur-xl rounded-full opacity-50 animate-pulse-soft" />
                <div className="w-20 h-20 bg-accent-100 border border-accent-200 rounded-2xl flex items-center justify-center relative z-10 shadow-lg">
                  <Sparkles size={36} className="text-accent-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-white mb-3">AI is writing your content...</h2>
              <p className="text-primary-500 dark:text-slate-400 max-w-sm mx-auto">
                Analyzing your niche ({form.niche}) and crafting the perfect hero headline and about section.
              </p>
            </div>
          )}

          {/* STEP 5: Review */}
          {step === 5 && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6 text-primary-900 dark:text-white">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg"><Sparkles size={24} className="text-accent-500" /></div>
                <h2 className="text-2xl font-display font-bold">Review & Publish</h2>
              </div>
              <p className="text-primary-600 dark:text-slate-400 mb-8">Here is what our AI created for you. Feel free to tweak it before publishing.</p>

              <div className="space-y-6">
                <div>
                  <label className="input-label">Hero Headline</label>
                  <input
                    type="text"
                    className="input-field font-semibold text-lg"
                    value={form.heroHeadline}
                    onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">About Us Text</label>
                  <textarea
                    rows={5}
                    className="input-field resize-none leading-relaxed"
                    value={form.aboutText}
                    onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={() => setStep(3)} className="btn-secondary w-full sm:w-auto" disabled={isLoading}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handlePublish} className="btn-primary w-full sm:w-auto ml-auto" disabled={isLoading}>
                  {isLoading ? <div className="spinner-sm mr-2" /> : null}
                  Publish Site
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
