'use client';

import { useState, useEffect } from 'react';

// Declare dataLayer for GTM and Navigator types
declare global {
  interface Window {
    dataLayer: any[];
  }
  interface Navigator {
    connection?: {
      effectiveType?: string;
      type?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    mozConnection?: {
      effectiveType?: string;
      type?: string;
    };
    webkitConnection?: {
      effectiveType?: string;
      type?: string;
    };
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

export default function JumperPage() {
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
  const [campaignSource, setCampaignSource] = useState<string>('QR Jumper Scan');
  const [customerId, setCustomerId] = useState<string>('');
  const [firstInteractionTime, setFirstInteractionTime] = useState<number>(0);
  const [surveyData, setSurveyData] = useState({
    dentalCare: [] as string[],
    appointmentTimes: [] as string[],
    timeline: '',
    importantFactors: '',
    previousExperience: '',
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

  // Track first interaction (mouse move, scroll, click, touch, or keyboard)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (firstInteractionTime === 0) {
        const interactionTime = Date.now();
        setFirstInteractionTime(interactionTime);
        const timeToInteraction = Math.round((interactionTime - pageLoadTimestamp) / 1000);
        console.log(`⏱️ First interaction after ${timeToInteraction} seconds`);
      }
    };

    window.addEventListener('mousemove', handleFirstInteraction, { once: true });
    window.addEventListener('scroll', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [firstInteractionTime, pageLoadTimestamp]);

  // Track visitor immediately on page load
  useEffect(() => {
    async function trackVisitor() {
      try {
        // Generate or retrieve SmileMoore Universal ID
        let smUniversalId = localStorage.getItem('sm_universal_id');
        if (!smUniversalId) {
          smUniversalId = `SM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('sm_universal_id', smUniversalId);
          console.log('🆔 Generated SmileMoore Universal ID:', smUniversalId);
        } else {
          console.log('🆔 Retrieved existing SmileMoore Universal ID:', smUniversalId);
        }

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
          setReferredBy(ref);
        }

        // Extract click IDs for ad platforms
        const fbclid = urlParams.get('fbclid') || '';
        const gclid = urlParams.get('gclid') || '';
        const msclkid = urlParams.get('msclkid') || '';
        const ttclid = urlParams.get('ttclid') || '';
        const li_fat_id = urlParams.get('li_fat_id') || '';

        // Enhanced device detection
        const userAgent = navigator.userAgent;

        // Detect device type and model
        let deviceType = 'Desktop';
        let deviceModel = 'Unknown';

        if (/iPhone/.test(userAgent)) {
          deviceType = 'Mobile';
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

        // Detect network type (WiFi vs mobile data)
        let networkType = 'Unknown';
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          if (connection.effectiveType) {
            networkType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
          } else if (connection.type) {
            networkType = connection.type; // 'wifi', 'cellular', 'bluetooth', etc.
          }
          console.log('📶 Network type:', networkType, 'Connection details:', connection);
        }

        // Get retargeting cookies for Facebook and Google
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
          return '';
        };

        // Wait for GTM and pixels to set cookies
        let fbp = '';
        let fbc = '';
        let gaClientId = '';
        let gid = '';
        let muid = '';
        let ttp = '';
        let tta = '';
        let mucAds = '';

        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          fbp = getCookie('_fbp');
          fbc = getCookie('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : '');
          gaClientId = getCookie('_ga');
          gid = getCookie('_gid');
          muid = getCookie('MUID');
          ttp = getCookie('_ttp');
          tta = getCookie('_tta');
          mucAds = getCookie('muc_ads');

          console.log(`Attempt ${attempt + 1}: Cookies:`, {
            fbp,
            fbc,
            gaClientId,
            gid,
            muid,
            ttp,
            tta,
            mucAds,
            allCookies: document.cookie
          });

          let platformCount = 0;
          if (fbp) platformCount++;
          if (gaClientId) platformCount++;
          if (muid) platformCount++;
          if (ttp || tta) platformCount++;
          if (mucAds) platformCount++;

          if (platformCount >= 4) {
            console.log(`✅ Found ${platformCount}/6 platform tracking cookies!`);
            break;
          }
        }

        if (!fbp) console.warn('⚠️ Facebook _fbp cookie not found after 5 seconds');
        if (!gaClientId) console.warn('⚠️ Google _ga cookie not found after 5 seconds');
        if (!muid) console.warn('⚠️ Microsoft MUID cookie not found after 5 seconds');
        if (!ttp && !tta) console.warn('⚠️ TikTok cookies not found after 5 seconds');
        if (!mucAds) console.warn('⚠️ Twitter/X muc_ads cookie not found after 5 seconds');

        // Get campaign source - prioritize referral, then UTM, then default to QR Jumper Scan
        let sourceName = 'QR Jumper Scan';
        if (ref) {
          sourceName = 'Referral';
        } else if (utmSource) {
          sourceName = utmSource;
        }
        setCampaignSource(sourceName);

        // Get full landing page URL
        const landingPage = window.location.href;

        // Check if returning visitor
        const existingVisitorId = localStorage.getItem('smilemoore_visitor_id');
        const sessionCount = parseInt(localStorage.getItem('smilemoore_session_count') || '0') + 1;
        const isReturningVisitor = !!existingVisitorId;
        const firstVisitDate = localStorage.getItem('smilemoore_first_visit') || new Date().toISOString();

        if (!existingVisitorId) {
          localStorage.setItem('smilemoore_first_visit', firstVisitDate);
        }
        localStorage.setItem('smilemoore_session_count', sessionCount.toString());

        // Get current date/time for analysis
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const hourOfDay = now.getHours();

        // Track the visit with new fields
        const response = await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignSource: sourceName,
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
            gid,
            fbclid,
            gclid,
            msclkid,
            ttclid,
            li_fat_id,
            muid,
            ttp,
            tta,
            mucAds,
            smUniversalId,
            pageLoadTime: Math.round(loadTime),
            isReturningVisitor,
            sessionCount,
            firstVisitDate,
            dayOfWeek,
            hourOfDay,
            networkType, // NEW: Network connection type
          }),
        });

        const data = await response.json();
        if (data.visitorId) {
          setVisitorId(data.visitorId);
          sessionStorage.setItem('visitorId', data.visitorId);
          localStorage.setItem('smilemoore_visitor_id', data.visitorId);

          // Capture cookies again after 10 seconds
          setTimeout(async () => {
            const getCookie = (name: string) => {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
              return '';
            };

            const delayedFbp = getCookie('_fbp');
            const delayedFbc = getCookie('_fbc');
            const delayedGa = getCookie('_ga');
            const delayedGid = getCookie('_gid');
            const delayedMuid = getCookie('MUID');
            const delayedTtp = getCookie('_ttp');
            const delayedTta = getCookie('_tta');
            const delayedMucAds = getCookie('muc_ads');

            console.log('🔄 Updating visitor with delayed cookies:', {
              visitorId: data.visitorId,
              fbp: delayedFbp,
              fbc: delayedFbc,
              ga: delayedGa,
              gid: delayedGid,
              muid: delayedMuid,
              ttp: delayedTtp,
              tta: delayedTta,
              mucAds: delayedMucAds,
              smUniversalId,
              allCookies: document.cookie
            });

            if (delayedFbp || delayedGa || delayedMuid || delayedTtp || delayedMucAds) {
              try {
                await fetch('/api/update-visitor-cookies', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    visitorId: data.visitorId,
                    fbp: delayedFbp,
                    fbc: delayedFbc,
                    gaClientId: delayedGa,
                    gid: delayedGid,
                    muid: delayedMuid,
                    ttp: delayedTtp,
                    tta: delayedTta,
                    mucAds: delayedMucAds,
                    smUniversalId,
                  }),
                });
                console.log('✅ All visitor cookies updated successfully!');
              } catch (err) {
                console.error('❌ Failed to update visitor cookies:', err);
              }
            }
          }, 10000);
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

  // Track session duration on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Math.round((Date.now() - pageLoadTimestamp) / 1000);
      const timeToFirstInteraction = firstInteractionTime > 0
        ? Math.round((firstInteractionTime - pageLoadTimestamp) / 1000)
        : 0;

      console.log(`📊 Session ending - Duration: ${sessionDuration}s, Time to first interaction: ${timeToFirstInteraction}s`);

      // Send session data using sendBeacon (works even when page is closing)
      if (visitorId && navigator.sendBeacon) {
        const sessionData = JSON.stringify({
          visitorId,
          sessionDuration,
          timeToFirstInteraction,
          maxScrollDepth,
        });
        navigator.sendBeacon('/api/update-session-data', sessionData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [visitorId, pageLoadTimestamp, firstInteractionTime, maxScrollDepth]);

  // Fetch initial voucher status
  useEffect(() => {
    async function fetchVoucherStatus() {
      try {
        const response = await fetch('/api/voucher-status');
        const data: VoucherStatus = await response.json();
        const actualRemaining = data.initialDisplay;

        setVouchersRemaining(actualRemaining);
        setVoucherValue(data.currentTier.value);

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

  const getProgress = () => {
    switch (step) {
      case 1: return 0;
      case 2: return 50;
      case 3: return 99;
      case 4: return 100;
      default: return 0;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      const emailTime = Date.now();
      setEmailSubmitTime(emailTime);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const timeToSubmit = Math.round((emailTime - pageLoadTimestamp) / 1000);
      const timeToFirstInteraction = firstInteractionTime > 0
        ? Math.round((firstInteractionTime - pageLoadTimestamp) / 1000)
        : 0;
      const smUniversalId = localStorage.getItem('sm_universal_id');

      fetch('/api/submit-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: '',
          phone: '',
          address: '',
          campaignSource,
          timeToSubmit,
          scrollDepth: maxScrollDepth,
          referredBy,
          smUniversalId,
          timeToFirstInteraction, // NEW: Time to first user interaction
        }),
      }).then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (data.voucherCode) {
            setVoucherCode(data.voucherCode);
          }
          if (data.totalSignups) {
            setTotalSignups(data.totalSignups);
          }
          if (data.customerId) {
            setCustomerId(data.customerId);
          }

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'email_submitted',
            voucher_value: voucherValue
          });
        }
      }).catch(error => {
        console.error('Error submitting email:', error);
      });
    } else if (step === 2) {
      const nameTime = Date.now();
      setNameSubmitTime(nameTime);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const emailToName = Math.round((nameTime - emailSubmitTime) / 1000);

      fetch('/api/update-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          customerId,
          field: 'name',
          value: formData.name,
          campaignSource,
          emailToName,
        }),
      }).catch(error => {
        console.error('Error updating name:', error);
      });
    } else if (step === 3) {
      const finalTime = Date.now();
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const nameToFinal = Math.round((finalTime - nameSubmitTime) / 1000);
      const totalTime = Math.round((finalTime - pageLoadTimestamp) / 1000);

      fetch('/api/update-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          customerId,
          field: 'phone',
          value: formData.phone,
          campaignSource,
          nameToPhone: nameToFinal,
        }),
      }).catch(error => {
        console.error('Error updating phone:', error);
      });

      fetch('/api/update-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          customerId,
          field: 'address',
          value: formData.address,
          campaignSource,
          phoneToPostcode: 0,
          totalTime,
        }),
      }).then(() => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'voucher_claimed',
          voucher_value: voucherValue,
          currency: 'GBP'
        });

        localStorage.removeItem('smilemoore_visitor_id');
        localStorage.removeItem('smilemoore_session_count');
        localStorage.removeItem('smilemoore_first_visit');
      }).catch(error => {
        console.error('Error updating address:', error);
      });
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

        {/* Step 3: Phone + Postcode (Combined Final Step) */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Almost There, {formData.name}!
              </h2>
              <p className="text-lg" style={{ color: '#666' }}>
                Just 2 more details to claim your £{voucherValue} voucher
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <label htmlFor="phone" className="block text-lg font-semibold mb-3 text-center" style={{ color: '#1f3a33' }}>
                  Your mobile number
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
              </div>

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
                />
              </div>

              <button
                type="submit"
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                style={{ backgroundColor: '#1f3a33' }}
              >
                🎉 Claim My £{voucherValue} Voucher Now!
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success Message */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="inline-block rounded-full p-6 mb-4" style={{ backgroundColor: '#cfe8d7' }}>
              <span className="text-6xl">🎉</span>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1f3a33' }}>
              Success, {formData.name}!
            </h2>
            <p className="text-xl mb-4" style={{ color: '#666' }}>
              Your £{voucherValue} voucher code has been sent to your email
            </p>
            <p className="text-lg" style={{ color: '#666' }}>
              Check your inbox for your unique voucher code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
