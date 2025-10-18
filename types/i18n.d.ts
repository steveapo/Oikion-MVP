/**
 * Global type declarations for next-intl
 * 
 * This file enables TypeScript autocomplete and type checking
 * for translation keys throughout the application.
 */

type Messages = typeof import('./messages/en/common.json');

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
