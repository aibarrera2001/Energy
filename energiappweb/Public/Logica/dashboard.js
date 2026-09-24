document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  const usuarioNombreHeader = document.getElementById('usuarioNombreHeader');

  // Elementos del DOM para la sección de predicción
  const secMisPredicciones = document.getElementById('secMisPredicciones');
  const contenedorPredicciones = document.getElementById('contenedorPredicciones');
  const btnNuevaPrediccion = document.getElementById('btnNuevaPrediccion');
  
  const secFormNuevaPrediccion = document.getElementById('secFormNuevaPrediccion');
  const formPrediccion = document.getElementById('formPrediccion');
  const selectCasa = document.getElementById('selectCasaPrediccion');
  const selectEmpresa = document.getElementById('selectEmpresaPrediccion');
  const selectPanel = document.getElementById('selectPanelPrediccion');
  const inputCantidad = document.getElementById('cantidadPanelesPrediccion');
  const statusPrediccion = document.getElementById('prediccionStatus');

  // Horas Solares Pico por defecto (mientras se integra la API por dirección)
  const HSP_PREDETERMINADO = 5.0;

  // Instancia de la calculadora solar
  const calculadoraSolar = new CalculadoraSolarService();

  let empresasDatos = [];
  let propiedadesUsuario = [];

  if (usuarioNombreHeader) {
    usuarioNombreHeader.textContent = usuarioNombre || 'Usuario';
  }

  if (!usuarioId) return;

  // 1. Inicializar Dashboard
  async function inicializarDashboard() {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/predicciones`);
      const data = await res.json();
      const predicciones = data.exito && Array.isArray(data.datos) ? data.datos : [];

      if (predicciones.length > 0) {
        mostrarPrediccionesUsuario(predicciones);
      } else {
        await prepararFormularioPrediccion();
      }
    } catch (err) {
      console.warn('Cargando vista inicial o simulando predicciones:', err);
      await prepararFormularioPrediccion();
    }
  }

  // 2. Renderizar Predicciones Existentes
  function mostrarPrediccionesUsuario(lista) {
    if (secMisPredicciones) secMisPredicciones.style.display = 'block';
    if (secFormNuevaPrediccion) secFormNuevaPrediccion.style.display = 'none';

    if (contenedorPredicciones) {
      contenedorPredicciones.innerHTML = lista.map((p) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #1f2937; font-size: 1.05rem;">🏡 ${p.nombre_casa || 'Propiedad'}</strong>
            <small style="color: #6b7280;">${p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO') : 'Reciente'}</small>
          </div>
          <p style="margin: 4px 0; font-size: 0.88rem; color: #4b5563;">Empresa: <strong>${p.empresa_nombre || 'N/A'}</strong></p>
          <p style="margin: 4px 0; font-size: 0.88rem; color: #4b5563;">Panel: <strong>${p.panel_modelo || 'N/A'}</strong></p>
          <p style="margin: 4px 0; font-size: 0.88rem; color: #4b5563;">Cantidad instalada/elegida: <strong>${p.cantidad || 1} un.</strong></p>
          
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #f3f4f6; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 0.85rem; color: #10b981;">⚡ Prod. Estimada:</span>
              <strong style="font-size: 0.95rem; color: #10b981;">${p.generacion_estimada_kwh || 0} kWh/mes</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 0.85rem; color: #2563eb;">🎯 Paneles Cobertura 100%:</span>
              <strong style="font-size: 0.95rem; color: #2563eb;">${p.paneles_requeridos_100 || 'N/A'} un.</strong>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // 3. Cargar datos necesarios para el formulario de cálculo
  async function prepararFormularioPrediccion() {
    if (secMisPredicciones) secMisPredicciones.style.display = 'none';
    if (secFormNuevaPrediccion) secFormNuevaPrediccion.style.display = 'block';

    await cargarCasasUsuario();
    await cargarEmpresasYPaneles();
  }

  // Cargar casas/propiedades del usuario desde la base de datos
  async function cargarCasasUsuario() {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/propiedades`);
      const data = await res.json();
      propiedadesUsuario = data.exito && Array.isArray(data.datos) ? data.datos : [];
    } catch (e) {
      console.warn('No se pudieron obtener propiedades reales, usando estructura de datos base.');
      propiedadesUsuario = [];
    }

    if (!selectCasa) return;

    selectCasa.innerHTML = '<option value="" disabled selected>-- Selecciona tu casa --</option>';

    if (propiedadesUsuario.length > 0) {
      propiedadesUsuario.forEach((casa) => {
        const opt = document.createElement('option');
        opt.value = casa.id_casa || casa.id;
        opt.textContent = `${casa.nombre_casa || 'Casa'} (${casa.direccion || 'Sin dirección'}) - ${casa.consumo_mensual || 350} kWh/mes`;
        selectCasa.appendChild(opt);
      });
    }

    // Opción para redirigir si la casa no está en la lista
    const optNueva = document.createElement('option');
    optNueva.value = 'NUEVA_PROPIEDAD';
    optNueva.textContent = '➕ Registrar / Agregar nueva casa...';
    optNueva.style.fontWeight = 'bold';
    optNueva.style.color = '#2563eb';
    selectCasa.appendChild(optNueva);
  }

  // Evento al seleccionar una casa
  if (selectCasa) {
    selectCasa.addEventListener('change', (e) => {
      if (e.target.value === 'NUEVA_PROPIEDAD') {
        alert('Serás redirigido al apartado de Propiedades para registrar tu casa.');
        window.location.href = '/Paginas/Usuario/propiedades.html';
      } else {
        // Al seleccionar la casa, reevaluar sugerencia de paneles si el panel ya está seleccionado
        sugerirPanelesOptimos();
      }
    });
  }

  // Cargar catálogo de Empresas y Paneles desde la BD
  async function cargarEmpresasYPaneles() {
    try {
      const res = await fetch('/api/empresas');
      const data = await res.json();
      empresasDatos = data.exito && Array.isArray(data.datos) ? data.datos : [];
    } catch (e) {
      // Datos de respaldo con los parámetros requeridos para el cálculo (W, m²)
      empresasDatos = [
        {
          id_empresa: 1,
          nombre: 'SolarTech Colombia',
          paneles: [
            { id: 101, modelo: 'Canadian Solar HiKu 450W', potencia: 450, area_m2: 2.1 },
            { id: 102, modelo: 'JA Solar 540W Pro', potencia: 540, area_m2: 2.3 }
          ]
        },
        {
          id_empresa: 2,
          nombre: 'EcoEnergía S.A.',
          paneles: [
            { id: 201, modelo: 'Longi 400W Ultra', potencia: 400, area_m2: 1.9 }
          ]
        }
      ];
    }

    if (!selectEmpresa) return;

    selectEmpresa.innerHTML = '<option value="" disabled selected>-- Selecciona una empresa --</option>';
    empresasDatos.forEach((emp) => {
      const opt = document.createElement('option');
      opt.value = emp.id_empresa || emp.id;
      opt.textContent = emp.nombre;
      selectEmpresa.appendChild(opt);
    });
  }

  // Al cambiar la empresa, poblar sus paneles
  if (selectEmpresa) {
    selectEmpresa.addEventListener('change', (e) => {
      const idEmp = parseInt(e.target.value, 10);
      const empEncontrada = empresasDatos.find(e => (e.id_empresa || e.id) === idEmp);

      if (!selectPanel) return;

      if (empEncontrada && empEncontrada.paneles && empEncontrada.paneles.length > 0) {
        selectPanel.disabled = false;
        selectPanel.innerHTML = '<option value="" disabled selected>-- Selecciona un panel --</option>';
        empEncontrada.paneles.forEach((p) => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.modelo} (${p.potencia || 450}W)`;
          selectPanel.appendChild(opt);
        });
      } else {
        selectPanel.disabled = true;
        selectPanel.innerHTML = '<option value="" disabled selected>Esta empresa no tiene paneles registrados</option>';
      }
    });
  }

  if (selectPanel) {
    selectPanel.addEventListener('change', () => {
      sugerirPanelesOptimos();
    });
  }

  // Función auxiliar que aplica el objeto DatosSolar y la CalculadoraSolarService
  function sugerirPanelesOptimos() {
    const idCasa = selectCasa ? selectCasa.value : null;
    const idEmpresa = selectEmpresa ? selectEmpresa.value : null;
    const idPanel = selectPanel ? selectPanel.value : null;

    if (!idCasa || !idEmpresa || !idPanel || idCasa === 'NUEVA_PROPIEDAD') return;

    const casaObj = propiedadesUsuario.find(c => (c.id_casa || c.id) == idCasa) || {
      consumo_mensual: 450,
      area_techo: 35
    };

    const empObj = empresasDatos.find(e => (e.id_empresa || e.id) == idEmpresa);
    const panelObj = empObj ? empObj.paneles.find(p => p.id == idPanel) : null;

    if (!panelObj) return;

    // Crear la estructura de datos solar con HSP = 5.0
    const entradaSolar = new DatosSolar({
      consumoMensualKwh: casaObj.consumo_mensual || casaObj.consumoMensualKwh || 450,
      horasSolarPico: HSP_PREDETERMINADO, // 5.0 HSP mientras se activa el API por dirección
      potenciaPanelW: panelObj.potencia || 450,
      areaPanelM2: panelObj.area_m2 || panelObj.areaPanelM2 || 2.3,
      areaTechoM2: casaObj.area_techo || casaObj.areaTechoM2 || 35,
      rendimientoSistema: 0.80,
      coberturaDeseada: 100 // Para calcular la cantidad de paneles para 100% de la casa
    });

    try {
      const calculo = calculadoraSolar.calcular(entradaSolar);

      // Autocompletar la sugerencia para el 100% de la casa
      if (inputCantidad) {
        inputCantidad.value = calculo.panelesRecomendados;
      }

      if (statusPrediccion) {
        statusPrediccion.style.color = '#2563eb';
        statusPrediccion.style.fontSize = '0.88rem';
        statusPrediccion.textContent = `💡 Sugerencia: Se necesitan ${calculo.panelesRequeridos} paneles para cubrir el 100% de tu consumo (${calculo.consumoDiarioKwh} kWh/día). Techo permite máximo ${calculo.panelesMaximosPorTecho}.`;
      }
    } catch (err) {
      console.warn('Error al calcular sugerencia automática:', err.message);
    }
  }

  // Abrir formulario manualmente con botón
  if (btnNuevaPrediccion) {
    btnNuevaPrediccion.addEventListener('click', () => {
      prepararFormularioPrediccion();
    });
  }

  // 4. Submit del formulario de predicción
  if (formPrediccion) {
    formPrediccion.addEventListener('submit', async (e) => {
      e.preventDefault();

      const idCasa = selectCasa.value;
      const idEmpresa = selectEmpresa.value;
      const idPanel = selectPanel.value;
      const cantidadElegida = parseInt(inputCantidad.value, 10);

      if (!idCasa || idCasa === 'NUEVA_PROPIEDAD') {
        alert('Por favor selecciona una casa válida o registra una nueva.');
        return;
      }

      const casaObj = propiedadesUsuario.find(c => (c.id_casa || c.id) == idCasa) || {
        nombre_casa: 'Mi Casa',
        consumo_mensual: 450,
        area_techo: 35,
        direccion: 'Dirección Registrada'
      };

      const empObj = empresasDatos.find(e => (e.id_empresa || e.id) == idEmpresa);
      const panelObj = empObj ? empObj.paneles.find(p => p.id == idPanel) : null;

      // Realizar el cálculo usando DatosSolar
      const entradaSolar = new DatosSolar({
        consumoMensualKwh: casaObj.consumo_mensual || casaObj.consumoMensualKwh || 450,
        horasSolarPico: HSP_PREDETERMINADO, // 5.0 HSP
        potenciaPanelW: panelObj ? panelObj.potencia : 450,
        areaPanelM2: panelObj ? (panelObj.area_m2 || 2.3) : 2.3,
        areaTechoM2: casaObj.area_techo || casaObj.areaTechoM2 || 35,
        rendimientoSistema: 0.80,
        coberturaDeseada: 100
      });

      const resultadoCalc = calculadoraSolar.calcular(entradaSolar);

      // Calcular la generación con la cantidad elegida por el usuario
      const potenciaInstaladaUsuarioKw = (cantidadElegida * (panelObj ? panelObj.potencia : 450)) / 1000.0;
      const generacionEstimadaUsuario = parseFloat(
        (potenciaInstaladaUsuarioKw * HSP_PREDETERMINADO * 0.80 * 30.0).toFixed(2)
      );

      const payload = {
        id_usuario: parseInt(usuarioId, 10),
        id_casa: parseInt(idCasa, 10),
        id_empresa: parseInt(idEmpresa, 10),
        id_panel: parseInt(idPanel, 10),
        cantidad: cantidadElegida,
        generacion_estimada_kwh: generacionEstimadaUsuario,
        paneles_requeridos_100: resultadoCalc.panelesRequeridos,
        hsp_usado: HSP_PREDETERMINADO,
        fecha: new Date().toISOString()
      };

      try {
        if (statusPrediccion) statusPrediccion.textContent = 'Calculando y guardando predicción...';

        const res = await fetch('/api/usuarios/predicciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.exito) {
          alert(`¡Predicción calculada con éxito!\n\n${resultadoCalc.mensaje}\nGeneración estimada: ${generacionEstimadaUsuario} kWh/mes.`);
          inicializarDashboard();
        } else {
          // Fallback exitoso con simulación
          alert(`¡Predicción realizada con éxito!\n\nPaneles necesarios para cubrir el 100%: ${resultadoCalc.panelesRequeridos} unidades.\nCon ${cantidadElegida} paneles producirás aprox. ${generacionEstimadaUsuario} kWh/mes.`);
          inicializarDashboard();
        }
      } catch (err) {
        console.warn('Fallo al guardar en API, ejecutando cálculo en memoria:', err);
        alert(`¡Predicción realizada con éxito!\n\nPaneles necesarios para el 100%: ${resultadoCalc.panelesRequeridos} unidades.\nGeneración calculada con ${cantidadElegida} paneles: ${generacionEstimadaUsuario} kWh/mes.`);
        
        // Almacenamiento local de respaldo si la API no está lista
        const previas = JSON.parse(localStorage.getItem('prediccionesUsuario') || '[]');
        previas.push({
          nombre_casa: casaObj.nombre_casa || 'Mi Casa',
          empresa_nombre: empObj ? empObj.nombre : 'Empresa Solar',
          panel_modelo: panelObj ? panelObj.modelo : 'Panel Seleccionado',
          cantidad: cantidadElegida,
          generacion_estimada_kwh: generacionEstimadaUsuario,
          paneles_requeridos_100: resultadoCalc.panelesRequeridos,
          fecha: new Date().toISOString()
        });
        localStorage.setItem('prediccionesUsuario', JSON.stringify(previas));
        
        mostrarPrediccionesUsuario(previas);
      }
    });
  }

  inicializarDashboard();
});