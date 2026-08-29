document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  const form = document.querySelector('.booking-form');
  const timeline = document.querySelector('.timeline');

  // Cargar Citas de la Base de Datos
  cargarCitas();

  async function cargarCitas() {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/citas`);
      const resData = await res.json();

      if (resData.exito && resData.datos.length > 0) {
        timeline.innerHTML = '';
        resData.datos.forEach(cita => {
          const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short'
          });

          const itemHtml = `
            <div class="timeline-item">
              <div class="time">${fechaFormateada}</div>
              <div class="content">
                <strong>${cita.tipo_servicio}</strong>
                <small>${cita.empresa_nombre} • ${cita.hora} [${cita.estado}]</small>
              </div>
            </div>
          `;
          timeline.innerHTML += itemHtml;
        });
      } else {
        timeline.innerHTML = '<p style="padding: 15px; color: #666;">No tienes citas registradas.</p>';
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    }
  }

  // Guardar una cita nueva en PostgreSQL
  if (form) {
    const btnGuardar = form.querySelector('button');
    btnGuardar.addEventListener('click', async (e) => {
      e.preventDefault();

      const tipoServicio = form.querySelector('select').value;
      const fecha = form.querySelector('input[type="date"]').value;
      const hora = form.querySelector('input[type="time"]').value;
      const comentario = form.querySelector('textarea').value;

      if (!fecha || !hora) {
        alert('Por favor selecciona fecha y hora');
        return;
      }

      const payload = {
        id_usuario: parseInt(usuarioId),
        empresa_id: 1, // Empresa base
        fecha: fecha,
        hora: hora,
        tipo_servicio: tipoServicio.toUpperCase().replace(' ', '_'),
        notas: comentario,
        nombre_cliente: usuarioNombre
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
          alert('Error: ' + data.mensaje);
        }
      } catch (err) {
        console.error('Error al guardar cita:', err);
      }
    });
  }
});