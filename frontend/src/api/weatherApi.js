const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    return { success: false, error: err.message || 'Network request failed' };
  }
}

export const weatherApi = {
  // Database status
  getDbStatus: () => fetchJson('/database/status'),

  // Filter metadata
  getFilterOptions: () => fetchJson('/meta/filters'),

  // Dashboard Overview
  getOverview: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/dashboard/overview${query ? `?${query}` : ''}`);
  },

  // Temperature Analytics
  getTemperatureAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/analytics/temperature${query ? `?${query}` : ''}`);
  },

  // Humidity Analytics
  getHumidityAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/analytics/humidity${query ? `?${query}` : ''}`);
  },

  // Rainfall Analytics
  getRainfallAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/analytics/rainfall${query ? `?${query}` : ''}`);
  },

  // Combined Analytics
  getCombinedAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/analytics/combined${query ? `?${query}` : ''}`);
  },

  // Monthly Reports
  getMonthlyReport: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/reports/monthly${query ? `?${query}` : ''}`);
  },

  // Data Quality
  getQualityDashboard: () => fetchJson('/quality/dashboard'),

  // Records Table with Search, Filter & Pagination
  getRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/records${query ? `?${query}` : ''}`);
  },

  // Upload & Validate CSV
  uploadAndValidate: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/upload-validate`, {
        method: 'POST',
        body: formData,
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Confirm Import
  confirmImport: (payload) => {
    return fetchJson('/confirm-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Seed sample data
  seedSampleData: () => {
    return fetchJson('/data/seed-sample', {
      method: 'POST',
    });
  },

  // Clear data
  clearAllData: () => {
    return fetchJson('/data/clear', {
      method: 'POST',
    });
  },

  // Download URLs
  getSampleDownloadUrl: () => `${API_BASE_URL}/export/sample`,
  getRecordsExportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/export/records${query ? `?${query}` : ''}`;
  },
  getReportExportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/export/report-csv${query ? `?${query}` : ''}`;
  },
};
