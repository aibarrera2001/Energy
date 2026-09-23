document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  const usuarioNombreHeader = document.getElementById('usuarioNombreHeader');
  const cards = Array.from(document.querySelectorAll('.stat-card'));
  const graficoBalance = document.getElementById('graficoBalance');
  const balanceEmpty = document.getElementById('balanceEmpty');
  const escena3d = document.getElementById('escena3d');

  if (usuarioNombreHeader) {
    usuarioNombreHeader.textContent = usuarioNombre || 'Usuario';
  }

  if (!cards.length) return;

  const [produccionCard, consumoCard, ahorroCard, panelesCard] = cards;
  const getStrong = (card) => card ? card.querySelector('strong') : null;
  const getSmall = (card) => card ? card.querySelector('small') : null;

  const setCard = (card, value) => {
    const strong = getStrong(card);
    if (strong) strong.textContent = value;
  };

  const setSmall = (card, value) => {
    const small = getSmall(card);
    if (small) small.textContent = value;
  };

  const resetCards = () => {
    setCard(produccionCard, '0.0 kWh');
    setCard(consumoCard, '0.0 kWh');
    setCard(ahorroCard, '+0%');
    setCard(panelesCard, '0');

    setSmall(produccionCard, 'Sin datos');
    setSmall(consumoCard, 'Sin datos');
    setSmall(ahorroCard, 'Sin datos');
    setSmall(panelesCard, 'Sin paneles');
  };

  resetCards();

  async function cargarBalanceYEscena(casa) {
    if (!casa || !usuarioId) return;

    try {
      const [balanceRes, escenaRes] = await Promise.all([
        fetch(`/api/usuarios/${usuarioId}/casas/${casa.id_casa}/balance`),
        fetch(`/api/usuarios/${usuarioId}/casas/${casa.id_casa}/escena-3d`)
      ]);

      const balanceData = await balanceRes.json();
      const escenaData = await escenaRes.json();

      if (balanceData.exito && balanceData.datos?.grafico_balance_png_base64) {
        graficoBalance.src = `data:image/png;base64,${balanceData.datos.grafico_balance_png_base64}`;
        graficoBalance.style.display = 'block';
        if (balanceEmpty) balanceEmpty.style.display = 'none';
      } else {
        if (balanceEmpty) {
          balanceEmpty.textContent = 'No hay balance disponible para esta propiedad.';
          balanceEmpty.style.display = 'block';
        }
        if (graficoBalance) graficoBalance.style.display = 'none';
      }

      if (escenaData.exito && escenaData.datos && window.Plotly) {
        Plotly.newPlot('escena3d', escenaData.datos.data, escenaData.datos.layout, {
          responsive: true,
          displayModeBar: false
        });

        window.addEventListener('resize', () => {
          if (document.getElementById('escena3d')) {
            Plotly.Plots.resize('escena3d');
          }
        });
      } else if (escena3d) {
        escena3d.innerHTML = '<p style="padding: 18px; color: #6b7280;">La escena 3D no está disponible en este momento.</p>';
      }
    } catch (error) {
      console.error('Error al cargar los datos del dashboard:', error);
      if (balanceEmpty) {
        balanceEmpty.textContent = 'No se pudo cargar el balance.';
        balanceEmpty.style.display = 'block';
      }
      if (graficoBalance) graficoBalance.style.display = 'none';
      if (escena3d) {
        escena3d.innerHTML = '<p style="padding: 18px; color: #6b7280;">No se pudo cargar la escena 3D.</p>';
      }
    }
  }

  if (!usuarioId) return;

  try {
    const response = await fetch(`/api/usuarios/${usuarioId}/resumen`);
    const result = await response.json();
    const data = result.exito && result.datos ? result.datos : {};
    const propiedades = Array.isArray(data.propiedades) ? data.propiedades : [];
    const totalPaneles = Number(data.totalPaneles || 0);
    const totalConsumo = propiedades.reduce((sum, item) => sum + Number(item.consumo_mensual || 0), 0);
    const totalProduccion = propiedades.reduce((sum, item) => sum + Number(item.consumo_mensual || 0) * 1.35, 0);
    const ahorroPorcentaje = propiedades.length
      ? Math.min(95, Math.max(0, Math.round((totalProduccion / Math.max(totalConsumo, 1)) * 100)))
      : 0;

    if (usuarioNombreHeader && data.usuario?.nombre) {
      usuarioNombreHeader.textContent = data.usuario.nombre;
    }

    setCard(produccionCard, `${totalProduccion.toFixed(1)} kWh`);
    setCard(consumoCard, `${totalConsumo.toFixed(1)} kWh`);
    setCard(ahorroCard, `+${ahorroPorcentaje}%`);
    setCard(panelesCard, String(totalPaneles));

    setSmall(produccionCard, propiedades.length ? 'Este mes' : 'Sin propiedades');
    setSmall(consumoCard, propiedades.length ? 'Total registrado' : 'Sin datos');
    setSmall(ahorroCard, propiedades.length ? 'Ahorro estimado' : 'Sin datos');
    setSmall(panelesCard, totalPaneles === 0 ? 'Sin paneles' : totalPaneles === 1 ? 'Activo' : 'Activos');

    if (propiedades.length > 0) {
      await cargarBalanceYEscena(propiedades[0]);
    } else if (balanceEmpty) {
      balanceEmpty.textContent = 'Registra una propiedad para ver el balance energético.';
      balanceEmpty.style.display = 'block';
      if (graficoBalance) graficoBalance.style.display = 'none';
      if (escena3d) {
        escena3d.innerHTML = '<p style="padding: 18px; color: #6b7280;">Aún no hay una propiedad para mostrar la vista 3D.</p>';
      }
    }
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    setCard(produccionCard, '0.0 kWh');
    setCard(consumoCard, '0.0 kWh');
    setCard(ahorroCard, '+0%');
    setCard(panelesCard, '0');

    setSmall(produccionCard, 'Sin conexión');
    setSmall(consumoCard, 'Reintenta');
    setSmall(ahorroCard, 'Verifica red');
    setSmall(panelesCard, 'Sin paneles');
  }
});
