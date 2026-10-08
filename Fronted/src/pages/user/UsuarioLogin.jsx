import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UsuarioLogin() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Mapeamos a "email" y "password" como requiere UsuarioController.java
        body: JSON.stringify({
          email: correo,
          password: contrasena
        }),
      });

      if (response.ok) {
        const usuario = await response.json();
        
        // El backend responde con "id", "nombre" y "email"
        localStorage.setItem('usuarioId', usuario.id);
        localStorage.setItem('usuarioNombre', usuario.nombre);

        // Redirección al Dashboard
        navigate('/user/dashboard');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Iniciar Sesión - Usuario</h2>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <label>Correo Electrónico:</label>
        <input 
          type="email" 
          value={correo} 
          onChange={(e) => setCorreo(e.target.value)} 
          required 
        />

        <label>Contraseña:</label>
        <input 
          type="password" 
          value={contrasena} 
          onChange={(e) => setContrasena(e.target.value)} 
          required 
        />

        <button type="submit" className="primary-btn">
          Ingresar
        </button>
      </form>
    </div>
  );
}