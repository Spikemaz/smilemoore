// Centralized email configuration
// All email addresses and settings should be configured here

export const EMAIL_CONFIG = {
  // Sender email for transactional emails (vouchers, confirmations)
  fromEmail: process.env.EMAIL_FROM || 'reception@smilemoore.co.uk',
  fromName: process.env.EMAIL_FROM_NAME || 'Smile Moore Reception',

  // Reply-to email for customer responses
  replyTo: process.env.EMAIL_REPLY_TO || 'reception@smilemoore.co.uk',

  // Admin email for error alerts
  adminEmail: process.env.ADMIN_EMAIL || 'info@smilemoore.co.uk',

  // Contact email shown to customers
  contactEmail: process.env.CONTACT_EMAIL || 'reception@smilemoore.co.uk',

  // Base URL for links in emails
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk',
};

// Helper to get formatted "from" address
export function getFromAddress(customName?: string): string {
  const name = customName || EMAIL_CONFIG.fromName;
  return `${name} <${EMAIL_CONFIG.fromEmail}>`;
}

// Google Sheets configuration
export const SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY',
};
