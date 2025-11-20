'use client';

import { useState, useEffect } from 'react';

// Declare dataLayer for GTM
declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface VoucherStatus {
  totalSignups: number;
  currentTier: {
    min: number;
    max: number;
    value: number;
    message: string;
  };
  initialDisplay: number;
  batchInfo: {
    currentBatch: number;
    vouchersInBatch: number;
    shouldAnnounce: boolean;
    announcement: string | null;
  };
}

export default function LandingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
  });
  const [vouchersRemaining, setVouchersRemaining] = useState<number>(91);
  const [voucherValue, setVoucherValue] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorId, setVisitorId] = useState<string>('');
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);
  const [maxScrollDepth, setMaxScrollDepth] = useState<number>(0);
  const [pageLoadTimestamp] = useState<number>(Date.now());
  const [emailSubmitTime, setEmailSubmitTime] = useState<number>(0);
  const [nameSubmitTime, setNameSubmitTime] = useState<number>(0);
  const [phoneSubmitTime, setPhoneSubmitTime] = useState<number>(0);

  // Track visitor immediately on page load
  useEffect(() => {
    async function trackVisitor() {
      try {
        // Calculate page load time
        const loadTime = performance.now();
        setPageLoadTime(loadTime);

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);

        // Extract UTM parameters
        const utmSource = urlParams.get('utm_source') || '';
        const utmMedium = urlParams.get('utm_medium') || '';
        const utmCampaign = urlParams.get('utm_campaign') || '';
        const utmTerm = urlParams.get('utm_term') || '';
        const utmContent = urlParams.get('utm_content') || '';

        // Extract click IDs for ad platforms
        const fbclid = urlParams.get('fbclid') || '';
        const gclid = urlParams.get('gclid') || '';
        const msclkid = urlParams.get('msclkid') || ''; // Microsoft Ads
        const ttclid = urlParams.get('ttclid') || ''; // TikTok
        const li_fat_id = urlParams.get('li_fat_id') || ''; // LinkedIn

        // Detect device type
        const deviceType = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
          ? 'Mobile'
          : 'Desktop';

        // Detect operating system
        const userAgent = navigator.userAgent;
        let os = 'Unknown';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'MacOS';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('Linux')) os = 'Linux';

        // Detect browser
        let browser = 'Unknown';
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edg')) browser = 'Edge';

        // Get screen resolution
        const screenResolution = `${window.screen.width}x${window.screen.height}`;

        // Get language and timezone
        const language = navigator.language || 'unknown';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';

        // Get campaign source from URL path or UTM
        const campaignSource = window.location.pathname.slice(1) || utmSource || 'direct';

        // Get full landing page URL
        const landingPage = window.location.href;

        // Check if returning visitor
        const existingVisitorId = localStorage.getItem('smilemoore_visitor_id');
        const sessionCount = parseInt(localStorage.getItem('smilemoore_session_count') || '0') + 1;
        const isReturningVisitor = !!existingVisitorId;
        const firstVisitDate = localStorage.getItem('smilemoore_first_visit') || new Date().toISOString();

        // Store first visit date if new
        if (!existingVisitorId) {
          localStorage.setItem('smilemoore_first_visit', firstVisitDate);
        }
        localStorage.setItem('smilemoore_session_count', sessionCount.toString());

        // Get current date/time for analysis
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const hourOfDay = now.getHours();

        // Track the visit
        const response = await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignSource,
            deviceType,
            browser,
            userAgent,
            referrer: document.referrer || 'direct',
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
            os,
            screenResolution,
            language,
            timezone,
            landingPage,
            fbclid,
            gclid,
            msclkid,
            ttclid,
            li_fat_id,
            pageLoadTime: Math.round(loadTime),
            isReturningVisitor,
            sessionCount,
            firstVisitDate,
            dayOfWeek,
            hourOfDay,
          }),
        });

        const data = await response.json();
        if (data.visitorId) {
          setVisitorId(data.visitorId);
          // Store in sessionStorage to link later
          sessionStorage.setItem('visitorId', data.visitorId);
          // Store in localStorage for return visitor tracking
          localStorage.setItem('smilemoore_visitor_id', data.visitorId);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    }

    trackVisitor();
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      if (scrollPercentage > maxScrollDepth) {
        setMaxScrollDepth(scrollPercentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScrollDepth]);

  // Fetch initial voucher status
  useEffect(() => {
    async function fetchVoucherStatus() {
      try {
        const response = await fetch('/api/voucher-status');
        const data: VoucherStatus = await response.json();
        setVouchersRemaining(data.initialDisplay);
        setVoucherValue(data.currentTier.value);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching voucher status:', error);
        setIsLoading(false);
      }
    }
    fetchVoucherStatus();
  }, []);

  // No fake countdown - counter shows real database value

  const getProgress = () => {
    switch (step) {
      case 1: return 0;
      case 2: return 50;
      case 3: return 90;
      case 4: return 99;
      case 5: return 100;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (step === 1) {
        // Calculate time from page load to email submission (in seconds)
        const timeToSubmit = Math.round((Date.now() - pageLoadTimestamp) / 1000);
        const emailTime = Date.now();
        setEmailSubmitTime(emailTime);

        // Submit email immediately to Google Sheets
        const response = await fetch('/api/submit-voucher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: '',
            phone: '',
            address: '',
            campaignSource: 'direct',
            timeToSubmit,
            scrollDepth: maxScrollDepth,
          }),
        });

        if (!response.ok) {
          alert('Failed to submit. Please try again.');
          return;
        }

        // Track email submission
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'email_submitted',
          voucher_value: voucherValue
        });

        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (step === 2) {
        // Calculate time between email submit and name submit
        const nameTime = Date.now();
        const emailToName = Math.round((nameTime - emailSubmitTime) / 1000);
        setNameSubmitTime(nameTime);

        // Update name in Google Sheets
        await fetch('/api/update-voucher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            field: 'name',
            value: formData.name,
            campaignSource: 'direct',
            emailToName,
          }),
        });

        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (step === 3) {
        // Calculate time between name submit and phone submit
        const phoneTime = Date.now();
        const nameToPhone = Math.round((phoneTime - nameSubmitTime) / 1000);
        setPhoneSubmitTime(phoneTime);

        // Update phone in Google Sheets
        await fetch('/api/update-voucher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            field: 'phone',
            value: formData.phone,
            campaignSource: 'direct',
            nameToPhone,
          }),
        });

        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (step === 4) {
        // Calculate time between phone submit and postcode submit
        const postcodeTime = Date.now();
        const phoneToPostcode = Math.round((postcodeTime - phoneSubmitTime) / 1000);

        // Calculate total time from page load to completion
        const totalTime = Math.round((postcodeTime - pageLoadTimestamp) / 1000);

        // Update address in Google Sheets
        const response = await fetch('/api/update-voucher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            field: 'address',
            value: formData.address,
            campaignSource: 'direct',
            phoneToPostcode,
            totalTime,
          }),
        });

        if (response.ok) {
          // Track voucher claimed
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'voucher_claimed',
            voucher_value: voucherValue,
            currency: 'GBP'
          });

          setStep(5);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          alert('Failed to submit. Please try again.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Voucher Counter Header */}
      <div className="py-4 px-4 text-center font-bold" style={{ backgroundColor: '#70d490', color: '#1f3a33' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-lg md:text-xl">Be Quick Only {vouchersRemaining} £{voucherValue} Vouchers Remaining!</span>
        </div>
      </div>

      {/* Progress Bar - Only show after step 1 */}
      {step > 1 && step <= 4 && (
        <div className="shadow-sm sticky top-0 z-50" style={{ backgroundColor: '#1f3a33' }}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-end items-center mb-2">
              <span className="text-sm font-semibold" style={{ color: '#cfe8d7' }}>
                {getProgress()}% Complete
              </span>
            </div>
            <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'rgba(207, 232, 215, 0.3)' }}>
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%`, backgroundColor: '#cfe8d7' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Step 1: Email */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                ✓ LIMITED TIME OFFER
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1f3a33' }}>
              Claim Your <span style={{ color: '#1f3a33' }}>£{voucherValue} Voucher</span>
            </h1>
            <p className="text-xl mb-8" style={{ color: '#666' }}>
              New patient special - Valid for dental treatments
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <label htmlFor="email" className="block text-lg font-semibold mb-3" style={{ color: '#1f3a33' }}>
                  Enter your email to claim your voucher
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all placeholder-gray-500 text-center"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7' }}
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#1f3a33' }}
              >
                Submit
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                Great! Your voucher is reserved
              </h2>
              <p className="text-lg" style={{ color: '#666' }}>
                Let's personalize your voucher...
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="name" className="block text-lg font-semibold mb-3" style={{ color: '#1f3a33' }}>
                  What's your full name?
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7' }}
                  placeholder="John Smith"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#1f3a33' }}
              >
                Continue →
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Phone */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                Thanks, {formData.name}!
              </h2>
              <p className="text-lg" style={{ color: '#666' }}>
                We'll send your voucher via SMS and email
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="phone" className="block text-lg font-semibold mb-3" style={{ color: '#1f3a33' }}>
                  What's your phone number?
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7' }}
                  placeholder="07XXX XXXXXX"
                  autoFocus
                />
                <p className="text-sm mt-2" style={{ color: '#666' }}>
                  We'll text you the voucher code instantly
                </p>
              </div>

              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#1f3a33' }}
              >
                Almost There →
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Address (Final Required) */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                Final Question - You're One Step Away!
              </h2>
              <p className="text-lg mb-2" style={{ color: '#666' }}>
                Getting your £{voucherValue} voucher sent to you now...
              </p>
              <p className="text-md" style={{ color: '#666' }}>
                Where should we send your welcome pack?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="address" className="block text-lg font-semibold mb-3" style={{ color: '#1f3a33' }}>
                  Your postcode
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7' }}
                  placeholder="SW1A 1AA"
                  autoFocus
                />
                <p className="text-sm mt-2" style={{ color: '#666' }}>
                  We'll mail you a physical voucher card
                </p>
              </div>

              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg animate-pulse"
                style={{ backgroundColor: '#1f3a33' }}
              >
                🎉 Claim My £{voucherValue} Voucher Now!
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Success + Bonus Offer */}
        {step === 5 && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white" style={{ backgroundColor: '#1f3a33' }}>
              <div className="mb-6">
                <div className="inline-block rounded-full p-6 mb-4 animate-bounce" style={{ backgroundColor: '#cfe8d7' }}>
                  <span className="text-6xl">🎉</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Congratulations, {formData.name}!
                </h2>
                <p className="text-2xl mb-6">
                  Your £{voucherValue} voucher is confirmed!
                </p>
                <div className="rounded-xl p-6 inline-block" style={{ backgroundColor: 'rgba(207, 232, 215, 0.2)' }}>
                  <p className="text-lg mb-2">Check your phone for:</p>
                  <div className="text-3xl font-mono font-bold tracking-wider">
                    SMILE50
                  </div>
                </div>
              </div>
            </div>

            {/* Bonus Questionnaire */}
            <div className="rounded-2xl shadow-2xl p-8 md:p-12 text-center" style={{ backgroundColor: '#1f3a33', color: 'white' }}>
              <div className="mb-6">
                <span className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-4 animate-pulse" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                  ⭐ EXCLUSIVE BONUS OPPORTUNITY ⭐
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Win 1 Year of FREE Dentistry!
              </h3>
              <p className="text-xl mb-2">
                Worth over <span className="font-bold text-3xl" style={{ color: '#cfe8d7' }}>£2,000</span>
              </p>
              <p className="text-lg mb-8 opacity-90">
                You're already qualified! Just answer 4 quick questions to enter the draw
              </p>

              <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: 'rgba(207, 232, 215, 0.2)' }}>
                <div className="flex items-center justify-center gap-4 text-lg">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Takes 30 seconds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>No purchase needed</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(6)}
                className="w-full px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg mb-4"
                style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}
              >
                Yes! Enter Me in the Draw →
              </button>

              <button
                onClick={() => window.location.href = '/home'}
                className="text-white/80 hover:text-white underline text-sm"
              >
                No thanks, I'll skip this opportunity
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Bonus Questions (Placeholder) */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Bonus Questions Coming...
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              This will be your 4-question survey for the annual dentistry draw
            </p>
            <button
              onClick={() => window.location.href = '/home'}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700"
            >
              Continue to Website
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
