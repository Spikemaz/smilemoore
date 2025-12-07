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
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [totalSignups, setTotalSignups] = useState<number>(0);
  const [referredBy, setReferredBy] = useState<string>('');
  const [campaignSource, setCampaignSource] = useState<string>('URL Direct');
  const [customerId, setCustomerId] = useState<string>('');
  const [firstInteractionTime, setFirstInteractionTime] = useState<number>(0);
  const [surveyData, setSurveyData] = useState({
    dentalCare: [] as string[], // Q1: Multiple choice
    appointmentTimes: [] as string[], // Q2: Multiple choice
    timeline: '', // Q3: Single choice
    importantFactors: '', // Q4: Single choice (how they feel about dentist)
    previousExperience: '', // Q5: Single choice (household size)
  });
  const [householdNames, setHouseholdNames] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [extendedSurvey, setExtendedSurvey] = useState({
    dentalExperience: '',
    mostImportantFactor: [] as string[],
    smileConfidence: '',
    sameClinician: '',
    neededTreatments: [] as string[],
    beforeAppointment: '',
    stayLongTerm: [] as string[],
    preventingVisits: '',
    cosmeticImportance: '',
    preferredContact: '',
    additionalFeedback: '',
  });

  // Retrieve customerId from localStorage on mount (for family signups with same email)
  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const cidFromUrl = urlParams.get('cid');

    if (cidFromUrl) {
      // Email link with Customer ID - use that (takes priority)
      setCustomerId(cidFromUrl);
      localStorage.setItem('smilemoore_customer_id', cidFromUrl);
      console.log('🆔 Customer ID from URL:', cidFromUrl);
      fetchAndPrefillCustomerData(cidFromUrl);
    } else {
      // No URL param - check localStorage
      const storedCustomerId = localStorage.getItem('smilemoore_customer_id');
      if (storedCustomerId) {
        setCustomerId(storedCustomerId);
        console.log('🆔 Retrieved Customer ID from localStorage:', storedCustomerId);
        // Fetch existing customer data and pre-fill form
        fetchAndPrefillCustomerData(storedCustomerId);
      }
    }
  }, []);

  // Fetch customer data and pre-fill the form
  async function fetchAndPrefillCustomerData(customerId: string) {
    try {
      const response = await fetch(`/api/get-customer-data?customerId=${customerId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        console.log('📋 Pre-filling form with existing customer data:', data);

        // Pre-fill basic info
        if (data.email) {
          setFormData(prev => ({
            ...prev,
            email: data.email,
            name: data.name || '',
            phone: data.phone || '',
            address: data.postcode || '',
          }));
        }

        // Pre-fill survey data if exists
        if (data.appointmentTimes) {
          setSurveyData(prev => ({
            ...prev,
            appointmentTimes: data.appointmentTimes.split(', '),
            timeline: data.timeline || '',
            dentalCare: data.dentalCare.split(', '),
            importantFactors: data.importantFactors || '',
            previousExperience: data.previousExperience || '',
          }));
        }

        // Pre-fill extended survey if exists
        if (data.dentalExperience) {
          setExtendedSurvey(prev => ({
            ...prev,
            dentalExperience: data.dentalExperience || '',
            mostImportantFactor: data.mostImportantFactor || '',
            smileConfidence: data.smileConfidence || '',
            sameClinician: data.sameClinician || '',
            neededTreatments: data.neededTreatments.split(', '),
            beforeAppointment: data.beforeAppointment || '',
            stayLongTerm: data.stayLongTerm || '',
            preventingVisits: data.preventingVisits || '',
            cosmeticImportance: data.cosmeticImportance || '',
            preferredContact: data.preferredContact || '',
            additionalFeedback: data.additionalFeedback || '',
          }));
        }

        // Check if they came from an email link (has ?cid= parameter)
        const urlParams = new URLSearchParams(window.location.search);
        const fromEmailLink = urlParams.has('cid');

        // Skip to the appropriate step based on what data is missing
        if (data.hasExtendedSurvey) {
          if (fromEmailLink) {
            // They came from email link - show them thank you page (auto-resume)
            console.log('📧 Email link detected - showing thank you page');
            setStep(7);
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 100);
          } else {
            // They came from QR/Direct URL - clear localStorage and start fresh
            // This allows them to use their phone to fill out friends' details
            console.log('✅ Survey complete - clearing localStorage to allow fresh signups');
            localStorage.removeItem('smilemoore_customer_id');
            localStorage.removeItem('smilemoore_last_email');
            setStep(1);
          }
        } else if (data.hasSurveyQ1to5) {
          if (fromEmailLink) {
            // They came from email link - resume to extended survey (auto-resume)
            console.log('📧 Email link detected - resuming to extended survey');
            setStep(6);
          } else {
            // They came from QR/Direct URL - clear localStorage and start fresh
            // This allows them to sign up friends/family after completing 5 questions
            console.log('✅ 5 questions complete - clearing localStorage to allow fresh signups');
            localStorage.removeItem('smilemoore_customer_id');
            localStorage.removeItem('smilemoore_last_email');
            setStep(1);
          }
        } else if (data.hasPhoneAddress) {
          // They have contact info, need to do 5 questions
          setStep(5);
        } else if (data.hasBasicInfo) {
          // They have email/name, need phone/address
          setStep(3);
        } else {
          // Start from beginning
          setStep(1);
        }

        console.log('✅ Form pre-filled and skipped to step', step);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  }

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

        // Extract Customer ID from URL (for email follow-ups)
        const customerIdFromUrl = urlParams.get('cid') || '';
        if (customerIdFromUrl) {
          setCustomerId(customerIdFromUrl);
          localStorage.setItem('smilemoore_customer_id', customerIdFromUrl);
          console.log('🆔 Customer ID from email link:', customerIdFromUrl);
        }

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

        // Extract click IDs for ad platforms (Google, TikTok)
        const gclid = urlParams.get('gclid') || '';
        const ttclid = urlParams.get('ttclid') || ''; // TikTok

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

        // Wait for GTM and pixels to set cookies (try multiple times with increasing delays)
        let gaClientId = '';
        let gid = '';
        let ttp = '';
        let tta = '';

        // Try to get cookies, retry up to 5 times over 5 seconds
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          gaClientId = getCookie('_ga');
          gid = getCookie('_gid');
          ttp = getCookie('_ttp');
          tta = getCookie('_tta');

          console.log(`Attempt ${attempt + 1}: Cookies:`, {
            gaClientId,
            gid,
            ttp,
            tta,
            allCookies: document.cookie
          });

          // Count how many platform cookies we have (2 platforms: Google, TikTok)
          let platformCount = 0;
          if (gaClientId) platformCount++;
          if (ttp || tta) platformCount++;

          // If we have both platform cookies, stop trying
          if (platformCount >= 2) {
            console.log(`✅ Found ${platformCount}/2 platform tracking cookies!`);
            break;
          }
        }

        // Log warnings for missing cookies
        if (!gaClientId) console.warn('⚠️ Google _ga cookie not found after 5 seconds');
        if (!ttp && !tta) console.warn('⚠️ TikTok cookies not found after 5 seconds');

        // Extract email and SMS campaign parameters
        const emailVariation = urlParams.get('email') || '';
        const smsVariation = urlParams.get('sms') || '';

        // Get campaign source - prioritize referral, email, SMS, then UTM, then default to URL Direct
        let sourceName = 'URL Direct';
        if (ref) {
          sourceName = `Referral: ${ref}`;
        } else if (emailVariation) {
          // Map email template names to readable format
          const emailNames: { [key: string]: string } = {
            'voucher-single': 'Email: Voucher Single',
            'voucher-family': 'Email: Voucher Family',
            '4q-1': 'Email: 4Q Follow-up #1',
            '4q-2': 'Email: 4Q Follow-up #2',
            '4q-3': 'Email: 4Q Follow-up #3',
            '10q-1': 'Email: 10Q Follow-up #1',
            '10q-2': 'Email: 10Q Follow-up #2',
            '10q-3': 'Email: 10Q Follow-up #3',
            'christmas': 'Email: Christmas Sharing',
            'referral': 'Email: Referral Follow-up',
          };
          sourceName = emailNames[emailVariation] || `Email: ${emailVariation}`;
        } else if (smsVariation) {
          // Map SMS template names to readable format
          const smsNames: { [key: string]: string } = {
            '4q-1': 'SMS: 4Q Follow-up #1',
            '4q-2': 'SMS: 4Q Follow-up #2',
            '4q-3': 'SMS: 4Q Follow-up #3',
            '10q-1': 'SMS: 10Q Follow-up #1',
            '10q-2': 'SMS: 10Q Follow-up #2',
            '10q-3': 'SMS: 10Q Follow-up #3',
            'referral': 'SMS: Referral Follow-up',
          };
          sourceName = smsNames[smsVariation] || `SMS: ${smsVariation}`;
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
            gaClientId,
            gid,
            gclid,
            ttclid,
            ttp,
            tta,
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
          // Store in sessionStorage to link later
          sessionStorage.setItem('visitorId', data.visitorId);
          // Store in localStorage for return visitor tracking
          localStorage.setItem('smilemoore_visitor_id', data.visitorId);

          // CRITICAL FIX: Capture cookies AGAIN after 10 seconds and update the visitor row
          // This ensures all platform pixels have fully loaded
          setTimeout(async () => {
            const getCookie = (name: string) => {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
              return '';
            };

            const delayedGa = getCookie('_ga');
            const delayedGid = getCookie('_gid');
            const delayedTtp = getCookie('_ttp');
            const delayedTta = getCookie('_tta');

            console.log('🔄 Updating visitor with delayed cookies:', {
              visitorId: data.visitorId,
              ga: delayedGa,
              gid: delayedGid,
              ttp: delayedTtp,
              tta: delayedTta,
              smUniversalId,
              allCookies: document.cookie
            });

            // Update the visitor row with cookies (2 platforms: Google, TikTok)
            if (delayedGa || delayedTtp) {
              try {
                await fetch('/api/update-visitor-cookies', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    visitorId: data.visitorId,
                    gaClientId: delayedGa,
                    gid: delayedGid,
                    ttp: delayedTtp,
                    tta: delayedTta,
                    smUniversalId,
                  }),
                });
                console.log('✅ Google and TikTok cookies updated successfully!');
              } catch (err) {
                console.error('❌ Failed to update visitor cookies:', err);
              }
            }
          }, 10000); // Wait 10 seconds after initial tracking
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
      case 3: return 99;
      case 4: return 100;
      default: return 0;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (step === 1) {
      // Move to next step IMMEDIATELY
      const emailTime = Date.now();
      setEmailSubmitTime(emailTime);

      // Instant transition for better UX
      setStep(2);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Calculate time from page load to email submission (in seconds)
      const timeToSubmit = Math.round((emailTime - pageLoadTimestamp) / 1000);
      const timeToFirstInteraction = firstInteractionTime > 0
        ? Math.round((firstInteractionTime - pageLoadTimestamp) / 1000)
        : 0;

      // ALWAYS clear customerId when submitting step 1 (email)
      localStorage.removeItem('smilemoore_customer_id');
      localStorage.removeItem('smilemoore_last_email');
      setCustomerId('');

      // Get SmileMoore Universal ID from localStorage
      const smUniversalId = localStorage.getItem('sm_universal_id');

      // Submit email in background to Google Sheets
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
            localStorage.setItem('smilemoore_customer_id', data.customerId.toString());
            localStorage.setItem('smilemoore_last_email', formData.email);
          }

          // Track email submission
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
      // Move to next step IMMEDIATELY
      const nameTime = Date.now();
      setNameSubmitTime(nameTime);

      // Instant transition for better UX
      setStep(3);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Calculate time between email submit and name submit
      const emailToName = Math.round((nameTime - emailSubmitTime) / 1000);

      // Update name in background
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
      // Move directly to step 5 (survey) - skip step 4
      const finalTime = Date.now();

      // Instant transition for better UX
      setStep(5);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Decrement voucher counter when voucher is claimed
      if (vouchersRemaining > 0) {
        setVouchersRemaining(vouchersRemaining - 1);
      }

      // Calculate time between name submit and final submit
      const nameToFinal = Math.round((finalTime - nameSubmitTime) / 1000);
      const totalTime = Math.round((finalTime - pageLoadTimestamp) / 1000);

      // Update phone in background
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

      // Update address in background
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
        // Track voucher claimed
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'voucher_claimed',
          voucher_value: voucherValue,
          currency: 'GBP'
        });

        // Clear visitor tracking
        localStorage.removeItem('smilemoore_visitor_id');
        localStorage.removeItem('smilemoore_session_count');
        localStorage.removeItem('smilemoore_first_visit');
      }).catch(error => {
        console.error('Error updating address:', error);
      });

      // Send SMS voucher message in background
      if (formData.phone && voucherCode) {
        fetch('/api/send-sms-voucher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formData.phone,
            voucherCode: voucherCode,
            firstName: formData.name.split(' ')[0], // Get first name only
          }),
        }).then(() => {
          console.log('✅ SMS voucher sent');
        }).catch(error => {
          console.error('Error sending SMS voucher:', error);
        });
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const getBannerMessage = () => {
    // Message for step 6 (final questions page)
    if (step === 6) {
      return (
        <span className="text-lg md:text-xl">
          🎉 You have been entered into our draw and have been sent your voucher code via email
        </span>
      );
    }

    // Simplified message for step 4-5 (success page and survey)
    if (step >= 4) {
      return (
        <span className="text-lg md:text-xl">
          🎉 Congratulations On Receiving Your Voucher
        </span>
      );
    }

    // Detailed messages for steps 1-3
    if (vouchersRemaining <= 3) {
      return (
        <span className="text-lg md:text-xl">
          Final <span className="underline font-extrabold text-4xl md:text-5xl pulse-color">{vouchersRemaining}</span> vouchers available last chance!
        </span>
      );
    } else if (vouchersRemaining <= 100) {
      return (
        <span className="text-lg md:text-xl">
          Due To Popular Demand Only <span className="underline font-extrabold text-4xl md:text-5xl pulse-color">{vouchersRemaining}</span> Vouchers Remaining!
        </span>
      );
    } else {
      return (
        <span className="text-lg md:text-xl">
          You've Found Us Early Claim Your £{voucherValue} Voucher Before the Final <span className="underline font-extrabold text-4xl md:text-5xl pulse-color">{vouchersRemaining}</span> Are Taken.
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Voucher Counter Header */}
      <div className="py-4 px-4 text-center font-bold" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
        <div className="max-w-4xl mx-auto">
          {getBannerMessage()}
        </div>
      </div>

      {/* Progress Bar - Only show after step 1 and before step 4 */}
      {step > 1 && step < 4 && (
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
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                ✓ LIMITED TIME OFFER
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#1f3a33' }}>
              Claim Your £{voucherValue}<br />Voucher
            </h1>

            <p className="text-lg mb-2" style={{ color: '#666' }}>
              Valid Towards Dental Treatment
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <label htmlFor="email" className="block text-lg font-semibold mb-3" style={{ color: '#1f3a33' }}>
                  Enter Your Email Below
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all text-center"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7', color: '#1f3a33' }}
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#f0f8f4' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-1 w-5 h-5 flex-shrink-0"
                  style={{ accentColor: '#1f3a33' }}
                />
                <label htmlFor="terms" className="text-sm text-left" style={{ color: '#1f3a33' }}>
                  I agree and consent, brighter smiles here we come! <a
                    href="/terms"
                    target="_blank"
                    className="underline font-semibold hover:text-green-700"
                    onClick={() => {
                      fetch('/api/track-tc-click', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customerId, location: 'step3_checkbox' }),
                      }).catch(console.error);
                    }}
                  >(Terms and Conditions)</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1f3a33' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Submit'}
              </button>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: '#e0e0e0' }}>
                <p className="text-sm" style={{ color: '#666' }}>
                  🔒 We never share your information. You'll receive your voucher instantly.
                </p>
                <p className="text-xs mt-2" style={{ color: '#999' }}>
                  <a
                    href="/terms"
                    target="_blank"
                    className="underline hover:text-gray-700"
                    onClick={() => {
                      fetch('/api/track-tc-click', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customerId, location: 'step3_bottom' }),
                      }).catch(console.error);
                    }}
                  >Terms and Conditions</a>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-4">
              <div className="inline-block p-4 rounded-full mb-2" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                Great! Your voucher is reserved
              </h2>
              <p className="text-lg mb-2" style={{ color: '#666' }}>
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
                disabled={isSubmitting}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1f3a33' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Continue →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Phone + Postcode (Combined Final Step) */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-4">
              <div className="inline-block p-4 rounded-full mb-2" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                Almost There, {formData.name}!
              </h2>
              <p className="text-lg mb-2" style={{ color: '#666' }}>
                Just 2 more details to claim your £{voucherValue} voucher
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isSubmitting}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1f3a33' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : `🎉 Claim My £${voucherValue} Voucher Now!`}
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Survey Questions with Prize Draw Banner (Step 4 removed - goes directly here) */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            {/* Prize Draw Banner at Top */}
            <div className="rounded-xl p-6 mb-8 text-center" style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)', border: '2px solid rgba(255, 215, 0, 0.5)' }}>
              <h3 className="text-3xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                🏆 Would you like the chance to Win 1 Year Of FREE Dentistry?
              </h3>
              <p className="text-2xl mb-2" style={{ color: '#d4af37' }}>
                Worth Up To £5000!
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg mb-3" style={{ color: '#666' }}>
                So Far Only <span className="underline font-extrabold pulse-color">{totalSignups}</span> People Have Entered This Draw
              </p>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Answer 5 Quick Questions
              </h3>
              <p className="text-lg mb-2" style={{ color: '#666' }}>
                Help us build your perfect dental practice
              </p>
              <p className="text-xs mt-2" style={{ color: '#999' }}>
                Subject to terms and conditions.
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              // Validate at least one option selected for multiple choice questions
              if (surveyData.dentalCare.length === 0) {
                alert('Please select at least one type of dental care you\'re interested in.');
                return;
              }
              if (surveyData.appointmentTimes.length === 0) {
                alert('Please select at least one preferred appointment time.');
                return;
              }

              setIsSubmitting(true);

              // Clear localStorage after 5 questions - allow fresh signups for friends/family
              console.log('✅ Completed 5 questions - clearing localStorage for fresh signups');
              localStorage.removeItem('smilemoore_customer_id');
              localStorage.removeItem('smilemoore_last_email');

              // Move to next step immediately for instant UX
              setStep(6);
              setIsSubmitting(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });

              // Save to Google Sheets in background (fire and forget)
              fetch('/api/save-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: formData.email,
                  ...surveyData,
                  householdNames, // Include household member names
                }),
              }).then(() => {
                console.log('✅ First 5 questions saved to Google Sheets');
              }).catch((error) => {
                console.error('Error saving first 5 questions:', error);
              });
            }} className="space-y-8">
              {/* Question 1: Multiple choice (was Q2) */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  1. When do you usually prefer appointments?
                  <span className="block text-sm font-normal mt-1" style={{ color: '#666' }}>(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {[
                    'Weekday mornings',
                    'Weekday afternoons',
                    'Weekday evenings (after 5pm)',
                    'Saturdays',
                    'Sundays'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.appointmentTimes.includes(option) ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={surveyData.appointmentTimes.includes(option)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSurveyData({ ...surveyData, appointmentTimes: [...surveyData.appointmentTimes, value] });
                          } else {
                            setSurveyData({ ...surveyData, appointmentTimes: surveyData.appointmentTimes.filter(t => t !== value) });
                          }
                        }}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2: Single choice (was Q3) */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  2. When was your most recent appointment?
                </label>
                <div className="space-y-3">
                  {[
                    'Within the last 6 months',
                    '6 months to 1 year',
                    '1-2 years',
                    '2-5 years',
                    '5+ Years'
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

              {/* Question 3: Single choice */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  3. How do you feel about visiting the dentist?
                </label>
                <div className="space-y-3">
                  {[
                    'I feel comfortable and relaxed',
                    'I feel slightly anxious',
                    'I feel very nervous or anxious',
                    'I avoid it due to fear or bad experiences'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.importantFactors === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="importantFactors"
                        value={option}
                        checked={surveyData.importantFactors === option}
                        onChange={(e) => setSurveyData({ ...surveyData, importantFactors: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 4: Multiple choice (was Q1) */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  4. What type of dental care are you most interested in?
                  <span className="block text-sm font-normal mt-1" style={{ color: '#666' }}>(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {[
                    'Routine check-ups and cleanings',
                    'Cosmetic dentistry (e.g., whitening, veneers)',
                    'Orthodontics (e.g., braces, Invisalign)',
                    'Restorative work (e.g., fillings, crowns)',
                    'Emergency dental care',
                    'Specialist treatments (e.g., implants, root canals)'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.dentalCare.includes(option) ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={surveyData.dentalCare.includes(option)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSurveyData({ ...surveyData, dentalCare: [...surveyData.dentalCare, value] });
                          } else {
                            setSurveyData({ ...surveyData, dentalCare: surveyData.dentalCare.filter(c => c !== value) });
                          }
                        }}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5: Household members */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  5. How many people in your household would potentially join the practice?
                </label>
                <div className="space-y-3">
                  {/* Just me option */}
                  <div>
                    <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.previousExperience === 'Just me' ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="previousExperience"
                        value="Just me"
                        checked={surveyData.previousExperience === 'Just me'}
                        onChange={(e) => {
                          setSurveyData({ ...surveyData, previousExperience: e.target.value });
                          setHouseholdNames([]);
                        }}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>Just me</span>
                    </label>
                  </div>

                  {/* 2 people option */}
                  <div>
                    <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.previousExperience === '2 people' ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="previousExperience"
                        value="2 people"
                        checked={surveyData.previousExperience === '2 people'}
                        onChange={(e) => {
                          setSurveyData({ ...surveyData, previousExperience: e.target.value });
                          setHouseholdNames(['']);
                          setTimeout(() => {
                            const element = document.getElementById('household-names-2');
                            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>2 people</span>
                    </label>
                    {surveyData.previousExperience === '2 people' && (
                      <div id="household-names-2" className="mt-3 p-4 rounded-lg" style={{ backgroundColor: '#f0f8f4', border: '2px solid #cfe8d7' }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: '#1f3a33' }}>
                          💡 Also Claim the Voucher for other people in your household whilst they are available - first come first serve!
                        </p>
                        <div className="space-y-3">
                          {householdNames.map((name, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium mb-1" style={{ color: '#1f3a33' }}>
                                Person {index + 2} Full Name
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  const newNames = [...householdNames];
                                  newNames[index] = e.target.value;
                                  setHouseholdNames(newNames);
                                }}
                                className="w-full px-4 py-2 border-2 rounded-lg"
                                style={{ borderColor: '#cfe8d7', color: '#1f3a33' }}
                                placeholder="Enter full name"
                                autoFocus
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setHouseholdNames([...householdNames, ''])}
                            className="px-4 py-2 rounded-lg font-medium text-sm"
                            style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}
                          >
                            + Add More
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3-4 people option */}
                  <div>
                    <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.previousExperience === '3-4 people' ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="previousExperience"
                        value="3-4 people"
                        checked={surveyData.previousExperience === '3-4 people'}
                        onChange={(e) => {
                          setSurveyData({ ...surveyData, previousExperience: e.target.value });
                          setHouseholdNames(['', '', '']);
                          setTimeout(() => {
                            const element = document.getElementById('household-names-3');
                            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>3-4 people</span>
                    </label>
                    {surveyData.previousExperience === '3-4 people' && (
                      <div id="household-names-3" className="mt-3 p-4 rounded-lg" style={{ backgroundColor: '#f0f8f4', border: '2px solid #cfe8d7' }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: '#1f3a33' }}>
                          💡 Also Claim the Voucher for other people in your household whilst they are available - first come first serve!
                        </p>
                        <div className="space-y-3">
                          {householdNames.map((name, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium mb-1" style={{ color: '#1f3a33' }}>
                                Person {index + 2} Full Name
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  const newNames = [...householdNames];
                                  newNames[index] = e.target.value;
                                  setHouseholdNames(newNames);
                                }}
                                className="w-full px-4 py-2 border-2 rounded-lg"
                                style={{ borderColor: '#cfe8d7', color: '#1f3a33' }}
                                placeholder="Enter full name"
                                autoFocus={index === 0}
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setHouseholdNames([...householdNames, ''])}
                            className="px-4 py-2 rounded-lg font-medium text-sm"
                            style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}
                          >
                            + Add More
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5+ people option */}
                  <div>
                    <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: surveyData.previousExperience === '5+ people' ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="previousExperience"
                        value="5+ people"
                        checked={surveyData.previousExperience === '5+ people'}
                        onChange={(e) => {
                          setSurveyData({ ...surveyData, previousExperience: e.target.value });
                          setHouseholdNames(['', '', '', '', '']);
                          setTimeout(() => {
                            const element = document.getElementById('household-names-5');
                            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>5+ people</span>
                    </label>
                    {surveyData.previousExperience === '5+ people' && (
                      <div id="household-names-5" className="mt-3 p-4 rounded-lg" style={{ backgroundColor: '#f0f8f4', border: '2px solid #cfe8d7' }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: '#1f3a33' }}>
                          💡 Also Claim the Voucher for other people in your household whilst they are available - first come first serve!
                        </p>
                        <div className="space-y-3">
                          {householdNames.map((name, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium mb-1" style={{ color: '#1f3a33' }}>
                                Person {index + 2} Full Name
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  const newNames = [...householdNames];
                                  newNames[index] = e.target.value;
                                  setHouseholdNames(newNames);
                                }}
                                className="w-full px-4 py-2 border-2 rounded-lg"
                                style={{ borderColor: '#cfe8d7', color: '#1f3a33' }}
                                placeholder="Enter full name"
                                autoFocus={index === 0}
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setHouseholdNames([...householdNames, ''])}
                            className="px-4 py-2 rounded-lg font-medium text-sm"
                            style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}
                          >
                            + Add More
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1f3a33' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Submit & Enter Prize Draw →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 6: Referral FIRST + Congratulations + Bonus Questions */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            {/* Referral Section - PRIORITY #1 */}
            <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: '#cfe8d7' }}>
              <h3 className="text-2xl font-bold mb-3 text-center" style={{ color: '#1f3a33' }}>
                🎄 Would you be kind enough to share with family, friends and neighbours?
              </h3>
              <p className="text-lg mb-3 text-center" style={{ color: '#1f3a33' }}>
                Give them the chance to win and get a £50 voucher before Christmas!
              </p>
              <p className="text-base mb-4 text-center" style={{ color: '#1f3a33' }}>
                Share your unique link by copy and pasting or posting on your social media:
              </p>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm mb-2 font-semibold" style={{ color: '#1f3a33' }}>Your referral link:</p>
                <p className="text-base font-mono break-all mb-3" style={{ color: '#1f3a33' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}?ref=${customerId}` : 'Loading...'}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const referralLink = `${window.location.origin}?ref=${customerId}`;
                  try {
                    await navigator.clipboard.writeText(referralLink);
                    alert('Copied! Now share to give someone a £50 voucher before Christmas 🎄');
                  } catch (err) {
                    const textArea = document.createElement('textarea');
                    textArea.value = referralLink;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Copied! Now share to give someone a £50 voucher before Christmas 🎄');
                  }
                }}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg mb-4"
                style={{ backgroundColor: '#1f3a33' }}
              >
                📋 Copy & Share Link
              </button>

              {/* Social Media Share Buttons */}
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const referralLink = `${window.location.origin}?ref=${customerId}`;
                    const shareText = `🎄 Get a FREE £50 dental voucher before Christmas! Plus enter to win 1 YEAR of FREE dentistry worth £5,000! 🎁\n\n${referralLink}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#1877f2' }}
                >
                  📘 Facebook
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const referralLink = `${window.location.origin}?ref=${customerId}`;
                    const shareText = `🎄 Get a FREE £50 dental voucher before Christmas! Plus enter to win 1 YEAR of FREE dentistry worth £5,000! 🎁`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#000000' }}
                >
                  𝕏 X
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const referralLink = `${window.location.origin}?ref=${customerId}`;
                    const shareText = `🎄 Get a FREE £50 dental voucher before Christmas! Plus enter to win 1 YEAR of FREE dentistry worth £5,000! 🎁\n\n${referralLink}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                  className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#25d366' }}
                >
                  💬 WhatsApp
                </button>
              </div>

              <p className="text-sm font-semibold text-center" style={{ color: '#1f3a33' }}>
                ⭐ Bonus: Receive +10 extra prize draw entries for every friend who claims their voucher!
              </p>
            </div>

            {/* Congratulations Section - AFTER Referral */}
            <div className="text-center mb-8">
              <div className="inline-block rounded-full p-6 mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-6xl">🎉</span>
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1f3a33' }}>
                Congratulations {formData.name}!
              </h2>
              <p className="text-xl mb-3" style={{ color: '#1f3a33' }}>
                You have now received your £{voucherValue} voucher and been entered into winning a year's worth of FREE dentistry!
              </p>
              <p className="text-lg mb-4" style={{ color: '#666' }}>
                🎁 Worth up to £5,000!
              </p>

              {/* Prize Draw Entries */}
              <div className="rounded-xl p-4 mb-6 inline-block" style={{ backgroundColor: '#fff7e6', border: '2px solid #ffd700' }}>
                <p className="text-xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                  🎟️ You currently have 2 entries in the prize draw
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
                  • 1 entry for claiming your voucher<br/>
                  • 1 entry for answering 5 questions
                </p>
              </div>
            </div>

            {/* Bonus Questions Section */}
            <div className="text-center mb-6 mt-12">
              <span className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-3" style={{ backgroundColor: '#cfe8d7', color: '#1f3a33' }}>
                🔥 BONUS QUESTIONS
              </span>
              <h3 className="text-3xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                Would you be kind enough to answer a few more questions?
              </h3>
              <p className="text-base mb-2" style={{ color: '#666' }}>
                Help us create your perfect dental practice
              </p>
              <div className="rounded-xl p-4 mt-4 mb-2 inline-block" style={{ backgroundColor: '#fff7e6', border: '2px solid #ffd700' }}>
                <p className="text-lg font-bold" style={{ color: '#1f3a33' }}>
                  🎟️ Complete these bonus questions to earn a 3rd entry into the prize draw!
                </p>
              </div>
              <p className="text-xs mt-2" style={{ color: '#999' }}>
                Subject to terms and conditions.
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);

              // Clear localStorage after all questions - allow fresh signups for friends/family
              console.log('✅ Completed all questions - clearing localStorage for fresh signups');
              localStorage.removeItem('smilemoore_customer_id');
              localStorage.removeItem('smilemoore_last_email');

              // Scroll to top FIRST (before state change) for mobile reliability
              window.scrollTo({ top: 0, behavior: 'instant' });

              // Move to next step immediately for instant UX
              setStep(7);
              setIsSubmitting(false);

              // Save extended survey responses in background (fire and forget)
              // Q1-Q5 were already saved in step 5
              fetch('/api/save-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: formData.email,
                  ...extendedSurvey,
                }),
              }).then(() => {
                console.log('✅ Extended survey saved to Google Sheets');
              }).catch((error) => {
                console.error('Survey submission error:', error);
              });
            }} className="space-y-8">
              {/* Question 1 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  1. How would you describe your previous experience with dental practices?
                </label>
                <div className="space-y-3">
                  {[
                    'Mostly positive',
                    'Mixed experiences',
                    'Mostly negative',
                    'I\'ve avoided going for a while',
                    'I feel nervous about dental visits'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.dentalExperience === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="dentalExperience"
                        value={option}
                        checked={extendedSurvey.dentalExperience === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, dentalExperience: e.target.value })}
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
                  2. When thinking about dental care, which factors matter most to you? (Select all that apply)
                </label>
                <div className="space-y-3">
                  {[
                    'Feeling listened to',
                    'Pain-free treatment',
                    'Clear explanations',
                    'Availability of appointments',
                    'Cost transparency',
                    'A calm, modern clinic environment'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.mostImportantFactor.includes(option) ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="checkbox"
                        name="mostImportantFactor"
                        value={option}
                        checked={extendedSurvey.mostImportantFactor.includes(option)}
                        onChange={(e) => {
                          const updatedFactors = e.target.checked
                            ? [...extendedSurvey.mostImportantFactor, option]
                            : extendedSurvey.mostImportantFactor.filter(f => f !== option);
                          setExtendedSurvey({ ...extendedSurvey, mostImportantFactor: updatedFactors });
                        }}
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
                  3. How confident do you currently feel about your smile?
                </label>
                <div className="space-y-3">
                  {[
                    'Very confident',
                    'Mostly confident',
                    'A little self-conscious',
                    'Not confident',
                    'I\'d like help improving it'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.smileConfidence === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="smileConfidence"
                        value={option}
                        checked={extendedSurvey.smileConfidence === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, smileConfidence: e.target.value })}
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
                  4. How important is seeing the same clinician each time?
                </label>
                <div className="space-y-3">
                  {[
                    'Essential',
                    'Preferable',
                    'Not important',
                    'Depends on the treatment'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.sameClinician === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="sameClinician"
                        value={option}
                        checked={extendedSurvey.sameClinician === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, sameClinician: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  5. What types of treatments do you think you may need in the next year?
                  <span className="block text-sm font-normal mt-1" style={{ color: '#666' }}>(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {[
                    'Hygienist visits',
                    'Check-ups',
                    'Whitening',
                    'Composite bonding / veneers',
                    'Teeth straightening (e.g., aligners)',
                    'Fillings / crowns / restorative work',
                    'Not sure — I need guidance'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.neededTreatments.includes(option) ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={extendedSurvey.neededTreatments.includes(option)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setExtendedSurvey({ ...extendedSurvey, neededTreatments: [...extendedSurvey.neededTreatments, value] });
                          } else {
                            setExtendedSurvey({ ...extendedSurvey, neededTreatments: extendedSurvey.neededTreatments.filter(t => t !== value) });
                          }
                        }}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 6 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  6. How do you usually feel before a dental appointment?
                </label>
                <div className="space-y-3">
                  {[
                    'Relaxed',
                    'Neutral',
                    'Slightly anxious',
                    'Very anxious',
                    'I often delay or avoid going'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.beforeAppointment === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="beforeAppointment"
                        value={option}
                        checked={extendedSurvey.beforeAppointment === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, beforeAppointment: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 7 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  7. What would make you more likely to stay with a dental practice long-term?
                </label>
                <div className="space-y-3">
                  {[
                    'Consistency of clinician',
                    'Clear pricing & no surprises',
                    'Flexible appointment times',
                    'Gentle, patient-focused approach',
                    'Quick availability',
                    'Modern technology & facilities'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.stayLongTerm.includes(option) ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="checkbox"
                        name="stayLongTerm"
                        value={option}
                        checked={extendedSurvey.stayLongTerm.includes(option)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setExtendedSurvey({
                            ...extendedSurvey,
                            stayLongTerm: e.target.checked
                              ? [...extendedSurvey.stayLongTerm, value]
                              : extendedSurvey.stayLongTerm.filter(item => item !== value)
                          });
                        }}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 8 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  8. What prevents you from attending the dentist as often as you'd like?
                </label>
                <div className="space-y-3">
                  {[
                    'Cost',
                    'Time / busy schedule',
                    'Anxiety',
                    'Difficulty getting appointments',
                    'Not had a practice I felt comfortable with',
                    'Nothing stops me'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.preventingVisits === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="preventingVisits"
                        value={option}
                        checked={extendedSurvey.preventingVisits === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, preventingVisits: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 9 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  9. How important is it that your dental practice offers cosmetic options?
                </label>
                <div className="space-y-3">
                  {[
                    'Very important',
                    'Somewhat important',
                    'Neutral',
                    'Not important',
                    'Unsure'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.cosmeticImportance === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="cosmeticImportance"
                        value={option}
                        checked={extendedSurvey.cosmeticImportance === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, cosmeticImportance: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 10 */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  10. How do you prefer to receive updates or reminders?
                </label>
                <div className="space-y-3">
                  {[
                    'WhatsApp',
                    'Email',
                    'Text message',
                    'Phone call',
                    'No preference'
                  ].map((option) => (
                    <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderColor: extendedSurvey.preferredContact === option ? '#1f3a33' : '#cfe8d7' }}>
                      <input
                        type="radio"
                        name="preferredContact"
                        value={option}
                        checked={extendedSurvey.preferredContact === option}
                        onChange={(e) => setExtendedSurvey({ ...extendedSurvey, preferredContact: e.target.value })}
                        required
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-base" style={{ color: '#1f3a33' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Feedback */}
              <div className="text-left">
                <label className="block text-lg font-semibold mb-4" style={{ color: '#1f3a33' }}>
                  Anything else you'd like us to know? (Optional)
                </label>
                <textarea
                  value={extendedSurvey.additionalFeedback}
                  onChange={(e) => setExtendedSurvey({ ...extendedSurvey, additionalFeedback: e.target.value })}
                  className="w-full px-6 py-4 text-base border-2 rounded-xl focus:ring-4 transition-all"
                  style={{ borderColor: '#cfe8d7', outlineColor: '#cfe8d7' }}
                  placeholder="Share any thoughts, preferences, or concerns..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1f3a33' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Complete Survey & Confirm Entry →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 7: Final Thank You & Share Again */}
        {step === 7 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="inline-block rounded-full p-6 mb-4" style={{ backgroundColor: '#cfe8d7' }}>
                <span className="text-6xl">🙏</span>
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1f3a33' }}>
                Thank You {formData.name}!
              </h2>
              <p className="text-xl mb-4" style={{ color: '#1f3a33' }}>
                Your feedback is invaluable in helping us create the perfect dental practice for you.
              </p>

              {/* Final Prize Draw Count */}
              <div className="rounded-xl p-4 mb-6 inline-block" style={{ backgroundColor: '#fff7e6', border: '2px solid #ffd700' }}>
                <p className="text-2xl font-bold mb-2" style={{ color: '#1f3a33' }}>
                  🎟️ You now have 3 entries in the prize draw!
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
                  • 1 entry for claiming your voucher<br/>
                  • 1 entry for answering 5 questions<br/>
                  • 1 entry for completing bonus questions
                </p>
              </div>
            </div>

            {/* Share Again Section */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#cfe8d7' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1f3a33' }}>
                🎄 One More Thing... Share Again?
              </h3>
              <p className="text-lg mb-3" style={{ color: '#1f3a33' }}>
                Know anyone else who'd love a £50 voucher before Christmas?
              </p>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm mb-2 font-semibold" style={{ color: '#1f3a33' }}>Your referral link:</p>
                <p className="text-base font-mono break-all mb-3" style={{ color: '#1f3a33' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}?ref=${customerId}` : 'Loading...'}
                </p>
              </div>

              <button
                onClick={async () => {
                  const referralLink = `${window.location.origin}?ref=${customerId}`;
                  try {
                    await navigator.clipboard.writeText(referralLink);
                    alert('Copied! Share to give more people a £50 voucher 🎄');
                  } catch (err) {
                    const textArea = document.createElement('textarea');
                    textArea.value = referralLink;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Copied! Share to give more people a £50 voucher 🎄');
                  }
                }}
                className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg mb-3"
                style={{ backgroundColor: '#1f3a33' }}
              >
                📋 Copy & Share Link
              </button>

              {/* Social Media Share Buttons */}
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const referralLink = `${window.location.origin}?ref=${customerId}`;
                    const shareText = `🎄 Get a FREE £50 dental voucher before Christmas! Plus enter to win 1 YEAR of FREE dentistry worth £5,000! 🎁\n\n${referralLink}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#1877f2' }}
                >
                  📘 Facebook
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const referralLink = `${window.location.origin}?ref=${customerId}`;
                    const shareText = `🎄 Get a FREE £50 dental voucher before Christmas! Plus enter to win 1 YEAR of FREE dentistry worth £5,000! 🎁`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#000000' }}
                >
                  𝕏 X
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const referralLink = `${window.location.origin}?ref=${customerId}`;
                    const shareText = `🎄 Get a FREE £50 dental voucher before Christmas! Plus enter to win 1 YEAR of FREE dentistry worth £5,000! 🎁\n\n${referralLink}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                  className="w-full text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#25d366' }}
                >
                  💬 WhatsApp
                </button>
              </div>

              <p className="text-sm font-semibold" style={{ color: '#1f3a33' }}>
                ⭐ +10 extra entries for every friend who claims!
              </p>
            </div>

            <p className="text-sm text-center" style={{ color: '#999' }}>
              <a
                href="/terms"
                className="underline hover:text-gray-700"
                onClick={() => {
                  fetch('/api/track-tc-click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId, location: 'success_page' }),
                  }).catch(console.error);
                }}
              >Terms and Conditions</a>
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
