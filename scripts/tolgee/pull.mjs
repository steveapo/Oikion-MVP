#!/usr/bin/env -S node --no-warnings

import { join } from 'path';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import {
  unflatten,
  writeJson,
  repoRoot,
  messagesDir,
  tolgeeEnv,
  hasTolgeeApiConfigured,
  httpJson,
  logInfo,
  logWarn,
} from './common.mjs';

function splitIntoNamespaces(flat) {
  const byNs = {};
  for (const [fullKey, value] of Object.entries(flat)) {
    const dot = fullKey.indexOf('.');
    if (dot === -1) continue;
    const ns = fullKey.substring(0, dot);
    const rest = fullKey.substring(dot + 1);
    byNs[ns] = byNs[ns] || {};
    byNs[ns][rest] = value;
  }
  return byNs;
}

async function pullViaApi(locales) {
  const { projectId, readKey } = tolgeeEnv();
  const body = {
    languages: locales,
    format: 'JSON',
    structureDelimiter: '.',
    zip: false,
  };

  const data = await httpJson('POST', `/v2/projects/${projectId}/export`, readKey, body);

  for (const locale of locales) {
    const flat = data?.[locale] || {};
    const byNs = splitIntoNamespaces(flat);
    for (const [ns, nsFlat] of Object.entries(byNs)) {
      const nested = unflatten(nsFlat);
      const outPath = join(messagesDir(), locale, `${ns}.json`);
      writeJson(outPath, nested);
    }
    logInfo(`✔ Wrote ${Object.keys(byNs).length} namespaces for ${locale}`);
  }
}

function applyFromExportFiles(locales) {
  const baseDir = join(repoRoot(), '.tolgee', 'export');
  for (const locale of locales) {
    const file = join(baseDir, `${locale}.merge.json`);
    if (!existsSync(file)) {
      logWarn(`Missing export file: ${file}`);
      continue;
    }
    const flat = JSON.parse(readFileSync(file, 'utf-8'));
    const byNs = splitIntoNamespaces(flat);
    for (const [ns, nsFlat] of Object.entries(byNs)) {
      const nested = unflatten(nsFlat);
      const outDir = join(messagesDir(), locale);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      const outPath = join(outDir, `${ns}.json`);
      writeJson(outPath, nested);
    }
    logInfo(`✔ Applied export for ${locale}`);
  }
}

async function main() {
  const locales = ['en', 'el'];
  if (hasTolgeeApiConfigured('read')) {
    try {
      await pullViaApi(locales);
      return;
    } catch (e) {
      logWarn(`Tolgee API pull failed: ${e?.message || e}`);
      logWarn('Falling back to manual export files...');
    }
  } else {
    logWarn('Tolgee API not configured for read. Using manual export files.');
  }
  applyFromExportFiles(locales);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


