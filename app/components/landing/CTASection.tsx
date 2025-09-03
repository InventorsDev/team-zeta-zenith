import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

export function CTASection() {
  return (
    <section id="get-started" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Support?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of companies that have already improved their customer support 
            with AI-powered insights. Start your free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="/onboarding"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
            
            <a
              href="#demo"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Schedule Demo
            </a>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Credit Card Required
              </h3>
              <p className="text-blue-100 text-sm">
                Start your free trial instantly without any payment information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                14-Day Free Trial
              </h3>
              <p className="text-blue-100 text-sm">
                Full access to all features with no limitations during your trial.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Setup in Minutes
              </h3>
              <p className="text-blue-100 text-sm">
                Get up and running with our simple integration process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

