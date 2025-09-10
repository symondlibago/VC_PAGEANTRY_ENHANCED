import axios from 'axios';

// Environment configuration
// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://192.168.137.1:8000/api';
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8000/api';
// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://192.168.68.100:8000/api';
// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://192.168.68.104:8000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token  
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network'
      });
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        console.error('Forbidden access:', data?.message);
        break;
      case 404:
        console.error('Resource not found:', data?.message);
        break;
      case 422:
        console.error('Validation error:', data?.errors);
        break;
      case 500:
        console.error('Server error:', data?.message);
        break;
      default:
        console.error(`HTTP ${status} error:`, data?.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/logout');
      // Clear local storage on successful logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return response;
    } catch (error) {
      // Clear local storage even if logout fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  getUser: () => api.get('/user'),
  changePassword: (data) => api.post('/change-password', data),
};

// Candidates API functions
export const candidatesAPI = {
  getAll: (params = {}) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  
  create: async (formData) => {
    // If formData is already a FormData object, use it directly
    if (formData instanceof FormData) {
      return api.post('/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Otherwise, create FormData from the data object
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    });
    
    return api.post('/candidates', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  update: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
  
    // Append method override for Laravel
    formData.append('_method', 'PUT');
  
    return api.post(`/candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  
  
  delete: (id) => api.delete(`/candidates/${id}`),
  getForJudging: (category) => api.get('/candidates/for-judging', { 
    params: { category } 
  }),
  getActive: () => api.get('/candidates/active'),
  getScores: (id) => api.get(`/candidates/${id}/scores`),
};

// Judges API functions (Admin only)
export const judgesAPI = {
  getAll: (params = {}) => api.get('/judges', { params }),
  getById: (id) => api.get(`/judges/${id}`),
  
  create: async (data) => {
    return api.post('/judges', {
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      is_active: data.is_active ?? true
    });
  },
  
  update: (id, data) => api.put(`/judges/${id}`, {
    name: data.name?.trim(),
    email: data.email?.trim().toLowerCase(),
    is_active: data.is_active
  }),
  
  delete: (id) => api.delete(`/judges/${id}`),
  toggleStatus: (id) => api.post(`/judges/${id}/toggle-status`),
};

// Scores API functions
export const scoresAPI = {
  getAll: (params = {}) => api.get('/scores', { params }),
  
  submit: async (data) => {
    return api.post('/scores', {
      candidate_id: parseInt(data.candidate_id),
      category: data.category,
      score: parseFloat(data.score)
    });
  },
  
  getMine: (params = {}) => api.get('/scores/mine', { params }),
  getNextCandidate: (category) => api.get('/scores/next-candidate', { 
    params: { category } 
  }),
  getAnalytics: (category, params = {}) => 
  api.get('/scores/analytics', { 
    params: { category, ...params } 
  }),

  getProgress: () => api.get('/scores/progress'),
};

// Export API functions
export const exportAPI = {
  exportExcel: async (params = {}) => {
    try {
      const response = await api.get("/export/excel", {
        params: params,
        responseType: "blob"
      });
      return response;
    } catch (error) {
      console.error("Excel export error:", error);
      throw error;
    }
  },
  
  exportPdf: async (params = {}) => {
    try {
      const response = await api.get("/export/pdf", {
        params: params,
        responseType: "blob"
      });
      return response;
    } catch (error) {
      console.error("PDF export error:", error.response?.data || error.message);
      throw error;
    }
  },
};

// Utility functions
export const downloadFile = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('File download error:', error);
    throw new Error('Failed to download file');
  }
};

// API health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', message: 'API unavailable' };
  }
};

export default api;
