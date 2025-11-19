export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="bg-white py-4">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Smile Moore</h1>
            <a href="/home" className="text-sm text-gray-600 hover:text-blue-600">
              Learn More →
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section with Lead Capture */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Value Proposition */}
            <div>
              <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🎉 Early Bird Special Offer
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Get Your Perfect Smile Today
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Professional dental care with flexible appointments and payment plans
              </p>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Same-day appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Flexible payment plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  <span>Expert care</span>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Your Free Consultation</h3>
              <p className="text-gray-600 mb-6">Limited spots available - Reserve yours now!</p>

              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="07XXX XXXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                    Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>General Check-up</option>
                    <option>Cosmetic Dentistry</option>
                    <option>Teeth Whitening</option>
                    <option>Emergency Care</option>
                    <option>Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Book Free Consultation
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to our privacy policy
                </p>
              </form>

              {/* Or Call */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Or call us directly:</p>
                <a href="tel:+44XXXXXXXXXX" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                  Available Soon
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Smile Moore?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Team</h3>
              <p className="text-gray-600">Experienced dentists with years of expertise</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Appointments</h3>
              <p className="text-gray-600">Same-day and emergency slots available</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Payments</h3>
              <p className="text-gray-600">Payment plans to suit your budget</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Care</h3>
              <p className="text-gray-600">Latest technology and techniques</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">General Dentistry</h3>
              <p className="text-gray-600 mb-4">Check-ups, cleanings, fillings, and preventive care</p>
              <a href="/home#services" className="text-blue-600 font-semibold hover:text-blue-700">
                Learn more →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cosmetic Dentistry</h3>
              <p className="text-gray-600 mb-4">Whitening, veneers, and smile transformations</p>
              <a href="/home#services" className="text-blue-600 font-semibold hover:text-blue-700">
                Learn more →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Emergency Care</h3>
              <p className="text-gray-600 mb-4">Urgent dental care when you need it most</p>
              <a href="/home#services" className="text-blue-600 font-semibold hover:text-blue-700">
                Learn more →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Smile?
          </h2>
          <p className="text-xl mb-8">Book your free consultation today - Limited spots available!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book Now
            </a>
            <a
              href="/home"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-800 transition-colors border-2 border-white"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 mb-2">Smile Moore Dental Practice</p>
            <p className="text-sm text-gray-500">© 2025 Smile Moore. All rights reserved.</p>
            <a href="/home" className="text-sm text-gray-400 hover:text-white mt-2 inline-block">
              Full Website →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
