"use client";

import Script from "next/script";
import { useEffect } from "react";

import { initTracking, trackPageView } from "@/lib/tracking/events";
import type { TrackingConfigPublic } from "@/lib/tracking/types";
import { captureAttribution } from "@/lib/tracking/utm";

type TrackingScriptsProps = {
  config: TrackingConfigPublic;
  customHeadScript?: string | null;
  customBodyScript?: string | null;
};

export function TrackingScripts({ config, customHeadScript, customBodyScript }: TrackingScriptsProps) {
  useEffect(() => {
    initTracking(config);
    captureAttribution();
    trackPageView();
  }, [config]);

  return (
    <>
      {config.gtmId ? (
        <>
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${config.gtmId}');`
            }}
          />
        </>
      ) : null}

      {config.ga4MeasurementId && !config.gtmId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${config.ga4MeasurementId}',{send_page_view:false});${
                config.googleAdsConversionId
                  ? `gtag('config','${config.googleAdsConversionId}');`
                  : ""
              }`
            }}
          />
        </>
      ) : null}

      {config.metaPixelId ? (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${config.metaPixelId}');
fbq('track', 'PageView');`
          }}
        />
      ) : null}

      {config.tiktokPixelId ? (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${config.tiktokPixelId}');
ttq.page();
}(window, document, 'ttq');`
          }}
        />
      ) : null}

      {customHeadScript ? (
        <Script
          id="custom-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: customHeadScript }}
        />
      ) : null}

      {customBodyScript ? (
        <Script
          id="custom-body"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: customBodyScript }}
        />
      ) : null}

      {config.gtmId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${config.gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="GTM noscript"
          />
        </noscript>
      ) : null}
    </>
  );
}
