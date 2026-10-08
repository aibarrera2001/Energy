import React from 'react';
import { NavLink } from 'react-router-dom';

export default function UserSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⚡</span>
        <h2>EnergiApp</h2>
        <span className="role-badge">Usuario</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/user/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/user/propiedades" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>🏠</span> Propiedades
        </NavLink>
        <NavLink to="/user/paneles" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>🔋</span> Paneles
        </NavLink>
        <NavLink to="/user/citas" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>📅</span> Citas
        </NavLink>
        <NavLink to="/user/reportes" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>📊</span> Reportes
        </NavLink>
        <NavLink to="/user/asistente" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>🤖</span> Asistente IA
        </NavLink>
      </nav>

      <div className="sidebar-status">
        <div className="status-item">
          <span className="status-label">Estado</span>
          <span className="status-value online">● Online</span>
        </div>
        <div className="status-item">
          <span className="status-label">Rendimiento</span>
          <span className="status-value">Normal</span>
        </div>
      </div>
    </aside>
  );
}