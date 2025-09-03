import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Head of Customer Support',
    company: 'TechFlow Inc.',
    content: 'Zeta Zenith has completely transformed our support operations. The AI classification is incredibly accurate, and the real-time alerts help us catch issues before they escalate.',
    rating: 5,
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Support Manager',
    company: 'CloudScale Solutions',
    content: 'The sentiment analysis feature is a game-changer. We can now prioritize tickets based on customer emotions, leading to much faster resolution times.',
    rating: 5,
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Customer Success Director',
    company: 'DataViz Pro',
    content: 'The dashboard gives us insights we never had before. We\'ve reduced our average response time by 60% and improved customer satisfaction scores significantly.',
    rating: 5,
    avatar: 'ER',
  },
];

const stats = [
  { number: '500+', label: 'Companies Trust Us' },
  { number: '95%', label: 'Accuracy Rate' },
  { number: '3x', label: 'Faster Response Times' },
  { number: '24/7', label: 'Real-time Monitoring' },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Support Teams Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how leading companies are transforming their customer support with AI-powered insights.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Support?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies that have already improved their customer support 
              with AI-powered insights and real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#get-started"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Start Free Trial
              </a>
              <a
                href="#demo"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


