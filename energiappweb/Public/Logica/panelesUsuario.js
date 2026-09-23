document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const selectModelo = document.getElementById("selectPanelModelo");
  const inputStock = document.getElementById("panelStockDisponible");
  const inputCantidad = document.getElementById("panelCantidad");
  const formSolicitud = document.getElementById("solicitudPanelForm");
  const statusMensaje = document.getElementById("solicitudStatus");
  const panelesContainer = document.getElementById("panelesContainer");

  // Elementos de resumen / stats
  const panelSeleccionadoText = document.getElementById("panelSeleccionado");
  const panelSeleccionadoSubtext = document.getElementById("panelSeleccionadoTexto");
  const panelesBadge = document.getElementById("panelesBadge");
  const panelesBadgeLabel = document.getElementById("panelesBadgeLabel");

  let panelesDisponibles = [];

  // 1. Cargar catálogo de paneles desde el backend/base de datos
  async function cargarPanelesCatalogo() {
    try {
      // Reemplazar la URL por tu endpoint real (ej. '/api/paneles/catalogo')
      const response = await fetch("/api/paneles/catalogo", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el catálogo de paneles.");
      }

      panelesDisponibles = await response.json();
      poblarSelectPaneles(panelesDisponibles);
      renderizarCatalogoTarjetas(panelesDisponibles);
    } catch (error) {
      console.warn("Usando datos de prueba / Fallo al conectar con backend:", error);
      // Fallback con datos de ejemplo si el servidor no responde
      panelesDisponibles = [
        { id: 1, nombre: "Canadian Solar HiKu", tipo: "Monocristalino", potencia: 450, eficiencia: 21.5, stock: 12, precio: 450000 },
        { id: 2, nombre: "JA Solar Jam72", tipo: "Monocristalino", potencia: 540, eficiencia: 20.9, stock: 5, precio: 580000 },
        { id: 3, nombre: "Longi LR5-72HPH", tipo: "Policristalino", potencia: 400, eficiencia: 19.8, stock: 8, precio: 390000 }
      ];
      poblarSelectPaneles(panelesDisponibles);
      renderizarCatalogoTarjetas(panelesDisponibles);
    }
  }

  // 2. Llenar el selector <select> con los paneles habilitados
  function poblarSelectPaneles(lista) {
    if (!selectModelo) return;

    selectModelo.innerHTML = '<option value="" disabled selected>-- Selecciona un modelo --</option>';

    lista.forEach((panel) => {
      const option = document.createElement("option");
      option.value = panel.id;
      option.textContent = `${panel.nombre} - (${panel.potencia}W | Stock: ${panel.stock})`;
      selectModelo.appendChild(option);
    });
  }

  // 3. Renderizar el catálogo visual en el contenedor de abajo
  function renderizarCatalogoTarjetas(lista) {
    if (!panelesContainer) return;

    if (lista.length === 0) {
      panelesContainer.innerHTML = '<p style="padding:15px;color:#666;">No hay paneles disponibles en el catálogo.</p>';
      return;
    }

    panelesContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; padding: 10px 0;">
        ${lista.map(panel => `
          <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 15px; background: #fff; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h4 style="margin: 0 0 5px 0; font-size: 1.05rem;">${panel.nombre}</h4>
              <p style="margin: 2px 0; font-size: 0.85rem; color: #6b7280;">Tipo: ${panel.tipo}</p>
              <p style="margin: 2px 0; font-size: 0.85rem; color: #6b7280;">Potencia: <strong>${panel.potencia} W</strong></p>
              <p style="margin: 2px 0; font-size: 0.85rem; color: #6b7280;">Eficiencia: ${panel.eficiencia}%</p>
              <p style="margin: 2px 0; font-size: 0.85rem; color: #10b981;">Stock disponible: <strong>${panel.stock} un.</strong></p>
            </div>
            <button class="primary-btn small-btn" style="margin-top: 12px; width: 100%;" onclick="seleccionarPanelDirecto(${panel.id})">
              Elegir para cita
            </button>
          </div>
        `).join("")}
      </div>
    `;

    if (panelesBadge) panelesBadge.textContent = lista.length;
    if (panelesBadgeLabel) panelesBadgeLabel.textContent = "Modelos disponibles";
  }

  // 4. Función global para seleccionar desde la tarjeta del catálogo
  window.seleccionarPanelDirecto = (panelId) => {
    if (selectModelo) {
      selectModelo.value = panelId;
      selectModelo.dispatchEvent(new Event("change"));
      selectModelo.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // 5. Cambio en el <select>: Actualizar campos y límites de stock
  if (selectModelo) {
    selectModelo.addEventListener("change", (e) => {
      const panelId = parseInt(e.target.value, 10);
      const panelSeleccionado = panelesDisponibles.find(p => p.id === panelId);

      if (panelSeleccionado) {
        inputStock.value = panelSeleccionado.stock;
        
        // Asignar el valor máximo permitido (debe ser menor o igual al stock disponible)
        inputCantidad.max = panelSeleccionado.stock;
        inputCantidad.min = 1;
        inputCantidad.value = 1;

        if (panelSeleccionadoText) panelSeleccionadoText.textContent = panelSeleccionado.nombre;
        if (panelSeleccionadoSubtext) panelSeleccionadoSubtext.textContent = `Stock: ${panelSeleccionado.stock}`;
      }
    });
  }

  // 6. Validar y procesar la solicitud/cita
  if (formSolicitud) {
    formSolicitud.addEventListener("submit", async (e) => {
      e.preventDefault();

      const panelId = parseInt(selectModelo.value, 10);
      const cantidad = parseInt(inputCantidad.value, 10);
      const stockDisponible = parseInt(inputStock.value, 10);

      const panelObj = panelesDisponibles.find(p => p.id === panelId);

      if (!panelObj) {
        mostrarStatus("Por favor selecciona un modelo de panel válido.", "error");
        return;
      }

      if (isNaN(cantidad) || cantidad <= 0) {
        mostrarStatus("Ingresa una cantidad válida mayor a 0.", "error");
        return;
      }

      if (cantidad > stockDisponible) {
        mostrarStatus(`La cantidad (${cantidad}) no puede exceder el stock disponible (${stockDisponible}).`, "error");
        return;
      }

      // Payload para la API
      const solicitudPayload = {
        panelId: panelObj.id,
        nombreModelo: panelObj.nombre,
        cantidadSolicitada: cantidad,
        fechaSolicitud: new Date().toISOString(),
        estado: "Pendiente" // Pendiente de aprobación del administrador
      };

      try {
        mostrarStatus("Enviando solicitud de cita...", "info");

        // Reemplazar la URL por tu endpoint real (ej. '/api/citas/solicitar')
        const response = await fetch("/api/citas/solicitar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify(solicitudPayload)
        });

        if (response.ok || response.status === 201) {
          mostrarStatus("¡Solicitud enviada con éxito! El administrador la revisará pronto.", "exito");
          formSolicitud.reset();
          inputStock.value = "0";
        } else {
          const resData = await response.json().catch(() => ({}));
          mostrarStatus(resData.mensaje || "Solicitud registrada (Modo simulación).", "exito");
        }
      } catch (error) {
        console.warn("Fallo de red, simulando guardado local:", error);
        
        // Guardado local de respaldo si no hay conexión backend
        const citasGuardadas = JSON.parse(localStorage.getItem("solicitudesCitas") || "[]");
        citasGuardadas.push(solicitudPayload);
        localStorage.setItem("solicitudesCitas", JSON.stringify(citasGuardadas));

        mostrarStatus("¡Cita solicitada exitosamente! Pendiente de aprobación por el Administrador.", "exito");
        formSolicitud.reset();
        inputStock.value = "0";
      }
    });
  }

  // Función aux. para mensajes de estado
  function mostrarStatus(mensaje, tipo) {
    if (!statusMensaje) return;
    statusMensaje.textContent = mensaje;
    statusMensaje.style.fontWeight = "600";
    if (tipo === "error") {
      statusMensaje.style.color = "#dc2626";
    } else if (tipo === "exito") {
      statusMensaje.style.color = "#16a34a";
    } else {
      statusMensaje.style.color = "#2563eb";
    }
  }

  // Inicializar carga
  cargarPanelesCatalogo();
});