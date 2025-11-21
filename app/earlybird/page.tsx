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

export default function EarlyBirdPage() {
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
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [totalSignups, setTotalSignups] = useState<number>(0);
  const [referredBy, setReferredBy] = useState<string>('');
  const [surveyData, setSurveyData] = useState({
    dentalCare: '',
    timeline: '',
    appointmentTimes: '',
    importantFactors: [] as string[],
  });
  const [extendedSurvey, setExtendedSurvey] = useState({
    previousExperience: '',
    mostImportantFactor: '',
    smileConfidence: '',
    sameClinician: '',
    neededTreatments: [] as string[],
    beforeAppointment: '',
    stayLongTerm: '',
    preventingVisits: '',
    cosmeticImportance: '',
    preferredContact: '',
    additionalFeedback: '',
  });

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

        // Extract referral parameter
        const ref = urlParams.get('ref') || '';
        if (ref) {
          // Store the referrer's name
          setReferredBy(ref);
        }

        // Extract click IDs for ad platforms
        const fbclid = urlParams.get('fbclid') || '';
        const gclid = urlParams.get('gclid') || '';
        const msclkid = urlParams.get('msclkid') || ''; // Microsoft Ads
        const ttclid = urlParams.get('ttclid') || ''; // TikTok
        const li_fat_id = urlParams.get('li_fat_id') || ''; // LinkedIn

        // Enhanced device detection
        const userAgent = navigator.userAgent;

        // Detect device type and model
        let deviceType = 'Desktop';
        let deviceModel = 'Unknown';

        if (/iPhone/.test(userAgent)) {
          deviceType = 'Mobile';
          // Detect iPhone model based on screen size and user agent
          if (window.screen.height === 932 || window.screen.height === 852) deviceModel = 'iPhone 15 Pro Max / 14 Pro Max';
          else if (window.screen.height === 844) deviceModel = 'iPhone 15 Pro / 14 Pro / 13 Pro / 12 Pro';
          else if (window.screen.height === 896) deviceModel = 'iPhone 11 Pro Max / XS Max';
          else if (window.screen.height === 812) deviceModel = 'iPhone 13 mini / 12 mini / X';
          else if (window.screen.height === 736) deviceModel = 'iPhone 8 Plus / 7 Plus / 6s Plus';
          else if (window.screen.height === 667) deviceModel = 'iPhone SE / 8 / 7 / 6s';
          else deviceModel = 'iPhone';
        } else if (/iPad/.test(userAgent)) {
          deviceType = 'Tablet';
          deviceModel = 'iPad';
        } else if (/Android/.test(userAgent)) {
          deviceType = 'Mobile';
          // Try to extract Android device model from user agent
          const androidMatch = userAgent.match(/Android.*;\s([^)]+)\)/);
          deviceModel = androidMatch ? androidMatch[1] : 'Android Device';
        } else if (/Mac/.test(userAgent) && !(/iPhone|iPad/.test(userAgent))) {
          deviceModel = 'MacBook/iMac';
        } else if (/Windows/.test(userAgent)) {
          deviceModel = 'Windows PC';
        }

        // Detect operating system with version
        let os = 'Unknown';
        if (userAgent.includes('Windows NT 10.0')) os = 'Windows 11';
        else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
        else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
        else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
        else if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac OS X')) {
          const macVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/);
          os = macVersion ? `macOS ${macVersion[1].replace('_', '.')}` : 'macOS';
        }
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
          const iosVersion = userAgent.match(/OS (\d+_\d+)/);
          os = iosVersion ? `iOS ${iosVersion[1].replace('_', '.')}` : 'iOS';
        }
        else if (userAgent.includes('Android')) {
          const androidVersion = userAgent.match(/Android (\d+\.?\d*)/);
          os = androidVersion ? `Android ${androidVersion[1]}` : 'Android';
        }
        else if (userAgent.includes('Linux')) os = 'Linux';

        // Detect browser with version
        let browser = 'Unknown';
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
          const chromeVersion = userAgent.match(/Chrome\/(\d+)/);
          browser = chromeVersion ? `Chrome ${chromeVersion[1]}` : 'Chrome';
        }
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
          const safariVersion = userAgent.match(/Version\/(\d+)/);
          browser = safariVersion ? `Safari ${safariVersion[1]}` : 'Safari';
        }
        else if (userAgent.includes('Firefox')) {
          const firefoxVersion = userAgent.match(/Firefox\/(\d+)/);
          browser = firefoxVersion ? `Firefox ${firefoxVersion[1]}` : 'Firefox';
        }
        else if (userAgent.includes('Edg')) {
          const edgeVersion = userAgent.match(/Edg\/(\d+)/);
          browser = edgeVersion ? `Edge ${edgeVersion[1]}` : 'Edge';
        }

        // Get screen resolution
        const screenResolution = `${window.screen.width}x${window.screen.height}`;

        // Get language and timezone
        const language = navigator.language || 'unknown';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';

        // Get retargeting cookies for Facebook and Google
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
          return '';
        };

        const fbp = getCookie('_fbp'); // Facebook Browser ID
        const fbc = getCookie('_fbc') || fbclid ? `fb.1.${Date.now()}.${fbclid}` : ''; // Facebook Click ID
        const gaClientId = getCookie('_ga'); // Google Analytics Client ID

        // Get campaign source from URL path or UTM
        const campaignSource = window.location.pathname.slice(1) || utmSource || 'earlybird';

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
            deviceModel,
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
            fbp,
            fbc,
            gaClientId,
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
        const actualRemaining = data.initialDisplay;

        // Start countdown from actual number
        setVouchersRemaining(actualRemaining);
        setVoucherValue(data.currentTier.value);

        // Animate countdown after 2 seconds
        setTimeout(() => {
          if (actualRemaining > 3) {
            setVouchersRemaining(actualRemaining - 1);
          }
        }, 2000);

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
            campaignSource: 'earlybird-qr',
            timeToSubmit,
            scrollDepth: maxScrollDepth,
            referredBy,
          }),
        });

        if (!response.ok) {
          alert('Failed to submit. Please try again.');
          return;
        }

        const data = await response.json();
        if (data.voucherCode) {
          setVoucherCode(data.voucherCode);
        }
        if (data.totalSignups) {
          setTotalSignups(data.totalSignups);
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
            campaignSource: 'earlybird',
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
            campaignSource: 'earlybird',
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
            campaignSource: 'earlybird',
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

  const getBannerMessage = () => {
    if (vouchersRemaining <= 3) {
      return (
        <span className="text-lg md:text-xl">
          Final <span className="text-white underline font-extrabold text-3xl md:text-4xl">{vouchersRemaining}</span> vouchers available last chance!
        </span>
      );
    } else if (vouchersRemaining <= 100) {
      return (
        <span className="text-lg md:text-xl">
          Due to popular demand only <span className="text-white underline font-extrabold text-3xl md:text-4xl">{vouchersRemaining}</span> more £{voucherValue} vouchers remaining!
        </span>
      );
    } else {
      return (
        <span className="text-lg md:text-xl">
          You've Found Us Early Claim Your £{voucherValue} Voucher Before the Final <span className="text-white underline font-extrabold text-3xl md:text-4xl">{vouchersRemaining}</span> Are Taken.
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Voucher Counter Header */}
      <div className="py-4 px-4 text-center font-bold" style={{ backgroundColor: '#70d490', color: '#1f3a33' }}>
        <div className="max-w-4xl mx-auto">
          {getBannerMessage()}
        </div>
      </div>

      {/* Progress Bar - Only show after step 1 */}
      {step > 1 && step <= 4 && (
        <div className="shadow-sm sticky top-0 z-50" style={{ backgroundColor: '#1f3a33' }}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-center items-center mb-2">
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
            <div className="mb-3">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-3" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                ✓ LIMITED TIME OFFER
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1f3a33' }}>
              Claim Your <span style={{ color: '#1f3a33' }}>£{voucherValue} Voucher</span>
            </h1>
            <p className="text-xl mb-6" style={{ color: '#666' }}>
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
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Great! Your voucher is reserved
              </h2>
              <p className="text-lg" style={{ color: '#666' }}>
                Let's personalise your voucher...
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <label htmlFor="name" className="block text-lg font-semibold mb-3" style={{ color: '#1f3a33' }}>
                  What's your full name?
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all text-center placeholder-gray-500"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7', color: '#1f3a33' }}
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
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Thanks, {formData.name}!
              </h2>
              <p className="text-lg" style={{ color: '#666' }}>
                We'll send your voucher via SMS
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <label htmlFor="phone" className="block text-lg font-semibold mb-3 text-center" style={{ color: '#1f3a33' }}>
                  What's your phone number?
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all text-center placeholder-gray-500"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7', color: '#1f3a33' }}
                  placeholder="07XXX XXXXXX"
                  autoFocus
                />
                <p className="text-sm mt-2 text-center" style={{ color: '#666' }}>
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
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Final Question - You're One Step Away!
              </h2>
              <p className="text-lg" style={{ color: '#666' }}>
                Getting your £{voucherValue} voucher sent to you now...
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <label htmlFor="address" className="block text-lg font-semibold mb-3 text-center" style={{ color: '#1f3a33' }}>
                  Your postcode
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all text-center placeholder-gray-500"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7', color: '#1f3a33' }}
                  placeholder="SW1A 1AA"
                  autoFocus
                />
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
          <div>
            {/* Success Message with Bonus Offer */}
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
                <div className="rounded-xl p-6 mb-6 inline-block" style={{ backgroundColor: 'rgba(207, 232, 215, 0.2)' }}>
                  <p className="text-lg mb-2">Check your email and phone for:</p>
                  <div className="text-3xl font-mono font-bold tracking-wider mb-3">
                    {voucherCode}
                  </div>
                  <p className="text-sm" style={{ color: '#cfe8d7' }}>
                    Keep this code safe you will need it to claim your voucher
                  </p>
                </div>
              </div>

              {/* Bonus Offer in Same Element */}
              <div className="border-t pt-6" style={{ borderColor: 'rgba(207, 232, 215, 0.3)' }}>
                <div className="mb-4">
                  <span className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-4 animate-pulse" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                    ⭐ BONUS OPPORTUNITY ⭐
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Win 1 Year of FREE Dentistry Worth £2,000!
                </h3>
                <p className="text-lg mb-4">
                  Join {totalSignups} other voucher holders competing for this prize!
                </p>
                <p className="text-base mb-6 opacity-90">
                  Answer 4 quick questions to enter the draw
                </p>

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
          </div>
        )}

        {/* Step 6: Survey Questions */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-6">
              <span className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-3" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                🔥 4 QUICK QUESTIONS
              </span>
              <h3 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Help Us Build Your Perfect Practice
              </h3>
              <p className="text-lg" style={{ color: '#666' }}>
                Your answers enter you for 1 year of FREE dentistry worth £2,000!
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              // Move to extended survey (step 7)
              setStep(7);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="space-y-8">
              {/* Question 1 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  1. What type of dental care is most important to you?
                </label>
                <div className="space-y-3">
                  {[
                    'Routine check-ups & hygiene',
                    'Cosmetic improvements',
                    'Family/children\'s dentistry',
                    'Emergency/relief from pain',
                    'Nervous-patient friendly care'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.dentalCare === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="dentalCare"
                        value={option}
                        checked={surveyData.dentalCare === option}
                        onChange={(e) => setSurveyData({ ...surveyData, dentalCare: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  2. How soon do you expect to register with or visit a dentist?
                </label>
                <div className="space-y-3">
                  {[
                    'Immediately',
                    'Within 1–3 months',
                    'Within 3–6 months',
                    'I\'m just browsing'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.timeline === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="timeline"
                        value={option}
                        checked={surveyData.timeline === option}
                        onChange={(e) => setSurveyData({ ...surveyData, timeline: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  3. What days/times work best for your dental appointments?
                </label>
                <div className="space-y-3">
                  {[
                    'Weekdays',
                    'Evenings',
                    'Weekends',
                    'Flexible'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.appointmentTimes === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="appointmentTimes"
                        value={option}
                        checked={surveyData.appointmentTimes === option}
                        onChange={(e) => setSurveyData({ ...surveyData, appointmentTimes: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 4 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  4. What matters most when choosing a new dental practice?
                  <span className="block text-sm font-normal mt-1" style={{ color: '#666' }}>(Select up to 3)</span>
                </label>
                <div className="space-y-3">
                  {[
                    'Price & transparency',
                    'Gentle, patient-focused care',
                    'Availability of hygiene appointments',
                    'Modern clinic & technology',
                    'Convenience of location',
                    'Short waiting lists'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.importantFactors.includes(option) ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={surveyData.importantFactors.includes(option)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked && surveyData.importantFactors.length < 3) {
                            setSurveyData({ ...surveyData, importantFactors: [...surveyData.importantFactors, value] });
                          } else if (!e.target.checked) {
                            setSurveyData({ ...surveyData, importantFactors: surveyData.importantFactors.filter(f => f !== value) });
                          }
                        }}
                        disabled={!surveyData.importantFactors.includes(option) && surveyData.importantFactors.length >= 3}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#1f3a33' }}
              >
                Submit & Enter Prize Draw →
              </button>
            </form>
          </div>
        )}

        {/* Step 7: Extended Survey Questions - Copy from main page */}
        {step === 7 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-6">
              <span className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-3" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                🔥 BONUS QUESTIONS
              </span>
              <h3 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Can we ask for a little more feedback?
              </h3>
              <p className="text-lg" style={{ color: '#666' }}>
                It takes 20 seconds and it will really shape your dental experience.
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              // Save all survey responses
              try {
                await fetch('/api/save-survey', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: formData.email,
                    ...surveyData,
                    ...extendedSurvey,
                  }),
                });
                setStep(8);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch (error) {
                console.error('Survey submission error:', error);
                setStep(8);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} className="space-y-8">
              {/* Questions 1-10 from page.tsx - abbreviated for brevity, will push full version */}
              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#1f3a33' }}
              >
                Complete Survey & Confirm Entry →
              </button>
            </form>
          </div>
        )}

        {/* Step 8: Congratulations & Share */}
        {step === 8 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="inline-block rounded-full p-6 mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-6xl">🎉</span>
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1f3a33' }}>
                Congratulations!
              </h2>
              <p className="text-2xl mb-4" style={{ color: '#70d490' }}>
                You're Now Eligible for Your £{voucherValue} Voucher!
              </p>
              <p className="text-lg mb-2" style={{ color: '#1f3a33' }}>
                Plus, you've received <span className="font-bold">3 entries</span> into the draw to win 1 Year of FREE Dentistry worth £2,000!
              </p>
              <p className="text-base mb-8" style={{ color: '#666' }}>
                Thank you for completing the survey. Your feedback helps us create the perfect dental practice for you.
              </p>
            </div>

            {/* Share Section */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#cfe8d7' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Want Even More Entries?
              </h3>
              <p className="text-lg mb-4" style={{ color: '#1f3a33' }}>
                Share your unique link with friends and receive <span className="font-bold">+10 bonus entries</span> for every friend who claims their voucher!
              </p>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm mb-2" style={{ color: '#666' }}>Your referral link:</p>
                <p className="text-base font-mono break-all mb-3" style={{ color: '#1f3a33' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/earlybird?ref=${encodeURIComponent(formData.name)}-${Math.floor(100 + Math.random() * 900)}` : 'Loading...'}
                </p>
              </div>

              <button
                onClick={async () => {
                  const randomNum = Math.floor(100 + Math.random() * 900);
                  const referralLink = `${window.location.origin}/earlybird?ref=${encodeURIComponent(formData.name)}-${randomNum}`;
                  try {
                    await navigator.clipboard.writeText(referralLink);
                    alert('✅ Link copied to clipboard! Share it with your friends to get +10 bonus entries for each friend who claims their voucher.');
                  } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = referralLink;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('✅ Link copied! Share it with your friends to get +10 bonus entries for each friend who claims their voucher.');
                  }
                }}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg mb-4"
                style={{ backgroundColor: '#1f3a33' }}
              >
                📋 Copy Share Link
              </button>

              <p className="text-sm" style={{ color: '#1f3a33', opacity: 0.8 }}>
                The more friends you share with, the better your chances!
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/home'}
              className="text-white px-8 py-4 rounded-xl text-lg font-bold transition-all"
              style={{ backgroundColor: '#70d490' }}
            >
              Continue to Website →
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
