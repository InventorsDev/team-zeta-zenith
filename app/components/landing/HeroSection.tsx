import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Support Analytics
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Customer Support
            </span>
            with AI Intelligence
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automatically classify support tickets, detect customer sentiment, and get actionable insights 
            that help you prioritize and resolve issues faster than ever before.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="/onboarding"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
            
            <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
              <PlayIcon className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">Accuracy in Ticket Classification</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">3x</div>
              <div className="text-sm text-gray-600">Faster Response Times</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Real-time Monitoring</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">Support Analytics Dashboard</div>
              </div>
              
              {/* Mock dashboard content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">1,234</div>
                  <div className="text-sm text-blue-700">Total Tickets</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">4.7/5</div>
                  <div className="text-sm text-green-700">Satisfaction Score</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">2.3h</div>
                  <div className="text-sm text-purple-700">Avg Response Time</div>
                </div>
              </div>
              
              <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-sm">Interactive Charts & Analytics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

