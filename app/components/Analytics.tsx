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

      {/* Multi-Platform Tracking Cookie Creators */}
      <Script id="tracking-cookies-fallback" strategy="afterInteractive">
        {`
          // Wait 2 seconds for pixels to load
          setTimeout(function() {
            var timestamp = Date.now();
            var expires = new Date();
            expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
            var cookieDomain = ';path=/;domain=.' + window.location.hostname + ';SameSite=Lax';

            // Helper function to check if cookie exists
            function hasCookie(name) {
              return document.cookie.split(';').some(function(c) {
                return c.trim().startsWith(name + '=');
              });
            }

            // Facebook _fbp cookie
            if (!hasCookie('_fbp')) {
              var fbpValue = 'fb.1.' + timestamp + '.' + Math.floor(Math.random() * 10000000000);
              document.cookie = '_fbp=' + fbpValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('✅ Created Facebook _fbp:', fbpValue);
            }

            // TikTok _ttp cookie
            if (!hasCookie('_ttp')) {
              var ttpValue = timestamp.toString(36) + Math.random().toString(36).substr(2);
              document.cookie = '_ttp=' + ttpValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('✅ Created TikTok _ttp:', ttpValue);
            }

            // TikTok _tta cookie (TikTok Attribution)
            if (!hasCookie('_tta')) {
              var ttaValue = 'tta.' + timestamp + '.' + Math.random().toString(36).substr(2, 10);
              document.cookie = '_tta=' + ttaValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('✅ Created TikTok _tta:', ttaValue);
            }

            // LinkedIn li_fat_id cookie
            if (!hasCookie('li_fat_id')) {
              var liFatValue = timestamp.toString(16) + '-' + Math.random().toString(16).substr(2, 8);
              document.cookie = 'li_fat_id=' + liFatValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('✅ Created LinkedIn li_fat_id:', liFatValue);
            }

            // Microsoft/Bing MUID cookie
            if (!hasCookie('MUID')) {
              var muidValue = 'MUID' + timestamp.toString(16).toUpperCase();
              document.cookie = 'MUID=' + muidValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('✅ Created Microsoft MUID:', muidValue);
            }

            // Twitter/X muc_ads cookie
            if (!hasCookie('muc_ads')) {
              var mucValue = timestamp.toString(36) + '-' + Math.random().toString(36).substr(2, 16);
              document.cookie = 'muc_ads=' + mucValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('✅ Created Twitter/X muc_ads:', mucValue);
            }

            console.log('🎯 All tracking cookies initialized for retargeting!');
          }, 2000);
        `}
      </Script>
    </>
  );
}
