// sdin.dev shared conversion tracking — pure functions over gtag.
const createConversionEvent = (category, label, leadScore = 0) => ({
  event_category: category,
  event_label: label,
  lead_score: leadScore,
  custom_parameter_1: 'conversion_tracked'
});

const trackConversion = (eventName, category, label, leadScore = 0) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, createConversionEvent(category, label, leadScore));
  }
};

const trackEmailClick = (emailAddress = 'email_link') =>
  trackConversion('email_click', 'Lead Generation', emailAddress, 8);
const trackPhoneCall = (phoneNumber = 'phone_link') =>
  trackConversion('phone_call_click', 'Lead Generation', phoneNumber, 15);
const trackServicePageView = (serviceName) =>
  trackConversion('service_page_view', 'Interest', serviceName, 5);

// Map a pathname to a human-readable service name.
const servicePageNames = {
  '/ai/': 'AI Development Services',
  '/coaching/': 'Coaching Services',
  '/automation/': 'Automation Services',
  '/': 'Homepage'
};
const servicePageName = (path) =>
  servicePageNames[path] ||
  (Object.entries(servicePageNames).find(([p]) => p !== '/' && path.includes(p)) || [null, 'Site'])[1];

const initTracking = () => {
  trackServicePageView(servicePageName(window.location.pathname));

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) =>
    link.addEventListener('click', () => trackEmailClick(link.getAttribute('href') || 'email_link')));

  document.querySelectorAll('a[href^="tel:"]').forEach((link) =>
    link.addEventListener('click', () => trackPhoneCall(link.getAttribute('href') || 'phone_link')));

  // Scroll-depth milestones
  let maxScroll = 0;
  const thresholds = [25, 50, 75, 90];
  const tracked = new Set();
  window.addEventListener('scroll', () => {
    const denom = document.body.scrollHeight - window.innerHeight;
    if (denom <= 0) return;
    const pct = Math.round((window.scrollY / denom) * 100);
    if (pct > maxScroll) {
      maxScroll = pct;
      thresholds.forEach((t) => {
        if (pct >= t && !tracked.has(t)) {
          tracked.add(t);
          trackConversion('scroll_depth', 'Engagement', `${t}%`, t);
        }
      });
    }
  }, { passive: true });

  // Time on page (only if engaged > 30s)
  const start = Date.now();
  window.addEventListener('beforeunload', () => {
    const secs = Math.round((Date.now() - start) / 1000);
    if (secs > 30) trackConversion('time_on_page', 'Engagement', `${secs}s`, Math.min(secs / 10, 10));
  });

  // Outbound link clicks
  document
    .querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])')
    .forEach((link) =>
      link.addEventListener('click', () =>
        trackConversion('external_link_click', 'Engagement', link.getAttribute('href'), 2)));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTracking);
} else {
  initTracking();
}
