import { 
  ChartBarIcon, 
  LightBulbIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Smart Ticket Classification',
    description: 'Automatically categorize support tickets using advanced AI algorithms with 95% accuracy.',
    icon: ChartBarIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Sentiment Analysis',
    description: 'Detect customer emotions and satisfaction levels in real-time to prioritize urgent issues.',
    icon: LightBulbIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Real-time Alerts',
    description: 'Get instant notifications for unusual spikes in ticket volume or sentiment changes.',
    icon: ExclamationTriangleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    name: 'Response Time Optimization',
    description: 'Identify bottlenecks and optimize your support team\'s response times automatically.',
    icon: ClockIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Advanced Analytics',
    description: 'Deep insights into ticket patterns, customer satisfaction trends, and team performance.',
    icon: EyeIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    name: 'Custom Integrations',
    description: 'Seamlessly integrate with your existing support tools and workflows.',
    icon: CogIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Support Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform your customer support from reactive to proactive, 
            with AI-powered insights that drive better outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-lg ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.name}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature highlight */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Real-time Dashboard with Live Insights
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Monitor your support performance in real-time with interactive charts, 
                automated alerts, and actionable recommendations that help you stay ahead of issues.
              </p>
              <ul className="space-y-3">
                {[
                  'Live ticket volume monitoring',
                  'Sentiment trend analysis',
                  'Automated priority scoring',
                  'Team performance metrics',
                  'Customer satisfaction tracking'
                ].map((item) => (
                  <li key={item} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Today's Tickets</span>
                  <span className="text-2xl font-bold text-gray-900">1,234</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Resolved</div>
                    <div className="font-semibold text-green-600">892</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Pending</div>
                    <div className="font-semibold text-orange-600">342</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


