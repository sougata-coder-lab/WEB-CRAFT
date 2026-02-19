import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Globe, Code2, Layers, ArrowRight, Star, Users, Wand2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import api from '../services/api';

const EXAMPLE_PROMPTS = [
  'A dark portfolio for a freelance photographer with gallery grid',
  'A modern SaaS landing page with pricing and features',
  'A restaurant website with menu, reservations, and contact',
  'A personal blog with dark theme and reading progress bar',
  'A fitness app landing page with workout plans and testimonials',
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const steps = [
    'Analyzing your prompt...',
    'Generating layout structure...',
    'Writing HTML & CSS...',
    'Adding interactivity...',
    'Finalizing your website...',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the website you want to build');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please sign in to generate websites');
      navigate('/signup');
      return;
    }

    setIsGenerating(true);
    let stepIdx = 0;
    setGenerationStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 1800);

    try {
      // Create project first
      const createRes = await api.post('/projects', {
        title: prompt.slice(0, 100),
        prompt: prompt.trim(),
      });
      const projectId = createRes.data.project._id;

      // Generate code
      await api.post(`/projects/${projectId}/generate`, {
        prompt: prompt.trim(),
      });

      clearInterval(stepInterval);
      toast.success('Website generated! Opening builder...');
      navigate(`/builder/${projectId}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      toast.error(err.response?.data?.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">AI-Powered Website Builder</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Build websites with{' '}
            <span className="gradient-text">AI magic</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Describe your dream website and watch AI build it in seconds. No coding required.
            Full HTML, CSS & JavaScript — ready to publish.
          </p>

          {/* Prompt Input */}
          <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className={`relative bg-gray-950 border rounded-2xl overflow-hidden transition-all ${isGenerating ? 'border-indigo-500 animate-pulse-glow' : 'border-white/10 hover:border-white/20'}`}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the website you want to build... (e.g. 'A dark portfolio for a freelance photographer with gallery grid and contact form')"
                rows={4}
                disabled={isGenerating}
                className="w-full bg-transparent text-white placeholder-gray-600 px-6 pt-5 pb-4 text-sm resize-none focus:outline-none"
              />

              {/* Example prompts */}
              <div className="px-6 pb-3 flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    disabled={isGenerating}
                    className="text-xs text-gray-500 hover:text-indigo-400 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 rounded-full px-3 py-1 transition-all"
                  >
                    {ex.slice(0, 35)}...
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <span className="text-gray-600 text-xs">Ctrl+Enter to generate</span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  {isGenerating ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full bounce-dot" />
                        <div className="w-1.5 h-1.5 bg-white rounded-full bounce-dot" />
                        <div className="w-1.5 h-1.5 bg-white rounded-full bounce-dot" />
                      </div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      Generate Website
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generation step */}
            {isGenerating && generationStep && (
              <div className="mt-4 text-center animate-fade-in">
                <p className="text-indigo-400 text-sm font-medium">{generationStep}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to build the web
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From idea to live website in seconds. No design skills or coding knowledge required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={24} className="text-indigo-400" />,
                title: 'AI-Powered Generation',
                desc: 'Describe your website in plain English and our AI generates complete, production-ready HTML, CSS & JavaScript.',
              },
              {
                icon: <Code2 size={24} className="text-indigo-400" />,
                title: 'Live Code Editor',
                desc: 'Edit the generated code directly in the browser with real-time preview. Tweak colors, text, and layout instantly.',
              },
              {
                icon: <Globe size={24} className="text-indigo-400" />,
                title: 'One-Click Publish',
                desc: 'Publish your website to the community gallery with a single click. Share your creations with the world.',
              },
              {
                icon: <Layers size={24} className="text-indigo-400" />,
                title: 'Version History',
                desc: 'Every AI generation creates a new version. Roll back to any previous version with one click.',
              },
              {
                icon: <Users size={24} className="text-indigo-400" />,
                title: 'Community Gallery',
                desc: 'Browse thousands of AI-generated websites for inspiration. See what others are building.',
              },
              {
                icon: <Star size={24} className="text-indigo-400" />,
                title: 'Device Preview',
                desc: 'Preview your website on mobile, tablet, and desktop. Ensure it looks perfect on every screen.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-950 border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 hover:bg-gray-900 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to build your website?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of creators building with AI. Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(isAuthenticated ? '/projects' : '/signup')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Start Building Free
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/community')}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              View Gallery
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm">WebCraft AI</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 WebCraft AI. Build the web with AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
