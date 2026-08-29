document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const grid = document.querySelector('.property-grid');

  if (!usuarioId) return;

  try {
    const res = await fetch(`/api/usuarios/${usuarioId}/propiedades`);
    const result = await res.json();

    if (result.exito && result.datos.length > 0) {
      grid.innerHTML = '';
      result.datos.forEach((prop, index) => {
        const cardHtml = `
          <article class="property-card">
            <div class="property-header">
              <span class="status-pill ok">Activa</span>
              <span class="property-code">Casa 0${index + 1}</span>
            </div>
            <h3>${prop.direccion}</h3>
            <p>${prop.ciudad}</p>
            <ul>
              <li>Tipo: ${prop.tipo_propiedad}</li>
              <li>Consumo prom: ${prop.consumo_mensual} kWh</li>
              <li>Área de techo: ${prop.area_techo_m2 || 0} m²</li>
            </ul>
            <button class="secondary-btn full-width">Ver detalle</button>
          </article>
        `;
        grid.innerHTML += cardHtml;
      });
    }
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
});