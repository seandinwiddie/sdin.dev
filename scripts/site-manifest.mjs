const canonicalOrigin = 'https://sdin.dev';

const socialProfiles = Object.freeze([
  'https://www.linkedin.com/in/seandinwiddie/',
  'https://github.com/SeanDinwiddie',
  'https://www.instagram.com/sdin.dev/',
  'https://x.com/seandinwiddie',
  'https://www.upwork.com/freelancers/~01dce79404e28629c9',
  'https://www.freelancer.com/u/seandinwiddie',
]);

export const site = Object.freeze({
  origin: canonicalOrigin,
  name: 'sdin.dev',
  language: 'en-US',
  author: 'Sean Dinwiddie',
  email: 'sean@sdin.dev',
  phoneDisplay: '(530) 638-3238',
  phoneHref: '+15306383238',
  phoneSchema: '+1-530-638-3238',
  analyticsId: 'G-V36RT068VK',
  imagePath: '/og.png',
  imageAlt: 'Sean Dinwiddie — React and Redux developer building AI-native software',
  personDescription: 'Remote software developer specializing in React, Redux Toolkit, TypeScript, AI systems, and business automation.',
  socialProfiles,
});

const page = (definition) => Object.freeze({
  indexable: true,
  ogType: 'website',
  schemaType: 'WebPage',
  ...definition,
});

export const pages = Object.freeze([
  page({
    id: 'home',
    source: 'index.html',
    route: '/',
    title: 'React & Redux Developer | Sean Dinwiddie',
    description: 'React, Redux Toolkit, and TypeScript developer building custom software, automation, and modern web and native apps that deliver measurable ROI.',
    service: Object.freeze({
      name: 'Remote Software Development',
      serviceType: ['Software Development', 'React Development', 'Redux Toolkit Consulting', 'Business Automation'],
      description: 'Custom software solutions that save businesses $50K+ monthly through automation and optimization',
      offers: Object.freeze([
        Object.freeze({
          '@type': 'Offer',
          name: 'Custom Software Development Services',
          description: 'Custom software solutions that save businesses $50K+ monthly through automation and optimization',
          category: 'Software Development',
        }),
        Object.freeze({
          '@type': 'Offer',
          name: 'Free Strategy Call',
          description: 'Free consultation to identify $25K+ in monthly savings opportunities',
          price: '0',
          priceCurrency: 'USD',
        }),
      ]),
    }),
  }),
  page({
    id: 'ai',
    source: 'ai/index.html',
    route: '/ai/',
    title: 'AI Development Services | Sean Dinwiddie',
    description: 'Done-for-you AI software and done-with-you team enablement using TypeScript, React, Redux Toolkit, Rust, and maintainable functional architecture.',
    service: Object.freeze({
      name: 'AI Development Services — Done-For-You and Done-With-You',
      serviceType: ['AI-Native Software Development', 'Team Enablement'],
      description: 'Done-For-You AI-native software builds and Done-With-You team enablement built on functional patterns in TypeScript, React, Redux Toolkit, and Rust.',
      offers: Object.freeze({
        '@type': 'AggregateOffer',
        offerCount: 3,
        lowPrice: '5500',
        highPrice: '9500',
        priceCurrency: 'USD',
        offers: Object.freeze([
          Object.freeze({ '@type': 'Offer', name: 'AI Advisor — ongoing architecture guidance', price: '5500', priceCurrency: 'USD' }),
          Object.freeze({ '@type': 'Offer', name: 'Embedded AI Architect (Done-With-You)', price: '9500', priceCurrency: 'USD' }),
          Object.freeze({ '@type': 'Offer', name: 'AI Build & Rescue (Done-For-You)' }),
        ]),
      }),
    }),
  }),
  page({
    id: 'automation',
    source: 'automation/index.html',
    route: '/automation/',
    title: 'Business Automation | Sean Dinwiddie',
    description: 'Custom business automation that removes repetitive work, reduces errors, and helps teams focus on high-value operations and AI-assisted decisions.',
    service: Object.freeze({
      name: 'Custom Software Development and Automation Consulting',
      serviceType: ['Business Automation', 'Process Optimization', 'Custom Software Development'],
      description: 'Custom software solutions that deliver $50K+ in monthly savings through intelligent automation and streamlined workflows.',
    }),
  }),
  page({
    id: 'coaching',
    source: 'coaching/index.html',
    route: '/coaching/',
    title: 'Technical Coaching & Fractional CTO | Sean Dinwiddie',
    description: 'Technical coaching, software consulting, and fractional CTO leadership for modernizing systems, reducing operational cost, and guiding architecture.',
    service: Object.freeze({
      name: 'Technical Coaching, Software Consulting, and Fractional CTO',
      serviceType: ['Technical Coaching', 'Software Consulting', 'Fractional CTO'],
      description: 'Technical coaching, software consulting, and fractional CTO leadership for modernizing legacy systems and providing senior architecture guidance.',
    }),
  }),
  page({
    id: 'resume',
    source: 'resume/index.html',
    route: '/resume/',
    title: 'AI Systems Architect Resume | Sean Dinwiddie',
    description: "Sean Dinwiddie's experience in AI systems architecture, full-stack engineering, autonomous agents, RAG pipelines, React, Redux Toolkit, and TypeScript.",
    ogType: 'profile',
    schemaType: 'ProfilePage',
  }),
  page({
    id: 'privacy',
    source: 'privacy/index.html',
    route: '/privacy/',
    title: 'Privacy | sdin.dev',
    description: 'How sdin.dev handles analytics, contact actions, browser privacy signals, and third-party services.',
  }),
]);

export const redirects = Object.freeze([
  Object.freeze({ source: 'sean-dinwiddie_resume.html', route: '/sean-dinwiddie_resume.html', destination: '/resume/' }),
]);

export const standalonePages = Object.freeze([
  '404.html',
]);

export const publicAssets = Object.freeze([
  'Sean Dinwiddie - AI Systems Architect & Senior Full Stack Engineer.pdf',
  'analytics.js',
  'favicon.ico',
  'google7e1b8911384e19a7.html',
  'main-sitemap.xsl',
  'og.png',
  'profile.png',
  'site.js',
  'styles.css',
  'tailwind.css',
  'tracking.js',
  'coaching/tb.jpg',
]);

export const vendorAssets = Object.freeze([
  Object.freeze({
    source: 'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
    destination: 'vendor/fontawesome/css/all.min.css',
  }),
  Object.freeze({
    source: 'node_modules/@fortawesome/fontawesome-free/webfonts',
    destination: 'vendor/fontawesome/webfonts',
  }),
  Object.freeze({
    source: 'node_modules/@fortawesome/fontawesome-free/LICENSE.txt',
    destination: 'vendor/fontawesome/LICENSE.txt',
  }),
  Object.freeze({
    source: 'node_modules/aos/dist/aos.css',
    destination: 'vendor/aos/aos.css',
  }),
  Object.freeze({
    source: 'node_modules/aos/dist/aos.js',
    destination: 'vendor/aos/aos.js',
  }),
  Object.freeze({
    source: 'node_modules/aos/LICENSE',
    destination: 'vendor/aos/LICENSE',
  }),
]);

export const blockedDeploymentPaths = Object.freeze([
  'README.md',
  'coaching/sales-video.md',
  'package.json',
  'package-lock.json',
  'scripts',
  'sdin-dev.code-workspace',
  'src',
  'tailwind.config.js',
  'test-tracking.html',
  'todo.md',
]);

export const resolveOrigin = (candidate = site.origin) => {
  const url = new URL(candidate);
  if (url.protocol !== 'https:') {
    throw new Error(`SITE_URL must use HTTPS: ${candidate}`);
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`SITE_URL must be an origin without a path, query, or hash: ${candidate}`);
  }
  return url.origin;
};

export const pageUrl = (origin, route) => `${resolveOrigin(origin)}${route}`;
