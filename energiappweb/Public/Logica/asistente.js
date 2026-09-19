document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const chatPanel = document.querySelector('.chat-panel');
  const inputBox = document.querySelector('.chat-input-box');

  if (!chatPanel || !inputBox) return;

  const input = inputBox.querySelector('input');
  const btnEnviar = inputBox.querySelector('button');

  if (!input || !btnEnviar) return;

  btnEnviar.addEventListener('click', enviarMensaje);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarMensaje();
    }
  });

  async function enviarMensaje() {
    const mensaje = input.value.trim();
    if (!mensaje) return;

    agregarMensaje('user', 'Tú', mensaje);
    input.value = '';
    input.disabled = true;
    btnEnviar.disabled = true;

    try {
      const res = await fetch('/api/usuarios/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje,
          id_usuario: usuarioId ? parseInt(usuarioId, 10) : null
        })
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

  function agregarMensaje(tipo, etiqueta, texto) {
    const div = document.createElement('div');
    div.className = `message ${tipo}`;
    div.innerHTML = `<strong>${etiqueta}:</strong><p>${escaparHtml(String(texto || ''))}</p>`;
    chatPanel.insertBefore(div, inputBox);
    chatPanel.scrollTop = chatPanel.scrollHeight;
  }

  function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }
});