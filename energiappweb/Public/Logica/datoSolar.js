/**
 * Clase para estructurar los datos de entrada necesarios para el cálculo solar.
 */
class DatosSolar {
  constructor({
    consumoMensualKwh,
    horasSolarPico,
    potenciaPanelW,
    areaPanelM2,
    areaTechoM2,
    rendimientoSistema = 0.80, // Valor por defecto sugerido (80%)
    coberturaDeseada = 100     // Valor por defecto del 100%
  }) {
    this.consumoMensualKwh = consumoMensualKwh;
    this.horasSolarPico = horasSolarPico;
    this.potenciaPanelW = potenciaPanelW;
    this.areaPanelM2 = areaPanelM2;
    this.areaTechoM2 = areaTechoM2;
    this.rendimientoSistema = rendimientoSistema;
    this.coberturaDeseada = coberturaDeseada;
  }
}

/**
 * Clase para contener los resultados procesados del dimensionamiento solar.
 */
class ResultadoSolar {
  constructor() {
    this.consumoDiarioKwh = 0;
    this.potenciaRequeridaKw = 0;
    this.panelesRequeridos = 0;
    this.panelesMaximosPorTecho = 0;
    this.panelesRecomendados = 0;
    this.potenciaInstaladaKw = 0;
    this.produccionDiariaKwh = 0;
    this.produccionMensualKwh = 0;
    this.produccionAnualKwh = 0;
    this.areaNecesariaM2 = 0;
    this.espacioSuficiente = false;
    this.mensaje = '';
  }
}