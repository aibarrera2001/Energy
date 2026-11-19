import React, { useState, useRef, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  caribeInputStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

export default function AsistenteIA() {
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const userId = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : null;
  const nombreUsuario = localStorage.getItem('nombreUsuario') || localStorage.getItem('nombre') || 'Usuario';

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      remitente: 'ia',
      texto: `Hola, ${nombreUsuario}. Soy el Asistente IA de EnergiApp. Analizo el consumo real de tus propiedades, la radiación de tu ciudad en el Caribe y tus citas agendadas para darte recomendaciones precisas. ¿Qué deseas consultar hoy?`,
    },
  ]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef(null);

  const preguntasRapidas = [
    '¿Cuántos paneles solares necesito para mi propiedad?',
    '¿Cuánto dinero puedo ahorrar al mes en mi factura?',
    '¿Cómo reduzco mi consumo energético en las tardes?',
    '¿Cuál es el estado de mi última cita técnica?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  const enviarConsulta = async (textoPregunta) => {
    const promptEnviar = textoPregunta.trim();
    if (!promptEnviar || cargando) return;

    const nuevoMensajeUser = {
      id: Date.now(),
      remitente: 'usuario',
      texto: promptEnviar,
    };

    setMensajes((prev) => [...prev, nuevoMensajeUser]);
    setInputMensaje('');
    setCargando(true);

    try {
      const res = await fetch('http://localhost:8080/api/asistente/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: userId,
          prompt: promptEnviar,
        }),
      }).catch(() =>
        fetch('/api/asistente/consulta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: userId,
            prompt: promptEnviar,
          }),
        })
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.respuesta || 'No se pudo obtener respuesta del asistente.');
      }

      setMensajes((prev) => [
        ...prev,
        { id: Date.now() + 1, remitente: 'ia', texto: data.respuesta },
      ]);
    } catch (err) {
      console.error('Error al consultar IA:', err);
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'ia',
          texto: 'Ocurrió un inconveniente al consultar tu perfil energético. Verifica que el servidor Spring Boot esté activo.',
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const handleEnviar = (e) => {
    e.preventDefault();
    enviarConsulta(inputMensaje);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: CARIBE_THEME.marfil,
        color: CARIBE_THEME.petroleo,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <UserSidebar />

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width, 260px)',
          width: 'calc(100% - var(--sidebar-width, 260px))',
          padding: '2.25rem 2.5rem',
          overflowY: 'auto',
          textAlign: 'left',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          {/* Encabezado */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.35rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: CARIBE_THEME.turquesa,
                }}
              >
                Asesoría Técnica · Energiapp IA
              </span>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(1.65rem, 2.8vw, 2.15rem)',
                  fontWeight: 700,
                  color: CARIBE_THEME.petroleo,
                  margin: '0.3rem 0 0.2rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Asistente Energético IA
              </h1>
              <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.95rem' }}>
                Consultas personalizadas basadas en el consumo y ubicación de tus propiedades en el Caribe.
              </p>
            </div>

            <span
              style={{
                backgroundColor: 'rgba(28, 128, 119, 0.14)',
                color: CARIBE_THEME.turquesa,
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.38rem 0.85rem',
                borderRadius: '999px',
              }}
            >
              ● Perfil Conectado
            </span>
          </header>

          {/* Sugerencias rápidas */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {preguntasRapidas.map((pregunta, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => enviarConsulta(pregunta)}
                disabled={cargando}
                style={{
                  backgroundColor: CARIBE_THEME.blanco,
                  color: CARIBE_THEME.petroleo,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  borderRadius: '999px',
                  padding: '0.48rem 0.95rem',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {pregunta}
              </button>
            ))}
          </div>

          {/* Contenedor del Chat */}
          <div
            style={{
              backgroundColor: CARIBE_THEME.blanco,
              border: `1px solid ${CARIBE_THEME.borde}`,
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 300px)',
              minHeight: '420px',
              padding: '1.35rem',
            }}
          >
            {/* Área de mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mensajes.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.remitente === 'usuario' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '0.95rem 1.2rem',
                      borderRadius: '14px',
                      fontSize: '0.94rem',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-line',
                      backgroundColor: msg.remitente === 'usuario' ? CARIBE_THEME.petroleo : CARIBE_THEME.marfil,
                      color: msg.remitente === 'usuario' ? CARIBE_THEME.marfil : CARIBE_THEME.petroleo,
                      border: msg.remitente === 'ia' ? `1px solid ${CARIBE_THEME.borde}` : 'none',
                      borderBottomRightRadius: msg.remitente === 'usuario' ? '4px' : '14px',
                      borderBottomLeftRadius: msg.remitente === 'ia' ? '4px' : '14px',
                    }}
                  >
                    {msg.texto}
                  </div>
                </div>
              ))}

              {cargando && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      backgroundColor: CARIBE_THEME.marfil,
                      color: CARIBE_THEME.pizarra,
                      border: `1px solid ${CARIBE_THEME.borde}`,
                      padding: '0.75rem 1.1rem',
                      borderRadius: '14px',
                      fontSize: '0.88rem',
                    }}
                  >
                    Analizando el consumo y radiación de tus propiedades...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Barra de escritura */}
            <form
              onSubmit={handleEnviar}
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${CARIBE_THEME.borde}`,
              }}
            >
              <input
                type="text"
                placeholder="Pregúntame sobre tus paneles, ahorro en COP, consumo o citas..."
                value={inputMensaje}
                onChange={(e) => setInputMensaje(e.target.value)}
                style={{ ...caribeInputStyle, flex: 1 }}
              />
              <button
                type="submit"
                disabled={cargando || !inputMensaje.trim()}
                style={{
                  ...caribePrimaryButtonStyle,
                  width: 'auto',
                  padding: '0.8rem 1.45rem',
                  opacity: cargando || !inputMensaje.trim() ? 0.6 : 1,
                  cursor: cargando || !inputMensaje.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}