// Application constants
export const APP_NAME = 'Pageantry Tabulation System';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER: '/user',
    CHANGE_PASSWORD: '/change-password',
  },
  CANDIDATES: {
    BASE: '/candidates',
    FOR_JUDGING: '/candidates/for-judging',
    ACTIVE: '/candidates/active',
    SCORES: (id) => `/candidates/${id}/scores`,
  },
  JUDGES: {
    BASE: '/judges',
    TOGGLE_STATUS: (id) => `/judges/${id}/toggle-status`,
  },
  SCORES: {
    BASE: '/scores',
    MINE: '/scores/mine',
    NEXT_CANDIDATE: '/scores/next-candidate',
    ANALYTICS: '/scores/analytics',
    PROGRESS: '/scores/progress',
  },
  EXPORT: {
    EXCEL: '/export/excel',
    PDF: '/export/pdf',
  },
};

// Pageant categories
export const CATEGORIES = {
  SPORTS_ATTIRE: {
    id: 'sports_attire',
    name: 'Sports Attire',
    weight: 20,
    description: 'Athletic wear and fitness presentation',
  },
  SWIMSUIT: {
    id: 'swimsuit',
    name: 'Swimsuit',
    weight: 20,
    description: 'Swimwear presentation and confidence',
  },
  GOWN: {
    id: 'gown',
    name: 'Gown',
    weight: 30,
    description: 'Evening gown elegance and poise',
  },
  QA: {
    id: 'qa',
    name: 'Q&A',
    weight: 30,
    description: 'Question and answer intelligence',
  },
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  JUDGE: 'judge',
};

// Score constraints
export const SCORE_CONSTRAINTS = {
  MIN: 0,
  MAX: 100,
  DECIMAL_PLACES: 2,
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact the administrator.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  CANDIDATE_CREATED: 'Candidate created successfully!',
  CANDIDATE_UPDATED: 'Candidate updated successfully!',
  CANDIDATE_DELETED: 'Candidate deleted successfully!',
  JUDGE_CREATED: 'Judge created successfully!',
  JUDGE_UPDATED: 'Judge updated successfully!',
  JUDGE_DELETED: 'Judge deleted successfully!',
  SCORE_SUBMITTED: 'Score submitted successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 2048 * 1024, // 2MB in bytes
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};

// Color scheme
export const COLORS = {
  PRIMARY: 'oklch(0.55 0.25 240)', // Electric Blue
  SECONDARY: 'oklch(0.3 0.15 20)', // Maroon
  ACCENT: 'oklch(0.6 0.3 15)', // Electric Red
  SUCCESS: 'oklch(0.6 0.2 140)', // Green
  WARNING: 'oklch(0.8 0.15 80)', // Yellow
  ERROR: 'oklch(0.6 0.3 15)', // Electric Red
  INFO: 'oklch(0.55 0.25 240)', // Electric Blue
};

export default {
  APP_NAME,
  APP_VERSION,
  API_ENDPOINTS,
  CATEGORIES,
  USER_ROLES,
  SCORE_CONSTRAINTS,
  STORAGE_KEYS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FILE_UPLOAD,
  PAGINATION,
  ANIMATION_DURATION,
  BREAKPOINTS,
  COLORS,
};

