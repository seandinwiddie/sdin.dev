import { pageUrl, site } from './site-manifest.mjs';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const safeJson = (value) => JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');

const personEntity = (origin) => ({
  '@type': 'Person',
  '@id': `${origin}/#person`,
  name: site.author,
  url: `${origin}/`,
  image: {
    '@type': 'ImageObject',
    '@id': `${origin}/#profile-image`,
    url: `${origin}/profile.png`,
    width: 128,
    height: 128,
  },
  description: site.personDescription,
  jobTitle: 'Remote Software Developer and Consultant',
  knowsAbout: [
    'React',
    'Redux Toolkit',
    'TypeScript',
    'Functional Programming',
    'AI Systems Architecture',
    'Business Automation',
  ],
  sameAs: [...site.socialProfiles],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phoneSchema,
    contactType: 'Business',
    email: site.email,
  },
});

const websiteEntity = (origin) => ({
  '@type': 'WebSite',
  '@id': `${origin}/#website`,
  url: `${origin}/`,
  name: site.name,
  description: 'Remote React, Redux Toolkit, TypeScript, AI systems, and automation development by Sean Dinwiddie.',
  inLanguage: site.language,
  publisher: { '@id': `${origin}/#person` },
});

const imageEntity = (origin) => ({
  '@type': 'ImageObject',
  '@id': `${origin}/#social-image`,
  url: `${origin}${site.imagePath}`,
  width: 1200,
  height: 630,
  caption: site.imageAlt,
});

const serviceEntity = (origin, definition) => {
  if (!definition.service) return null;
  const url = pageUrl(origin, definition.route);
  const offers = definition.service.offers;
  const normalizeOffer = (offer) => ({ ...offer, url });
  const normalizedOffers = Array.isArray(offers)
    ? offers.map(normalizeOffer)
    : offers
      ? { ...offers, offers: offers.offers?.map(normalizeOffer) }
      : undefined;

  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: definition.service.name,
    description: definition.service.description,
    url,
    serviceType: definition.service.serviceType,
    areaServed: 'Worldwide',
    provider: { '@id': `${origin}/#person` },
    ...(normalizedOffers ? { offers: normalizedOffers } : {}),
  };
};

const breadcrumbEntity = (origin, definition) => {
  if (definition.route === '/') return null;
  const url = pageUrl(origin, definition.route);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: definition.title.split('|')[0].trim(), item: url },
    ],
  };
};

export const schemaGraph = (origin, definition) => {
  const url = pageUrl(origin, definition.route);
  const service = serviceEntity(origin, definition);
  const breadcrumb = breadcrumbEntity(origin, definition);
  const webPage = {
    '@type': definition.schemaType,
    '@id': `${url}#webpage`,
    url,
    name: definition.title,
    description: definition.description,
    inLanguage: site.language,
    isPartOf: { '@id': `${origin}/#website` },
    primaryImageOfPage: { '@id': `${origin}/#social-image` },
    ...(breadcrumb ? { breadcrumb: { '@id': breadcrumb['@id'] } } : {}),
    ...(definition.schemaType === 'ProfilePage'
      ? { mainEntity: { '@id': `${origin}/#person` } }
      : service
        ? { mainEntity: { '@id': service['@id'] } }
        : { about: { '@id': `${origin}/#website` } }),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      personEntity(origin),
      websiteEntity(origin),
      imageEntity(origin),
      webPage,
      ...(service ? [service] : []),
      ...(breadcrumb ? [breadcrumb] : []),
    ],
  };
};

export const renderSeoBlock = (origin, definition) => {
  const url = pageUrl(origin, definition.route);
  const imageUrl = `${origin}${site.imagePath}`;
  return `<!-- GENERATED:SEO:START -->
    <title>${escapeHtml(definition.title)}</title>
    <meta name="description" content="${escapeHtml(definition.description)}">
    <meta name="author" content="${escapeHtml(site.author)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${escapeHtml(url)}">

    <meta property="og:type" content="${escapeHtml(definition.ogType)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:title" content="${escapeHtml(definition.title)}">
    <meta property="og:description" content="${escapeHtml(definition.description)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(site.imageAlt)}">
    <meta property="og:site_name" content="${escapeHtml(site.name)}">
    <meta property="og:locale" content="en_US">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${escapeHtml(url)}">
    <meta name="twitter:title" content="${escapeHtml(definition.title)}">
    <meta name="twitter:description" content="${escapeHtml(definition.description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <meta name="twitter:image:alt" content="${escapeHtml(site.imageAlt)}">
    <meta name="twitter:site" content="@seandinwiddie">
    <meta name="twitter:creator" content="@seandinwiddie">

    <meta name="theme-color" content="#1f2430">
    <meta name="msapplication-TileColor" content="#1f2430">
    <script type="application/ld+json">
${safeJson(schemaGraph(origin, definition))}
    </script>
    <!-- GENERATED:SEO:END -->`;
};

export const renderRedirectBlock = (origin, redirect) => `<!-- GENERATED:REDIRECT:START -->
  <title>Page moved | ${escapeHtml(site.author)}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${escapeHtml(pageUrl(origin, redirect.destination))}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(redirect.destination)}">
  <!-- GENERATED:REDIRECT:END -->`;

const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const renderUrlSet = (origin, hydratedPages) => `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${hydratedPages.map(({ definition, lastmod }) => `\t<url>
\t\t<loc>${xmlEscape(pageUrl(origin, definition.route))}</loc>
\t\t<lastmod>${xmlEscape(lastmod)}</lastmod>
\t\t<image:image>
\t\t\t<image:loc>${xmlEscape(`${origin}${site.imagePath}`)}</image:loc>
\t\t\t<image:title>${xmlEscape(definition.title)}</image:title>
\t\t\t<image:caption>${xmlEscape(definition.description)}</image:caption>
\t\t</image:image>
\t</url>`).join('\n')}
</urlset>
<!-- Generated from scripts/site-manifest.mjs. Do not edit by hand. -->
`;

export const renderSitemapIndex = (origin, hydratedPages) => {
  const latest = hydratedPages.map(({ lastmod }) => lastmod).sort((left, right) => right.localeCompare(left))[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\t<sitemap>
\t\t<loc>${xmlEscape(`${origin}/page-sitemap.xml`)}</loc>
\t\t<lastmod>${xmlEscape(latest)}</lastmod>
\t</sitemap>
</sitemapindex>
<!-- Generated from scripts/site-manifest.mjs. Do not edit by hand. -->
`;
};

export const renderRobots = (origin) => `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap_index.xml
`;

export const renderSitemapStylesheet = (origin, template) => {
  const hostname = new URL(origin).hostname;
  return template
    .replaceAll(site.origin, origin)
    .replaceAll(site.name, hostname);
};

export const renderNormalizeScript = (origin) => {
  const host = new URL(origin).hostname;
  return `// Generated canonical-host normalization for portable static hosting.
// Server-level redirects remain preferable; local and preview hosts are untouched.
(function () {
  'use strict';

  const canonicalOrigin = ${JSON.stringify(origin)};
  const canonicalHost = ${JSON.stringify(host)};
  const productionHosts = new Set([canonicalHost, \`www.\${canonicalHost}\`]);

  const shouldNormalize = ({ protocol, hostname }) =>
    productionHosts.has(hostname) &&
    (protocol !== 'https:' || hostname !== canonicalHost);

  const toCanonicalUrl = ({ pathname, search, hash }) =>
    \`\${canonicalOrigin}\${pathname}\${search}\${hash}\`;

  if (shouldNormalize(window.location)) {
    window.location.replace(toCanonicalUrl(window.location));
  }
}());
`;
};

const blockPattern = (name) => new RegExp(`<!-- GENERATED:${name}:START -->[\\s\\S]*?<!-- GENERATED:${name}:END -->`);

export const replaceGeneratedBlock = (html, name, rendered) => {
  const pattern = blockPattern(name);
  if (!pattern.test(html)) throw new Error(`Missing GENERATED:${name} markers`);
  return html.replace(pattern, rendered);
};

export const normalizeUiUrls = (html) => html
  .replaceAll('href="https://sdin.dev/"', 'href="/"')
  .replaceAll('href="https://sdin.dev/ai/"', 'href="/ai/"')
  .replaceAll('href="https://sdin.dev/automation/"', 'href="/automation/"')
  .replaceAll('href="https://sdin.dev/coaching/"', 'href="/coaching/"')
  .replaceAll('href="https://sdin.dev/resume/"', 'href="/resume/"')
  .replaceAll('href="https://sdin.dev/privacy/"', 'href="/privacy/"')
  .replaceAll('href="https://sdin.dev"', 'href="/"')
  .replaceAll('src="https://sdin.dev/profile.png"', 'src="/profile.png"')
  .replaceAll('src="profile.png"', 'src="/profile.png"');
