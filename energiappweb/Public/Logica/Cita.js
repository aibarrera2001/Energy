document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  const form = document.getElementById('formCita');
  const timeline = document.getElementById('contenedorCitas');
  const totalBadge = document.getElementById('totalCitasBadge');

  if (!usuarioId) {
    if (timeline) timeline.innerHTML = '<p style="padding: 15px; color: #666;">Debes iniciar sesión para ver tus citas.</p>';
    return;
  }

  async function cargarCitas() {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/citas`);
      const resData = await res.json();
      const citas = resData.exito && Array.isArray(resData.datos) ? resData.datos : [];

      if (totalBadge) totalBadge.textContent = String(citas.length).padStart(2, '0');

      if (citas.length > 0) {
        timeline.innerHTML = '';
        citas.forEach((cita) => {
          const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short'
          });

          const itemHtml = `
            <div class="timeline-item">
              <div class="time">${fechaFormateada}</div>
              <div class="content">
                <strong>${cita.tipo_servicio || 'Servicio'}</strong>
                <small>${cita.empresa_nombre || 'Empresa'} • ${cita.hora || '--:--'} [${cita.estado || 'PENDIENTE'}]</small>
              </div>
            </div>
          `;
          timeline.insertAdjacentHTML('beforeend', itemHtml);
        });
      } else {
        timeline.innerHTML = '<p style="padding: 15px; color: #666;">No tienes citas pendientes ni agendadas.</p>';
        if (totalBadge) totalBadge.textContent = '00';
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
      if (timeline) timeline.innerHTML = '<p style="padding: 15px; color: #666;">No se pudieron cargar tus citas.</p>';
      if (totalBadge) totalBadge.textContent = '00';
    }
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const tipoServicio = document.getElementById('tiposervicio').value;
      const fecha = document.getElementById('fechaCita').value;
      const hora = document.getElementById('horaCita').value;
      const comentario = document.getElementById('comentarioCita').value;

      if (!fecha || !hora) {
        alert('Por favor selecciona fecha y hora');
        return;
      }

      const payload = {
        id_usuario: parseInt(usuarioId, 10),
        empresa_id: 1,
        fecha,
        hora,
        tipo_servicio: tipoServicio,
        notas: comentario,
        nombre_cliente: usuarioNombre || 'Cliente'
      };

      try {
        const res = await fetch('/api/usuarios/citas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.exito) {
          alert('Cita guardada correctamente');
          form.reset();
          cargarCitas();
        } else {
          alert('Error: ' + (data.mensaje || 'No se pudo guardar la cita'));
        }
      } catch (err) {
        console.error('Error al guardar cita:', err);
      }
    });
  }

  cargarCitas();
});