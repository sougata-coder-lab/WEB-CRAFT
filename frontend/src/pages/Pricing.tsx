import { Check, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Unlimited AI generations',
      'Live preview & editor',
      'Device preview toggles',
      'Version history (5 versions)',
      'Download as HTML',
      'Community gallery access',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For serious creators',
    features: [
      'Everything in Free',
      'Unlimited version history',
      'Priority AI generation',
      'Custom domain publishing',
      'Advanced code editor',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared project workspace',
      'Team version control',
      'White-label exports',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">Simple Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose your plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 border transition-all animate-fade-in-up ${
                plan.highlighted
                  ? 'bg-indigo-600/10 border-indigo-500/40 shadow-2xl shadow-indigo-500/10'
                  : 'bg-gray-950 border-white/10 hover:border-white/20'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? 'bg-indigo-500/20' : 'bg-white/5'
                    }`}>
                      <Check size={12} className={plan.highlighted ? 'text-indigo-400' : 'text-gray-400'} />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(isAuthenticated ? '/projects' : '/signup')}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlighted
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                }`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {[
              {
                q: 'Is the free plan really free?',
                a: 'Yes! The free plan includes unlimited AI generations and all core features. No credit card required.',
              },
              {
                q: 'What AI model powers the generation?',
                a: 'We use state-of-the-art code generation models via OpenRouter, including Qwen 2.5 Coder and DeepSeek Coder.',
              },
              {
                q: 'Can I download my generated websites?',
                a: 'Yes! You can download any project as a single index.html file that works anywhere.',
              },
              {
                q: 'How many websites can I create?',
                a: 'Unlimited! Create as many projects as you want on any plan.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-950 border border-white/10 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
