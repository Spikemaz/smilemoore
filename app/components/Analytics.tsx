'use client';

import Script from 'next/script';

export default function Analytics() {
  return (
    <>
      {/*
        Google Tag Manager - Handles ALL platform pixels:
        - Facebook Pixel
        - Google Analytics 4 (GA4)
        - Microsoft UET Tag (Bing Ads)
        - TikTok Pixel

        Configure these in GTM at: https://tagmanager.google.com/
        Container: GTM-MN6GXKS4
      */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MN6GXKS4');
        `}
      </Script>
    </>
  );
}
