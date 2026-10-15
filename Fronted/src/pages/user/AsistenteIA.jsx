import React, { useState, useRef, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function AsistenteIA() {
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      remitente: 'ia',
      texto: '¡Hola! Soy tu Asistente IA de EnergiApp. ¿En qué te puedo ayudar hoy con el rendimiento de tus paneles o tu consumo de energía?'
    }
  ]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!inputMensaje.trim() || cargando) return;

    const nuevoMensajeUser = {
      id: Date.now(),
      remitente: 'usuario',
      texto: inputMensaje
    };

    setMensajes((prev) => [...prev, nuevoMensajeUser]);
    const promptEnviar = inputMensaje;
    setInputMensaje('');
    setCargando(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      const res = await fetch('http://localhost:5000/api/asistente/consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          usuarioId: userId,
          prompt: promptEnviar
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMensajes((prev) => [
          ...prev,
          { id: Date.now() + 1, remitente: 'ia', texto: data.respuesta }
        ]);
      } else {
        throw new Error('No se pudo obtener respuesta del asistente.');
      }
    } catch (err) {
      console.error('Error al consultar IA:', err);
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'ia',
          texto: 'Lo siento, ocurrió un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.'
        }
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="dashboard-container">
      <UserSidebar />

      <main className="dashboard-main-content">
        <header className="dashboard-header-card">
          <div className="header-info">
            <span className="header-badge">Inteligencia Artificial</span>
            <h1>Asistente IA</h1>
            <p className="user-welcome">Recibe asesoría personalizada para optimizar tu consumo y ahorro energético</p>
          </div>
        </header>

        {/* Panel del Chat */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', padding: '1.25rem' }}>
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
                    maxWidth: '75%',
                    padding: '0.85rem 1.2rem',
                    borderRadius: '1.1rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    backgroundColor: msg.remitente === 'usuario' ? '#10B981' : '#F1F5F9',
                    color: msg.remitente === 'usuario' ? '#FFFFFF' : '#0F172A',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    borderBottomRightRadius: msg.remitente === 'usuario' ? '0.2rem' : '1.1rem',
                    borderBottomLeftRadius: msg.remitente === 'ia' ? '0.2rem' : '1.1rem'
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.texto}</p>
                </div>
              </div>
            ))}

            {cargando && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    padding: '0.75rem 1.2rem',
                    borderRadius: '1.1rem',
                    fontSize: '0.9rem',
                    borderBottomLeftRadius: '0.2rem'
                  }}
                >
                  Analizando tu consulta...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Formulario de entrada */}
          <form
            onSubmit={handleEnviar}
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #E2E8F0'
            }}
          >
            <input
              type="text"
              placeholder="Escribe tu consulta (ej. ¿Cómo reduzco mi consumo en las tardes?)..."
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              style={{
                flex: 1,
                padding: '0.85rem 1.2rem',
                borderRadius: '0.85rem',
                border: '1px solid #CBD5E1',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
            <button
              type="submit"
              className="btn-accent-green"
              disabled={cargando || !inputMensaje.trim()}
              style={{ opacity: cargando || !inputMensaje.trim() ? 0.6 : 1 }}
            >
              Enviar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}