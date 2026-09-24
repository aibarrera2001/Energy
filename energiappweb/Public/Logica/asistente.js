document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const chatPanel = document.getElementById('chatPanel');
  const historialChat = document.getElementById('historialChat');
  const input = document.getElementById('chatInput');
  const btnEnviar = document.getElementById('btnEnviarChat');

  if (!chatPanel || !historialChat || !input || !btnEnviar) return;

  function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function agregarMensaje(tipo, etiqueta, texto) {
    const div = document.createElement('div');
    div.className = `message ${tipo}`;
    div.innerHTML = `<strong>${etiqueta}:</strong><p>${escaparHtml(String(texto || ''))}</p>`;
    historialChat.appendChild(div);
    historialChat.scrollTop = historialChat.scrollHeight;
  }

  async function cargarHistorial() {
    if (!usuarioId) {
      historialChat.innerHTML = '<p style="padding: 15px; color: #666;">Debes iniciar sesión para usar el asistente.</p>';
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/chat/historial`);
      const data = await res.json();
      const mensajes = data.exito && Array.isArray(data.datos) ? data.datos : [];

      historialChat.innerHTML = '';
      if (!mensajes.length) {
        historialChat.innerHTML = '<p style="padding: 15px; color: #666;">No hay historial aún. Haz tu primera consulta.</p>';
        return;
      }

      mensajes.forEach((mensaje) => {
        agregarMensaje(mensaje.remitente === 'usuario' ? 'user' : 'bot', mensaje.remitente === 'usuario' ? 'Tú' : 'Asistente', mensaje.mensaje);
      });
    } catch (error) {
      console.error('Error al cargar historial:', error);
      historialChat.innerHTML = '<p style="padding: 15px; color: #666;">No se pudo cargar el historial del asistente.</p>';
    }
  }

  async function enviarMensaje() {
    const mensaje = input.value.trim();
    if (!mensaje || !usuarioId) return;

    agregarMensaje('user', 'Tú', mensaje);
    input.value = '';
    input.disabled = true;
    btnEnviar.disabled = true;

    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje })
      });

      const data = await res.json();
      if (data.exito && data.respuesta) {
        agregarMensaje('bot', 'Asistente', data.respuesta);
      } else {
        agregarMensaje('bot', 'Asistente', data.mensaje || 'No pude procesar tu consulta.');
      }
    } catch (err) {
      console.error('Error al consultar el asistente:', err);
      agregarMensaje('bot', 'Asistente', 'Hubo un error de conexión con el servidor.');
    } finally {
      input.disabled = false;
      btnEnviar.disabled = false;
      input.focus();
    }
  }

  btnEnviar.addEventListener('click', enviarMensaje);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarMensaje();
    }
  });

  await cargarHistorial();
});