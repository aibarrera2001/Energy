import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. IMPORTAR EL COMPONENTE (Revisa si se llama RolSelector o RoleSelector):
import RolSelector from './pages/RolSelector'; 

// Páginas de Usuario
import UsuarioLogin from './pages/user/UsuarioLogin';
import UserDashboard from './pages/user/UserDashboard';
import UserPropiedades from './pages/user/UserPropiedades';

// Páginas de Administrador
import AdminLogin from './pages/admin/Login/AdminLogin';
import AdminRegistro from './pages/admin/Login/AdminRegistro';
import AdminDashboard from './pages/admin/Inicio/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Principal */}
        <Route path="/" element={<RolSelector />} />

        {/* Rutas de Usuario */}
        <Route path="/usuario-login" element={<UsuarioLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
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