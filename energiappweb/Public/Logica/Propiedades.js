document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const grid = document.querySelector('.property-grid');
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const formPropiedadPanel = document.getElementById('formPropiedadPanel');
  const formPropiedad = document.getElementById('formPropiedad');
  const contadorPropiedades = document.getElementById('cantidadPropiedades');
  const textoCantidad = document.getElementById('textoCantidadPropiedades');

  if (!usuarioId) {
    if (grid) {
      grid.innerHTML = '<p style="padding: 15px; color: #666;">Debes iniciar sesión para ver tus propiedades.</p>';
    }
    return;
  }

  function actualizarContador(cantidad) {
    if (!contadorPropiedades) return;
    contadorPropiedades.textContent = String(cantidad);

    if (textoCantidad) {
      textoCantidad.textContent = cantidad === 1 ? 'Casa activa' : cantidad === 0 ? 'Sin casas' : 'Casas activas';
    }
  }

  async function cargarDetallePropiedad(casa, detailBox) {
    if (!detailBox || !usuarioId) return;

    const graphImg = detailBox.querySelector('.property-graph');
    const sceneBox = detailBox.querySelector('.property-3d');

    try {
      const [balanceRes, escenaRes] = await Promise.all([
        fetch(`/api/usuarios/${usuarioId}/casas/${casa.id_casa}/balance`),
        fetch(`/api/usuarios/${usuarioId}/casas/${casa.id_casa}/escena-3d`)
      ]);

      const balanceData = await balanceRes.json();
      const escenaData = await escenaRes.json();

      if (balanceData.exito && balanceData.datos?.grafico_balance_png_base64) {
        graphImg.src = `data:image/png;base64,${balanceData.datos.grafico_balance_png_base64}`;
        graphImg.style.display = 'block';
        graphImg.parentElement.querySelector('.property-empty').style.display = 'none';
      } else {
        graphImg.style.display = 'none';
        graphImg.parentElement.querySelector('.property-empty').style.display = 'block';
      }

      if (escenaData.exito && escenaData.datos && window.Plotly) {
        const sceneId = `escena-${casa.id_casa}`;
        sceneBox.id = sceneId;
        Plotly.newPlot(sceneId, escenaData.datos.data, escenaData.datos.layout, {
          responsive: true,
          displayModeBar: false
        });
        window.addEventListener('resize', () => Plotly.Plots.resize(sceneId));
      } else {
        sceneBox.innerHTML = '<p style="margin:0; color:#6b7280;">Escena 3D no disponible.</p>';
      }
    } catch (error) {
      console.error('Error al cargar detalle de propiedad:', error);
      graphImg.style.display = 'none';
      graphImg.parentElement.querySelector('.property-empty').textContent = 'No se pudo cargar el balance.';
      graphImg.parentElement.querySelector('.property-empty').style.display = 'block';
      sceneBox.innerHTML = '<p style="margin:0; color:#6b7280;">No se pudo cargar la vista 3D.</p>';
    }
  }

  async function cargarPropiedades() {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/propiedades`);
      const resData = await res.json();
      const propiedades = resData.exito && Array.isArray(resData.datos) ? resData.datos : [];

      if (propiedades.length > 0) {
        grid.innerHTML = '';
        const cards = propiedades.map(casa => crearTarjetaPropiedad(casa));
        cards.forEach(card => grid.appendChild(card));
        actualizarContador(propiedades.length);
      } else {
        grid.innerHTML = '<div style="padding:18px; color:#666;">No tienes propiedades registradas. Usa “Nueva propiedad” para crear tu primera casa.</div>';
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
      <h3>${casa.direccion || 'Sin dirección'}</h3>
      <p>${casa.ciudad || 'Sin ciudad'}</p>
      <ul>
        <li>${casa.tipo_propiedad || 'Tipo no especificado'}</li>
        <li>${area}</li>
        <li>Consumo estimado: ${consumo} kWh</li>
      </ul>
      <div class="property-detail">
        <div class="property-visual-box">
          <h4>Balance</h4>
          <img class="property-graph" alt="Balance energético" style="display: none; width: 100%; border-radius: 10px;" />
          <p class="property-empty">Cargando balance…</p>
        </div>
        <div class="property-visual-box">
          <h4>Vista 3D</h4>
          <div class="property-3d" style="width: 100%; height: 220px; min-height: 220px; background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%); border-radius: 10px; overflow: hidden;"></div>
        </div>
      </div>
      <button class="secondary-btn full-width view-btn" type="button">Actualizar vista</button>
    `;

    const viewBtn = article.querySelector('.view-btn');
    const detailBox = article.querySelector('.property-detail');
    viewBtn.addEventListener('click', () => cargarDetallePropiedad(casa, detailBox));
    cargarDetallePropiedad(casa, detailBox);

    return article;
  }

  if (toggleFormBtn && formPropiedadPanel) {
    toggleFormBtn.addEventListener('click', () => {
      const isHidden = formPropiedadPanel.style.display === 'none';
      formPropiedadPanel.style.display = isHidden ? 'block' : 'none';
    });
  }

  if (formPropiedad) {
    formPropiedad.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload = {
        id_usuario: parseInt(usuarioId, 10),
        direccion: document.getElementById('direccionPropiedad').value.trim(),
        ciudad: document.getElementById('ciudadPropiedad').value.trim(),
        tipo_propiedad: document.getElementById('tipoPropiedad').value,
        consumo_mensual: Number(document.getElementById('consumoMensual').value || 0),
        area_techo_m2: Number(document.getElementById('areaTecho').value || 0)
      };

      if (!payload.direccion || !payload.ciudad) {
        alert('Completa la dirección y la ciudad de la propiedad');
        return;
      }

      try {
        const res = await fetch('/api/usuarios/propiedades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.exito) {
          formPropiedad.reset();
          formPropiedadPanel.style.display = 'none';
          cargarPropiedades();
          alert('Propiedad registrada correctamente');
        } else {
          alert('Error: ' + (data.mensaje || 'No se pudo guardar la propiedad'));
        }
      } catch (err) {
        console.error('Error al crear propiedad:', err);
        alert('Error de conexión con el servidor');
      }
    });
  }

  cargarPropiedades();
});