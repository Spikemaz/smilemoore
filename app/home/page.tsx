'use client';

import MailchimpSignup from '../components/MailchimpSignup';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <a href="/home">
                <h1 className="text-2xl font-bold" style={{ color: '#1f3a33' }}>Smile Moore</h1>
              </a>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="/home#services" className="text-gray-700 transition-colors hover:text-[#1f3a33]">Services</a>
              <a href="/home#about" className="text-gray-700 transition-colors hover:text-[#1f3a33]">About</a>
              <a href="/home#contact" className="text-gray-700 transition-colors hover:text-[#1f3a33]">Contact</a>
            </div>
            <a href="#book" className="text-white px-6 py-2 rounded-lg transition-colors" style={{ backgroundColor: '#1f3a33' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#70d490'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3a33'}>
              Book Appointment
            </a>
          </div>
        </nav>
      </header>

      {/* Early Bird Special Banner */}
      <section className="text-white py-8" style={{ background: 'linear-gradient(to right, #1f3a33, #70d490)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Early Bird Special Offer!</h2>
          <p className="text-xl">Book your appointment now and save</p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6" style={{ color: '#1f3a33' }}>
            Your Smile, Our Priority
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional dental care and cosmetic dentistry services to keep your smile healthy and beautiful
          </p>
          <div className="flex gap-4 justify-center">
            <a href="#book" className="text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors" style={{ backgroundColor: '#1f3a33' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#70d490'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3a33'}>
              Book Now
            </a>
            <a href="#services" className="px-8 py-3 rounded-lg text-lg font-semibold transition-colors" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#70d490'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#cfe8d7'}>
              Our Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#1f3a33' }}>Our Services</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all border-2" style={{ borderColor: '#cfe8d7' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#70d490'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cfe8d7'}>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#1f3a33' }}>General Dentistry</h4>
              <p className="text-gray-600">Comprehensive dental care including check-ups, cleanings, and preventive treatments</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all border-2" style={{ borderColor: '#cfe8d7' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#70d490'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cfe8d7'}>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#1f3a33' }}>Cosmetic Dentistry</h4>
              <p className="text-gray-600">Teeth whitening, veneers, and smile makeovers to enhance your appearance</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all border-2" style={{ borderColor: '#cfe8d7' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#70d490'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cfe8d7'}>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#1f3a33' }}>Emergency Care</h4>
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
              <h3 className="text-3xl font-bold mb-6" style={{ color: '#1f3a33' }}>About Smile Moore</h3>
              <p className="text-gray-600 mb-4">
                We are dedicated to providing exceptional dental care in a comfortable and welcoming environment.
                Our experienced team uses the latest technology and techniques to ensure the best outcomes for our patients.
              </p>
              <p className="text-gray-600">
                Whether you need routine care or advanced cosmetic procedures, we are committed to helping you achieve
                and maintain a healthy, beautiful smile.
              </p>
            </div>
            <div className="p-8 rounded-lg" style={{ backgroundColor: '#cfe8d7' }}>
              <h4 className="text-xl font-bold mb-4" style={{ color: '#1f3a33' }}>Why Choose Us?</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#70d490' }}>✓</span>
                  <span className="text-gray-700">Experienced and caring dental team</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#70d490' }}>✓</span>
                  <span className="text-gray-700">State-of-the-art equipment and technology</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#70d490' }}>✓</span>
                  <span className="text-gray-700">Flexible appointment scheduling</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#70d490' }}>✓</span>
                  <span className="text-gray-700">Comprehensive range of dental services</span>
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
      <section id="contact" className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#1f3a33' }}>Get In Touch</h3>
            <p className="text-gray-600">Have questions? We'd love to hear from you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="font-bold mb-2" style={{ color: '#1f3a33' }}>Phone</h4>
              <p className="text-gray-600">Available Soon</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold mb-2" style={{ color: '#1f3a33' }}>Email</h4>
              <p className="text-gray-600">info@smilemoore.co.uk</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold mb-2" style={{ color: '#1f3a33' }}>Address</h4>
              <p className="text-gray-600">Location Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#1f3a33' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Smile Moore Dental Practice</h3>
            <p className="mb-4" style={{ color: '#cfe8d7' }}>Professional dental care for the whole family</p>
            <p className="text-sm" style={{ color: '#cfe8d7', opacity: 0.8 }}>© 2025 Smile Moore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
