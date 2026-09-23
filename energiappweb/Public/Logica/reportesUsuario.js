document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const token = localStorage.getItem('token');

  // Referencias a elementos del DOM
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

  // Menú desplegable lateral
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

  // 1. Control de Acceso: Verificar usuario único
  if (!usuarioId) {
    limpiarVista('Debes iniciar sesión con tu cuenta para visualizar tus reportes exclusivos.');
    return;
  }

  // 2. Cargar reportes exclusivos del usuario desde la base de datos
  try {
    const response = await fetch(`/api/usuarios/${usuarioId}/reportes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json();
    let reportesDelUsuario = data.exito && Array.isArray(data.datos) ? data.datos : [];

    // Garantizar filtro estricto por id_usuario en la respuesta de datos
    reportesDelUsuario = reportesDelUsuario.filter(
      r => !r.id_usuario || String(r.id_usuario) === String(usuarioId)
    );

    renderizarReportesUsuario(reportesDelUsuario);

  } catch (error) {
    console.warn('Backend inaccesible o en desarrollo, consultando respaldo exclusivo:', error);
    
    // Respaldo Local (Filtrando estrictamente por el usuarioId activo)
    const todosLosReportesLocales = JSON.parse(localStorage.getItem('reportesCasasUsuario') || '[]');
    const misReportesLocales = todosLosReportesLocales.filter(
      item => String(item.id_usuario) === String(usuarioId)
    );

    renderizarReportesUsuario(misReportesLocales);
  }

  // Función para procesar y renderizar los datos únicos del usuario
  function renderizarReportesUsuario(reportes) {
    if (!reportes || reportes.length === 0) {
      limpiarVista('No tienes reportes asignados ni propiedades registradas en tu cuenta.');
      return;
    }

    // Cálculos consolidados para el usuario
    const generacionTotal = reportes.reduce((sum, item) => sum + Number(item.generacion_kwh || 0), 0);
    const consumoTotal = reportes.reduce((sum, item) => sum + Number(item.consumo_kwh || 0), 0);
    const ahorroPromedio = Math.round(
      reportes.reduce((sum, item) => sum + Number(item.ahorro_porcentaje || 0), 0) / reportes.length
    );
    
    const ahorroEstimado = Math.max(0, Math.round((generacionTotal * 390) / Math.max(consumoTotal || 1, 1)));
    const estadoGeneral = ahorroPromedio >= 70 ? 'Excelente' : ahorroPromedio >= 45 ? 'Bueno' : 'En revisión';

    // Actualizar métricas en pantalla
    if (reporteGeneracion) reporteGeneracion.textContent = `${generacionTotal.toFixed(1)} kWh`;
    if (reporteConsumo) reporteConsumo.textContent = `${consumoTotal.toFixed(1)} kWh`;
    if (reporteAhorro) reporteAhorro.textContent = `${ahorroPromedio}%`;
    if (reporteEstado) reporteEstado.textContent = estadoGeneral;
    if (reporteEstadoTexto) reporteEstadoTexto.textContent = `${reportes.length} propiedad(es) activa(s)`;
    if (finanzasBadge) finanzasBadge.textContent = `$${ahorroEstimado.toLocaleString('es-CO')}`;
    if (finanzasLabel) finanzasLabel.textContent = 'Ahorro estimado';

    // Generar tarjetas por propiedad única del usuario
    if (reportesContainer) {
      reportesContainer.innerHTML = '';
      
      reportes.forEach((reporte) => {
        const card = document.createElement('article');
        card.style.border = '1px solid #e5e7eb';
        card.style.borderRadius = '12px';
        card.style.padding = '16px';
        card.style.marginBottom = '12px';
        card.style.background = '#ffffff';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap;">
            <div>
              <strong style="font-size:1.05rem; color:#1f2937;">🏡 ${reporte.nombre || 'Mi Propiedad'}</strong><br>
              <small style="color:#6b7280;">${reporte.ciudad || 'Ubicación'} • ${reporte.fecha || 'Reciente'}</small>
            </div>
            <span style="padding:6px 12px; border-radius:999px; background:#ecfdf5; color:#047857; font-weight:600; font-size:0.85rem;">
              ${reporte.estado || 'Activo'}
            </span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px; margin-top:14px; padding-top:10px; border-top:1px solid #f3f4f6;">
            <div>
              <small style="color:#6b7280;">Generación</small><br>
              <strong style="color:#10b981;">${Number(reporte.generacion_kwh || 0).toFixed(1)} kWh</strong>
            </div>
            <div>
              <small style="color:#6b7280;">Consumo</small><br>
              <strong style="color:#ef4444;">${Number(reporte.consumo_kwh || 0).toFixed(1)} kWh</strong>
            </div>
            <div>
              <small style="color:#6b7280;">Ahorro</small><br>
              <strong style="color:#2563eb;">${Number(reporte.ahorro_porcentaje || 0)}%</strong>
            </div>
          </div>
        `;
        reportesContainer.appendChild(card);
      });
    }
  }

  // Función para resetear/limpiar las tarjetas y contadores
  function limpiarVista(mensaje) {
    if (reportesContainer) {
      reportesContainer.innerHTML = `<p style="padding:15px; color:#6b7280;">${mensaje}</p>`;
    }
    if (reporteGeneracion) reporteGeneracion.textContent = '0 kWh';
    if (reporteConsumo) reporteConsumo.textContent = '0 kWh';
    if (reporteAhorro) reporteAhorro.textContent = '0%';
    if (reporteEstado) reporteEstado.textContent = 'Sin datos';
    if (reporteEstadoTexto) reporteEstadoTexto.textContent = 'Sin propiedades';
    if (finanzasBadge) finanzasBadge.textContent = '$0';
    if (finanzasLabel) finanzasLabel.textContent = 'Sin datos';
  }
});