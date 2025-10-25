#!/usr/bin/env -S node --no-warnings

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  flatten,
  readJson,
  writeJson,
  repoRoot,
  messagesDir,
  listNamespaces,
  tolgeeEnv,
  hasTolgeeApiConfigured,
  httpJson,
  logInfo,
  logWarn,
} from './common.mjs';

function makeNamespaceFilePath(locale, ns) {
  return join(messagesDir(), locale, `${ns}.json`);
}

async function pushViaApi() {
  const { projectId, writeKey } = tolgeeEnv();
  const namespaces = listNamespaces('en');

  const translations = [];

  for (const ns of namespaces) {
    const enPath = makeNamespaceFilePath('en', ns);
    const data = readJson(enPath);
    const flat = flatten(data);
    for (const [k, v] of Object.entries(flat)) {
      translations.push({ key: `${ns}.${k}`, languageTag: 'en', text: v });
    }
  }

  await httpJson(
    'POST',
    `/v2/projects/${projectId}/translations/bulk`,
    writeKey,
    { translations }
  );

  logInfo(`✔ Pushed ${translations.length} English translations to Tolgee project ${projectId}`);
}

function prepareUploadFiles() {
  const outDir = join(repoRoot(), '.tolgee', 'upload');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const namespaces = listNamespaces('en');
  const merged = {};

  for (const ns of namespaces) {
    const enPath = makeNamespaceFilePath('en', ns);
    const data = readJson(enPath);
    const flat = flatten(data);
    merged[ns] = Object.fromEntries(
      Object.entries(flat).map(([k, v]) => [`${ns}.${k}`, v])
    );
  }

  const flatMerged = Object.assign({}, ...Object.values(merged));
  writeJson(join(outDir, 'en.merge.json'), flatMerged);
  logInfo(`Prepared .tolgee/upload/en.merge.json (${Object.keys(flatMerged).length} keys)`);
}

async function main() {
  if (hasTolgeeApiConfigured('write')) {
    try {
      await pushViaApi();
      return;
    } catch (e) {
      logWarn(`Tolgee API push failed: ${e?.message || e}`);
      logWarn('Falling back to manual upload file generation...');
    }
  } else {
    logWarn('Tolgee API not configured for write. Generating manual upload files.');
  }
  prepareUploadFiles();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


