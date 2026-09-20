/**
 * Centralized API Client connecting Next.js Frontend to Express Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('invoice_auth_token');
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('invoice_auth_token', token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('invoice_auth_token');
  }
};

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; errors?: any; pagination?: any }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
export const authApi = {
  register: (payload: { companyName: string; name: string; email: string; password: string; phone?: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
};

// ----------------------------------------------------
// COMPANY API
// ----------------------------------------------------
export const companyApi = {
  get: () => apiRequest('/company'),
  update: (payload: {
    name?: string;
    taxId?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    defaultCurrency?: string;
    defaultVatRate?: number;
    invoicePrefix?: string;
  }) => apiRequest('/company', { method: 'PUT', body: JSON.stringify(payload) }),
};

// ----------------------------------------------------
// DASHBOARD & REPORTS API
// ----------------------------------------------------
export const dashboardApi = {
  getSummary: () => apiRequest('/dashboard/summary'),
  getSalesReport: (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    return apiRequest(`/reports/sales?${params.toString()}`);
  },
  getSalesByCustomer: () => apiRequest('/reports/by-customer'),
  getSalesByProduct: () => apiRequest('/reports/by-product'),
  getVatReport: () => apiRequest('/reports/vat'),
};

// ----------------------------------------------------
// CUSTOMER API
// ----------------------------------------------------
export const customerApi = {
  getAll: (search = '') => apiRequest(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (payload: { name: string; companyName?: string; email?: string; phone?: string; taxId?: string; address?: string }) =>
    apiRequest('/customers', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: any) =>
    apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id: string) =>
    apiRequest(`/customers/${id}`, { method: 'DELETE' }),
};

// ----------------------------------------------------
// PRODUCT API
// ----------------------------------------------------
export const productApi = {
  getAll: (search = '') => apiRequest(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (payload: {
    name: string;
    reference?: string;
    sellingPrice: number;
    purchasePrice?: number;
    vatRate?: number;
    stockQuantity?: number;
    minStockLevel?: number;
    unit?: string;
    originCountry?: string;
  }) => apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: any) =>
    apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id: string) =>
    apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

// ----------------------------------------------------
// INVOICE API
// ----------------------------------------------------
export const invoiceApi = {
  getAll: (filters: { status?: string; paymentStatus?: string; search?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus);
    if (filters.search) params.append('search', filters.search);
    return apiRequest(`/invoices?${params.toString()}`);
  },
  getById: (id: string) => apiRequest(`/invoices/${id}`),
  create: (payload: {
    customerId: string;
    dueDate: string;
    applyVat?: boolean;
    items: Array<{ productId: string; quantity: number; unitPrice?: number; discount?: number }>;
    discount?: number;
    paymentTerms?: string;
    notes?: string;
  }) => apiRequest('/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: any) => apiRequest(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  finalize: (id: string) => apiRequest(`/invoices/${id}/finalize`, { method: 'POST' }),
  cancel: (id: string) => apiRequest(`/invoices/${id}/cancel`, { method: 'POST' }),
  delete: (id: string) => apiRequest(`/invoices/${id}`, { method: 'DELETE' }),
  recordPayment: (invoiceId: string, payload: { amount: number; paymentMethod?: string; reference?: string; notes?: string }) =>
    apiRequest(`/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(payload) }),
  getPdfBlobUrl: async (invoiceId: string): Promise<string> => {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    const blob = await res.blob();
    return window.URL.createObjectURL(blob);
  }
};


