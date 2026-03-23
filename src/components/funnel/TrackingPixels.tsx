"use client";

import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

interface TrackingPixelsProps {
  fbPixelId?: string;
  tiktokPixelId?: string;
  ga4MeasurementId?: string;
  cursivePixelId?: string;
}

export function TrackingPixels({ fbPixelId, tiktokPixelId, ga4MeasurementId, cursivePixelId }: TrackingPixelsProps) {
  return (
    <>
      {/* Cursive SuperPixel */}
      {cursivePixelId && (
        <Script
          id="cursive-pixel"
          strategy="afterInteractive"
          src={`https://t.meetcursive.com/pixel/${cursivePixelId}`}
        />
      )}

      {/* Facebook Pixel */}
      {fbPixelId && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
              n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
              s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
              (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${fbPixelId}');
              fbq('track','PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script id="tt-pixel" strategy="afterInteractive">
          {`
            !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off",
            "once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer=function(t,e){t[e]=function(){
            t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)
            ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i=
            "https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};
            ttq._i[e]=[];ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};
            ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";
            o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];
            a.parentNode.insertBefore(o,a)};
            ttq.load('${tiktokPixelId}');
            ttq.page();
          }(window,document,'ttq');
          `}
        </Script>
      )}

      {/* GA4 */}
      {ga4MeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4MeasurementId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}

// Fire conversion events from funnel steps
export function fireConversionEvent(tracking?: { fbPixelId?: string; tiktokPixelId?: string; ga4MeasurementId?: string }) {
  if (!tracking) return;

  if (tracking.fbPixelId && window.fbq) {
    window.fbq("track", "Lead");
  }
  if (tracking.tiktokPixelId && window.ttq) {
    window.ttq.track("SubmitForm");
  }
  if (tracking.ga4MeasurementId && window.gtag) {
    window.gtag("event", "generate_lead");
  }
}

// Fire quiz start event
export function fireQuizStartEvent(tracking?: { fbPixelId?: string; tiktokPixelId?: string; ga4MeasurementId?: string }) {
  if (!tracking) return;

  if (tracking.fbPixelId && window.fbq) {
    window.fbq("track", "ViewContent", { content_name: "Quiz Started" });
  }
  if (tracking.tiktokPixelId && window.ttq) {
    window.ttq.track("ViewContent");
  }
  if (tracking.ga4MeasurementId && window.gtag) {
    window.gtag("event", "quiz_start");
  }
}
