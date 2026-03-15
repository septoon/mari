import { Suspense } from 'react';
import Script from 'next/script';

import { YandexMetrikaPageTracker } from '@/components/analytics/yandex-metrika-page-tracker';

export function YandexMetrika({ metrikaId }: { metrikaId?: number }) {
  if (!metrikaId) {
    return null;
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`window.__YANDEX_METRIKA_ID__ = ${metrikaId};
window.dataLayer = window.dataLayer || [];
(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${metrikaId}', 'ym');

ym(${metrikaId}, 'init', {
    defer: true,
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true
});`}
      </Script>

      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${metrikaId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>

      <Suspense fallback={null}>
        <YandexMetrikaPageTracker />
      </Suspense>
    </>
  );
}
