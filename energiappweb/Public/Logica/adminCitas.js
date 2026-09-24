document.addEventListener('DOMContentLoaded', () => {
  const tablaCitasBody = document.querySelector('tbody');
  const badgeTotalCitas = document.getElementById('totalCitas');
  const storedEmpresa = JSON.parse(localStorage.getItem('adminEmpresa') || 'null');

  if (!storedEmpresa || !storedEmpresa.id_empresa) {
    window.location.href = '/admin-login';
    return;
  }

  if (badgeTotalCitas) badgeTotalCitas.textContent = '0';

  if (tablaCitasBody) {
    tablaCitasBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">No hay citas asociadas a esta empresa.</td>
      </tr>
    `;
  }

  try {
    fetch(`/api/admin/dashboard/${storedEmpresa.id_empresa}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.exito && Number(data.metrics?.citas_pendientes || 0) > 0) {
          if (badgeTotalCitas) badgeTotalCitas.textContent = data.metrics.citas_pendientes;
        } else {
          if (badgeTotalCitas) badgeTotalCitas.textContent = '0';
          if (tablaCitasBody) {
            tablaCitasBody.innerHTML = `
              <tr>
                <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">No hay citas asociadas a esta empresa.</td>
              </tr>
            `;
          }
        }
      })
      .catch(() => {
        if (badgeTotalCitas) badgeTotalCitas.textContent = '0';
        if (tablaCitasBody) {
          tablaCitasBody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">No hay citas asociadas a esta empresa.</td>
            </tr>
          `;
        }
      });
  } catch (error) {
    console.error('Error al preparar datos de citas:', error);
  }
});