import React, { useState, useRef, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function AsistenteIA() {
  const userId = Number(localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario'));
  const nombreUsuario = localStorage.getItem('nombreUsuario') || localStorage.getItem('nombre') || 'Usuario';

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      remitente: 'ia',
      texto: `¡Hola, ${nombreUsuario}! Soy el Asistente IA de EnergiApp. Analizo el consumo real de tus propiedades, la radiación de tu ciudad y tus citas agendadas para darte recomendaciones exactas. ¿Qué deseas consultar hoy?`
    }
  ]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef(null);

  const preguntasRapidas = [
    '¿Cuántos paneles solares necesito para mi propiedad?',
    '¿Cuánto dinero puedo ahorrar al mes en mi factura?',
    '¿Cómo reduzco mi consumo energético en las tardes?',
    '¿Cuál es el estado de mi última cita técnica?'
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
      texto: promptEnviar
    };

    setMensajes((prev) => [...prev, nuevoMensajeUser]);
    setInputMensaje('');
    setCargando(true);

    try {
      const res = await fetch('/api/asistente/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: userId,
          prompt: promptEnviar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.respuesta || 'No se pudo obtener respuesta del asistente.');
      }

      setMensajes((prev) => [
        ...prev,
        { id: Date.now() + 1, remitente: 'ia', texto: data.respuesta }
      ]);
    } catch (err) {
      console.error('Error al consultar IA:', err);
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'ia',
          texto: 'Ocurrió un inconveniente al consultar tu perfil energético. Verifica que el servidor Spring Boot esté activo.'
        }
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
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Encabezado uniforme */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              🤖 Asistente Energético IA
            </h1>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
              Asesoría personalizada basada en los datos reales de consumo y ubicación de tus propiedades.
            </p>
          </div>

          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.85rem', borderRadius: '999px' }}>
            ● Contexto BD Conectado
          </span>
        </div>

        {/* Sugerencias rápidas */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {preguntasRapidas.map((pregunta, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => enviarConsulta(pregunta)}
              disabled={cargando}
              style={{
                backgroundColor: '#1E293B',
                color: '#CBD5E1',
                border: '1px solid #334155',
                borderRadius: '999px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.8rem',
                cursor: cargando ? 'not-allowed' : 'pointer'
              }}
            >
              ✨ {pregunta}
            </button>
          ))}
        </div>

        {/* Contenedor del Chat */}
        <div
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 280px)',
            minHeight: '420px',
            padding: '1.25rem'
          }}
        >
          {/* Área de mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.remitente === 'usuario' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '0.9rem 1.15rem',
                    borderRadius: '0.95rem',
                    fontSize: '0.92rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    backgroundColor: msg.remitente === 'usuario' ? '#10B981' : '#0F172A',
                    color: msg.remitente === 'usuario' ? '#0F172A' : '#F8FAFC',
                    fontWeight: msg.remitente === 'usuario' ? 600 : 400,
                    border: msg.remitente === 'ia' ? '1px solid #334155' : 'none',
                    borderBottomRightRadius: msg.remitente === 'usuario' ? '0.2rem' : '0.95rem',
                    borderBottomLeftRadius: msg.remitente === 'ia' ? '0.2rem' : '0.95rem'
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
                    backgroundColor: '#0F172A',
                    color: '#94A3B8',
                    border: '1px solid #334155',
                    padding: '0.75rem 1.1rem',
                    borderRadius: '0.95rem',
                    fontSize: '0.88rem'
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
              borderTop: '1px solid #334155'
            }}
          >
            <input
              type="text"
              placeholder="Pregúntame sobre tus paneles, ahorro en COP, consumo o citas..."
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                borderRadius: '0.6rem',
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                color: '#FFFFFF',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            />
            <button
              type="submit"
              disabled={cargando || !inputMensaje.trim()}
              style={{
                backgroundColor: '#10B981',
                color: '#0F172A',
                fontWeight: 700,
                border: 'none',
                padding: '0.8rem 1.35rem',
                borderRadius: '0.6rem',
                cursor: cargando || !inputMensaje.trim() ? 'not-allowed' : 'pointer',
                opacity: cargando || !inputMensaje.trim() ? 0.6 : 1,
                fontSize: '0.92rem'
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}