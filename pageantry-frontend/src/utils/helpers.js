import { SCORE_CONSTRAINTS, FILE_UPLOAD, ERROR_MESSAGES } from './constants';

/**
 * Format a score to display with proper decimal places
 * @param {number} score - The score to format
 * @returns {string} Formatted score
 */
export const formatScore = (score) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return '0.00';
  }
  return score.toFixed(SCORE_CONSTRAINTS.DECIMAL_PLACES);
};

/**
 * Validate a score value
 * @param {number} score - The score to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateScore = (score) => {
  const numScore = parseFloat(score);
  
  if (isNaN(numScore)) {
    return { isValid: false, message: 'Score must be a valid number' };
  }
  
  if (numScore < SCORE_CONSTRAINTS.MIN) {
    return { isValid: false, message: `Score must be at least ${SCORE_CONSTRAINTS.MIN}` };
  }
  
  if (numScore > SCORE_CONSTRAINTS.MAX) {
    return { isValid: false, message: `Score must not exceed ${SCORE_CONSTRAINTS.MAX}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a file for upload
 * @param {File} file - The file to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }
  
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return { isValid: false, message: 'File size must be less than 2MB' };
  }
  
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, message: 'File must be an image (JPG, PNG, GIF)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Format a candidate number for display
 * @param {string|number} candidateNumber - The candidate number
 * @returns {string} Formatted candidate number
 */
export const formatCandidateNumber = (candidateNumber) => {
  if (!candidateNumber) return '';
  return `#${candidateNumber}`;
};

/**
 * Calculate progress percentage
 * @param {number} completed - Number of completed items
 * @param {number} total - Total number of items
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Get status color class based on progress
 * @param {number} progress - Progress percentage
 * @returns {string} CSS class name for status color
 */
export const getProgressStatusColor = (progress) => {
  if (progress === 100) return 'text-green-600';
  if (progress > 0) return 'text-yellow-600';
  return 'text-gray-400';
};

/**
 * Get status text based on progress
 * @param {number} progress - Progress percentage
 * @returns {string} Status text
 */
export const getProgressStatusText = (progress) => {
  if (progress === 100) return 'Completed';
  if (progress > 0) return 'In Progress';
  return 'Not Started';
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '';
  }
};

/**
 * Format date and time for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return data?.message || ERROR_MESSAGES.GENERIC_ERROR;
  }
};

/**
 * Check if user has specific role
 * @param {object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (user, role) => {
  return user && user.role === role;
};

/**
 * Check if user is admin
 * @param {object} user - User object
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is judge
 * @param {object} user - User object
 * @returns {boolean} True if user is judge
 */
export const isJudge = (user) => {
  return hasRole(user, 'judge');
};

/**
 * Sort array of objects by a property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, property, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

/**
 * Filter array of objects by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, searchFields) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => 
    searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(term)
    )
  );
};

export default {
  formatScore,
  validateScore,
  validateEmail,
  validatePassword,
  validateFile,
  formatCandidateNumber,
  calculateProgress,
  getProgressStatusColor,
  getProgressStatusText,
  debounce,
  throttle,
  formatDate,
  formatDateTime,
  capitalize,
  toTitleCase,
  generateId,
  handleApiError,
  hasRole,
  isAdmin,
  isJudge,
  sortBy,
  filterBySearch,
};

