const API_BASE_URL = 'http://localhost:8080/api';

export const adminApi = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  },

  registro: async (empresaData) => {
    const response = await fetch(`${API_BASE_URL}/admin/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresaData),
    });
    return await response.json();
  }
};