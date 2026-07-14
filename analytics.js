// First-party analytics loader. Visual dependencies are self-hosted; Google
// Analytics is the only third-party runtime script and respects privacy signals.
(function () {
  'use strict';

  const measurementId = 'G-V36RT068VK';
  const privacySignalEnabled =
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1';

  if (privacySignalEnabled) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}());
