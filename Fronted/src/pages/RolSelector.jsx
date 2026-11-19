import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CARIBE_THEME,
  LogoEnergiapp,
  CaribeIcons,
  useCaribeFonts,
} from '../components/CaribeSolarUI';
import mapaCaribeReal from '../assets/Mapavectorial.svg';
/* Mapa vectorial limpio: únicamente silueta de Colombia, Caribe en amarillo solar y etiqueta breve */
const MapaCaribeLimpio = () => (
  <div
    style={{
      backgroundColor: '#0A2F34',
      border: '1px solid rgba(247, 244, 235, 0.12)',
      borderRadius: '16px',
      padding: '0.75rem',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        borderRadius: '12px',
        backgroundColor: '#0A2F34',
      }}
    >
      <img
        src={mapaCaribeReal}
        alt="Mapa de Colombia destacando la Región Caribe colombiana"
        style={{
          position: 'absolute',
          top: '-13%',
          right: '-2%',
          width: '185%',
          maxWidth: 'none',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </div>
  </div>
);

export default function RolSelector() {
  const navigate = useNavigate();
  useCaribeFonts();

  const [menuIngresoAbierto, setMenuIngresoAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuIngresoAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: CARIBE_THEME.petroleo,
        color: CARIBE_THEME.marfil,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* 1. CABECERA CON ACCESO ÚNICO */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.35rem 0',
            borderBottom: '1px solid rgba(247, 244, 235, 0.08)',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <LogoEnergiapp size={28} />
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '1.28rem',
                letterSpacing: '-0.02em',
                color: CARIBE_THEME.marfil,
              }}
            >
              energiapp
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <button
              type="button"
              onClick={() => scrollToSection('capacidades')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(247, 244, 235, 0.78)',
                fontSize: '0.92rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Plataforma
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('proyecto')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(247, 244, 235, 0.78)',
                fontSize: '0.92rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Sobre el proyecto
            </button>

            {/* Único punto de acceso en toda la portada */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuIngresoAbierto((prev) => !prev)}
                aria-expanded={menuIngresoAbierto}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#0D3B42',
                  color: CARIBE_THEME.marfil,
                  border: '1px solid rgba(247, 244, 235, 0.22)',
                  borderRadius: '12px',
                  padding: '0.6rem 1.1rem',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Ingresar <CaribeIcons.ArrowUpRight color="#FFBF3F" />
              </button>

              {menuIngresoAbierto && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 0.55rem)',
                    width: '270px',
                    backgroundColor: '#0D3B42',
                    border: '1px solid rgba(247, 244, 235, 0.16)',
                    borderRadius: '14px',
                    padding: '0.5rem',
                    boxShadow: '0 18px 36px rgba(4, 22, 25, 0.55)',
                    zIndex: 30,
                    textAlign: 'left',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate('/usuario-login')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: CARIBE_THEME.marfil,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#124851')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ marginTop: '2px' }}>
                      <CaribeIcons.Home size={18} color="#FFBF3F" />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>
                        Propietarios y clientes
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(247, 244, 235, 0.68)' }}>
                        Consulta tu sistema y soporte
                      </span>
                    </div>
                  </button>

                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'rgba(247, 244, 235, 0.08)',
                      margin: '0.25rem 0.5rem',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => navigate('/admin-login')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: CARIBE_THEME.marfil,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#124851')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ marginTop: '2px' }}>
                      <CaribeIcons.Building size={18} color="#8CE0D6" />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>
                        Empresas y operadores
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(247, 244, 235, 0.68)' }}>
                        Gestión operativa y usuarios
                      </span>
                    </div>
                  </button>

                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'rgba(247, 244, 235, 0.08)',
                      margin: '0.25rem 0.5rem',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => navigate('/admin-registro')}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#8CE0D6',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#124851')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Registrar una empresa →
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* 2. MENSAJE PRINCIPAL + MAPA PROTAGONISTA */}
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
            padding: '4.25rem 0 4.75rem 0',
            borderBottom: '1px solid rgba(247, 244, 235, 0.08)',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8CE0D6',
                margin: '0 0 1rem 0',
              }}
            >
              Energía solar · Caribe colombiano
            </p>

            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(2.25rem, 4.4vw, 3.55rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: CARIBE_THEME.marfil,
                margin: '0 0 1.25rem 0',
              }}
            >
              El sol del Caribe,{' '}
              <span style={{ color: CARIBE_THEME.amarillo }}>convertido en decisiones.</span>
            </h1>

            <p
              style={{
                fontSize: '1.08rem',
                lineHeight: 1.6,
                color: 'rgba(247, 244, 235, 0.8)',
                maxWidth: '50ch',
                margin: '0 0 2.15rem 0',
              }}
            >
              Consulta el potencial solar, conoce tu sistema y planifica tu próximo paso en
              energía fotovoltaica.
            </p>

            {/* Única acción principal en el bloque hero */}
            <button
              type="button"
              onClick={() => scrollToSection('capacidades')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                backgroundColor: CARIBE_THEME.amarillo,
                color: CARIBE_THEME.petroleo,
                border: 'none',
                borderRadius: '12px',
                padding: '0.95rem 1.5rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Conocer la plataforma <CaribeIcons.ArrowRight color="#092F35" />
            </button>
          </div>

          <MapaCaribeLimpio />
        </header>

        {/* 3. TRES CAPACIDADES CONCRETAS */}
        <section
          id="capacidades"
          style={{
            padding: '4.25rem 0',
            borderBottom: '1px solid rgba(247, 244, 235, 0.08)',
            textAlign: 'left',
          }}
        >
          <div style={{ marginBottom: '2.25rem', maxWidth: '58ch' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8CE0D6',
              }}
            >
              Qué ofrece la plataforma
            </span>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.15rem)',
                fontWeight: 700,
                color: CARIBE_THEME.marfil,
                margin: '0.4rem 0 0 0',
                letterSpacing: '-0.02em',
              }}
            >
              Herramientas técnicas para decidir y operar
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.35rem',
            }}
          >
            {[
              {
                num: '01',
                titulo: 'Potencial solar regional',
                descripcion:
                  'Consulta parámetros fotovoltaicos ajustados a las condiciones climáticas de la Región Caribe colombiana.',
              },
              {
                num: '02',
                titulo: 'Estimación y viabilidad',
                descripcion:
                  'Evalúa opciones de paneles, eficiencia y dimensionamiento previo antes de ejecutar una instalación.',
              },
              {
                num: '03',
                titulo: 'Seguimiento operativo',
                descripcion:
                  'Conecta propietarios y empresas instaladoras para gestionar citas de revisión y soporte técnico.',
              },
            ].map((item) => (
              <article
                key={item.num}
                style={{
                  backgroundColor: '#0D3B42',
                  border: '1px solid rgba(247, 244, 235, 0.1)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: CARIBE_THEME.amarillo,
                    marginBottom: '0.85rem',
                  }}
                >
                  {item.num}
                </span>
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: CARIBE_THEME.marfil,
                    margin: '0 0 0.55rem 0',
                  }}
                >
                  {item.titulo}
                </h3>
                <p
                  style={{
                    color: 'rgba(247, 244, 235, 0.75)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.descripcion}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* 4. BREVE INFORMACIÓN DEL PROYECTO */}
        <section
          id="proyecto"
          style={{
            padding: '3.75rem 0',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              backgroundColor: '#0D3B42',
              border: '1px solid rgba(247, 244, 235, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#8CE0D6',
                }}
              >
                Sobre el proyecto
              </span>
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: CARIBE_THEME.marfil,
                  margin: '0.45rem 0 0.65rem 0',
                }}
              >
                Planificación energética con rigor técnico
              </h2>
              <p
                style={{
                  color: 'rgba(247, 244, 235, 0.76)',
                  fontSize: '0.94rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Sistema web orientado a centralizar información solar y facilitar la evaluación de
                viabilidad fotovoltaica para hogares, empresas, estudiantes e investigadores en el
                Caribe colombiano.
              </p>
            </div>

            <div
              style={{
                borderLeft: '2px solid #1C8077',
                paddingLeft: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: CARIBE_THEME.amarillo,
                  marginBottom: '0.4rem',
                }}
              >
                Línea de investigación
              </span>
              <p
                style={{
                  color: 'rgba(247, 244, 235, 0.78)',
                  fontSize: '0.94rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Estudio de la energía fotovoltaica y aprovechamiento de energías renovables
                aplicadas al contexto de la región Caribe colombiana.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PIE DE PÁGINA DISCRETO */}
        <footer
          style={{
            borderTop: '1px solid rgba(247, 244, 235, 0.08)',
            padding: '1.75rem 0 2.5rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'rgba(247, 244, 235, 0.58)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogoEnergiapp size={20} />
            <span>energiapp · Región Caribe colombiana</span>
          </div>
          <span>Energía solar fotovoltaica</span>
        </footer>
      </div>
    </div>
  );
}