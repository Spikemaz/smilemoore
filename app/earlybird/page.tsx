import MailchimpSignup from '../components/MailchimpSignup';

export default function EarlyBird() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Smile Moore</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="/#services" className="text-gray-700 hover:text-blue-600">Services</a>
              <a href="/#about" className="text-gray-700 hover:text-blue-600">About</a>
              <a href="/#contact" className="text-gray-700 hover:text-blue-600">Contact</a>
            </div>
            <a href="#book" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Book Appointment
            </a>
          </div>
        </nav>
      </header>

      {/* Early Bird Special Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Early Bird Special Offer!</h2>
          <p className="text-xl">Book your appointment now and save</p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Smile, Our Priority
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional dental care and cosmetic dentistry services to keep your smile healthy and beautiful
          </p>
          <div className="flex gap-4 justify-center">
            <a href="#book" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Book Now
            </a>
            <a href="/#services" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors">
              Our Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Services</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-4">General Dentistry</h4>
              <p className="text-gray-600">Comprehensive dental care including check-ups, cleanings, and preventive treatments</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Cosmetic Dentistry</h4>
              <p className="text-gray-600">Teeth whitening, veneers, and smile makeovers to enhance your appearance</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Emergency Care</h4>
              <p className="text-gray-600">Prompt treatment for dental emergencies and urgent care needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">About Smile Moore</h3>
              <p className="text-gray-600 mb-4">
                We are dedicated to providing exceptional dental care in a comfortable and welcoming environment.
                Our experienced team uses the latest technology and techniques to ensure the best outcomes for our patients.
              </p>
              <p className="text-gray-600">
                Whether you need routine care or advanced cosmetic procedures, we are committed to helping you achieve
                and maintain a healthy, beautiful smile.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us?</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-600">Experienced and caring dental team</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-600">State-of-the-art equipment and technology</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-600">Flexible appointment scheduling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-600">Comprehensive range of dental services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <MailchimpSignup />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h3>
            <p className="text-gray-600">Have questions? We'd love to hear from you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="font-bold text-gray-900 mb-2">Phone</h4>
              <p className="text-gray-600">Available Soon</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-gray-900 mb-2">Email</h4>
              <p className="text-gray-600">info@smilemoore.co.uk</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-gray-900 mb-2">Address</h4>
              <p className="text-gray-600">Location Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Smile Moore Dental Practice</h3>
            <p className="text-gray-400 mb-4">Professional dental care for the whole family</p>
            <p className="text-sm text-gray-500">© 2025 Smile Moore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
