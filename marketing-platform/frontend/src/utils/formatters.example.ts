/**
 * @fileoverview Data Formatting Utilities
 * 
 * Pure functions for formatting data for display.
 * All functions are immutable and have no side effects.
 * 
 * @module utils/formatters
 */

/**
 * Formats a number as currency
 * 
 * Pure function that converts a number to a localized currency string.
 * 
 * @function formatCurrency
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code (ISO 4217)
 * @param {string} [locale='en-US'] - The locale for formatting
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formats a date to a readable string
 * 
 * Pure function that converts a Date object to a formatted string.
 * 
 * @function formatDate
 * @param {Date | string} date - The date to format
 * @param {string} [format='medium'] - Format style: 'short', 'medium', 'long', 'full'
 * @param {string} [locale='en-US'] - The locale for formatting
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date('2025-10-08')) // "Oct 8, 2025"
 * formatDate('2025-10-08', 'long') // "October 8, 2025"
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formats a number as a percentage
 * 
 * Pure function that converts a decimal to a percentage string.
 * 
 * @function formatPercentage
 * @param {number} value - The value to format (0.1 = 10%)
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted percentage string
 * 
 * @example
 * formatPercentage(0.1234) // "12.3%"
 * formatPercentage(0.1234, 2) // "12.34%"
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Truncates a string to a specified length
 * 
 * Pure function that shortens a string and adds ellipsis.
 * 
 * @function truncateString
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} [suffix='...'] - Suffix to add when truncated
 * @returns {string} Truncated string
 * 
 * @example
 * truncateString('Hello World', 8) // "Hello..."
 * truncateString('Short', 10) // "Short"
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Formats a large number with K, M, B suffixes
 * 
 * Pure function that converts large numbers to abbreviated format.
 * 
 * @function formatCompactNumber
 * @param {number} num - The number to format
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted number string
 * 
 * @example
 * formatCompactNumber(1234) // "1.2K"
 * formatCompactNumber(1234567) // "1.2M"
 * formatCompactNumber(1234567890) // "1.2B"
 */
export const formatCompactNumber = (num: number, decimals: number = 1): string => {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  
  if (tier === 0) return num.toString();
  
  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  
  return `${scaled.toFixed(decimals)}${suffix}`;
};

/**
 * Formats a phone number
 * 
 * Pure function that formats a US phone number.
 * 
 * @function formatPhoneNumber
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 * 
 * @example
 * formatPhoneNumber('5551234567') // "(555) 123-4567"
 * formatPhoneNumber('555-123-4567') // "(555) 123-4567"
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

/**
 * Capitalizes the first letter of a string
 * 
 * Pure function that capitalizes the first character.
 * 
 * @function capitalize
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 * 
 * @example
 * capitalize('hello') // "Hello"
 * capitalize('HELLO') // "HELLO"
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to title case
 * 
 * Pure function that capitalizes the first letter of each word.
 * 
 * @function toTitleCase
 * @param {string} str - The string to convert
 * @returns {string} Title-cased string
 * 
 * @example
 * toTitleCase('hello world') // "Hello World"
 * toTitleCase('the quick brown fox') // "The Quick Brown Fox"
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Formats bytes to human-readable file size
 * 
 * Pure function that converts bytes to KB, MB, GB, etc.
 * 
 * @function formatFileSize
 * @param {number} bytes - The number of bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size string
 * 
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Formats a duration in seconds to readable string
 * 
 * Pure function that converts seconds to "Xh Ym Zs" format.
 * 
 * @function formatDuration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 * 
 * @example
 * formatDuration(65) // "1m 5s"
 * formatDuration(3665) // "1h 1m 5s"
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};
