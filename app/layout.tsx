import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "./components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smile Moore Dental Practice",
  description: "Professional dental care and cosmetic dentistry services",
  openGraph: {
    title: "Claim Your £50 Dental Voucher - Smile Moore",
    description: "Your friend shared this exclusive £50 voucher with you! Limited vouchers remaining - claim yours now.",
    url: "https://smilemoore.co.uk",
    siteName: "Smile Moore Dental Practice",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Smile Moore - Get Your FREE £50 Voucher Plus Win 1 Year of FREE Dentistry Worth £5,000",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claim Your £50 Dental Voucher - Smile Moore",
    description: "Your friend shared this exclusive £50 voucher with you! Limited vouchers remaining - claim yours now.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'Smile Moore',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Analytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MN6GXKS4"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
