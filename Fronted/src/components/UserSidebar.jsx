import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CARIBE_THEME,
  LogoEnergiapp,
  CaribeIcons,
  useCaribeFonts,
} from './CaribeSolarUI';

export default function UserSidebar({ colapsadoExterno, onToggleColapso }) {
  const navigate = useNavigate();
  const location = useLocation();
  useCaribeFonts();

  const [colapsadoInterno, setColapsadoInterno] = useState(() => {
    return localStorage.getItem('sidebarColapsado') === 'true';
  });

  const colapsado =
    typeof colapsadoExterno === 'boolean' ? colapsadoExterno : colapsadoInterno;

  const anchoActual = colapsado ? '78px' : '260px';

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', anchoActual);
    localStorage.setItem('sidebarColapsado', String(colapsado));
  }, [colapsado, anchoActual]);

  const toggleSidebar = () => {
    if (typeof onToggleColapso === 'function') {
      onToggleColapso(!colapsado);
    } else {
      setColapsadoInterno((prev) => !prev);
    }
  };

  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nombreUsuario = usuarioGuardado?.nombre || 'Propietario';
  const ciudadUsuario = usuarioGuardado?.ciudad || 'Región Caribe';

  const menuItems = [
    {
      label: 'Resumen general',
      ruta: '/user/dashboard',
      icon: <CaribeIcons.Home size={19} />,
    },
    {
      label: 'Mis propiedades',
      ruta: '/propiedades',
      icon: <CaribeIcons.Building size={19} />,
    },
    {
      label: 'Catálogo de paneles',
      ruta: '/paneles',
      icon: <CaribeIcons.GridSolar size={19} />,
    },
    {
      label: 'Citas y soporte',
      ruta: '/citas',
      icon: <CaribeIcons.Compass size={19} />,
    },
    {
      label: 'Reportes solares',
      ruta: '/reportes',
      icon: <CaribeIcons.ArrowUpRight size={19} />,
    },
    {
      label: 'Asistente IA',
      ruta: '/asistente-ia',
      icon: <CaribeIcons.ArrowRight size={19} />,
    },
  ];

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: anchoActual,
        height: '100vh',
        backgroundColor: CARIBE_THEME.petroleo,
        color: CARIBE_THEME.marfil,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: colapsado ? '1.35rem 0.65rem' : '1.4rem 1.05rem',
        borderRight: '1px solid rgba(247, 244, 235, 0.08)',
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        zIndex: 30,
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), padding 0.28s ease',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <div>
        {/* Cabecera de marca + Botón de movimiento */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: colapsado ? 'center' : 'space-between',
            gap: '0.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(247, 244, 235, 0.08)',
          }}
        >
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <LogoEnergiapp size={28} />
            </div>
            {!colapsado && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.18rem',
                    letterSpacing: '-0.02em',
                    color: CARIBE_THEME.marfil,
                    lineHeight: 1.1,
                  }}
                >
                  energiapp
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#8CE0D6',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  Portal Propietario
                </span>
              </div>
            )}
          </div>

          {!colapsado && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Contraer menú"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: '1px solid rgba(247, 244, 235, 0.16)',
                backgroundColor: '#0D3B42',
                color: CARIBE_THEME.marfil,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ‹
            </button>
          )}
        </div>

        {/* Botón para expandir cuando está colapsado */}
        {colapsado && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expandir menú"
            style={{
              width: '100%',
              marginTop: '0.85rem',
              padding: '0.45rem',
              borderRadius: '8px',
              border: '1px solid rgba(247, 244, 235, 0.16)',
              backgroundColor: '#0D3B42',
              color: CARIBE_THEME.amarillo,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ›
          </button>
        )}

        {/* Ficha compacta del usuario */}
        {!colapsado && (
          <div
            style={{
              margin: '1.15rem 0',
              padding: '0.85rem 0.9rem',
              backgroundColor: '#0D3B42',
              border: '1px solid rgba(247, 244, 235, 0.08)',
              borderRadius: '12px',
              textAlign: 'left',
              whiteSpace: 'nowrap',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.92rem',
                color: CARIBE_THEME.marfil,
                marginBottom: '0.2rem',
              }}
            >
              {nombreUsuario}
            </strong>
            <span
              style={{
                display: 'block',
                fontSize: '0.78rem',
                color: 'rgba(247, 244, 235, 0.68)',
              }}
            >
              {ciudadUsuario} · Caribe
            </span>
          </div>
        )}

        {/* Navegación principal */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            marginTop: colapsado ? '1rem' : '0',
          }}
        >
          {menuItems.map((item) => {
            const estaActivo = location.pathname === item.ruta;

            return (
              <button
                key={item.ruta}
                type="button"
                title={colapsado ? item.label : ''}
                onClick={() => navigate(item.ruta)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: colapsado ? 'center' : 'flex-start',
                  gap: '0.75rem',
                  padding: colapsado ? '0.75rem 0' : '0.75rem 0.95rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: estaActivo ? CARIBE_THEME.amarillo : 'transparent',
                  color: estaActivo ? CARIBE_THEME.petroleo : 'rgba(247, 244, 235, 0.85)',
                  fontWeight: estaActivo ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!estaActivo) e.currentTarget.style.backgroundColor = '#0D3B42';
                }}
                onMouseLeave={(e) => {
                  if (!estaActivo) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {React.cloneElement(item.icon, {
                    color: estaActivo ? CARIBE_THEME.petroleo : '#8CE0D6',
                  })}
                </span>
                {!colapsado && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del sidebar: cerrar sesión */}
      <div
        style={{
          paddingTop: '1rem',
          borderTop: '1px solid rgba(247, 244, 235, 0.08)',
        }}
      >
        <button
          type="button"
          title="Cerrar sesión"
          onClick={handleCerrarSesion}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: colapsado ? 'center' : 'space-between',
            padding: colapsado ? '0.75rem 0' : '0.75rem 0.95rem',
            borderRadius: '12px',
            border: '1px solid rgba(247, 244, 235, 0.16)',
            backgroundColor: 'transparent',
            color: 'rgba(247, 244, 235, 0.85)',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0D3B42')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {!colapsado && <span>Cerrar sesión</span>}
          <CaribeIcons.ArrowUpRight color="#FFBF3F" />
        </button>
      </div>
    </aside>
  );
}