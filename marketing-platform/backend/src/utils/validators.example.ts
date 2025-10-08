/**
 * @fileoverview Validation Utility Functions
 * 
 * Pure functions for data validation.
 * All validators return validation results without side effects.
 * 
 * @module utils/validators
 */

/**
 * Validation result interface
 * 
 * @interface ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates email address format
 * 
 * Pure function that checks if string matches email pattern.
 * 
 * @function validateEmail
 * @pure
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 * 
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid') // false
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * 
 * Checks for minimum length, uppercase, lowercase, number, and special char.
 * Pure function with no side effects.
 * 
 * @function validatePassword
 * @pure
 * @param {string} password - Password to validate
 * @returns {ValidationResult} Validation result with errors
 * 
 * @example
 * validatePassword('Weak') 
 * // { isValid: false, errors: ['Too short', 'Missing number'] }
 * 
 * validatePassword('Strong123!')
 * // { isValid: true, errors: [] }
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates URL format
 * 
 * Pure function that checks if string is a valid URL.
 * 
 * @function validateURL
 * @pure
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 * 
 * @example
 * validateURL('https://example.com') // true
 * validateURL('not-a-url') // false
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates phone number format (US)
 * 
 * Pure function that checks US phone number format.
 * 
 * @function validatePhoneNumber
 * @pure
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid US phone number
 * 
 * @example
 * validatePhoneNumber('555-123-4567') // true
 * validatePhoneNumber('12345') // false
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates date range
 * 
 * Checks if start date is before end date and both are valid.
 * Pure function with no side effects.
 * 
 * @function validateDateRange
 * @pure
 * @param {Date | string} startDate - Range start date
 * @param {Date | string} endDate - Range end date
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * validateDateRange('2025-01-01', '2025-12-31')
 * // { isValid: true, errors: [] }
 * 
 * validateDateRange('2025-12-31', '2025-01-01')
 * // { isValid: false, errors: ['Start date must be before end date'] }
 */
export const validateDateRange = (
  startDate: Date | string,
  endDate: Date | string
): ValidationResult => {
  const errors: string[] = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    errors.push('Invalid start date');
  }
  
  if (isNaN(end.getTime())) {
    errors.push('Invalid end date');
  }
  
  if (errors.length === 0 && start >= end) {
    errors.push('Start date must be before end date');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates budget configuration
 * 
 * Checks budget values for validity and consistency.
 * Pure function following functional programming principles.
 * 
 * @function validateBudget
 * @pure
 * @param {number} total - Total budget
 * @param {number} spent - Amount spent
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * validateBudget(10000, 5000)
 * // { isValid: true, errors: [] }
 * 
 * validateBudget(10000, 15000)
 * // { isValid: false, errors: ['Spent cannot exceed total budget'] }
 */
export const validateBudget = (
  total: number,
  spent: number
): ValidationResult => {
  const errors: string[] = [];
  
  if (total < 0) {
    errors.push('Total budget must be non-negative');
  }
  
  if (spent < 0) {
    errors.push('Spent amount must be non-negative');
  }
  
  if (spent > total) {
    errors.push('Spent cannot exceed total budget');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates campaign status transition
 * 
 * Pure function that validates state machine transitions.
 * 
 * @function validateStatusTransition
 * @pure
 * @param {string} currentStatus - Current campaign status
 * @param {string} newStatus - Desired new status
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * validateStatusTransition('draft', 'active')
 * // { isValid: true, errors: [] }
 * 
 * validateStatusTransition('completed', 'draft')
 * // { isValid: false, errors: ['Invalid status transition'] }
 */
export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): ValidationResult => {
  const validTransitions: Record<string, string[]> = {
    draft: ['active', 'deleted'],
    active: ['paused', 'completed', 'deleted'],
    paused: ['active', 'completed', 'deleted'],
    completed: ['deleted'],
    deleted: [],
  };
  
  const allowed = validTransitions[currentStatus] || [];
  const isValid = allowed.includes(newStatus);
  
  return {
    isValid,
    errors: isValid ? [] : [`Cannot transition from ${currentStatus} to ${newStatus}`],
  };
};

/**
 * Validates required fields in an object
 * 
 * Generic pure function for validating required fields.
 * 
 * @function validateRequiredFields
 * @pure
 * @template T
 * @param {T} obj - Object to validate
 * @param {Array<keyof T>} requiredFields - Required field names
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const campaign = { name: 'Test', budget: 1000 };
 * validateRequiredFields(campaign, ['name', 'budget', 'startDate'])
 * // { isValid: false, errors: ['Missing required field: startDate'] }
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  obj: T,
  requiredFields: Array<keyof T>
): ValidationResult => {
  const errors = requiredFields
    .filter(field => obj[field] === undefined || obj[field] === null)
    .map(field => `Missing required field: ${String(field)}`);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Composes multiple validators into a single validator
 * 
 * Functional composition of validators.
 * Returns combined validation result.
 * 
 * @function composeValidators
 * @pure
 * @param {...Function} validators - Validator functions
 * @returns {Function} Composed validator function
 * 
 * @example
 * const validateCampaign = composeValidators(
 *   (c) => validateRequiredFields(c, ['name', 'budget']),
 *   (c) => validateBudget(c.budget, c.spent),
 *   (c) => validateDateRange(c.startDate, c.endDate)
 * );
 * 
 * const result = validateCampaign(campaignData);
 */
export const composeValidators = (
  ...validators: Array<(data: any) => ValidationResult>
) => {
  return (data: any): ValidationResult => {
    const results = validators.map(validator => validator(data));
    
    const allErrors = results.flatMap(result => result.errors);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  };
};

/**
 * Sanitizes string input
 * 
 * Pure function that removes potentially dangerous characters.
 * 
 * @function sanitizeString
 * @pure
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 * 
 * @example
 * sanitizeString('<script>alert("xss")</script>')
 * // 'scriptalert("xss")/script'
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Validates and sanitizes email
 * 
 * Combines validation and sanitization.
 * Pure function composition.
 * 
 * @function validateAndSanitizeEmail
 * @pure
 * @param {string} email - Email to validate and sanitize
 * @returns {{ isValid: boolean; email: string; errors: string[] }}
 * 
 * @example
 * validateAndSanitizeEmail('  USER@EXAMPLE.COM  ')
 * // { isValid: true, email: 'user@example.com', errors: [] }
 */
export const validateAndSanitizeEmail = (email: string) => {
  const sanitized = email.toLowerCase().trim();
  const isValid = validateEmail(sanitized);
  
  return {
    isValid,
    email: sanitized,
    errors: isValid ? [] : ['Invalid email format'],
  };
};
