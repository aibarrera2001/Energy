document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const grid = document.querySelector('.property-grid');
  const btnNueva = document.querySelector('.actions .ghost-btn');
  const contadorPropiedades = document.getElementById('cantidadPropiedades');
  const textoCantidad = document.getElementById('textoCantidadPropiedades');

  function actualizarContador(cantidad) {
    if (!contadorPropiedades) return;
    contadorPropiedades.textContent = String(cantidad);

    if (textoCantidad) {
      textoCantidad.textContent = cantidad === 1 ? 'Casa activa' : 'Casas activas';
    }
  }

  cargarPropiedades();

  async function cargarPropiedades() {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/propiedades`);
      const resData = await res.json();

      if (resData.exito && resData.datos.length > 0) {
        grid.innerHTML = '';
        resData.datos.forEach(casa => grid.appendChild(crearTarjetaPropiedad(casa)));
        actualizarContador(resData.datos.length);
      } else {
        grid.innerHTML = '<p style="padding: 15px; color: #666;">No tienes propiedades registradas.</p>';
        actualizarContador(0);
      }
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
      grid.innerHTML = '<p style="padding: 15px; color: #666;">No se pudieron cargar las propiedades.</p>';
      actualizarContador(0);
    }
  }

  function crearTarjetaPropiedad(casa) {
    const article = document.createElement('article');
    article.className = 'property-card';

    const consumo = Number(casa.consumo_mensual || 0).toFixed(1);
    const area = casa.area_techo_m2 ? `${casa.area_techo_m2} m² de techo` : 'Área no registrada';

    article.innerHTML = `
      <div class="property-header">
        <span class="status-pill ok">Activa</span>
        <span class="property-code">Casa ${casa.id_casa}</span>
      </div>
      <h3>${casa.direccion}</h3>
      <p>${casa.ciudad}</p>
      <ul>
        <li>${casa.tipo_propiedad || 'Tipo no especificado'}</li>
        <li>${area}</li>
        <li>Consumo estimado: ${consumo} kWh</li>
      </ul>
      <button class="secondary-btn full-width">Ver detalle</button>
    `;

    return article;
  }

  // Alta rápida de propiedad. Reemplazar por un formulario/modal cuando exista en el HTML.
  if (btnNueva) {
    btnNueva.addEventListener('click', async () => {
      const direccion = prompt('Dirección de la propiedad:');
      if (!direccion) return;

      const ciudad = prompt('Ciudad:', 'Valledupar');
      const tipo_propiedad = prompt('Tipo de propiedad (CASA, APARTAMENTO, EDIFICIO):', 'CASA');
      const consumo_mensual = Number(prompt('Consumo mensual estimado (kWh):', '0')) || 0;
      const area_techo_m2 = Number(prompt('Área de techo disponible (m²):', '0')) || 0;

      const payload = {
        id_usuario: parseInt(usuarioId, 10),
        direccion,
        ciudad,
        tipo_propiedad,
        consumo_mensual,
        area_techo_m2
      };

      try {
        const res = await fetch('/api/usuarios/propiedades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.exito) {
          cargarPropiedades();
          alert('Propiedad registrada correctamente');
        } else {
          alert('Error: ' + data.mensaje);
        }
      } catch (err) {
        console.error('Error al crear propiedad:', err);
        alert('Error de conexión con el servidor');
      }
    });
  }
});