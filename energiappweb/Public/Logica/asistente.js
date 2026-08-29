document.addEventListener('DOMContentLoaded', () => {
  const chatPanel = document.querySelector('.chat-panel');
  const input = chatPanel.querySelector('input[type="text"]');
  const btnEnviar = chatPanel.querySelector('.primary-btn');

  btnEnviar.addEventListener('click', enviarMensaje);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensaje();
  });

  async function enviarMensaje() {
    const texto = input.value.trim();
    if (!texto) return;

    // Dibujar mensaje del usuario
    const msgUser = document.createElement('div');
    msgUser.className = 'message user';
    msgUser.innerHTML = `<strong>Tú:</strong><p>${texto}</p>`;
    chatPanel.insertBefore(msgUser, chatPanel.querySelector('.chat-input-box'));

    input.value = '';

    try {
      const res = await fetch('/api/usuarios/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto })
      });

      const data = await res.json();

      // Dibujar respuesta de la IA
      const msgBot = document.createElement('div');
      msgBot.className = 'message bot';
      msgBot.innerHTML = `<strong>Asistente:</strong><p>${data.respuesta}</p>`;
      chatPanel.insertBefore(msgBot, chatPanel.querySelector('.chat-input-box'));
    } catch (err) {
      console.error('Error en el asistente:', err);
    }
  }
});