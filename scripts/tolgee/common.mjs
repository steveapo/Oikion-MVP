#!/usr/bin/env -S node --no-warnings

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';

export function flatten(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj ?? {})) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, full));
    } else {
      out[full] = String(value ?? '');
    }
  }
  return out;
}

export function unflatten(record) {
  const root = {};
  for (const [flatKey, value] of Object.entries(record)) {
    const parts = flatKey.split('.');
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cur[part] = value;
      } else {
        cur[part] = cur[part] ?? {};
        cur = cur[part];
      }
    }
  }
  return root;
}

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function writeJson(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function repoRoot() {
  return join(__dirname, '..', '..');
}

export function messagesDir() {
  return join(repoRoot(), 'messages');
}

export function listLocales() {
  const dir = messagesDir();
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function listNamespaces(locale) {
  const dir = join(messagesDir(), locale);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.json'))
    .map((d) => basename(d.name, '.json'))
    .sort();
}

export function ensureDir(dirPath) {
  if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
}

export function tolgeeEnv() {
  const url = process.env.TOLGEE_API_URL?.replace(/\/$/, '');
  const readKey = process.env.TOLGEE_API_KEY_READ;
  const writeKey = process.env.TOLGEE_API_KEY_WRITE;
  const projectId = process.env.TOLGEE_PROJECT_ID;
  return { url, readKey, writeKey, projectId };
}

export function hasTolgeeApiConfigured(kind) {
  const { url, projectId, readKey, writeKey } = tolgeeEnv();
  if (!url || !projectId) return false;
  return kind === 'read' ? Boolean(readKey) : Boolean(writeKey);
}

export async function httpJson(method, path, apiKey, body) {
  const { url } = tolgeeEnv();
  const endpoint = `${url}${path}`;
  const res = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export function logInfo(msg) {
  console.log(`\x1b[36m${msg}\x1b[0m`);
}

export function logWarn(msg) {
  console.warn(`\x1b[33m${msg}\x1b[0m`);
}

export function logErr(msg) {
  console.error(`\x1b[31m${msg}\x1b[0m`);
}


