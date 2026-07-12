package sistemapanelessolares.view;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.paint.Color;
import javafx.scene.chart.*;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.logica.GraficasService;
import sistemapanelessolares.logica.SolarService;
import sistemapanelessolares.logica.CalculadoraPanels;
import javafx.scene.Node;

public class PestanaGraficasFX {

    private final Usuario       usuario;
    private final GraficasService graficasService;
    private final SolarService  solarServicio;

    private static final String C_PRIMARY   = "#0D5BD7";
    private static final String C_PRIMARY_L = "#EEF4FF";
    private static final String C_BG        = "#F0F4FA";
    private static final String C_SURFACE   = "#FFFFFF";
    private static final String C_TEXT      = "#1F2937";
    private static final String C_TEXT_S    = "#6B7280";
    private static final String C_BORDER    = "#E2E8F0";
    private static final String C_SUCCESS   = "#16A34A";
    private static final String C_SUCCESS_L = "#F0FDF4";
    private static final String C_WARNING   = "#D97706";
    private static final String C_WARNING_L = "#FFFBEB";
    private static final String C_PURPLE    = "#7C3AED";
    private static final String C_PURPLE_L  = "#F5F3FF";

    public PestanaGraficasFX(Usuario usuario, SolarService solarService) {
        this.usuario        = usuario;
        this.solarServicio  = solarService;
        this.graficasService = new GraficasService(solarService);
    }

    public Tab crearPestanaGraficas() {
        Tab tab = new Tab("📊 Gráficas");
        tab.setClosable(false);

        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background:" + C_BG + "; -fx-background-color:" + C_BG + ";");
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        VBox contenedor = new VBox(20);
        contenedor.setPadding(new Insets(20));
        contenedor.setStyle("-fx-background-color:" + C_BG + ";");

        // Cabecera
        contenedor.getChildren().add(construirCabecera());

        // Estadísticas calculadas en tiempo real
        contenedor.getChildren().add(construirEstadisticas());

        // Grid 2x2 gráficas
        GridPane grid = new GridPane();
        grid.setHgap(16); grid.setVgap(16);
        ColumnConstraints cc = new ColumnConstraints();
        cc.setPercentWidth(50);
        grid.getColumnConstraints().addAll(cc, new ColumnConstraints() {{ setPercentWidth(50); }});

        grid.add(wrapGrafica(graficasService.crearGraficaConsumoVsGeneracion(usuario),
                "📈  Consumo vs Generación Mensual",
                "Barra roja = lo que consumes de la red. Barra amarilla = lo que generarías con paneles solares.",
                C_PRIMARY, C_PRIMARY_L), 0, 0);

        grid.add(wrapGrafica(graficasService.crearGraficaAhorroAcumulado(usuario),
                "💰  Ahorro Acumulado (10 años)",
                "Proyección del dinero ahorrado año a año desde la instalación del sistema solar.",
                C_SUCCESS, C_SUCCESS_L), 1, 0);

        grid.add(wrapGrafica(graficasService.crearGraficaDistribucionCostos(),
                "🧩  Distribución de la Inversión",
                "Cómo se reparte el costo inicial: paneles 55%, instalación 25%, inversor 12%, baterías 8%.",
                C_WARNING, C_WARNING_L), 0, 1);

        grid.add(wrapGrafica(graficasService.crearGraficaComparativaEnergia(usuario),
                "⚡  Energía Semanal Comparada",
                "Cuánta energía tomarías de la red vs cuánta generarías cada semana con tu sistema solar.",
                C_PURPLE, C_PURPLE_L), 1, 1);

        contenedor.getChildren().addAll(grid, construirPanelInfo());
        scroll.setContent(contenedor);
        tab.setContent(scroll);
        return tab;
    }

    // ── Cabecera ──────────────────────────────────────────────────────
    private HBox construirCabecera() {
        HBox hdr = new HBox(16); hdr.setAlignment(Pos.CENTER_LEFT);
        VBox textos = new VBox(4);
        Label titulo = new Label("Panel de Análisis Gráfico");
        titulo.setStyle("-fx-font-size:22px; -fx-font-weight:900; -fx-text-fill:" + C_TEXT + ";");
        Label sub = new Label("Usuario: " + usuario.getNombre() + " " + usuario.getApellido()
                + "  •  Datos calculados con API Open-Meteo en tiempo real");
        sub.setStyle("-fx-font-size:12px; -fx-text-fill:" + C_TEXT_S + ";");
        textos.getChildren().addAll(titulo, sub);
        Region sp = new Region(); HBox.setHgrow(sp, Priority.ALWAYS);
        Button btnAct = accionBtn("🔄  Actualizar", C_PRIMARY, C_PRIMARY_L);
        Button btnExp = accionBtn("📥  Exportar",   C_SUCCESS,  C_SUCCESS_L);
        btnAct.setOnAction(e -> mostrarInfo("Actualización", "Gráficas actualizadas."));
        btnExp.setOnAction(e -> mostrarInfo("Exportar", "Funcionalidad en desarrollo."));
        HBox bots = new HBox(8, btnAct, btnExp);
        hdr.getChildren().addAll(textos, sp, bots);
        return hdr;
    }

    // ── Estadísticas reales ───────────────────────────────────────────
    private HBox construirEstadisticas() {
        double consumo    = graficasService.getConsumoMensual(usuario);
        double generacion = graficasService.getGeneracionMensual(usuario);
        double ahorro     = Math.min(consumo, generacion) * 1000.0;
        double co2        = generacion * 0.233;

        // Calcular paneles totales
        int totalPaneles = 0;
        PanelSolar panel = usuario.getPanelSeleccionado();
        if (panel == null && solarServicio != null) {
            java.util.List<PanelSolar> ps = solarServicio.getGestorPaneles().listarPorPrecioAscendente();
            if (ps.size() > 2) panel = ps.get(2);
            else if (!ps.isEmpty()) panel = ps.get(0);
        }
        if (panel != null && usuario.getCasas() != null) {
            for (Casa c : usuario.getCasas()) {
                totalPaneles += new CalculadoraPanels(c, panel, panel.getCostoInstalacion()).calcularNumeroPaneles();
            }
        }

        HBox row = new HBox(14);
        row.getChildren().addAll(
            statCard("⚡", "Generación Estimada",
                     generacion > 0 ? String.format("%.0f kWh", generacion) : "Sin datos",
                     C_PRIMARY, C_PRIMARY_L),
            statCard("💰", "Ahorro Mensual",
                     ahorro > 0 ? "$" + String.format("%,.0f", ahorro) : "Sin datos",
                     C_SUCCESS, C_SUCCESS_L),
            statCard("🌍", "CO₂ Evitado/Mes",
                     co2 > 0 ? String.format("%.1f kg", co2) : "Sin datos",
                     C_WARNING, C_WARNING_L),
            statCard("🔋", "Paneles Necesarios",
                     totalPaneles > 0 ? totalPaneles + " und." : "Sin datos",
                     C_PURPLE, C_PURPLE_L)
        );
        row.getChildren().forEach(n -> HBox.setHgrow(n, Priority.ALWAYS));

        // Nota si no hay panel seleccionado
        if (usuario.getPanelSeleccionado() == null) {
            VBox wrapper = new VBox(8);
            Label nota = new Label("ℹ  Valores estimados con panel de referencia. Selecciona un panel en el Dashboard para ver tus datos reales.");
            nota.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_WARNING + "; -fx-font-style:italic;");
            nota.setWrapText(true);
            wrapper.getChildren().addAll(row, nota);
            HBox outer = new HBox(wrapper); HBox.setHgrow(wrapper, Priority.ALWAYS);
            return outer;
        }
        return row;
    }

    // ── Wrap gráfica ──────────────────────────────────────────────────
    private VBox wrapGrafica(Chart grafica, String titulo, String descripcion, String color, String bgColor) {
        VBox box = new VBox(12);
        box.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:14;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-left-color:" + color + ";"
                + "-fx-border-radius:14; -fx-padding:18; -fx-border-width:1 1 1 4;");
        box.setEffect(new DropShadow(5, 0, 1, Color.color(0,0,0,0.05)));
        Label tit = new Label(titulo);
        tit.setStyle("-fx-font-size:14px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        Region sep = new Region(); sep.setPrefHeight(1);
        sep.setStyle("-fx-background-color:" + C_BORDER + ";");
        grafica.setMinHeight(280); grafica.setPrefHeight(300);
        grafica.setMaxWidth(Double.MAX_VALUE);
        grafica.setStyle("-fx-background-color:transparent;");
        VBox.setVgrow(grafica, Priority.ALWAYS);
        Label desc = new Label(descripcion);
        desc.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + "; -fx-wrap-text:true;");
        desc.setWrapText(true);
        box.getChildren().addAll(tit, sep, grafica, desc);
        return box;
    }

    // ── Panel informativo ─────────────────────────────────────────────
    private VBox construirPanelInfo() {
        VBox panel = new VBox(14);
        panel.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:14;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:14; -fx-padding:20;");
        panel.setEffect(new DropShadow(5, 0, 1, Color.color(0,0,0,0.05)));
        Label tit = new Label("ℹ  Cómo leer las gráficas");
        tit.setStyle("-fx-font-size:15px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        Separator sep = new Separator(); sep.setStyle("-fx-background-color:" + C_BORDER + ";");
        GridPane tips = new GridPane(); tips.setHgap(12); tips.setVgap(10);
        String[][] d = {
            {"📈","Consumo vs Generación","Si la barra solar ≥ barra de red, tu sistema cubre toda tu demanda energética."},
            {"💰","Ahorro Acumulado","Cuando la curva supere tu inversión inicial, habrás recuperado el 100% del capital."},
            {"🧩","Distribución de Costos","Los paneles representan ~55% de la inversión total del sistema fotovoltaico."},
            {"⚡","Energía Semanal","Útil para monitorear el rendimiento de tu sistema en períodos cortos."},
        };
        for (int i = 0; i < d.length; i++) {
            HBox tip = new HBox(10); tip.setAlignment(Pos.TOP_LEFT);
            tip.setStyle("-fx-background-color:" + C_BG + "; -fx-background-radius:10; -fx-padding:12;");
            Label ico = new Label(d[i][0]); ico.setStyle("-fx-font-size:18px;");
            VBox txt = new VBox(3);
            Label t = new Label(d[i][1]); t.setStyle("-fx-font-size:12px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
            Label de = new Label(d[i][2]); de.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + "; -fx-wrap-text:true;");
            de.setWrapText(true);
            txt.getChildren().addAll(t, de); HBox.setHgrow(txt, Priority.ALWAYS);
            tip.getChildren().addAll(ico, txt);
            tips.add(tip, i % 2, i / 2);
        }
        ColumnConstraints cc = new ColumnConstraints(); cc.setPercentWidth(50);
        tips.getColumnConstraints().addAll(cc, new ColumnConstraints() {{ setPercentWidth(50); }});
        HBox leyenda = new HBox(20); leyenda.setAlignment(Pos.CENTER_LEFT);
        leyenda.getChildren().addAll(
            leyItem(C_PRIMARY,"Energía de Red"), leyItem(C_SUCCESS,"Energía Solar"),
            leyItem(C_WARNING,"Ahorro"), leyItem(C_PURPLE,"Comparativa")
        );
        panel.getChildren().addAll(tit, sep, tips, leyenda);
        return panel;
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private VBox statCard(String icon, String tit, String val, String color, String bg) {
        VBox box = new VBox(6);
        box.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:12;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-left-color:" + color + ";"
                + "-fx-border-radius:12; -fx-padding:14 16; -fx-border-width:1 1 1 4;");
        box.setEffect(new DropShadow(4, 0, 1, Color.color(0,0,0,0.04)));
        HBox hdr = new HBox(6); hdr.setAlignment(Pos.CENTER_LEFT);
        Label ico = new Label(icon); ico.setStyle("-fx-font-size:14px;");
        Label t   = new Label(tit);  t.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + "; -fx-font-weight:bold;");
        hdr.getChildren().addAll(ico, t);
        Label v = new Label(val); v.setStyle("-fx-font-size:22px; -fx-font-weight:900; -fx-text-fill:" + color + ";");
        box.getChildren().addAll(hdr, v);
        return box;
    }

    private Button accionBtn(String txt, String color, String bg) {
        Button b = new Button(txt);
        b.setStyle("-fx-background-color:" + bg + "; -fx-text-fill:" + color + ";"
                + "-fx-font-size:12px; -fx-font-weight:bold; -fx-cursor:hand;"
                + "-fx-background-radius:8; -fx-padding:8 14;"
                + "-fx-border-color:" + color + "44; -fx-border-radius:8;");
        return b;
    }

    private HBox leyItem(String color, String txt) {
        HBox i = new HBox(6); i.setAlignment(Pos.CENTER_LEFT);
        Region r = new Region(); r.setPrefSize(12, 12);
        r.setStyle("-fx-background-color:" + color + "; -fx-background-radius:3;");
        Label l = new Label(txt); l.setStyle("-fx-font-size:12px; -fx-text-fill:" + C_TEXT_S + ";");
        i.getChildren().addAll(r, l); return i;
    }

    private void mostrarInfo(String titulo, String msg) {
        Alert a = new Alert(Alert.AlertType.INFORMATION);
        a.setTitle(titulo); a.setHeaderText(null); a.setContentText(msg); a.showAndWait();
    }
}