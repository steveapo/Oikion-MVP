#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Fix contentlayer2 generated types by replacing invalid 'json' type
 * with proper TypeScript types for image arrays
 */
const typesPath = join(process.cwd(), '.contentlayer', 'generated', 'types.d.ts');

try {
  let content = readFileSync(typesPath, 'utf8');
  
  // Replace all instances of 'images: json' with 'images: string[]'
  content = content.replace(/images:\s*json/g, 'images: string[]');
  
  writeFileSync(typesPath, content, 'utf8');
  console.log('✓ Fixed contentlayer types');
} catch (error) {
  console.error('Failed to fix contentlayer types:', error.message);
  process.exit(1);
}
