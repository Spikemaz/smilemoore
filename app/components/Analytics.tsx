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

      {/* TikTok Pixel */}
      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            // Replace with your TikTok Pixel ID when available
            // ttq.load('YOUR_TIKTOK_PIXEL_ID');
            // ttq.page();
          }(window, document, 'ttq');
        `}
      </Script>

      {/* LinkedIn Insight Tag */}
      <Script id="linkedin-insight" strategy="afterInteractive">
        {`
          _linkedin_partner_id = "YOUR_LINKEDIN_PARTNER_ID";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}
      </Script>

      {/* Microsoft UET Tag */}
      <Script id="microsoft-uet" strategy="afterInteractive">
        {`
          (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"YOUR_MICROSOFT_UET_TAG_ID"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
        `}
      </Script>

      {/* Twitter/X Pixel */}
      <Script id="twitter-pixel" strategy="afterInteractive">
        {`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          // Replace with your Twitter Pixel ID when available
          // twq('config','YOUR_TWITTER_PIXEL_ID');
        `}
      </Script>

      {/* Multi-Platform Tracking Cookie Creators - FALLBACK ONLY */}
      <Script id="tracking-cookies-fallback" strategy="afterInteractive">
        {`
          // Wait 3 seconds for real pixels to load first
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

            var fallbacksCreated = 0;

            // Facebook _fbp cookie (fallback)
            if (!hasCookie('_fbp')) {
              var fbpValue = 'fb.1.' + timestamp + '.' + Math.floor(Math.random() * 10000000000);
              document.cookie = '_fbp=' + fbpValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('⚠️ Fallback: Created Facebook _fbp:', fbpValue);
              fallbacksCreated++;
            }

            // TikTok _ttp cookie (fallback)
            if (!hasCookie('_ttp')) {
              var ttpValue = timestamp.toString(36) + Math.random().toString(36).substr(2);
              document.cookie = '_ttp=' + ttpValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('⚠️ Fallback: Created TikTok _ttp:', ttpValue);
              fallbacksCreated++;
            }

            // TikTok _tta cookie (fallback)
            if (!hasCookie('_tta')) {
              var ttaValue = 'tta.' + timestamp + '.' + Math.random().toString(36).substr(2, 10);
              document.cookie = '_tta=' + ttaValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('⚠️ Fallback: Created TikTok _tta:', ttaValue);
              fallbacksCreated++;
            }

            // LinkedIn li_fat_id cookie (fallback)
            if (!hasCookie('li_fat_id')) {
              var liFatValue = timestamp.toString(16) + '-' + Math.random().toString(16).substr(2, 8);
              document.cookie = 'li_fat_id=' + liFatValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('⚠️ Fallback: Created LinkedIn li_fat_id:', liFatValue);
              fallbacksCreated++;
            }

            // Microsoft/Bing MUID cookie (fallback)
            if (!hasCookie('MUID')) {
              var muidValue = 'MUID' + timestamp.toString(16).toUpperCase();
              document.cookie = 'MUID=' + muidValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('⚠️ Fallback: Created Microsoft MUID:', muidValue);
              fallbacksCreated++;
            }

            // Twitter/X muc_ads cookie (fallback)
            if (!hasCookie('muc_ads')) {
              var mucValue = timestamp.toString(36) + '-' + Math.random().toString(36).substr(2, 16);
              document.cookie = 'muc_ads=' + mucValue + ';expires=' + expires.toUTCString() + cookieDomain;
              console.log('⚠️ Fallback: Created Twitter/X muc_ads:', mucValue);
              fallbacksCreated++;
            }

            if (fallbacksCreated > 0) {
              console.log('⚠️ ' + fallbacksCreated + ' fallback cookies created. Real pixel IDs preferred for retargeting!');
            } else {
              console.log('✅ All platform pixels loaded successfully - no fallbacks needed!');
            }
          }, 3000);
        `}
      </Script>
    </>
  );
}
