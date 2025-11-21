'use client';

import Script from 'next/script';

export default function Analytics() {
  return (
    <>
      {/* Google Tag Manager */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MN6GXKS4');
        `}
      </Script>

      {/* Google Analytics 4 - Direct Implementation */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-F6CLY0PVY0"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-F6CLY0PVY0');
        `}
      </Script>

      {/* Facebook Pixel - Load ONLY if GTM hasn't loaded it yet */}
      <Script id="facebook-pixel-conditional" strategy="lazyOnload">
        {`
          // Wait 3 seconds to let GTM load Facebook Pixel first
          setTimeout(function() {
            // Only initialize if GTM hasn't already loaded fbq
            if (typeof fbq === 'undefined') {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2396693024117840');
              fbq('track', 'PageView');
              console.log('✅ Facebook Pixel loaded directly (GTM not detected)');
            } else {
              console.log('✅ Facebook Pixel already loaded by GTM');
            }
          }, 3000);
        `}
      </Script>
    </>
  );
}
