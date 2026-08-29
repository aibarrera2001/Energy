document.addEventListener('DOMContentLoaded', () => {
  const tablaCitasBody = document.getElementById('tablaCitasBody');
  const badgeTotalCitas = document.getElementById('badgeTotalCitas');

  cargarCitasAdmin();

  async function cargarCitasAdmin() {
    try {
      const respuesta = await fetch('/api/admin/citas');
      const resultado = await respuesta.json();

      if (resultado.exito && resultado.datos.length > 0) {
        tablaCitasBody.innerHTML = '';

        if (badgeTotalCitas) {
          badgeTotalCitas.textContent = resultado.datos.length;
        }

        resultado.datos.forEach(cita => {
          const fechaObj = new Date(cita.fecha);
          const fechaFormateada = fechaObj.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short'
          });

          const nombreCliente = cita.nombre_cliente || `${cita.usuario_nombre || ''} ${cita.usuario_apellido || ''}`.trim() || 'Cliente';
          const tipoServicio = cita.tipo_servicio || 'Mantenimiento';
          const estado = cita.estado || 'Pendiente';

          const filaHtml = `
            <tr>
              <td>${nombreCliente}</td>
              <td>${tipoServicio}</td>
              <td>${fechaFormateada}</td>
              <td><span>${estado}</span></td>
            </tr>
          `;
          tablaCitasBody.innerHTML += filaHtml;
        });
      } else {
        tablaCitasBody.innerHTML = `
          <tr>
            <td colspan="4">No hay citas programadas en el sistema.</td>
          </tr>
        `;
        if (badgeTotalCitas) badgeTotalCitas.textContent = '0';
      }
    } catch (error) {
      console.error('Error al cargar las citas del administrador:', error);
      tablaCitasBody.innerHTML = `
        <tr>
          <td colspan="4">Error al conectar con el servidor.</td>
        </tr>
      `;
    }
  }
});