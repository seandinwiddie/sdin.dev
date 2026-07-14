import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  pages,
  publicAssets,
  redirects,
  resolveOrigin,
  site,
  standalonePages,
  vendorAssets,
} from './site-manifest.mjs';
import {
  normalizeUiUrls,
  renderNormalizeScript,
  renderRedirectBlock,
  renderRobots,
  renderSeoBlock,
  renderSitemapStylesheet,
  replaceGeneratedBlock,
} from './render-site.mjs';
import { hydratePages, writeSitemaps } from './generate-sitemaps.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destinationRoot = resolve(root, 'dist');
const origin = resolveOrigin(process.env.SITE_URL ?? site.origin);

const write = (relativePath, contents) => {
  const destination = resolve(destinationRoot, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents);
};

const copy = (relativePath) => {
  const destination = resolve(destinationRoot, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(resolve(root, relativePath), destination);
};

rmSync(destinationRoot, { recursive: true, force: true });
mkdirSync(destinationRoot, { recursive: true });

for (const definition of pages) {
  const source = normalizeUiUrls(readFileSync(resolve(root, definition.source), 'utf8'));
  write(definition.source, replaceGeneratedBlock(source, 'SEO', renderSeoBlock(origin, definition)));
}

for (const redirect of redirects) {
  const source = normalizeUiUrls(readFileSync(resolve(root, redirect.source), 'utf8'));
  write(redirect.source, replaceGeneratedBlock(source, 'REDIRECT', renderRedirectBlock(origin, redirect)));
}

standalonePages.forEach(copy);
publicAssets.forEach(copy);
for (const { source, destination } of vendorAssets) {
  const target = resolve(destinationRoot, destination);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(root, source), target, { recursive: true });
}

write('normalize.js', renderNormalizeScript(origin));
write('robots.txt', renderRobots(origin));
write('main-sitemap.xsl', renderSitemapStylesheet(
  origin,
  readFileSync(resolve(root, 'main-sitemap.xsl'), 'utf8'),
));
write('CNAME', `${new URL(origin).hostname}\n`);
writeSitemaps({ outputRoot: destinationRoot, origin, hydratedPages: hydratePages() });
