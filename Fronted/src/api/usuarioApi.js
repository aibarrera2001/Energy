const API_BASE_URL = 'http://localhost:8080/api';

export const usuarioApi = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: Credenciales inválidas o falla en el servidor`);
    }
    return await response.json();
  },

  getPropiedades: async (usuarioId) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/propiedades`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener las propiedades`);
    }
    return await response.json();
  },

  guardarPropiedad: async (usuarioId, propiedad) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/propiedades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propiedad),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo guardar la propiedad`);
    }
    return await response.json();
  }
};