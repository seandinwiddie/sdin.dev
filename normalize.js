// Canonical-host normalization for portable static hosting.
// Server-level redirects remain preferable; local and preview hosts are untouched.
(function () {
  'use strict';

  const canonicalHost = 'sdin.dev';
  const productionHosts = new Set([canonicalHost, `www.${canonicalHost}`]);

  const shouldNormalize = ({ protocol, hostname }) =>
    productionHosts.has(hostname) &&
    (protocol !== 'https:' || hostname !== canonicalHost);

  const toCanonicalUrl = ({ pathname, search, hash }) =>
    `https://${canonicalHost}${pathname}${search}${hash}`;

  if (shouldNormalize(window.location)) {
    window.location.replace(toCanonicalUrl(window.location));
  }
}());
