document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const reportesContainer = document.getElementById('reportesContainer');
  const reporteGeneracion = document.getElementById('reporteGeneracion');
  const reporteConsumo = document.getElementById('reporteConsumo');
  const reporteAhorro = document.getElementById('reporteAhorro');
  const reporteEstado = document.getElementById('reporteEstado');
  const reporteEstadoTexto = document.getElementById('reporteEstadoTexto');
  const finanzasBadge = document.getElementById('finanzasBadge');
  const finanzasLabel = document.getElementById('finanzasLabel');

  const homeTrigger = document.querySelector('.nav-home-trigger');
  const navSubmenu = document.querySelector('.nav-submenu');

  if (homeTrigger && navSubmenu) {
    homeTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = navSubmenu.classList.toggle('open');
      homeTrigger.setAttribute('aria-expanded', String(isOpen));
    });

    homeTrigger.addEventListener('mouseenter', () => {
      navSubmenu.classList.add('open');
      homeTrigger.setAttribute('aria-expanded', 'true');
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-home-wrap')) {
        navSubmenu.classList.remove('open');
        homeTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (!usuarioId) {
    if (reportesContainer) {
      reportesContainer.innerHTML = '<p style="padding:15px;color:#666;">Debes iniciar sesión para ver tus reportes.</p>';
    }
    return;
  }

  try {
    const res = await fetch(`/api/usuarios/${usuarioId}/reportes`);
    const data = await res.json();
    const reportes = data.exito && Array.isArray(data.datos) ? data.datos : [];

    if (!reportes.length) {
      if (reportesContainer) {
        reportesContainer.innerHTML = '<p style="padding:15px;color:#666;">No hay reportes disponibles porque aún no registras propiedades.</p>';
      }
      if (reporteGeneracion) reporteGeneracion.textContent = '0 kWh';
      if (reporteConsumo) reporteConsumo.textContent = '0 kWh';
      if (reporteAhorro) reporteAhorro.textContent = '0%';
      if (reporteEstado) reporteEstado.textContent = 'Sin datos';
      if (reporteEstadoTexto) reporteEstadoTexto.textContent = 'Sin propiedades';
      if (finanzasBadge) finanzasBadge.textContent = '$0';
      if (finanzasLabel) finanzasLabel.textContent = 'Sin datos';
      return;
    }

    const generacionTotal = reportes.reduce((sum, item) => sum + Number(item.generacion_kwh || 0), 0);
    const consumoTotal = reportes.reduce((sum, item) => sum + Number(item.consumo_kwh || 0), 0);
    const ahorroPromedio = reportes.length
      ? Math.round(reportes.reduce((sum, item) => sum + Number(item.ahorro_porcentaje || 0), 0) / reportes.length)
      : 0;
    const ahorroEstimado = Math.max(0, Math.round((generacionTotal * 390) / Math.max(consumoTotal || 1, 1)));
    const estado = ahorroPromedio >= 70 ? 'Excelente' : ahorroPromedio >= 45 ? 'Bueno' : 'Revisión';

    if (reporteGeneracion) reporteGeneracion.textContent = `${generacionTotal.toFixed(1)} kWh`;
    if (reporteConsumo) reporteConsumo.textContent = `${consumoTotal.toFixed(1)} kWh`;
    if (reporteAhorro) reporteAhorro.textContent = `${ahorroPromedio}%`;
    if (reporteEstado) reporteEstado.textContent = estado;
    if (reporteEstadoTexto) reporteEstadoTexto.textContent = `${reportes.length} propiedades`;
    if (finanzasBadge) finanzasBadge.textContent = `$${ahorroEstimado.toLocaleString('es-CO')}`;
    if (finanzasLabel) finanzasLabel.textContent = 'Ahorro estimado';

    if (reportesContainer) {
      reportesContainer.innerHTML = '';
      reportes.forEach((reporte) => {
        const card = document.createElement('div');
        card.style.border = '1px solid #e5e7eb';
        card.style.borderRadius = '12px';
        card.style.padding = '16px';
        card.style.marginBottom = '12px';
        card.style.background = '#fff';

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
            <div>
              <strong>${reporte.nombre || 'Propiedad'}</strong><br>
              <small>${reporte.ciudad || 'Sin ciudad'} • ${reporte.fecha || 'Sin fecha'}</small>
            </div>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-weight:600;">${reporte.estado || 'Sin estado'}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(120px,1fr));gap:10px;margin-top:12px;">
            <div><small>Generación</small><br><strong>${Number(reporte.generacion_kwh || 0).toFixed(1)} kWh</strong></div>
            <div><small>Consumo</small><br><strong>${Number(reporte.consumo_kwh || 0).toFixed(1)} kWh</strong></div>
            <div><small>Ahorro</small><br><strong>${Number(reporte.ahorro_porcentaje || 0)}%</strong></div>
          </div>
        `;
        reportesContainer.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Error al cargar reportes:', error);
    if (reportesContainer) {
      reportesContainer.innerHTML = '<p style="padding:15px;color:#666;">No se pudieron cargar los reportes.</p>';
    }
  }
});
