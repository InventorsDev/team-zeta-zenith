import { 
  ArrowRightIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const steps = [
  {
    number: '01',
    title: 'Connect Your Support System',
    description: 'Integrate with your existing support tools like Zendesk, Intercom, or custom solutions.',
    icon: DocumentTextIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    number: '02',
    title: 'AI Analyzes Your Tickets',
    description: 'Our advanced AI automatically classifies tickets and analyzes customer sentiment.',
    icon: CpuChipIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    number: '03',
    title: 'Get Real-time Insights',
    description: 'Monitor trends, identify patterns, and receive alerts for unusual activity.',
    icon: ChartBarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    number: '04',
    title: 'Take Action',
    description: 'Use actionable insights to prioritize tickets and improve response times.',
    icon: BellIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes with our simple 4-step process that transforms 
            your support operations with AI intelligence.
          </p>
        </div>

        <div className="relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-orange-200 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="text-center">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-gray-200 mb-6 relative z-10">
                    <span className="text-2xl font-bold text-gray-900">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} rounded-lg mb-4`}>
                    <step.icon className={`h-6 w-6 ${step.color}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-8">
                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Integration showcase */}
        <div className="mt-20 bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h3>
            <p className="text-lg text-gray-600">
              Connect with your favorite support tools and start analyzing in minutes
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {[
              'Zendesk', 'Intercom', 'Freshdesk', 'Help Scout', 'Slack', 'Teams'
            ].map((tool) => (
              <div key={tool} className="text-center group">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-400 rounded"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{tool}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Don't see your tool? We can build custom integrations for your specific needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


