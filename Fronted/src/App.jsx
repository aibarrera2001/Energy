import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. IMPORTAR EL COMPONENTE (Revisa si se llama RolSelector o RoleSelector):
import RolSelector from './pages/RolSelector'; 

// Páginas de Usuario
import UsuarioLogin from './pages/user/UsuarioLogin';
import UserDashboard from './pages/user/UserDashboard';
import UserPropiedades from './pages/user/UserPropiedades';
import RegistroCasa from './pages/user/RegistroCasa';
import UsuarioRegistro from './pages/user/UsuarioRegistro'; 
import Paneles from './pages/user/Paneles';
import Citas from './pages/user/Citas';
import Reportes from './pages/user/Reportes';
import AsistenteIA from './pages/user/AsistenteIA';

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
        <Route path="/registrar-casa" element={<RegistroCasa />} />
        <Route path="/usuario-registro" element={<UsuarioRegistro />} />
        <Route path="/paneles" element={<Paneles />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/asistente-ia" element={<AsistenteIA />} />

        
        {/* Rutas de Administrador */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-registro" element={<AdminRegistro />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;