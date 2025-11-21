'use client';

import Script from 'next/script';

export default function Analytics() {
  return (
    <>
      {/* Google Tag Manager - Handles Facebook Pixel & GA4 */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MN6GXKS4');
        `}
      </Script>

      {/* Manual _fbp cookie creator (fallback if Facebook Pixel doesn't create it) */}
      <Script id="fbp-cookie-fallback" strategy="afterInteractive">
        {`
          // Wait 2 seconds for Facebook Pixel to create _fbp cookie
          setTimeout(function() {
            // Check if _fbp cookie exists
            var hasFbp = document.cookie.split(';').some(function(c) {
              return c.trim().startsWith('_fbp=');
            });

            // If Facebook Pixel didn't create it, create it manually
            if (!hasFbp) {
              var timestamp = Date.now();
              var randomNum = Math.floor(Math.random() * 10000000000);
              var fbpValue = 'fb.1.' + timestamp + '.' + randomNum;

              // Set cookie for 90 days (same as Facebook's default)
              var expires = new Date();
              expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000));
              document.cookie = '_fbp=' + fbpValue + ';expires=' + expires.toUTCString() + ';path=/;domain=.' + window.location.hostname + ';SameSite=Lax';

              console.log('✅ Manually created _fbp cookie:', fbpValue);
            } else {
              console.log('✅ Facebook Pixel created _fbp cookie automatically');
            }
          }, 2000);
        `}
      </Script>
    </>
  );
}
