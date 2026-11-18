import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function UserSidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/propiedades', label: 'Propiedades', icon: '🏠' },
    { path: '/paneles', label: 'Paneles', icon: '🔋' },
    { path: '/citas', label: 'Citas', icon: '📅' },
    { path: '/reportes', label: 'Reportes', icon: '📈' },
    { path: '/asistente-ia', label: 'Asistente IA', icon: '🤖' }
  ];

  return (
    <nav
      style={{
        backgroundColor: '#1E293B',
        borderBottom: '1px solid #334155',
        padding: '0.85rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Logo */}
        <Link
          to="/user/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.25rem'
          }}
        >
          <span>⚡</span>
          <span>EnergiApp</span>
        </Link>

        {/* Enlaces de navegación */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap'
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? '#6366F1' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Indicadores de Estado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.8rem'
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              padding: '0.3rem 0.7rem',
              borderRadius: '999px',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981'
              }}
            />
            Estado: Online
          </span>

          <span
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818CF8',
              padding: '0.3rem 0.7rem',
              borderRadius: '999px',
              fontWeight: 600
            }}
          >
            Rendimiento: Normal
          </span>
        </div>
      </div>
    </nav>
  );
}