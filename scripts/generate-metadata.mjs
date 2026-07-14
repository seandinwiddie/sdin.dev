import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, redirects, site } from './site-manifest.mjs';
import {
  normalizeUiUrls,
  renderNormalizeScript,
  renderRedirectBlock,
  renderSeoBlock,
  replaceGeneratedBlock,
} from './render-site.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const writeIfChanged = (relativePath, contents) => {
  const destination = resolve(root, relativePath);
  const current = readFileSync(destination, 'utf8');
  if (current !== contents) writeFileSync(destination, contents);
};

for (const definition of pages) {
  const source = readFileSync(resolve(root, definition.source), 'utf8');
  const normalized = normalizeUiUrls(source);
  const rendered = replaceGeneratedBlock(normalized, 'SEO', renderSeoBlock(site.origin, definition));
  writeIfChanged(definition.source, rendered);
}

for (const redirect of redirects) {
  const source = readFileSync(resolve(root, redirect.source), 'utf8');
  const normalized = normalizeUiUrls(source);
  const rendered = replaceGeneratedBlock(normalized, 'REDIRECT', renderRedirectBlock(site.origin, redirect));
  writeIfChanged(redirect.source, rendered);
}

writeIfChanged('normalize.js', renderNormalizeScript(site.origin));
