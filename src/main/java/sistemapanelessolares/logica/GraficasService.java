package sistemapanelessolares.logica;

import javafx.scene.chart.*;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.dominio.Usuario;
import java.util.List;

public class GraficasService {

    private final SolarService solarService;

    public GraficasService(SolarService solarService) {
        this.solarService = solarService;
    }

    // ── Helpers base ──────────────────────────────────────────────────
    public double getConsumoMensual(Usuario usuario) {
        if (usuario.getCasas() == null || usuario.getCasas().isEmpty()) return 300;
        return usuario.getCasas().stream().mapToDouble(Casa::getConsumoMensualKWh).sum();
    }

    public double getGeneracionMensual(Usuario usuario) {
        // 1. Usa panelSeleccionado si existe
        if (usuario.getPanelSeleccionado() != null
                && usuario.getCasas() != null && !usuario.getCasas().isEmpty()) {
            double total = 0;
            for (Casa c : usuario.getCasas()) {
                PanelSolar p = usuario.getPanelSeleccionado();
                total += new CalculadoraPanels(c, p, p.getCostoInstalacion()).calcularGeneracionMensualKWh();
            }
            return total > 0 ? total : 0;
        }
        // 2. Fallback: primer panel del catálogo
        if (solarService != null && usuario.getCasas() != null && !usuario.getCasas().isEmpty()) {
            List<PanelSolar> paneles = solarService.getGestorPaneles().listarPorPrecioAscendente();
            if (!paneles.isEmpty()) {
                double total = 0;
                PanelSolar p = paneles.get(2); // panel intermedio (índice 2)
                for (Casa c : usuario.getCasas()) {
                    total += new CalculadoraPanels(c, p, p.getCostoInstalacion()).calcularGeneracionMensualKWh();
                }
                return total > 0 ? total : 0;
            }
        }
        // 3. Estimación con HSP promedio si hay casas
        if (usuario.getCasas() != null && !usuario.getCasas().isEmpty()) {
            double consumo = getConsumoMensual(usuario);
            return consumo * 0.45; // estimado: genera 45% del consumo con panel básico
        }
        return 250;
    }

    // ── Gráfica 1: Consumo vs Generación ─────────────────────────────
    public Chart crearGraficaConsumoVsGeneracion(Usuario usuario) {
        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis   yAxis = new NumberAxis();
        xAxis.setLabel("Mes"); yAxis.setLabel("kWh");

        BarChart<String, Number> chart = new BarChart<>(xAxis, yAxis);
        chart.setTitle("Consumo vs Generación");
        chart.setLegendVisible(true);

        XYChart.Series<String, Number> serieConsumo    = new XYChart.Series<>();
        serieConsumo.setName("Consumo Red");
        XYChart.Series<String, Number> serieGeneracion = new XYChart.Series<>();
        serieGeneracion.setName("Generación Solar");

        String[] meses = {"Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"};
        double consumo    = getConsumoMensual(usuario);
        double generacion = getGeneracionMensual(usuario);

        // Variación estacional realista para Colombia
        double[] factores = {0.95,0.98,1.05,1.08,1.02,0.96,0.94,0.97,1.00,1.03,1.01,0.97};
        for (int i = 0; i < meses.length; i++) {
            serieConsumo.getData().add(new XYChart.Data<>(meses[i], consumo));
            serieGeneracion.getData().add(new XYChart.Data<>(meses[i], Math.round(generacion * factores[i])));
        }
        chart.getData().addAll(serieConsumo, serieGeneracion);
        chart.setStyle("-fx-background-color: transparent;");
        return chart;
    }

    // ── Gráfica 2: Ahorro acumulado ───────────────────────────────────
    public Chart crearGraficaAhorroAcumulado(Usuario usuario) {
        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis   yAxis = new NumberAxis();
        xAxis.setLabel("Año"); yAxis.setLabel("$ Ahorro");

        LineChart<String, Number> chart = new LineChart<>(xAxis, yAxis);
        chart.setTitle("Ahorro Acumulado");

        XYChart.Series<String, Number> serie = new XYChart.Series<>();
        serie.setName("Ahorro $");

        double generacion    = getGeneracionMensual(usuario);
        double consumo       = getConsumoMensual(usuario);
        double ahorroMensual = Math.min(consumo, generacion) * 1000.0;
        double acumulado     = 0;

        for (int anio = 1; anio <= 10; anio++) {
            acumulado += ahorroMensual * 12;
            serie.getData().add(new XYChart.Data<>("Año " + anio, acumulado));
        }
        chart.getData().add(serie);
        chart.setStyle("-fx-background-color: transparent;");
        return chart;
    }

    // ── Gráfica 3: Distribución costos ───────────────────────────────
    public Chart crearGraficaDistribucionCostos() {
        PieChart chart = new PieChart();
        chart.setTitle("Distribución de Costos");
        chart.getData().addAll(
            new PieChart.Data("Paneles Solares (55%)", 55),
            new PieChart.Data("Instalación (25%)",     25),
            new PieChart.Data("Inversor (12%)",         12),
            new PieChart.Data("Baterías (8%)",           8)
        );
        chart.setStyle("-fx-background-color: transparent;");
        return chart;
    }

    // ── Gráfica 4: Comparativa semanal ───────────────────────────────
    public Chart crearGraficaComparativaEnergia(Usuario usuario) {
        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis   yAxis = new NumberAxis();
        xAxis.setLabel("Semana"); yAxis.setLabel("kWh");

        BarChart<String, Number> chart = new BarChart<>(xAxis, yAxis);
        chart.setTitle("Comparativa Semanal");

        XYChart.Series<String, Number> serieRed   = new XYChart.Series<>();
        serieRed.setName("Red Eléctrica");
        XYChart.Series<String, Number> serieSolar = new XYChart.Series<>();
        serieSolar.setName("Solar");

        double consumoSemanal    = getConsumoMensual(usuario) / 4.0;
        double generacionSemanal = getGeneracionMensual(usuario) / 4.0;

        for (int i = 1; i <= 4; i++) {
            serieRed.getData().add(  new XYChart.Data<>("Sem " + i, consumoSemanal));
            serieSolar.getData().add(new XYChart.Data<>("Sem " + i, generacionSemanal));
        }
        chart.getData().addAll(serieRed, serieSolar);
        chart.setStyle("-fx-background-color: transparent;");
        return chart;
    }

    // ── Métodos legacy para compatibilidad ───────────────────────────
    private double obtenerConsumoMensual(Usuario u)    { return getConsumoMensual(u); }
    private double obtenerGeneracionMensual(Usuario u) { return getGeneracionMensual(u); }
}