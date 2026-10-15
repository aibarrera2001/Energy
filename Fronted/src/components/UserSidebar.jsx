import React from 'react';
import { NavLink } from 'react-router-dom';

export default function UserSidebar() {
  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    color: isActive ? '#FFFFFF' : '#94A3B8',
    backgroundColor: isActive ? '#10B981' : 'transparent',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    borderRadius: '0.6rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <header style={{
      width: '100%',
      backgroundColor: '#1E293B',
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxSizing: 'border-box'
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.4rem', color: '#F59E0B' }}>⚡</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>EnergiApp</h2>
      </div>

      {/* Enlaces Horizontales */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <NavLink to="/user/dashboard" style={linkStyle}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/user/propiedades" style={linkStyle}>
          <span>🏠</span> Propiedades
        </NavLink>
        <NavLink to="/user/paneles" style={linkStyle}>
          <span>🔋</span> Paneles
        </NavLink>
        <NavLink to="/user/citas" style={linkStyle}>
          <span>📅</span> Citas
        </NavLink>
        <NavLink to="/user/reportes" style={linkStyle}>
          <span>📈</span> Reportes
        </NavLink>
        <NavLink to="/user/asistente" style={linkStyle}>
          <span>🤖</span> Asistente IA
        </NavLink>
      </nav>

      {/* Indicador Estado */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.8rem',
        backgroundColor: '#0F172A',
        borderRadius: '2rem',
        fontSize: '0.8rem',
        color: '#94A3B8'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
        <span>En Línea</span>
      </div>
    </header>
  );
}