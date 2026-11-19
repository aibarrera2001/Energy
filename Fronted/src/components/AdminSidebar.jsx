import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CARIBE_THEME,
  LogoEnergiapp,
  CaribeIcons,
  useCaribeFonts,
} from './CaribeSolarUI';

export default function AdminSidebar({ tabActiva, onSelectTab }) {
  const navigate = useNavigate();
  useCaribeFonts();

  const [colapsado, setColapsado] = useState(() => {
    return localStorage.getItem('adminSidebarColapsado') === 'true';
  });

  const anchoActual = colapsado ? '78px' : '260px';

  useEffect(() => {
    document.documentElement.style.setProperty('--admin-sidebar-width', anchoActual);
    localStorage.setItem('adminSidebarColapsado', String(colapsado));
  }, [colapsado, anchoActual]);

  const adminNombre = localStorage.getItem('adminNombre') || 'Administrador';
  const nombreEmpresa = localStorage.getItem('nombreEmpresa') || 'Empresa Solar';

  const menuItems = [
    {
      id: 'resumen',
      label: 'Resumen general',
      icon: <CaribeIcons.Home size={19} />,
    },
    {
      id: 'catalogo',
      label: 'Catálogo de paneles',
      icon: <CaribeIcons.GridSolar size={19} />,
    },
    {
      id: 'finanzas',
      label: 'Informes financieros',
      icon: <CaribeIcons.ArrowUpRight size={19} />,
    },
    {
      id: 'factura',
      label: 'Emitir factura',
      icon: <CaribeIcons.Building size={19} />,
    },
  ];

  const handleCerrarSesion = () => {
    localStorage.removeItem('idEmpresa');
    localStorage.removeItem('adminNombre');
    localStorage.removeItem('nombreEmpresa');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('rol');
    navigate('/admin-login');
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
        {/* Cabecera de marca + botón de colapso */}
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
          {!colapsado && (
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
              <div style={{ whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    letterSpacing: '-0.02em',
                    display: 'block',
                    color: CARIBE_THEME.marfil,
                  }}
                >
                  energiapp
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: CARIBE_THEME.amarillo,
                  }}
                >
                  Consola Admin
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setColapsado((prev) => !prev)}
            title={colapsado ? 'Expandir menú' : 'Contraer menú'}
            style={{
              backgroundColor: 'rgba(247, 244, 235, 0.08)',
              border: '1px solid rgba(247, 244, 235, 0.14)',
              color: CARIBE_THEME.marfil,
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              fontSize: '0.95rem',
            }}
          >
            {colapsado ? '»' : '«'}
          </button>
        </div>

        {/* Tarjeta de empresa y administrador */}
        {!colapsado && (
          <div
            style={{
              marginTop: '1.15rem',
              padding: '0.85rem 0.95rem',
              backgroundColor: 'rgba(247, 244, 235, 0.06)',
              border: '1px solid rgba(247, 244, 235, 0.1)',
              borderRadius: '12px',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: CARIBE_THEME.turquesa,
              }}
            >
              Empresa Instaladora
            </span>
            <strong
              style={{
                display: 'block',
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.92rem',
                color: CARIBE_THEME.marfil,
                marginTop: '0.2rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {nombreEmpresa}
            </strong>
            <span
              style={{
                display: 'block',
                fontSize: '0.78rem',
                color: 'rgba(247, 244, 235, 0.7)',
                marginTop: '0.15rem',
              }}
            >
              {adminNombre}
            </span>
          </div>
        )}

        {/* Navegación principal */}
        <nav
          style={{
            marginTop: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          {menuItems.map((item) => {
            const activo = tabActiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={colapsado ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: colapsado ? 'center' : 'flex-start',
                  gap: '0.75rem',
                  width: '100%',
                  padding: colapsado ? '0.75rem 0' : '0.78rem 0.9rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: activo ? CARIBE_THEME.amarillo : 'transparent',
                  color: activo ? CARIBE_THEME.petroleo : 'rgba(247, 244, 235, 0.85)',
                  fontWeight: activo ? 700 : 500,
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.16s ease',
                }}
              >
                <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                  {React.cloneElement(item.icon, {
                    color: activo ? CARIBE_THEME.petroleo : CARIBE_THEME.marfil,
                  })}
                </span>
                {!colapsado && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del sidebar */}
      <div
        style={{
          paddingTop: '1rem',
          borderTop: '1px solid rgba(247, 244, 235, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          title={colapsado ? 'Ir al inicio' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: colapsado ? 'center' : 'flex-start',
            gap: '0.65rem',
            width: '100%',
            padding: '0.68rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid rgba(247, 244, 235, 0.14)',
            backgroundColor: 'transparent',
            color: CARIBE_THEME.marfil,
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span>⌂</span>
          {!colapsado && <span>Portal principal</span>}
        </button>

        <button
          type="button"
          onClick={handleCerrarSesion}
          title={colapsado ? 'Cerrar sesión' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: colapsado ? 'center' : 'flex-start',
            gap: '0.65rem',
            width: '100%',
            padding: '0.68rem 0.85rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'rgba(220, 68, 68, 0.16)',
            color: '#FCA5A5',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span>⎋</span>
          {!colapsado && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}