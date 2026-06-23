/**
 * API Client for Long Hưng Backend
 * Handles all API calls to the backend server
 */

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';
const API_TIMEOUT = import.meta.env.PUBLIC_API_TIMEOUT || 30000;

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch(endpoint, options = {}) {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get authorization header with token
 */
export function getAuthHeader() {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Auth API
 */
export const authAPI = {
  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () =>
    apiFetch('/api/auth/me', {
      headers: getAuthHeader(),
    }),
};

/**
 * Product API
 */
export const productAPI = {
  getAll: (page = 1, limit = 12, search = '', category = '') =>
    apiFetch(`/api/products?page=${page}&limit=${limit}&search=${search}&category=${category}`),

  getBySlug: (slug) =>
    apiFetch(`/api/products/${slug}`),

  create: (data, imageFile = null) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('stock', data.stock);
    if (data.unit !== undefined) formData.append('unit', data.unit);
    if (data.vat_percent !== undefined) formData.append('vat_percent', data.vat_percent);
    formData.append('category_id', data.category_id);
    if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active);
    if (data.image_url) formData.append('image_url', data.image_url);
    if (imageFile) formData.append('image', imageFile);

    return fetch(`${API_URL}/api/products`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  update: (id, data, imageFile = null) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price) formData.append('price', data.price);
    if (data.stock !== undefined) formData.append('stock', data.stock);
    if (data.unit !== undefined) formData.append('unit', data.unit);
    if (data.vat_percent !== undefined) formData.append('vat_percent', data.vat_percent);
    if (data.category_id !== undefined) formData.append('category_id', data.category_id);
    if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active);
    if (data.image_url) formData.append('image_url', data.image_url);
    if (imageFile) formData.append('image', imageFile);

    return fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      body: formData,
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  delete: (id) =>
    apiFetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }),
};

/**
 * Category API
 */
export const categoryAPI = {
  getAll: () =>
    apiFetch('/api/categories'),

  create: (name, description, displayOrder = 0) =>
    apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description, display_order: displayOrder }),
      headers: getAuthHeader(),
    }),

  update: (id, name, description, displayOrder = 0, isActive = true) =>
    apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, display_order: displayOrder, is_active: isActive }),
      headers: getAuthHeader(),
    }),

  delete: (id) =>
    apiFetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }),
};

/**
 * Article API
 */
export const articleAPI = {
  getAll: (page = 1, limit = 10, search = '') =>
    apiFetch(`/api/articles?page=${page}&limit=${limit}&search=${search}`),

  getBySlug: (slug) =>
    apiFetch(`/api/articles/${slug}`),

  getAllAdmin: (page = 1, limit = 20, search = '', published = '') =>
    apiFetch(`/api/articles/admin/list?page=${page}&limit=${limit}&search=${search}&published=${published}`, {
      headers: getAuthHeader(),
    }),

  create: (data, imageFile = null) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.is_published !== undefined) formData.append('is_published', data.is_published);
    if (data.featured_image) formData.append('featured_image', data.featured_image);
    if (imageFile) formData.append('image', imageFile);

    return fetch(`${API_URL}/api/articles`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  update: (id, data, imageFile = null) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.excerpt !== undefined) formData.append('excerpt', data.excerpt);
    if (data.is_published !== undefined) formData.append('is_published', data.is_published);
    if (data.featured_image) formData.append('featured_image', data.featured_image);
    if (imageFile) formData.append('image', imageFile);

    return fetch(`${API_URL}/api/articles/${id}`, {
      method: 'PUT',
      body: formData,
      headers: getAuthHeader(),
    }).then(r => r.json());
  },

  togglePublish: (id, isPublished) =>
    apiFetch(`/api/articles/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: isPublished }),
      headers: getAuthHeader(),
    }),

  delete: (id) =>
    apiFetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }),
};

/**
 * Order API
 */
export const orderAPI = {
  getAll: (page = 1, limit = 20, status = '') =>
    apiFetch(`/api/orders?page=${page}&limit=${limit}&status=${status}`, {
      headers: getAuthHeader(),
    }),

  getById: (id) =>
    apiFetch(`/api/orders/${id}`, {
      headers: getAuthHeader(),
    }),

  create: (data) =>
    apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiFetch(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader(),
    }),

  updateStatus: (id, status, notes = '') =>
    apiFetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
      headers: getAuthHeader(),
    }),

  delete: (id) =>
    apiFetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }),
};

/**
 * Health check
 */
export const healthAPI = {
  check: () => apiFetch('/api/health'),
};

export default {
  apiFetch,
  authAPI,
  productAPI,
  categoryAPI,
  articleAPI,
  orderAPI,
  healthAPI,
};
