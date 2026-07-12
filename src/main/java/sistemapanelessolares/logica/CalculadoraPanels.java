package sistemapanelessolares.logica;

import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.dominio.SolarAPIUsuario;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

public class CalculadoraPanels {

    private Casa casa;
    private PanelSolar panel;
    private double costoAdicionalSistema;

    public CalculadoraPanels(Casa casa, PanelSolar panel, double costoAdicionalSistema) {
        this.casa = casa;
        this.panel = panel;
        this.costoAdicionalSistema = costoAdicionalSistema;
    }

    public double getHorasSolEstimadas() {
        return SolarAPIUsuario.obtenerHorasSolPico(
                casa.getLatitud(), casa.getLongitud(), casa.getCiudad());
    }

    public int calcularNumeroPaneles() {
        if (panel == null) return 0;
        double consumoDiarioKWh = casa.getConsumoDiarioKWh();
        double horasSol = getHorasSolEstimadas();
        // PR = 0.80: Factor de rendimiento real (pérdidas por temperatura,
        // cableado, inversor, suciedad). El Wp ya incluye la eficiencia celular.
        double PR = 0.80;
        double produccionPorPanel = (panel.getPotenciaWatts() / 1000.0) * horasSol * PR;
        if (produccionPorPanel <= 0) return 0;
        return (int) Math.ceil(consumoDiarioKWh / produccionPorPanel);
    }

    public static int calcularPanelesParaConsumoMensual(PanelSolar panel,
            double consumoMensualKWh, double horasSolEfectivas) {
        if (panel == null) return 0;
        double consumoDiarioKWh = consumoMensualKWh / 30.0;
        double eficienciaDecimal = panel.getEficiencia() / 100.0;
        double produccionPorPanel = (panel.getPotenciaWatts() / 1000.0) * horasSolEfectivas * eficienciaDecimal;
        if (produccionPorPanel <= 0) return 0;
        return (int) Math.ceil(consumoDiarioKWh / produccionPorPanel);
    }

    public double calcularCostoTotal() {
        if (panel == null) return costoAdicionalSistema;
        int numPaneles = calcularNumeroPaneles();
        return numPaneles * (panel.getCostoUnidad() + costoAdicionalSistema);
    }

    public double calcularGeneracionMensualKWh() {
        if (panel == null) return 0;
        int numPaneles = calcularNumeroPaneles();
        double horasSol = getHorasSolEstimadas();
        double PR = 0.80;
        double produccionDiaria = numPaneles * (panel.getPotenciaWatts() / 1000.0) * horasSol * PR;
        return produccionDiaria * 30;
    }

    /**
     * @throws ValidacionNegocioException si no hay un panel seleccionado para generar el resumen
     */
    public String generarResumen() {
        if (panel == null) {
            throw new ValidacionNegocioException("No se ha seleccionado ningún panel solar.");
        }
        int numPaneles = calcularNumeroPaneles();
        double costoTotal = calcularCostoTotal();
        return "Resumen del sistema solar:\n"
                + "- Casa: " + casa.toString() + "\n"
                + "- Horas de sol estimadas: " + String.format("%.1f h", getHorasSolEstimadas()) + "\n"
                + "- Panel: " + panel.getNombre() + " (" + panel.getTipo() + ")\n"
                + "- Paneles necesarios: " + numPaneles + "\n"
                + "- Costo paneles: $" + String.format("%,.0f", numPaneles * panel.getCostoUnidad()) + "\n"
                + "- Costo instalación: $" + String.format("%,.0f", numPaneles * costoAdicionalSistema) + "\n"
                + "- Costo total: $" + String.format("%,.0f", costoTotal);
    }
}