'use client';

import { useState } from 'react';

export default function MailchimpSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/mailchimp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="p-8 rounded-lg" style={{ backgroundColor: '#cfe8d7' }}>
      <h3 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>Stay Updated</h3>
      <p className="mb-4" style={{ color: '#1f3a33' }}>
        Subscribe to our newsletter for dental tips and special offers
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
          style={{ borderColor: '#cfe8d7', outlineColor: '#70d490', color: '#1f3a33' }}
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
          style={{ backgroundColor: '#1f3a33' }}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
        {message && (
          <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
