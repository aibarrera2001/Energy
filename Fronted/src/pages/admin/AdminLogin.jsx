import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await adminApi.login({ email, password });
      
      localStorage.setItem('adminEmpresa', JSON.stringify(data));
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Credenciales inválidas o error en el servidor.');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card admin-card">
        <aside className="auth-hero">
          <div className="brand-logo">⚡</div>
          <h1>EnergiApp</h1>
          <p>Panel de administración y control energético</p>
        </aside>

        <main className="auth-form-panel">
          <div className="form-header">
            <h2>Acceso administrativo</h2>
            <p>Ingresa tus credenciales de administración</p>
          </div>

          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

          <form className="form-box" onSubmit={handleSubmit}>
            <label>
              <span>Usuario administrador</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@energiapp.com" 
                required 
              />
            </label>

            <label>
              <span>Contraseña</span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </label>

            <button type="submit" className="primary-btn admin-btn">Ingresar</button>
          </form>

          <div className="separator"><span>¿Nueva empresa?</span></div>

          <Link to="/admin-registro" className="secondary-btn">
            Registrar Empresa
          </Link>
        </main>
      </div>
    </div>
  );
}