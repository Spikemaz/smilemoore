'use client';

import { useState, useEffect } from 'react';

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

  // Simulate countdown during form filling
  useEffect(() => {
    if (step >= 2 && step <= 4 && vouchersRemaining > 1) {
      const interval = setInterval(() => {
        setVouchersRemaining((prev) => {
          const shouldDecrease = Math.random() > 0.7;
          return shouldDecrease ? Math.max(1, prev - 1) : prev;
        });
      }, 8000 + Math.random() * 12000);

      return () => clearInterval(interval);
    }
  }, [step, vouchersRemaining]);

  const getProgress = () => {
    switch (step) {
      case 1: return 0;
      case 2: return 25;
      case 3: return 50;
      case 4: return 75;
      case 5: return 100;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 4) {
      // Submit to Google Sheets
      try {
        const response = await fetch('/api/submit-voucher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setStep(5);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          alert('Failed to submit. Please try again.');
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit. Please try again.');
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Voucher Counter Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 text-center font-bold">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="text-2xl animate-pulse">🔥</span>
          <span>Only {vouchersRemaining} £{voucherValue} Vouchers Remaining!</span>
          <span className="text-2xl animate-pulse">🔥</span>
        </div>
      </div>

      {/* Progress Bar */}
      {step <= 4 && (
        <div className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Step {step} of 4
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {getProgress()}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Step 1: Email */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                ✓ LIMITED TIME OFFER
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Claim Your <span className="text-blue-600">£{voucherValue} Voucher</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              New patient special - Valid for dental treatments
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-3">
                  Enter your email to claim your voucher
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Claim My £{voucherValue} Voucher →
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>No spam</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>Instant claim</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              127 people claimed their voucher today
            </p>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Great! Your voucher is reserved
              </h2>
              <p className="text-lg text-gray-600">
                Let's personalize your voucher...
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-3">
                  What's your full name?
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="John Smith"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Thanks, {formData.name}!
              </h2>
              <p className="text-lg text-gray-600">
                We'll send your voucher via SMS and email
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="phone" className="block text-lg font-semibold text-gray-700 mb-3">
                  What's your phone number?
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="07XXX XXXXXX"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  We'll text you the voucher code instantly
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
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
              <div className="inline-block bg-yellow-100 p-4 rounded-full mb-4">
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Final Step to Unlock Your Voucher
              </h2>
              <p className="text-lg text-gray-600">
                Where should we send your welcome pack?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="address" className="block text-lg font-semibold text-gray-700 mb-3">
                  Your postcode
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="SW1A 1AA"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  We'll mail you a physical voucher card
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-5 rounded-xl text-xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg animate-pulse"
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
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
              <div className="mb-6">
                <div className="inline-block bg-white rounded-full p-6 mb-4 animate-bounce">
                  <span className="text-6xl">🎉</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Congratulations, {formData.name}!
                </h2>
                <p className="text-2xl mb-6">
                  Your £{voucherValue} voucher is confirmed!
                </p>
                <div className="bg-white/20 backdrop-blur rounded-xl p-6 inline-block">
                  <p className="text-lg mb-2">Check your phone for:</p>
                  <div className="text-3xl font-mono font-bold tracking-wider">
                    SMILE50
                  </div>
                </div>
              </div>
            </div>

            {/* Bonus Questionnaire */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
              <div className="mb-6">
                <span className="inline-block bg-yellow-400 text-purple-900 px-6 py-3 rounded-full text-sm font-bold mb-4 animate-pulse">
                  ⭐ EXCLUSIVE BONUS OPPORTUNITY ⭐
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Win 1 Year of FREE Dentistry!
              </h3>
              <p className="text-xl mb-2">
                Worth over <span className="text-yellow-400 font-bold text-3xl">£2,000</span>
              </p>
              <p className="text-lg mb-8 opacity-90">
                You're already qualified! Just answer 4 quick questions to enter the draw
              </p>

              <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-8">
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
                className="w-full bg-yellow-400 text-purple-900 px-8 py-5 rounded-xl text-xl font-bold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg mb-4"
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

      {/* Trust Signals Footer */}
      {step <= 4 && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <p className="font-semibold text-gray-700">Secure & Private</p>
              <p className="text-sm text-gray-500">Your data is protected</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">⚡</span>
              <p className="font-semibold text-gray-700">Instant Voucher</p>
              <p className="text-sm text-gray-500">Receive code via SMS</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">⭐</span>
              <p className="font-semibold text-gray-700">No Hidden Fees</p>
              <p className="text-sm text-gray-500">Valid on any treatment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
