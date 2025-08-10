/**
 * API utilities for backend authentication
 */

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorDetails = null;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      errorDetails = errorData;
    } catch (e) {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(errorMessage, response.status, errorDetails);
  }
  
  return response.json();
};

// Auth API functions
export const authApi = {
  // Register a new user
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await handleResponse(response);
    return data;
  },

  // Login user
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse(response);
    
    // Store the token in localStorage
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem('token_expires_in', data.expires_in.toString());
      localStorage.setItem('token_created_at', Date.now().toString());
    }
    
    return data;
  },

  // Get current user info
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  // Verify token
  async verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  // Update current user
  async updateUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  // Logout (client-side only for now)
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('token_expires_in');
    localStorage.removeItem('token_created_at');
  },

  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('access_token');
    const createdAt = localStorage.getItem('token_created_at');
    const expiresIn = localStorage.getItem('token_expires_in');
    
    if (!token || !createdAt || !expiresIn) {
      return false;
    }
    
    // Check if token has expired
    const tokenAge = Date.now() - parseInt(createdAt);
    const tokenMaxAge = parseInt(expiresIn) * 1000; // Convert to milliseconds
    
    if (tokenAge > tokenMaxAge) {
      // Token has expired, remove it
      this.logout();
      return false;
    }
    
    return true;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('access_token');
  },

  // Get current user from token without API call
  getCurrentUserFromToken() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      // Decode JWT token (simple base64 decode for payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        // Add other user info if available in token
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
};

export { ApiError };