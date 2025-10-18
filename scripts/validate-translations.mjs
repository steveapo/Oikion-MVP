#!/usr/bin/env node

/**
 * Translation Validation Script
 * 
 * Validates that all translation keys in English exist in all other locales
 * for critical pages. This script runs during the build process to ensure
 * translation completeness.
 * 
 * Usage: node scripts/validate-translations.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const LOCALES = ['en', 'el'];
const DEFAULT_LOCALE = 'en';
const MESSAGES_DIR = join(__dirname, '..', 'messages');

const CRITICAL_PAGES = [
  'common',
  'dashboard',
  'properties',
  'relations',
  'oikosync',
  'members',
  'billing',
  'settings',
  'navigation',
  'validation',
  'errors',
  'marketing'
];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Load JSON file and return parsed content
 */
function loadJSON(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Extract all keys from a nested object
 * Returns an array of dot-notation paths (e.g., ['header.title', 'header.description'])
 */
function extractKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively extract keys from nested objects
      keys = keys.concat(extractKeys(value, fullKey));
    } else {
      // Leaf node - add the full key path
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Check if a value at the given key path is empty
 */
function isEmptyValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return true;
    }
  }
  
  return value === '' || value === null || value === undefined;
}

/**
 * Extract interpolation variables from a translation string
 * Returns an array of variable names (e.g., ['role', 'count'])
 */
function extractVariables(str) {
  if (typeof str !== 'string') return [];
  const matches = str.matchAll(/\{\{(\w+)\}\}/g);
  return Array.from(matches).map(match => match[1]);
}

/**
 * Get value at a specific key path in an object
 */
function getValueAtPath(obj, keyPath) {
  const keys = keyPath.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Validate a single page translation file
 */
function validatePage(page, locale) {
  const errors = [];
  const warnings = [];
  
  // Load English (source) file
  const enFilePath = join(MESSAGES_DIR, DEFAULT_LOCALE, `${page}.json`);
  const enContent = loadJSON(enFilePath);
  
  if (!enContent) {
    errors.push(`Missing or invalid English file: ${enFilePath}`);
    return { errors, warnings };
  }
  
  // Load target locale file
  const localeFilePath = join(MESSAGES_DIR, locale, `${page}.json`);
  
  if (!existsSync(localeFilePath)) {
    errors.push(`Missing translation file: ${localeFilePath}`);
    return { errors, warnings };
  }
  
  const localeContent = loadJSON(localeFilePath);
  
  if (!localeContent) {
    errors.push(`Invalid JSON in file: ${localeFilePath}`);
    return { errors, warnings };
  }
  
  // Extract all keys from English file
  const enKeys = extractKeys(enContent);
  
  // Check each key exists in target locale
  for (const key of enKeys) {
    const localeValue = getValueAtPath(localeContent, key);
    
    if (localeValue === undefined) {
      errors.push(`Missing key: ${key}`);
    } else if (localeValue === '' || localeValue === null) {
      errors.push(`Empty value for key: ${key}`);
    } else {
      // Check variable consistency
      const enValue = getValueAtPath(enContent, key);
      const enVars = extractVariables(enValue);
      const localeVars = extractVariables(localeValue);
      
      // Check if all English variables are present in translation
      const missingVars = enVars.filter(v => !localeVars.includes(v));
      if (missingVars.length > 0) {
        warnings.push(
          `Variable mismatch in key "${key}": missing variables [${missingVars.join(', ')}]`
        );
      }
      
      // Check for extra variables in translation
      const extraVars = localeVars.filter(v => !enVars.includes(v));
      if (extraVars.length > 0) {
        warnings.push(
          `Variable mismatch in key "${key}": extra variables [${extraVars.join(', ')}]`
        );
      }
    }
  }
  
  // Check for extra keys in target locale (not critical, just a warning)
  const localeKeys = extractKeys(localeContent);
  const extraKeys = localeKeys.filter(k => !enKeys.includes(k));
  
  if (extraKeys.length > 0) {
    warnings.push(`Extra keys found (not in English): ${extraKeys.join(', ')}`);
  }
  
  return { errors, warnings };
}

/**
 * Main validation function
 */
function validateTranslations() {
  console.log(`${colors.cyan}🌍 Validating translations...${colors.reset}\n`);
  
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];
  
  // Validate each locale (except default)
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    
    console.log(`${colors.blue}Checking locale: ${locale}${colors.reset}`);
    
    for (const page of CRITICAL_PAGES) {
      const { errors, warnings } = validatePage(page, locale);
      
      if (errors.length > 0 || warnings.length > 0) {
        results.push({
          locale,
          page,
          errors,
          warnings
        });
      }
      
      totalErrors += errors.length;
      totalWarnings += warnings.length;
      
      // Print immediate feedback
      if (errors.length > 0) {
        console.log(`  ${colors.red}✗${colors.reset} ${page}.json - ${errors.length} error(s)`);
      } else if (warnings.length > 0) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${page}.json - ${warnings.length} warning(s)`);
      } else {
        console.log(`  ${colors.green}✓${colors.reset} ${page}.json`);
      }
    }
    
    console.log('');
  }
  
  // Print detailed results
  if (results.length > 0) {
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    
    for (const result of results) {
      if (result.errors.length > 0) {
        console.log(`${colors.red}❌ Errors in ${result.locale}/${result.page}.json:${colors.reset}`);
        result.errors.forEach(error => {
          console.log(`   ${colors.red}•${colors.reset} ${error}`);
        });
        console.log('');
      }
      
      if (result.warnings.length > 0) {
        console.log(`${colors.yellow}⚠️  Warnings in ${result.locale}/${result.page}.json:${colors.reset}`);
        result.warnings.forEach(warning => {
          console.log(`   ${colors.yellow}•${colors.reset} ${warning}`);
        });
        console.log('');
      }
    }
  }
  
  // Print summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  • Locales validated: ${LOCALES.length - 1} (excluding ${DEFAULT_LOCALE})`);
  console.log(`  • Critical pages: ${CRITICAL_PAGES.length}`);
  console.log(`  • Total checks: ${(LOCALES.length - 1) * CRITICAL_PAGES.length}`);
  
  if (totalErrors > 0) {
    console.log(`  • ${colors.red}Errors: ${totalErrors}${colors.reset}`);
  } else {
    console.log(`  • ${colors.green}Errors: 0${colors.reset}`);
  }
  
  if (totalWarnings > 0) {
    console.log(`  • ${colors.yellow}Warnings: ${totalWarnings}${colors.reset}`);
  } else {
    console.log(`  • Warnings: 0`);
  }
  
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  // Exit with error code if there are errors
  if (totalErrors > 0) {
    console.log(`${colors.red}❌ Translation validation failed!${colors.reset}`);
    console.log(`${colors.red}Build aborted. Please fix the errors above.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All translations validated successfully!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
validateTranslations();
