document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const cards = Array.from(document.querySelectorAll('.stat-card'));

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
    setSmall(ahorroCard, 'Inicia sesión');
    setSmall(panelesCard, 'Activos');
  };

  resetCards();

  if (!usuarioId) return;

  try {
    const response = await fetch(`/api/usuarios/${usuarioId}/propiedades`);
    const result = await response.json();
    const propiedades = result.exito && Array.isArray(result.datos) ? result.datos : [];

    const totalConsumo = propiedades.reduce((sum, item) => sum + Number(item.consumo_mensual || 0), 0);
    const totalProduccion = propiedades.reduce((sum, item) => sum + Number(item.consumo_mensual || 0) * 1.42, 0);
    const ahorroPorcentaje = propiedades.length
      ? Math.min(95, Math.max(0, Math.round((totalProduccion / Math.max(totalConsumo, 1)) * 100)))
      : 0;

    setCard(produccionCard, `${totalProduccion.toFixed(1)} kWh`);
    setCard(consumoCard, `${totalConsumo.toFixed(1)} kWh`);
    setCard(ahorroCard, `+${ahorroPorcentaje}%`);
    setCard(panelesCard, String(propiedades.length));

    setSmall(produccionCard, propiedades.length ? 'Este mes' : 'Sin propiedades');
    setSmall(consumoCard, propiedades.length ? 'Total registrado' : 'Sin datos');
    setSmall(ahorroCard, propiedades.length ? 'Ahorro estimado' : 'Sin datos');
    setSmall(panelesCard, propiedades.length === 1 ? 'Activo' : 'Activos');
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    setCard(produccionCard, '0.0 kWh');
    setCard(consumoCard, '0.0 kWh');
    setCard(ahorroCard, '+0%');
    setCard(panelesCard, '0');

    setSmall(produccionCard, 'Sin conexión');
    setSmall(consumoCard, 'Reintenta');
    setSmall(ahorroCard, 'Verifica red');
    setSmall(panelesCard, 'Activos');
  }
});
