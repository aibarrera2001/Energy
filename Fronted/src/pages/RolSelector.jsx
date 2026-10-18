import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RolSelector() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#334155',
      padding: '2.5rem 1.5rem',
      boxSizing: 'border-box',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HERO / ENCABEZADO PRINCIPAL */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem', color: '#F97316' }}>⚡</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F3854', margin: 0, letterSpacing: '-0.02em' }}>
              Energiapp
            </h1>
          </div>
          <p style={{
            color: '#2D7A58',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0.25rem 0 0.75rem 0'
          }}>
            Plataforma Web de Energía Solar Fotovoltaica • Región Caribe Colombiana
          </p>
          <p style={{
            maxWidth: '750px',
            margin: '0 auto',
            color: '#64748B',
            fontSize: '1rem',
            lineHeight: 1.6
          }}>
            Solución digital orientada a apoyar el aprovechamiento de la energía solar y fuentes renovables. 
            Ofrece herramientas de consulta, monitoreo y estimaciones para facilitar decisiones técnicas y de planificación energética sostenible.
          </p>
        </header>

        {/* SECCIÓN DE BOTONES DE ACCESO / PORTALES */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3rem'
        }}>
          {/* Tarjeta Usuario */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>🏡</span>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F3854', margin: 0 }}>Portal de Usuario</h2>
                  <small style={{ color: '#2D7A58', fontWeight: 700 }}>Clientes y Propietarios</small>
                </div>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Consulta el rendimiento de tu sistema fotovoltaico, monitorea el consumo diario y programa citas de soporte o revisión técnica.
              </p>
            </div>
            <div>
              <button
                onClick={() => navigate('/usuario-login')}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: '#2D7A58',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Ingresar como Usuario
              </button>
            </div>
          </div>

          {/* Tarjeta Administrador */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>🏢</span>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F3854', margin: 0 }}>Portal Administrador</h2>
                  <small style={{ color: '#475569', fontWeight: 700 }}>Empresas y Operadores</small>
                </div>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Administra inventarios de paneles, gestiona usuarios registrados, monitorea mantenimientos y revisa reportes del potencial energético.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/admin-login')}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: '#0F3854',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Acceso Administrativo
              </button>
              <button
                onClick={() => navigate('/admin-registro')}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: 'transparent',
                  color: '#2D7A58',
                  border: '1px solid #2D7A58',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Registrar Empresa
              </button>
            </div>
          </div>
        </section>

        {/* SECCIÓN INFORMATIVA / PROPÓSITO Y OBJETIVOS */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* ¿Qué hace Energiapp? */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            padding: '1.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: '#2D7A58', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <span>☀️</span> ¿Qué hace Energiapp?
            </h3>
            <ul style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
              <li>Consultar información sobre el potencial solar en la región Caribe.</li>
              <li>Estimar la viabilidad de sistemas de energía fotovoltaica.</li>
              <li>Apoyar la toma de decisiones en el uso de energías renovables.</li>
              <li>Promover el conocimiento y la planificación energética sostenible.</li>
              <li>Facilitar acceso a datos útiles para estudiantes, investigadores y comunidades.</li>
            </ul>
          </div>

          {/* Nuestro Objetivo & Importancia */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            padding: '1.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0F3854', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <span>🎯</span> Objetivo e Importancia
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              <strong style={{ color: '#334155' }}>Objetivo:</strong> Implementar un sistema web que permita consultar, monitorear y estimar el potencial de generación fotovoltaica para la planificación en el Caribe colombiano.
            </p>
            <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#334155' }}>Importancia:</strong> Nace de la necesidad de centralizar información solar clave y evaluar la viabilidad de instalaciones sostenibles en las condiciones de la región.
            </p>
          </div>
        </section>

        {/* LÍNEA DE INVESTIGACIÓN (FOOTER BANNER) */}
        <footer style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '0.75rem',
          padding: '1.25rem 1.75rem',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
        }}>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            🔬 <strong style={{ color: '#0F3854' }}>Línea de investigación:</strong> Estudio de la energía fotovoltaica y aprovechamiento de energías renovables aplicadas al contexto de la región Caribe colombiana.
          </p>
        </footer>

      </div>
    </div>
  );
}