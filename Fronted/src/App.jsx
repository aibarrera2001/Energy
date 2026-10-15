import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importación de Páginas Principales
import RoleSelector from './pages/RoleSelector';

// Importación de Módulos de Usuario
import UsuarioLogin from './pages/user/UsuarioLogin';
import UserDashboard from './pages/user/UserDashboard';

// Importación de Módulos de Administrador
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegistro from './pages/admin/AdminRegistro';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página Inicial - Selector de Rol e Información Institucional */}
        <Route path="/" element={<RoleSelector />} />

        {/* Portales de Usuario */}
        <Route path="/usuario-login" element={<UsuarioLogin />} />
        <Route path="/usuario-registro" element={<UsuarioLogin />} /> {/* Redirige a Login o a tu formulario de registro */}
        <Route path="/user/dashboard" element={<UserDashboard />} />

        {/* Portales de Administrador */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-registro" element={<AdminRegistro />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Redirección de respaldo en caso de ruta inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}