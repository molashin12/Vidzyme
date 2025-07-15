import React, { useState } from 'react';
import { Check, Crown, Zap, Star, CreditCard, Calendar } from 'lucide-react';

interface SubscriptionProps {
  onNavigate: (page: string) => void;
}

export default function Subscription({ onNavigate }: SubscriptionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState('pro');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out Vidzyme',
      price: { monthly: 0, yearly: 0 },
      features: [
        '3 videos per month',
        '3 minutes of voiceover',
        'Basic templates',
        'Watermark included',
        'Community support'
      ],
      limitations: [
        'Limited to 30 seconds per video',
        'No priority processing',
        'No custom branding'
      ],
      icon: Star,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Great for content creators',
      price: { monthly: 29, yearly: 290 },
      features: [
        '30 videos per month',
        '30 minutes of voiceover',
        'Premium templates',
        'No watermark',
        'Social media scheduling',
        'Priority processing',
        'Email support'
      ],
      limitations: [],
      icon: Zap,
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For agencies and businesses',
      price: { monthly: 99, yearly: 990 },
      features: [
        '100 videos per month',
        '120 minutes of voiceover',
        'Custom templates',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom branding',
        'Team collaboration'
      ],
      limitations: [],
      icon: Crown,
      popular: false
    }
  ];

  const handlePlanChange = (planId: string) => {
    if (planId === 'free') {
      alert('Downgrading to free plan...');
    } else {
      alert(`Upgrading to ${planId} plan...`);
    }
  };

  const getCurrentPlanInfo = () => {
    return plans.find(plan => plan.id === currentPlan);
  };

  return (
    <div className="min-h-screen bg-[#0F1116] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
          <p className="text-gray-400">Choose the plan that fits your content creation needs</p>
        </div>

        {/* Current Plan Status */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Current Plan</h2>
              <p className="text-gray-400">Your subscription details</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#27AE60]">{getCurrentPlanInfo()?.name}</div>
              <div className="text-gray-400">
                {getCurrentPlanInfo()?.price.monthly === 0 ? 'Free' : `$${getCurrentPlanInfo()?.price.monthly}/month`}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Videos this month</span>
                <span className="text-white font-semibold">12 / 30</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div className="bg-[#27AE60] h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Voice minutes</span>
                <span className="text-white font-semibold">18 / 30</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div className="bg-[#27AE60] h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Next billing</span>
                <span className="text-white font-semibold">Jan 15, 2025</span>
              </div>
              <div className="flex items-center text-gray-400 mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">Auto-renewal enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[#27AE60] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#27AE60] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-800/50 rounded-xl p-6 border relative ${
                plan.popular ? 'border-[#27AE60]' : 'border-gray-700'
              } ${currentPlan === plan.id ? 'ring-2 ring-[#27AE60]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#27AE60] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#27AE60]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="w-6 h-6 text-[#27AE60]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="text-3xl font-bold">
                  ${plan.price[billingCycle]}
                  <span className="text-base text-gray-400 font-normal">
                    {plan.price[billingCycle] === 0 ? '' : `/${billingCycle === 'monthly' ? 'month' : 'year'}`}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="text-sm text-[#27AE60] mt-1">
                    Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-[#27AE60] mr-3" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={currentPlan === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-[#27AE60] text-white hover:bg-[#229954]'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : 
                 plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-[#27AE60]" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-gray-400 text-sm">Expires 12/25</p>
                </div>
              </div>
              <button className="text-[#27AE60] hover:text-[#229954] transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Billing History</h3>
          <div className="space-y-3">
            {[
              { date: 'Dec 15, 2024', amount: '$29.00', status: 'Paid', plan: 'Pro Monthly' },
              { date: 'Nov 15, 2024', amount: '$29.00', status: 'Paid', plan: 'Pro Monthly' },
              { date: 'Oct 15, 2024', amount: '$29.00', status: 'Paid', plan: 'Pro Monthly' },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[#27AE60]/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#27AE60]" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.plan}</p>
                    <p className="text-gray-400 text-sm">{invoice.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{invoice.amount}</p>
                  <p className="text-green-400 text-sm">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}