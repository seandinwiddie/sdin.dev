import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  blockedDeploymentPaths,
  pages,
  pageUrl,
  publicAssets,
  redirects,
  resolveOrigin,
  site,
  standalonePages,
  vendorAssets,
} from './site-manifest.mjs';
import { schemaGraph } from './render-site.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const targetOrigin = resolveOrigin(process.env.SITE_URL ?? site.origin);
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const matches = (input, pattern) => [...input.matchAll(pattern)];

const filesBelow = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = resolve(directory, entry.name);
  return entry.isDirectory() ? filesBelow(absolute) : [absolute];
});

const vendorOutputFiles = vendorAssets.flatMap(({ source, destination }) => {
  const sourcePath = resolve(root, source);
  if (!statSync(sourcePath).isDirectory()) return [destination];
  return filesBelow(sourcePath).map((file) =>
    `${destination}/${relative(sourcePath, file).split(sep).join('/')}`,
  );
});
const vendorOutputSet = new Set(vendorOutputFiles);

const metadata = (html, selector) => html.match(selector)?.[1] ?? '';
const stripTags = (value) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const decodeHtml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&#39;', "'")
  .replaceAll('&quot;', '"')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

const localTarget = (source, rawUrl) => {
  const value = rawUrl.split(/[?#]/)[0];
  if (!value || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return null;
  const base = new URL(source.replace(/index\.html$/, ''), 'https://local/');
  const url = new URL(value, base);
  let path = decodeURIComponent(url.pathname).replace(/^\//, '');
  if (path.endsWith('/')) path += 'index.html';
  return path;
};

for (const definition of pages) {
  const html = read(definition.source);
  const title = decodeHtml(metadata(html, /<title>([\s\S]*?)<\/title>/i));
  const description = decodeHtml(metadata(html, /<meta name="description" content="([^"]*)">/i));
  const canonical = metadata(html, /<link rel="canonical" href="([^"]+)">/i);
  const ogUrl = metadata(html, /<meta property="og:url" content="([^"]+)">/i);
  const twitterUrl = metadata(html, /<meta name="twitter:url" content="([^"]+)">/i);
  const expectedUrl = pageUrl(site.origin, definition.route);

  if (title !== definition.title) fail(`${definition.source}: title differs from site manifest`);
  if (description !== definition.description) fail(`${definition.source}: description differs from site manifest`);
  if (title.length > 60) fail(`${definition.source}: title exceeds 60 characters`);
  if (description.length > 160) fail(`${definition.source}: description exceeds 160 characters`);
  if (![canonical, ogUrl, twitterUrl].every((value) => value === expectedUrl)) {
    fail(`${definition.source}: canonical/social URL mismatch`);
  }
  if ((html.match(/<main\b/gi) ?? []).length !== 1) fail(`${definition.source}: expected one main landmark`);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) fail(`${definition.source}: expected one h1`);
  if (!/<main\b[^>]*\bid="main"[^>]*\btabindex="-1"/i.test(html)) {
    fail(`${definition.source}: main must be the focusable skip-link target`);
  }

  const ids = matches(html, /\sid="([^"]+)"/gi).map((match) => match[1]);
  const duplicateIds = ids.filter((value, index) => ids.indexOf(value) !== index);
  if (duplicateIds.length) fail(`${definition.source}: duplicate ids: ${[...new Set(duplicateIds)].join(', ')}`);
  for (const fragment of matches(html, /href="#([^"]+)"/gi).map((match) => match[1])) {
    if (!ids.includes(fragment)) fail(`${definition.source}: missing fragment target #${fragment}`);
  }

  let previousHeading = 0;
  for (const match of matches(html, /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const level = Number(match[1]);
    if (previousHeading && level > previousHeading + 1) {
      fail(`${definition.source}: heading level skips ${previousHeading} to ${level} at ${stripTags(match[2])}`);
    }
    previousHeading = level;
  }

  for (const script of matches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      fail(`${definition.source}: invalid JSON-LD: ${error.message}`);
    }
  }

  const graph = schemaGraph(site.origin, definition)['@graph'];
  const types = graph.map((entity) => entity['@type']);
  if (!types.includes('Person') || !types.includes('WebSite') || !types.includes(definition.schemaType)) {
    fail(`${definition.source}: required schema graph entities are missing`);
  }
  if (definition.service && !types.includes('Service')) fail(`${definition.source}: Service schema is missing`);
  if (types.some((type) => ['LocalBusiness', 'ProfessionalService'].includes(type))) {
    fail(`${definition.source}: local-business schema is not allowed on the remote brand`);
  }

  const body = html.split(/<body\b/i)[1] ?? '';
  if (/(?:href|src)="https:\/\/sdin\.dev(?:\/|")/.test(body)) {
    fail(`${definition.source}: internal UI URLs must be root-relative`);
  }
  if (/https?:\/\/(?:cdnjs\.cloudflare\.com|unpkg\.com|fonts\.(?:googleapis|gstatic)\.com)/i.test(html)) {
    fail(`${definition.source}: visual runtime dependencies must be self-hosted`);
  }

  for (const rawUrl of matches(html, /\b(?:href|src)="([^"]+)"/gi).map((match) => match[1])) {
    const target = localTarget(definition.source, rawUrl);
    if (target && !existsSync(resolve(root, target)) && !vendorOutputSet.has(target)) {
      fail(`${definition.source}: missing local target ${rawUrl}`);
    }
  }
}

for (const redirect of redirects) {
  const html = read(redirect.source);
  if (!html.includes('name="robots" content="noindex, follow"')) fail(`${redirect.source}: redirect must be noindex`);
  if (!html.includes(`href="${pageUrl(site.origin, redirect.destination)}"`)) fail(`${redirect.source}: redirect canonical mismatch`);
}

const sitemapUrls = matches(read('page-sitemap.xml'), /<loc>(https:\/\/sdin\.dev[^<]*)<\/loc>/g)
  .map((match) => match[1])
  .filter((url) => !url.endsWith('/og.png'));
const expectedSitemapUrls = pages.map((definition) => pageUrl(site.origin, definition.route));
if (JSON.stringify(sitemapUrls.sort()) !== JSON.stringify(expectedSitemapUrls.sort())) {
  fail('page-sitemap.xml does not exactly match the indexable site manifest');
}
if (!read('robots.txt').includes(`Sitemap: ${site.origin}/sitemap_index.xml`)) fail('robots.txt sitemap URL is stale');

const image = readFileSync(resolve(root, site.imagePath.slice(1)));
if (image.readUInt32BE(16) !== 1200 || image.readUInt32BE(20) !== 630) fail('og.png must remain 1200x630');

const textExtensions = new Set(['.html', '.js', '.mjs', '.md', '.json', '.txt', '.xml', '.xsl', '.yml', '.yaml', '.css']);
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  if (['.git', 'dist', 'node_modules'].includes(entry.name)) return [];
  const absolute = resolve(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});
for (const path of walk(root).filter((path) => textExtensions.has(extname(path)))) {
  const contents = readFileSync(path, 'utf8');
  for (const match of matches(contents, /(?<![0-9A-Za-z])(?:\+?1[-. ()]*)?\(?([2-9][0-9]{2})\)?[-. ()]*([0-9]{3})[-. ]*([0-9]{4})(?![0-9A-Za-z])/g)) {
    const digits = match[0].replace(/\D/g, '');
    if (!['5306383238', '15306383238'].includes(digits)) fail(`${relative(root, path)}: unexpected phone number ${match[0]}`);
  }
}

if (!existsSync(dist)) fail('dist/: run npm run build before npm run check');
if (existsSync(dist)) {
  const files = walk(dist).map((path) => relative(dist, path).split(sep).join('/')).sort();
  const expected = [
    ...pages.map(({ source }) => source),
    ...redirects.map(({ source }) => source),
    ...standalonePages,
    ...publicAssets,
    ...vendorOutputFiles,
    'CNAME',
    'normalize.js',
    'page-sitemap.xml',
    'robots.txt',
    'sitemap_index.xml',
  ].sort();
  if (JSON.stringify(files) !== JSON.stringify(expected)) {
    fail(`dist/: artifact allowlist mismatch\nExpected: ${expected.join(', ')}\nActual: ${files.join(', ')}`);
  }
  for (const blocked of blockedDeploymentPaths) {
    if (existsSync(resolve(dist, blocked))) fail(`dist/: blocked path was published: ${blocked}`);
  }

  for (const definition of pages) {
    const html = readFileSync(resolve(dist, definition.source), 'utf8');
    const canonical = metadata(html, /<link rel="canonical" href="([^"]+)">/i);
    if (canonical !== pageUrl(targetOrigin, definition.route)) {
      fail(`dist/${definition.source}: canonical does not match target origin`);
    }
    const body = html.split(/<body\b/i)[1] ?? '';
    if (/(?:href|src)="https:\/\/sdin\.dev(?:\/|")/.test(body)) {
      fail(`dist/${definition.source}: internal UI URLs must remain root-relative`);
    }
  }

  const distSitemapUrls = matches(readFileSync(resolve(dist, 'page-sitemap.xml'), 'utf8'), /<loc>(https:\/\/[^<]+)<\/loc>/g)
    .map((match) => match[1])
    .filter((url) => !url.endsWith('/og.png'));
  const expectedDistUrls = pages.map((definition) => pageUrl(targetOrigin, definition.route));
  if (JSON.stringify(distSitemapUrls.sort()) !== JSON.stringify(expectedDistUrls.sort())) {
    fail('dist/page-sitemap.xml does not match the target origin and site manifest');
  }
  if (!readFileSync(resolve(dist, 'robots.txt'), 'utf8').includes(`Sitemap: ${targetOrigin}/sitemap_index.xml`)) {
    fail('dist/robots.txt sitemap URL does not match the target origin');
  }
  if (!readFileSync(resolve(dist, 'normalize.js'), 'utf8').includes(`const canonicalOrigin = ${JSON.stringify(targetOrigin)}`)) {
    fail('dist/normalize.js does not match the target origin');
  }
  const sitemapStylesheet = readFileSync(resolve(dist, 'main-sitemap.xsl'), 'utf8');
  if (!sitemapStylesheet.includes(`href="${targetOrigin}"`) || !sitemapStylesheet.includes(`XML Sitemap - ${new URL(targetOrigin).hostname}`)) {
    fail('dist/main-sitemap.xsl does not match the target origin');
  }
  if (readFileSync(resolve(dist, 'CNAME'), 'utf8').trim() !== new URL(targetOrigin).hostname) {
    fail('dist/CNAME does not match the target origin');
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`ERROR: ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Static checks passed for ${pages.length} canonical pages and the allowlisted dist artifact.`);
}
