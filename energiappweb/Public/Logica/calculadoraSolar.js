/**
 * Servicio encargado de realizar los cálculos y validaciones energéticas.
 */
class CalculadoraSolarService {
  static DIAS_MES = 30.0;
  static DIAS_ANIO = 365.0;
  
  // Solo el 70 % del techo se usa como estimación preliminar.
  static FACTOR_APROVECHAMIENTO_TECHO = 0.70;

  /**
   * Procesa la información de entrada y devuelve la estimación solar.
   * @param {DatosSolar} datos 
   * @returns {ResultadoSolar}
   */
  calcular(datos) {
    this.validar(datos);

    // 1. Consumo diario y energía objetivo
    const consumoDiario = datos.consumoMensualKwh / CalculadoraSolarService.DIAS_MES;
    const cobertura = datos.coberturaDeseada / 100.0;
    const energiaObjetivo = consumoDiario * cobertura;

    // 2. Potencia fotovoltaica requerida
    const potenciaRequeridaKw = energiaObjetivo / (datos.horasSolarPico * datos.rendimientoSistema);
    const potenciaPanelKw = datos.potenciaPanelW / 1000.0;

    // 3. Cantidad de paneles requeridos (redondeado hacia arriba)
    const panelesRequeridos = Math.ceil(potenciaRequeridaKw / potenciaPanelKw);

    // 4. Área de techo y máximo de paneles permitidos
    const areaUtilizable = datos.areaTechoM2 * CalculadoraSolarService.FACTOR_APROVECHAMIENTO_TECHO;
    const panelesMaximosPorTecho = Math.floor(areaUtilizable / datos.areaPanelM2);

    // 5. Dimensionamiento final según restricciones de espacio
    const panelesRecomendados = Math.min(panelesRequeridos, panelesMaximosPorTecho);
    const potenciaInstaladaKw = panelesRecomendados * potenciaPanelKw;

    // 6. Producción estimada con los paneles recomendados
    const produccionDiaria = potenciaInstaladaKw * datos.horasSolarPico * datos.rendimientoSistema;
    const produccionMensual = produccionDiaria * CalculadoraSolarService.DIAS_MES;
    const produccionAnual = produccionDiaria * CalculadoraSolarService.DIAS_ANIO;

    const areaNecesaria = panelesRequeridos * datos.areaPanelM2;
    const espacioSuficiente = panelesRequeridos <= panelesMaximosPorTecho;

    // 7. Generación del mensaje descriptivo
    let mensaje = '';
    if (espacioSuficiente) {
      mensaje = `El área disponible permite instalar los ${panelesRequeridos} paneles necesarios para alcanzar la cobertura deseada.`;
    } else {
      mensaje = `Para alcanzar la cobertura deseada se requieren ${panelesRequeridos} paneles, pero el área utilizable permite instalar máximo ${panelesMaximosPorTecho}. La producción estimada será parcial.`;
    }

    // 8. Construcción del objeto de respuesta
    const resultado = new ResultadoSolar();
    resultado.consumoDiarioKwh = parseFloat(consumoDiario.toFixed(2));
    resultado.potenciaRequeridaKw = parseFloat(potenciaRequeridaKw.toFixed(2));
    resultado.panelesRequeridos = panelesRequeridos;
    resultado.panelesMaximosPorTecho = panelesMaximosPorTecho;
    resultado.panelesRecomendados = panelesRecomendados;
    resultado.potenciaInstaladaKw = parseFloat(potenciaInstaladaKw.toFixed(2));
    resultado.produccionDiariaKwh = parseFloat(produccionDiaria.toFixed(2));
    resultado.produccionMensualKwh = parseFloat(produccionMensual.toFixed(2));
    resultado.produccionAnualKwh = parseFloat(produccionAnual.toFixed(2));
    resultado.areaNecesariaM2 = parseFloat(areaNecesaria.toFixed(2));
    resultado.espacioSuficiente = espacioSuficiente;
    resultado.mensaje = mensaje;

    return resultado;
  }

  /**
   * Valida los datos de entrada antes de ejecutar el cálculo.
   * @param {DatosSolar} datos 
   */
  validar(datos) {
    if (
      !datos.consumoMensualKwh || datos.consumoMensualKwh <= 0 ||
      !datos.horasSolarPico || datos.horasSolarPico <= 0 ||
      !datos.potenciaPanelW || datos.potenciaPanelW <= 0 ||
      !datos.areaPanelM2 || datos.areaPanelM2 <= 0 ||
      !datos.areaTechoM2 || datos.areaTechoM2 <= 0 ||
      !datos.rendimientoSistema || datos.rendimientoSistema <= 0 || datos.rendimientoSistema > 1 ||
      !datos.coberturaDeseada || datos.coberturaDeseada <= 0 || datos.coberturaDeseada > 100
    ) {
      throw new Error('Verifica los valores ingresados para el cálculo solar.');
    }
  }
}