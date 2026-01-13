'use client';

import { useState } from 'react';
import MailchimpSignup from '../components/MailchimpSignup';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/home" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1f3a33' }}>
                  <span className="text-white font-bold text-lg">SM</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: '#1f3a33' }}>Smile Moore</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-[#1f3a33] transition-colors font-medium">Services</a>
              <a href="#about" className="text-gray-700 hover:text-[#1f3a33] transition-colors font-medium">About</a>
              <a href="#location" className="text-gray-700 hover:text-[#1f3a33] transition-colors font-medium">Location</a>
              <a href="#contact" className="text-gray-700 hover:text-[#1f3a33] transition-colors font-medium">Contact</a>
            </div>

            {/* Phone & CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a href="tel:coming-soon" className="flex items-center gap-2 font-semibold" style={{ color: '#B8860B' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Coming Soon
              </a>
              <a
                href="#book"
                className="text-white px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: '#1f3a33' }}
              >
                Book Appointment
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="#1f3a33" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t" style={{ borderColor: '#cfe8d7' }}>
              <div className="flex flex-col space-y-3 pt-4">
                <a href="#services" className="text-gray-700 hover:text-[#1f3a33] font-medium py-2">Services</a>
                <a href="#about" className="text-gray-700 hover:text-[#1f3a33] font-medium py-2">About</a>
                <a href="#location" className="text-gray-700 hover:text-[#1f3a33] font-medium py-2">Location</a>
                <a href="#contact" className="text-gray-700 hover:text-[#1f3a33] font-medium py-2">Contact</a>
                <a
                  href="#book"
                  className="text-white px-6 py-3 rounded-lg font-semibold text-center mt-2"
                  style={{ backgroundColor: '#1f3a33' }}
                >
                  Book Appointment
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ backgroundColor: '#1f3a33', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ backgroundColor: '#B8860B', transform: 'translate(-30%, 30%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#B8860B' }} />
                <span className="text-sm font-semibold" style={{ color: '#B8860B' }}>Now Accepting New Patients</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#1f3a33' }}>
                Premium Private Dentistry For You & Your Family
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Experience personalised dental care with same-day availability, state-of-the-art technology, and a team dedicated to your comfort.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <a
                  href="#book"
                  className="text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#1f3a33' }}
                >
                  Book Consultation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#services"
                  className="px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 border-2 inline-flex items-center justify-center gap-2"
                  style={{ borderColor: '#1f3a33', color: '#1f3a33' }}
                >
                  View Our Services
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(184, 134, 11, 0.15)' }}>
                    <svg className="w-4 h-4" style={{ color: '#B8860B' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Same-Day Appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(184, 134, 11, 0.15)' }}>
                    <svg className="w-4 h-4" style={{ color: '#B8860B' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">5-Star Care</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(184, 134, 11, 0.15)' }}>
                    <svg className="w-4 h-4" style={{ color: '#B8860B' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Flexible Payments</span>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=800&fit=crop&q=80"
                    alt="Smiling patient at dental clinic"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-2xl" style={{ backgroundColor: '#B8860B', opacity: 0.2 }} />
                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full" style={{ backgroundColor: '#1f3a33', opacity: 0.1 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#B8860B' }}>Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4" style={{ color: '#1f3a33' }}>
              Experience the Smile Moore Difference
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine clinical excellence with genuine care to provide an exceptional dental experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Same-Day Appointments</h3>
              <p className="text-gray-600">
                Need urgent care? We offer same-day and next-day appointments to fit your schedule.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Modern Technology</h3>
              <p className="text-gray-600">
                State-of-the-art equipment and digital dentistry for precise, comfortable treatments.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Experienced Team</h3>
              <p className="text-gray-600">
                Our skilled dentists and hygienists bring years of expertise and genuine patient care.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Flexible Payments</h3>
              <p className="text-gray-600">
                Affordable care with interest-free payment plans and competitive pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-24" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#B8860B' }}>Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4" style={{ color: '#1f3a33' }}>
              Comprehensive Dental Care
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From routine check-ups to advanced cosmetic treatments, we offer a full range of dental services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 - General Dentistry */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#70d490] group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop&q=80"
                  alt="Dental checkup"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>General Dentistry</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive check-ups, cleanings, fillings, and preventive care to maintain your oral health.
                </p>
                <a href="#book" className="inline-flex items-center font-semibold transition-colors hover:gap-3 gap-2" style={{ color: '#B8860B' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service 2 - Cosmetic Dentistry */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#70d490] group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&h=300&fit=crop&q=80"
                  alt="Beautiful smile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Cosmetic Dentistry</h3>
                <p className="text-gray-600 mb-4">
                  Transform your smile with veneers, bonding, and complete smile makeovers tailored to you.
                </p>
                <a href="#book" className="inline-flex items-center font-semibold transition-colors hover:gap-3 gap-2" style={{ color: '#B8860B' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service 3 - Teeth Whitening */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#70d490] group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=400&h=300&fit=crop&q=80"
                  alt="Teeth whitening"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Teeth Whitening</h3>
                <p className="text-gray-600 mb-4">
                  Professional whitening treatments for a brighter, more confident smile in just one visit.
                </p>
                <a href="#book" className="inline-flex items-center font-semibold transition-colors hover:gap-3 gap-2" style={{ color: '#B8860B' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service 4 - Invisalign */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#70d490] group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=300&fit=crop&q=80"
                  alt="Clear aligners"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Invisalign</h3>
                <p className="text-gray-600 mb-4">
                  Straighten your teeth discreetly with clear aligners. Achieve the smile you've always wanted.
                </p>
                <a href="#book" className="inline-flex items-center font-semibold transition-colors hover:gap-3 gap-2" style={{ color: '#B8860B' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service 5 - Dental Implants */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#70d490] group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop&q=80"
                  alt="Dental implants"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Dental Implants</h3>
                <p className="text-gray-600 mb-4">
                  Permanent tooth replacement solutions that look, feel, and function like natural teeth.
                </p>
                <a href="#book" className="inline-flex items-center font-semibold transition-colors hover:gap-3 gap-2" style={{ color: '#B8860B' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service 6 - Emergency Care */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#70d490] group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop&q=80"
                  alt="Emergency dental care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1f3a33' }}>Emergency Care</h3>
                <p className="text-gray-600 mb-4">
                  Prompt treatment for dental emergencies. Same-day appointments available when you need us most.
                </p>
                <a href="#book" className="inline-flex items-center font-semibold transition-colors hover:gap-3 gap-2" style={{ color: '#B8860B' }}>
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #1f3a33 0%, #2d5246 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: 'rgba(184, 134, 11, 0.2)' }}>
                <span className="text-sm font-semibold" style={{ color: '#B8860B' }}>Limited Time Offer</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                New Patient Special
              </h2>
              <p className="text-lg" style={{ color: '#cfe8d7' }}>
                Comprehensive consultation, examination & treatment plan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <p className="text-sm" style={{ color: '#cfe8d7' }}>Usually</p>
                <p className="text-2xl font-bold text-white line-through opacity-60">£95</p>
              </div>
              <div className="text-center px-8 py-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-sm" style={{ color: '#B8860B' }}>Special Price</p>
                <p className="text-4xl font-bold text-white">£49</p>
              </div>
              <a
                href="#book"
                className="px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#B8860B', color: 'white' }}
              >
                Claim Offer
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credentials Section */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#B8860B' }}>Our Credentials</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4" style={{ color: '#1f3a33' }}>
              Trusted by Patients, Recognised by Experts
            </h2>
          </div>

          {/* Team & Practice Image Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Dental Team */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <img
                src="https://images.unsplash.com/photo-1629909615184-74f495363b67?w=400&h=500&fit=crop&q=80"
                alt="Professional dental team"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f3a33]/80 to-transparent flex items-end p-6">
                <div>
                  <h4 className="text-white font-bold text-lg">Expert Team</h4>
                  <p className="text-[#cfe8d7] text-sm">Qualified professionals dedicated to your care</p>
                </div>
              </div>
            </div>

            {/* Modern Practice */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=500&fit=crop&q=80"
                alt="Modern dental practice"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f3a33]/80 to-transparent flex items-end p-6">
                <div>
                  <h4 className="text-white font-bold text-lg">Modern Facilities</h4>
                  <p className="text-[#cfe8d7] text-sm">State-of-the-art equipment & technology</p>
                </div>
              </div>
            </div>

            {/* Happy Patient */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <img
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=500&fit=crop&q=80"
                alt="Happy patient with beautiful smile"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f3a33]/80 to-transparent flex items-end p-6">
                <div>
                  <h4 className="text-white font-bold text-lg">Beautiful Results</h4>
                  <p className="text-[#cfe8d7] text-sm">Transforming smiles, changing lives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials Placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-center p-6 rounded-xl" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#cfe8d7' }}>
                    <svg className="w-8 h-8" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">Certification {i}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Our Promise */}
          <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor: '#cfe8d7' }}>
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1f3a33' }}>Our Promise to You</h3>
              <p className="text-lg text-gray-700 mb-6">
                At Smile Moore, we believe everyone deserves access to exceptional dental care. We promise to treat you with respect, explain all options clearly, and never recommend unnecessary treatments. Your comfort and trust are our top priorities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white">
                  <svg className="w-5 h-5" style={{ color: '#70d490' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium" style={{ color: '#1f3a33' }}>No Hidden Fees</span>
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white">
                  <svg className="w-5 h-5" style={{ color: '#70d490' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium" style={{ color: '#1f3a33' }}>Transparent Pricing</span>
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white">
                  <svg className="w-5 h-5" style={{ color: '#70d490' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium" style={{ color: '#1f3a33' }}>Patient-First Care</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours Section */}
      <section id="location" className="py-20 lg:py-24" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#B8860B' }}>Find Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4" style={{ color: '#1f3a33' }}>
              Location & Opening Hours
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map Placeholder with Dental Practice Interior */}
            <div className="rounded-2xl overflow-hidden shadow-lg relative">
              <img
                src="https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&h=600&fit=crop&q=80"
                alt="Modern dental practice reception"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-[#1f3a33]/60 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-white mb-2">Location Coming Soon</p>
                  <p className="text-[#cfe8d7]">Interactive map will be available once our location is confirmed</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-8">
              {/* Address */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#cfe8d7' }}>
                    <svg className="w-6 h-6" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#1f3a33' }}>Our Address</h3>
                    <p className="text-gray-600">
                      Address Coming Soon<br />
                      Location to be announced
                    </p>
                    <a href="#" className="inline-flex items-center gap-2 mt-3 font-semibold transition-colors" style={{ color: '#B8860B' }}>
                      Get Directions
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#cfe8d7' }}>
                    <svg className="w-6 h-6" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-4" style={{ color: '#1f3a33' }}>Opening Hours</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium" style={{ color: '#1f3a33' }}>8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium" style={{ color: '#1f3a33' }}>9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium text-gray-400">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parking */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#cfe8d7' }}>
                    <svg className="w-6 h-6" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#1f3a33' }}>Facilities</h3>
                    <ul className="space-y-1 text-gray-600">
                      <li>Free on-site parking available</li>
                      <li>Wheelchair accessible</li>
                      <li>Public transport links nearby</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section id="book" className="py-20 lg:py-24" style={{ background: 'linear-gradient(135deg, #1f3a33 0%, #2d5246 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Smile?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#cfe8d7' }}>
            Book your consultation today and take the first step towards the smile you deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:coming-soon"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
              style={{ backgroundColor: 'white', color: '#1f3a33' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: '#B8860B', color: 'white' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Online
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#B8860B' }}>Get In Touch</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4" style={{ color: '#1f3a33' }}>
              Contact Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Phone */}
            <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1f3a33' }}>Phone</h3>
              <p className="text-gray-600">Coming Soon</p>
            </div>

            {/* Email */}
            <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1f3a33' }}>Email</h3>
              <a href="mailto:info@smilemoore.co.uk" className="transition-colors" style={{ color: '#B8860B' }}>
                info@smilemoore.co.uk
              </a>
            </div>

            {/* Address */}
            <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <svg className="w-7 h-7" style={{ color: '#1f3a33' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1f3a33' }}>Address</h3>
              <p className="text-gray-600">Location Coming Soon</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-xl mx-auto">
            <MailchimpSignup />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f3a33' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                  <span className="font-bold text-lg" style={{ color: '#1f3a33' }}>SM</span>
                </div>
                <span className="text-2xl font-bold text-white">Smile Moore</span>
              </div>
              <p className="mb-6" style={{ color: '#cfe8d7' }}>
                Premium private dentistry dedicated to creating beautiful, healthy smiles. Experience the difference of personalised dental care.
              </p>
              {/* Social Media Placeholders */}
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#services" className="transition-colors hover:text-white" style={{ color: '#cfe8d7' }}>Our Services</a></li>
                <li><a href="#about" className="transition-colors hover:text-white" style={{ color: '#cfe8d7' }}>About Us</a></li>
                <li><a href="#location" className="transition-colors hover:text-white" style={{ color: '#cfe8d7' }}>Location</a></li>
                <li><a href="#contact" className="transition-colors hover:text-white" style={{ color: '#cfe8d7' }}>Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="/terms" className="transition-colors hover:text-white" style={{ color: '#cfe8d7' }}>Terms & Conditions</a></li>
                <li><a href="/terms" className="transition-colors hover:text-white" style={{ color: '#cfe8d7' }}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-12 pt-8" style={{ borderColor: 'rgba(207, 232, 215, 0.2)' }}>
            <p className="text-center text-sm" style={{ color: 'rgba(207, 232, 215, 0.7)' }}>
              © {new Date().getFullYear()} Smile Moore Dental Practice. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
