import { CheckIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'Perfect for small support teams getting started with AI analytics.',
    features: [
      'Up to 1,000 tickets/month',
      'Basic AI classification',
      'Sentiment analysis',
      'Real-time dashboard',
      'Email alerts',
      'Basic integrations',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'Ideal for growing teams that need advanced analytics and automation.',
    features: [
      'Up to 10,000 tickets/month',
      'Advanced AI classification',
      'Real-time sentiment analysis',
      'Custom alert rules',
      'Advanced integrations',
      'Priority support',
      'Custom dashboards',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with complex support operations.',
    features: [
      'Unlimited tickets',
      'Custom AI models',
      'Advanced analytics',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your team size and scale as you grow. 
            All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.popular 
                  ? 'ring-2 ring-blue-600 shadow-xl scale-105' 
                  : 'border border-gray-200 hover:shadow-lg transition-shadow duration-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-600">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What integrations are supported?
              </h4>
              <p className="text-gray-600">
                We support all major support platforms including Zendesk, Intercom, Freshdesk, and custom APIs.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h4>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade security with SOC 2 compliance and end-to-end encryption.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you offer custom solutions?
              </h4>
              <p className="text-gray-600">
                Yes, our Enterprise plan includes custom AI models and on-premise deployment options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


