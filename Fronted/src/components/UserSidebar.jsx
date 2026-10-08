import React from 'react';
import { NavLink } from 'react-router-dom';

export default function UserSidebar() {
  return (
    <aside className="custom-sidebar">
      <div className="sidebar-brand-box">
        <span className="brand-icon">⚡</span>
        <span className="brand-text">EnergiApp</span>
      </div>

      <nav className="sidebar-nav-container">
        <NavLink to="/user/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/user/propiedades" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">🏠</span>
          <span>Propiedades</span>
        </NavLink>
        <NavLink to="/user/paneles" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">🔋</span>
          <span>Paneles</span>
        </NavLink>
        <NavLink to="/user/citas" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">📅</span>
          <span>Citas</span>
        </NavLink>
        <NavLink to="/user/reportes" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">📈</span>
          <span>Reportes</span>
        </NavLink>
        <NavLink to="/user/asistente" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">🤖</span>
          <span>Asistente IA</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer-card">
        <div className="footer-row">
          <span>Estado</span>
          <span className="badge-online">Online</span>
        </div>
        <div className="footer-row">
          <span>Rendimiento</span>
          <span className="footer-value">Normal</span>
        </div>
      </div>
    </aside>
  );
}