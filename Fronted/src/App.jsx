import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Páginas de Usuario
import UsuarioLogin from './pages/user/UsuarioLogin';
import UserDashboard from './pages/user/UserDashboard';
import UserPropiedades from './pages/user/UserPropiedades';

// Páginas de Administrador
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegistro from './pages/admin/AdminRegistro';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/usuario-login" replace />} />

        {/* Rutas de Usuario */}
        <Route path="/usuario-login" element={<UsuarioLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        {/* Redirecciona /dashboard automáticamente a /user/dashboard */}
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/propiedades" element={<UserPropiedades />} />

        {/* Rutas de Administrador */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-registro" element={<AdminRegistro />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;