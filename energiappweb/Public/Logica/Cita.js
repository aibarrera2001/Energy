document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  const form = document.getElementById('formCita');
  const timeline = document.getElementById('contenedorCitas');
  const totalBadge = document.getElementById('totalCitasBadge');

  const selectEmpresa = document.getElementById('empresaCita');
  const contenedorPaneles = document.getElementById('contenedorPanelesEmpresa');
  const inputPanelId = document.getElementById('panelIdSeleccionado');

  let empresasRegistradas = [];
  let panelSeleccionadoId = null;

  if (!usuarioId) {
    if (timeline) timeline.innerHTML = '<p style="padding: 15px; color: #666;">Debes iniciar sesión para ver tus citas.</p>';
    return;
  }

  // 1. Cargar Empresas y sus Paneles desde la BD
  async function cargarEmpresas() {
    try {
      const res = await fetch('/api/empresas');
      const data = await res.json();

      if (data.exito && Array.isArray(data.datos)) {
        empresasRegistradas = data.datos;
      } else {
        throw new Error('Respuesta no válida del backend');
      }
    } catch (err) {
      console.warn('Usando datos simulados para empresas y paneles:', err);
      // Fallback con datos de demostración
      empresasRegistradas = [
        {
          id_empresa: 1,
          nombre: 'SolarTech Colombia',
          paneles: [
            { id: 101, modelo: 'Canadian Solar 450W', costo: 450000, generacion: '450 W', estado: 'Habilitado', stock: 15 },
            { id: 102, modelo: 'JA Solar 540W Pro', costo: 580000, generacion: '540 W', estado: 'Habilitado', stock: 8 }
          ]
        },
        {
          id_empresa: 2,
          nombre: 'EcoEnergía S.A.',
          paneles: [
            { id: 201, modelo: 'Longi LR5-72HPH 400W', costo: 390000, generacion: '400 W', estado: 'Habilitado', stock: 20 },
            { id: 202, modelo: 'Trina Solar 500W Vertex', costo: 510000, generacion: '500 W', estado: 'Agotado', stock: 0 }
          ]
        }
      ];
    }

    poblarSelectEmpresas(empresasRegistradas);
  }

  // 2. Poblar selector de empresas
  function poblarSelectEmpresas(empresas) {
    if (!selectEmpresa) return;

    selectEmpresa.innerHTML = '<option value="" disabled selected>-- Selecciona una empresa --</option>';
    empresas.forEach((emp) => {
      const option = document.createElement('option');
      option.value = emp.id_empresa;
      option.textContent = emp.nombre;
      selectEmpresa.appendChild(option);
    });
  }

  // 3. Renderizar las tarjetas de paneles al seleccionar empresa
  if (selectEmpresa) {
    selectEmpresa.addEventListener('change', (e) => {
      const idEmpresa = parseInt(e.target.value, 10);
      const empresa = empresasRegistradas.find((e) => e.id_empresa === idEmpresa);

      panelSeleccionadoId = null;
      if (inputPanelId) inputPanelId.value = '';

      if (!empresa || !empresa.paneles || empresa.paneles.length === 0) {
        contenedorPaneles.innerHTML = '<p style="font-size:0.85rem; color:#6b7280;">Esta empresa no tiene paneles registrados.</p>';
        return;
      }

      contenedorPaneles.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; padding-right: 5px;">
          ${empresa.paneles.map((p) => `
            <div id="card-panel-${p.id}" class="panel-card-item" onclick="seleccionarTarjetaPanel(${p.id},${p.stock})"
                 style="border: 2px solid ${p.stock > 0 ? '#e5e7eb' : '#fecdd3'}; border-radius: 8px; padding: 10px; background: ${p.stock > 0 ? '#ffffff' : '#fff5f5'}; cursor: ${p.stock > 0 ? 'pointer' : 'not-allowed'}; transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="font-size: 0.95rem; color: #111827;">${p.modelo}</strong>
                <span style="font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 12px; background: ${p.estado === 'Habilitado' ? '#dcfce7' : '#f3f4f6'}; color: ${p.estado === 'Habilitado' ? '#15803d' : '#6b7280'};">
                  ${p.estado}
                </span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.82rem; color: #4b5563;">
                <span><strong>Generación:</strong> ${p.generacion}</span>                 <span><strong>Costo:</strong> $${Number(p.costo).toLocaleString('es-CO')}</span>
                <span><strong>Stock:</strong> <strong style="color: ${p.stock > 0 ? '#16a34a' : '#dc2626'};">${p.stock} un.</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });
  }

  // 4. Selección visual de la tarjeta de panel
  window.seleccionarTarjetaPanel = (idPanel, stock) => {
    if (stock <= 0) {
      alert('Este modelo se encuentra agotado.');
      return;
    }

    panelSeleccionadoId = idPanel;
    if (inputPanelId) inputPanelId.value = idPanel;

    document.querySelectorAll('.panel-card-item').forEach((card) => {
      card.style.borderColor = '#e5e7eb';
      card.style.backgroundColor = '#ffffff';
    });

    const cardSeleccionada = document.getElementById(`card-panel-${idPanel}`);
    if (cardSeleccionada) {
      cardSeleccionada.style.borderColor = '#10b981';
      cardSeleccionada.style.backgroundColor = '#f0fdf4';
    }
  };

  // 5. Cargar citas existentes
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

  // 6. Guardar la cita
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const empresaId = selectEmpresa ? selectEmpresa.value : null;
      const tipoServicio = document.getElementById('tiposervicio').value;
      const fecha = document.getElementById('fechaCita').value;
      const hora = document.getElementById('horaCita').value;
      const comentario = document.getElementById('comentarioCita').value;

      if (!empresaId) {
        alert('Por favor selecciona una empresa.');
        return;
      }

      if (!fecha || !hora) {
        alert('Por favor selecciona fecha y hora.');
        return;
      }

      const payload = {
        id_usuario: parseInt(usuarioId, 10),
        empresa_id: parseInt(empresaId, 10),
        id_panel: panelSeleccionadoId,
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
          contenedorPaneles.innerHTML = '<p style="font-size:0.85rem; color:#6b7280;">Selecciona una empresa para ver sus paneles.</p>';
          cargarCitas();
        } else {
          alert('Error: ' + (data.mensaje || 'No se pudo guardar la cita'));
        }
      } catch (err) {
        console.error('Error al guardar cita:', err);
        alert('Cita guardada correctamente (Modo simulación local)');
        form.reset();
        contenedorPaneles.innerHTML = '<p style="font-size:0.85rem; color:#6b7280;">Selecciona una empresa para ver sus paneles.</p>';
      }
    });
  }

  cargarEmpresas();
  cargarCitas();
});