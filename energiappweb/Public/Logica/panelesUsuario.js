document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const panelesContainer = document.getElementById('panelesContainer');
  const panelesBadge = document.getElementById('panelesBadge');
  const panelesBadgeLabel = document.getElementById('panelesBadgeLabel');
  const inventoryForm = document.getElementById('panelInventoryForm');
  const inventoryStatus = document.getElementById('panelInventoryStatus');

  const prodPaneles = document.getElementById('prodPaneles');
  const prodPanelesTexto = document.getElementById('prodPanelesTexto');
  const rendPaneles = document.getElementById('rendPaneles');
  const rendPanelesTexto = document.getElementById('rendPanelesTexto');
  const estadoPaneles = document.getElementById('estadoPaneles');
  const estadoPanelesTexto = document.getElementById('estadoPanelesTexto');
  const panelSeleccionado = document.getElementById('panelSeleccionado');
  const panelSeleccionadoTexto = document.getElementById('panelSeleccionadoTexto');

  if (!usuarioId) {
    if (panelesContainer) {
      panelesContainer.innerHTML = '<p style="padding:15px;color:#666;">Debes iniciar sesión para consultar tus paneles.</p>';
    }
    return;
  }

  const setSummary = (total, totalProduccion, rendimiento, estado) => {
    if (panelesBadge) panelesBadge.textContent = String(total);
    if (panelesBadgeLabel) panelesBadgeLabel.textContent = total === 1 ? 'Panel activo' : total === 0 ? 'Sin paneles' : 'Paneles activos';

    if (prodPaneles) prodPaneles.textContent = `${totalProduccion.toFixed(1)} kWh`;
    if (prodPanelesTexto) prodPanelesTexto.textContent = total === 0 ? 'Sin datos' : 'Producción estimada';

    if (rendPaneles) rendPaneles.textContent = `${rendimiento}%`;
    if (rendPanelesTexto) rendPanelesTexto.textContent = total === 0 ? 'Sin datos' : 'Rendimiento';

    if (estadoPaneles) estadoPaneles.textContent = estado;
    if (estadoPanelesTexto) estadoPanelesTexto.textContent = total === 0 ? 'Sin paneles' : 'Estado actual';
  };

  const cargarPaneles = async () => {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/paneles`);
      const data = await res.json();
      const paneles = data.exito && Array.isArray(data.datos) ? data.datos : [];
      const propiedades = data.exito && Array.isArray(data.propiedades) ? data.propiedades : [];

      if (!paneles.length || !propiedades.length) {
        setSummary(0, 0, 0, 'Sin datos');
        if (panelesContainer) {
          panelesContainer.innerHTML = '<p style="padding:15px;color:#666;">Aún no tienes propiedades registradas para asociar paneles solares.</p>';
        }
        return;
      }

      const totalProduccion = paneles.reduce((sum, panel) => sum + Number(panel.produccion_estimado || 0), 0);
      const rendimiento = Math.min(100, Math.round((totalProduccion / Math.max(paneles.length, 1)) * 10));
      const estado = rendimiento >= 80 ? 'Excelente' : rendimiento >= 60 ? 'Bueno' : 'Revisión';
      setSummary(paneles.length, totalProduccion, rendimiento, estado);

      if (panelesContainer) {
        panelesContainer.innerHTML = '';
        paneles.forEach((panel) => {
          const card = document.createElement('div');
          card.style.border = '1px solid #e5e7eb';
          card.style.borderRadius = '12px';
          card.style.padding = '16px';
          card.style.marginBottom = '12px';
          card.style.display = 'grid';
          card.style.gridTemplateColumns = '1.4fr 1fr auto';
          card.style.gap = '10px';
          card.style.alignItems = 'center';

          const prod = Number(panel.produccion_estimado || 0).toFixed(2);
          const panelName = panel.nombre || `Panel ${panel.id || 'N/D'}`;

          card.innerHTML = `
            <div>
              <strong>${panelName}</strong><br>
              <small>${panel.ubicacion || 'Techo principal'} • ${panel.potencia_w || 0} W</small>
            </div>
            <div>
              <span>Producción</span><br>
              <strong>${prod} kWh</strong>
            </div>
            <button class="primary-btn small-btn" type="button">Seleccionar</button>
          `;

          const btn = card.querySelector('button');
          btn.addEventListener('click', () => {
            if (panelSeleccionado) panelSeleccionado.textContent = panelName;
            if (panelSeleccionadoTexto) panelSeleccionadoTexto.textContent = `Producción ${prod} kWh`;
          });

          panelesContainer.appendChild(card);
        });
      }
    } catch (error) {
      console.error('Error al cargar paneles:', error);
      if (panelesContainer) {
        panelesContainer.innerHTML = '<p style="padding:15px;color:#666;">No se pudieron cargar los paneles disponibles.</p>';
      }
      setSummary(0, 0, 0, 'Sin datos');
    }
  };

  if (inventoryForm) {
    inventoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const nombre = document.getElementById('panelNombre').value.trim();
      const tipo = document.getElementById('panelTipo').value.trim();
      const potencia = Number(document.getElementById('panelPotencia').value);
      const eficiencia = Number(document.getElementById('panelEficiencia').value);
      const stock = Number(document.getElementById('panelStock').value);
      const precio = Number(document.getElementById('panelPrecio').value);

      if (!nombre || !tipo || !Number.isFinite(potencia) || !Number.isFinite(eficiencia) || !Number.isFinite(stock) || !Number.isFinite(precio)) {
        if (inventoryStatus) {
          inventoryStatus.textContent = 'Todos los campos deben ser válidos.';
          inventoryStatus.style.color = '#b91c1c';
        }
        return;
      }

      try {
        const response = await fetch(`/api/usuarios/${usuarioId}/paneles/inventario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, tipo, potencia, eficiencia, stock, precio })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.mensaje || 'No se pudo guardar el panel.');
        }

        inventoryForm.reset();
        if (inventoryStatus) {
          inventoryStatus.textContent = 'Panel guardado correctamente en la base de datos.';
          inventoryStatus.style.color = '#15803d';
        }

        await cargarPaneles();
      } catch (error) {
        console.error('Error al guardar panel:', error);
        if (inventoryStatus) {
          inventoryStatus.textContent = error.message || 'No se pudo guardar el panel.';
          inventoryStatus.style.color = '#b91c1c';
        }
      }
    });
  }

  await cargarPaneles();
});
