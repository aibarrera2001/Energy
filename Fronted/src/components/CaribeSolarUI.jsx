import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const CARIBE_THEME = {
  petroleo: '#092F35',
  petroleoSuperficie: '#0D3B42',
  amarillo: '#FFBF3F',
  amarilloHover: '#F5B32E',
  marfil: '#F7F4EB',
  marfilSecundario: '#EFECE1',
  turquesa: '#1C8077',
  pizarra: '#586F73',
  blanco: '#FFFFFF',
  borde: 'rgba(9, 47, 53, 0.12)',
};

export function useCaribeFonts() {
  useEffect(() => {
    const id = 'energiapp-caribe-solar-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);
}

/* Isotipo refinado: sol naciente en franjas de celda fotovoltaica con lectura de "e" */
export const LogoEnergiapp = ({ size = 28, monochrome = false }) => {
  const arcColor = monochrome ? 'currentColor' : '#FFBF3F';
  const cellColor = monochrome ? 'currentColor' : '#1C8077';

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Arco solar exterior */}
      <path
        d="M5 17.5C5 11.4249 9.92487 6.5 16 6.5C22.0751 6.5 27 11.4249 27 17.5"
        stroke={arcColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Trazo interno en forma de "e" / celda */}
      <path
        d="M10.5 16.5H21.5C21.5 13.4624 19.0376 11 16 11C12.9624 11 10.5 13.4624 10.5 16.5C10.5 19.2 12.6 21 15.8 21H20.5"
        stroke={arcColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Franjas de horizonte y retícula */}
      <line x1="3.5" y1="21" x2="8.5" y2="21" stroke={arcColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="23.5" y1="21" x2="28.5" y2="21" stroke={arcColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="7.5" y1="25.5" x2="24.5" y2="25.5" stroke={cellColor} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
};

/* Familia única de iconos lineales (trazo 1.8px) */
export const CaribeIcons = {
  ArrowUpRight: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  ),
  ArrowRight: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  ),
  Home: ({ size = 20, color = '#1C8077' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  ),
  Building: ({ size = 20, color = '#092F35' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
      <path d="M10 21v-3h4v3" />
    </svg>
  ),
  Compass: ({ size = 20, color = '#1C8077' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" />
    </svg>
  ),
  GridSolar: ({ size = 20, color = '#1C8077' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="9" y1="4" x2="9" y2="18" />
      <line x1="15" y1="4" x2="15" y2="18" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  ),
};

/* Contenedor unificado de autenticación para Propietarios y Empresas */
export function CaribeAuthLayout({
  badge = 'Portal Energiapp',
  titulo,
  subtitulo,
  children,
  footerLinkText,
  footerActionText,
  onFooterAction,
}) {
  const navigate = useNavigate();
  useCaribeFonts();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: CARIBE_THEME.marfil,
        color: CARIBE_THEME.petroleo,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          backgroundColor: CARIBE_THEME.petroleo,
          color: CARIBE_THEME.marfil,
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(247, 244, 235, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <LogoEnergiapp size={28} />
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                color: CARIBE_THEME.marfil,
              }}
            >
              energiapp
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'rgba(247, 244, 235, 0.08)',
              color: CARIBE_THEME.marfil,
              border: '1px solid rgba(247, 244, 235, 0.2)',
              borderRadius: '12px',
              padding: '0.5rem 0.95rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 0.2s ease',
            }}
          >
            ← Volver al inicio
          </button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.25rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: CARIBE_THEME.blanco,
            border: `1px solid ${CARIBE_THEME.borde}`,
            borderRadius: '16px',
            padding: '2.25rem',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: CARIBE_THEME.turquesa,
              backgroundColor: 'rgba(28, 128, 119, 0.1)',
              padding: '0.3rem 0.65rem',
              borderRadius: '8px',
              marginBottom: '0.9rem',
            }}
          >
            {badge}
          </span>

          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              color: CARIBE_THEME.petroleo,
              margin: '0 0 0.45rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            {titulo}
          </h1>

          <p
            style={{
              color: CARIBE_THEME.pizarra,
              fontSize: '0.95rem',
              lineHeight: 1.55,
              margin: '0 0 1.75rem 0',
            }}
          >
            {subtitulo}
          </p>

          {children}

          {footerLinkText && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: `1px solid ${CARIBE_THEME.borde}`,
                fontSize: '0.9rem',
                color: CARIBE_THEME.pizarra,
                textAlign: 'left',
              }}
            >
              {footerLinkText}{' '}
              <button
                type="button"
                onClick={onFooterAction}
                style={{
                  background: 'none',
                  border: 'none',
                  color: CARIBE_THEME.turquesa,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                }}
              >
                {footerActionText}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export const caribeInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  backgroundColor: CARIBE_THEME.marfil,
  color: CARIBE_THEME.petroleo,
  border: '1px solid rgba(9, 47, 53, 0.2)',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

export const caribeLabelStyle = {
  display: 'block',
  fontSize: '0.88rem',
  fontWeight: 600,
  color: CARIBE_THEME.petroleo,
  marginBottom: '0.4rem',
};

/* Botón principal en amarillo solar con texto petróleo (nunca blanco) */
export const caribePrimaryButtonStyle = {
  width: '100%',
  padding: '0.95rem 1.25rem',
  backgroundColor: CARIBE_THEME.amarillo,
  color: CARIBE_THEME.petroleo,
  border: 'none',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.98rem',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'background-color 0.2s ease',
};

/* Botón estructural en petróleo profundo */
export const caribeSecondaryButtonStyle = {
  width: '100%',
  padding: '0.95rem 1.25rem',
  backgroundColor: CARIBE_THEME.petroleo,
  color: CARIBE_THEME.marfil,
  border: 'none',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.98rem',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'opacity 0.2s ease',
};