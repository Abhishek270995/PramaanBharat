import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Lock, 
  CreditCard, 
  Smartphone, 
  ArrowRight,
  BadgeCheck,
  Flame,
  Clock,
  Volume2
} from 'lucide-react';
import { UserSubscription, activateProSubscription, cancelProSubscription } from '../utils/subscriptionUtils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSubscriptionChanged: (sub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSubscriptionChanged
}) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'weekly' as const,
      name: 'Weekly Pass',
      priceINR: '₹29',
      periodINR: '/ week',
      priceUSD: '$0.79',
      periodUSD: '/ week',
      badge: 'Quick Trial',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'Ideal for short-term travel or weekend research.',
      features: [
        'Unlimited AI Fact-Check Summaries',
        'District & State Safety Dossiers',
        'Audio Voice Reading (Text-to-Speech)',
        '7-Day Instant Access'
      ]
    },
    {
      id: 'monthly' as const,
      name: 'Pramaan Pro Monthly',
      priceINR: '₹99',
      periodINR: '/ month',
      priceUSD: '$1.99',
      periodUSD: '/ month',
      badge: 'Most Popular ⭐',
      badgeColor: 'bg-blue-600 text-white shadow-md shadow-blue-500/20',
      isPopular: true,
      description: 'The standard choice for informed citizens & daily commuters.',
      features: [
        'Unlimited Real-time AI News Generation',
        'Unlimited Gemini Fact-Check & Verification',
        'Unlimited Neighborhood Safety Advisories',
        'Instant Text-to-Speech News Audio',
        'Verified Pro Badge & Fast-Track Processing',
        'Cancel anytime with 1-click'
      ]
    },
    {
      id: 'annual' as const,
      name: 'Champion Annual',
      priceINR: '₹999',
      periodINR: '/ year',
      priceUSD: '$14.99',
      periodUSD: '/ year',
      badge: 'Best Value (Save 20%) 🔥',
      badgeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20',
      description: 'For power users, legal researchers, and civic leaders.',
      features: [
        'Everything in Pro Monthly',
        '2 Months Completely FREE',
        'Priority Police Telemetry & Solved Archives',
        'Export Crime Dossiers as PDF Reports',
        'Custom District Watchlist Alerts',
        'Dedicated Civic Intelligence Queue'
      ]
    }
  ];

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newSub = activateProSubscription(selectedPlan);
      onSubscriptionChanged(newSub);
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 2200);
    }, 1200);
  };

  const handleCancelSub = () => {
    if (confirm('Are you sure you want to cancel your Pro subscription and revert to the free 3 daily credits tier?')) {
      const canceled = cancelProSubscription();
      onSubscriptionChanged(canceled);
      onClose();
    }
  };

  return (
    <div 
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div 
        id="subscription-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in zoom-in-95 overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6 fill-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Pramaan Pro AI Subscription
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[11px] font-extrabold shadow-xs">
                  UNLIMITED AI
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Unlock real-time Gemini news analysis, local district safety dossiers, and instant text-to-speech.
              </p>
            </div>
          </div>

          <button
            id="close-subscription-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 z-10"
            title="Close subscription modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Current Status Bar if user is already Pro */}
          {subscription.isPro ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Your Subscription is Active!</h4>
                  <p className="text-xs text-emerald-700">
                    Plan: <span className="font-semibold">{subscription.tierName}</span> • Unlimited AI Quota Enabled
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelSub}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Cancel Subscription
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3 text-blue-900 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Free Quota Remaining Today: <strong>{subscription.aiCreditsRemaining} / {subscription.dailyAiQuota} AI requests</strong>
                </span>
              </div>
              <span className="font-semibold text-blue-700 text-[11px] bg-blue-100 px-2 py-0.5 rounded-md">
                Resets daily at 00:00 IST
              </span>
            </div>
          )}

          {/* Currency Toggle */}
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span>Choose Your Plan</span>
            </h4>

            <div className="flex items-center bg-slate-200 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₹ INR (India)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ USD (Global)
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const price = currency === 'INR' ? plan.priceINR : plan.priceUSD;
              const period = currency === 'INR' ? plan.periodINR : plan.periodUSD;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected 
                      ? 'border-blue-600 bg-white shadow-xl ring-2 ring-blue-500/20' 
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-sm">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h5 className="font-black text-base text-slate-900">{plan.name}</h5>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${plan.badgeColor}`}>
                        {plan.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-slate-100">
                      <span className="text-3xl font-black text-slate-950 tracking-tight">{price}</span>
                      <span className="text-xs font-semibold text-slate-500 ml-1">{period}</span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 text-xs text-slate-700 mb-4">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Select button indicator */}
                  <div className={`w-full py-2 rounded-xl text-xs font-bold text-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                    {isSelected ? 'Selected Plan' : 'Select Plan'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment & Security Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant Activation & Payment Method</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>UPI / GPay / PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>NetBanking / Wire</span>
              </button>
            </div>

            {/* Action CTA */}
            {paymentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-center text-sm flex items-center justify-center gap-2 animate-in zoom-in-95">
                <Check className="w-5 h-5" />
                <span>Payment Successful! Unlimited AI Quota Activated.</span>
              </div>
            ) : (
              <button
                id="activate-subscription-btn"
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment & Activating Quota...</span>
                  </>
                ) : (
                  <>
                    <span>Activate {selectedPlan.toUpperCase()} ({currency === 'INR' ? plans.find(p => p.id === selectedPlan)?.priceINR : plans.find(p => p.id === selectedPlan)?.priceUSD})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span>🔒 256-bit Encrypted</span>
              <span>•</span>
              <span>⚡ Instant Access</span>
              <span>•</span>
              <span>🔄 Cancel Anytime</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
