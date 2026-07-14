import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, site } from './site-manifest.mjs';
import { renderSitemapIndex, renderUrlSet } from './render-site.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const gitOutput = (args) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const lastModified = (source) => {
  const dirty = gitOutput(['status', '--porcelain', '--', source]);
  const committed = dirty ? '' : gitOutput(['log', '-1', '--format=%cs', '--', source]);
  return committed || new Date().toISOString().slice(0, 10);
};

export const hydratePages = () => pages.map((definition) => Object.freeze({
  definition,
  lastmod: lastModified(definition.source),
}));

export const writeSitemaps = ({ outputRoot, origin, hydratedPages }) => {
  mkdirSync(outputRoot, { recursive: true });
  writeFileSync(resolve(outputRoot, 'page-sitemap.xml'), renderUrlSet(origin, hydratedPages));
  writeFileSync(resolve(outputRoot, 'sitemap_index.xml'), renderSitemapIndex(origin, hydratedPages));
};

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  writeSitemaps({ outputRoot: root, origin: site.origin, hydratedPages: hydratePages() });
}
