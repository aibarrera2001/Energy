package sistemapanelessolares.view;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.image.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

import sistemapanelessolares.dao.CasaDAO;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.logica.SolarService;
import sistemapanelessolares.logica.CalculadoraPanels;

import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class DashboardusuarioFx {

    private final Usuario      usuarioLogueado;
    private final SolarService solarServicio;
    private final Connection   conexionDB;

    private final Map<Integer, PanelSolar> panelesPorCasa = new HashMap<>();

    private VBox  listaCasasBox;
    private Label lblMetricaCasas, lblMetricaPanel, lblMetricaConsumo;
    private VBox  vboxInformeFinanciero;

    private static final String C_PRIMARY   = "#0D5BD7";
    private static final String C_PRIMARY_L = "#EEF4FF";
    private static final String C_PRIMARY_D = "#0A47B0";
    private static final String C_BG        = "#F0F4FA";
    private static final String C_SURFACE   = "#FFFFFF";
    private static final String C_TEXT      = "#1F2937";
    private static final String C_TEXT_S    = "#6B7280";
    private static final String C_BORDER    = "#E2E8F0";
    private static final String C_SUCCESS   = "#16A34A";
    private static final String C_SUCCESS_L = "#F0FDF4";
    private static final String C_WARNING   = "#D97706";
    private static final String C_WARNING_L = "#FFFBEB";
    private static final String C_ERROR     = "#DC2626";
    private static final String C_ERROR_L   = "#FEF2F2";

    public DashboardusuarioFx(Usuario u, SolarService s, Connection c) {
        this.usuarioLogueado = u; this.solarServicio = s; this.conexionDB = c;
    }

    public void mostrar(Stage stage) {
        stage.setTitle("EnergiApp — Panel de Usuario");
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color:" + C_BG + ";");
        root.setTop(construirNavbar(stage));

        TabPane tabs = new TabPane();
        tabs.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);
        tabs.setStyle("-fx-background-color:" + C_BG + "; -fx-tab-min-height:44px;");

        Tab tDash = new Tab("🏠  Dashboard");
        tDash.setContent(construirDashboard(stage));

        Tab tGraf = new Tab("📊  Gráficas");
        Label grafPh = new Label("Haz clic en esta pestaña para cargar las gráficas");
        grafPh.setStyle("-fx-font-size:14px; -fx-text-fill:" + C_TEXT_S + ";");
        StackPane grafPane = new StackPane(grafPh);
        grafPane.setStyle("-fx-background-color:" + C_BG + ";");
        tGraf.setContent(grafPane);
        tGraf.setOnSelectionChanged(e -> {
            if (tGraf.isSelected() && grafPane.getChildren().size() == 1
                    && grafPane.getChildren().get(0) instanceof Label) {
                PestanaGraficasFX pg = new PestanaGraficasFX(usuarioLogueado, solarServicio);
                grafPane.getChildren().clear();
                grafPane.getChildren().add(pg.crearPestanaGraficas().getContent());
            }
        });

        tabs.getTabs().addAll(tDash, tGraf);
        root.setCenter(tabs);

        stage.setScene(new Scene(root, 1400, 860));
        stage.setMaximized(true);
        stage.setMinWidth(1100); stage.setMinHeight(700);
        stage.show();

        refrescarCasas();
        actualizarMetricas();
    }

    // ── NAVBAR ────────────────────────────────────────────────────────
    private HBox construirNavbar(Stage stage) {
        HBox nav = new HBox(16);
        nav.setPadding(new Insets(10, 28, 10, 28));
        nav.setAlignment(Pos.CENTER_LEFT);
        nav.setStyle("-fx-background-color:" + C_SURFACE + ";"
                + "-fx-border-color:transparent transparent " + C_BORDER + " transparent;"
                + "-fx-border-width:0 0 1.5 0;");
        nav.setEffect(new DropShadow(6, 0, 2, Color.color(0,0,0,0.07)));

        InputStream li = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.png");
        if (li == null) li = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.jpeg");
        javafx.scene.Node logo;
        if (li != null) {
            ImageView iv = new ImageView(new Image(li));
            iv.setFitWidth(52); iv.setFitHeight(52); iv.setPreserveRatio(true);
            Circle cl = new Circle(26,26,26); iv.setClip(cl);
            iv.setEffect(new DropShadow(6, Color.color(0,0,0,0.15)));
            logo = iv;
        } else {
            Label fb = new Label("⚡"); fb.setStyle("-fx-font-size:26px;"); logo = fb;
        }

        VBox appName = new VBox(2);
        Label lApp = new Label("EnergiApp");
        lApp.setStyle("-fx-font-size:18px; -fx-font-weight:900; -fx-text-fill:" + C_TEXT + ";");
        Label lSub = new Label("Sistema de Gestión Solar");
        lSub.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
        appName.getChildren().addAll(lApp, lSub);

        Region sp = new Region(); HBox.setHgrow(sp, Priority.ALWAYS);

        String ini = usuarioLogueado.getNombre().substring(0,1).toUpperCase();
        Label av = new Label(ini);
        av.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-text-fill:white;"
                + "-fx-font-size:17px; -fx-font-weight:bold; -fx-background-radius:22;"
                + "-fx-min-width:44; -fx-min-height:44; -fx-alignment:center;");

        VBox uInfo = new VBox(2);
        Label uNom = new Label(usuarioLogueado.getNombre() + " " + usuarioLogueado.getApellido());
        uNom.setStyle("-fx-font-size:14px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        Label uRol = new Label("Usuario  •  " + usuarioLogueado.getCorreo());
        uRol.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
        uInfo.getChildren().addAll(uNom, uRol);

        Button btnSalir = new Button("Cerrar Sesión");
        btnSalir.setStyle("-fx-background-color:transparent; -fx-text-fill:" + C_ERROR + ";"
                + "-fx-font-size:13px; -fx-font-weight:bold; -fx-cursor:hand;"
                + "-fx-border-color:" + C_ERROR + "; -fx-border-radius:8;"
                + "-fx-background-radius:8; -fx-padding:7 18;");
        btnSalir.setOnAction(e -> { try { new IngresoFX().start(stage); } catch (Exception ex) { ex.printStackTrace(); } });

        nav.getChildren().addAll(logo, appName, sp, av, uInfo, btnSalir);
        return nav;
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────
    private SplitPane construirDashboard(Stage stage) {
        SplitPane split = new SplitPane();
        split.setStyle("-fx-background-color:" + C_BG + "; -fx-box-border:transparent;");
        split.setDividerPositions(0.65);

        // ── IZQUIERDA ─────────────────────────────────────────────────
        ScrollPane leftScroll = new ScrollPane();
        leftScroll.setFitToWidth(true);
        leftScroll.setStyle("-fx-background:" + C_BG + "; -fx-background-color:" + C_BG + ";");
        leftScroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        VBox left = new VBox(18);
        left.setPadding(new Insets(20, 12, 20, 20));

        // Métricas
        lblMetricaCasas   = new Label("0");
        lblMetricaPanel   = new Label("—");
        lblMetricaConsumo = new Label("0");
        HBox metricas = new HBox(14,
            metricaCard("🏠","Propiedades",    lblMetricaCasas,   "registradas",   C_PRIMARY, C_PRIMARY_L),
            metricaCard("⚡","Panel Activo",    lblMetricaPanel,   "asignado",      C_SUCCESS, C_SUCCESS_L),
            metricaCard("📊","Consumo Mensual", lblMetricaConsumo, "kWh estimados", C_WARNING, C_WARNING_L)
        );
        metricas.getChildren().forEach(n -> HBox.setHgrow(n, Priority.ALWAYS));

        // ── SECCIÓN PROPIEDADES ───────────────────────────────────────
        VBox secCasas = new VBox(0);
        secCasas.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:16;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:16;");
        secCasas.setEffect(new DropShadow(8, 0, 2, Color.color(0,0,0,0.06)));

        HBox casasHdr = new HBox(12);
        casasHdr.setAlignment(Pos.CENTER_LEFT);
        casasHdr.setPadding(new Insets(16, 18, 14, 18));
        casasHdr.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-background-radius:16 16 0 0;");
        Label casasTit = new Label("🏠  Mis Propiedades");
        casasTit.setStyle("-fx-font-size:16px; -fx-font-weight:900; -fx-text-fill:white;");
        Label casasSub = new Label("Selecciona el panel solar para cada propiedad");
        casasSub.setStyle("-fx-font-size:12px; -fx-text-fill:rgba(255,255,255,0.82);");
        VBox casasTxtBox = new VBox(2, casasTit, casasSub);
        HBox.setHgrow(casasTxtBox, Priority.ALWAYS);
        Button btnAgregar = botonHeaderBlanco("+ Nueva Propiedad");
        btnAgregar.setOnAction(e -> {
            try {
                Registro reg = new Registro(conexionDB);
                Optional<Casa> res = reg.mostrarModalRegistroCasa(usuarioLogueado.getId());
                res.ifPresent(casa -> { usuarioLogueado.agregarCasa(casa); refrescarCasas(); actualizarMetricas(); });
            } catch (Exception ex) { alerta("Error", ex.getMessage(), Alert.AlertType.ERROR); }
        });
        casasHdr.getChildren().addAll(casasTxtBox, btnAgregar);

        listaCasasBox = new VBox(12);
        listaCasasBox.setPadding(new Insets(14));
        secCasas.getChildren().addAll(casasHdr, listaCasasBox);

        // ── SECCIÓN ESTUDIO FINANCIERO ────────────────────────────────
        VBox secInforme = new VBox(0);
        secInforme.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:16;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:16;");
        secInforme.setEffect(new DropShadow(8, 0, 2, Color.color(0,0,0,0.06)));

        HBox informeHdr = new HBox(12);
        informeHdr.setAlignment(Pos.CENTER_LEFT);
        informeHdr.setPadding(new Insets(16, 18, 14, 18));
        informeHdr.setStyle("-fx-background-color:" + C_SUCCESS + "; -fx-background-radius:16 16 0 0;");
        Label informeTit = new Label("📋  Estudio Financiero");
        informeTit.setStyle("-fx-font-size:16px; -fx-font-weight:900; -fx-text-fill:white;");
        Label informeSub = new Label("Inversión, ahorro y retorno por propiedad");
        informeSub.setStyle("-fx-font-size:12px; -fx-text-fill:rgba(255,255,255,0.82);");
        VBox informeTxtBox = new VBox(2, informeTit, informeSub);
        HBox.setHgrow(informeTxtBox, Priority.ALWAYS);
        Button btnGenerar = botonHeaderBlanco("⚡ Generar Informe");
        btnGenerar.setOnAction(e -> generarInformeTodas());
        informeHdr.getChildren().addAll(informeTxtBox, btnGenerar);

        vboxInformeFinanciero = new VBox(12);
        vboxInformeFinanciero.setAlignment(Pos.CENTER);
        vboxInformeFinanciero.setPadding(new Insets(36));
        vboxInformeFinanciero.setMinHeight(180);
        Label icoPlh = new Label("📊"); icoPlh.setStyle("-fx-font-size:40px;");
        Label msgPlh = new Label("Selecciona un panel para cada propiedad y presiona 'Generar Informe'");
        msgPlh.setStyle("-fx-font-size:13px; -fx-text-fill:" + C_TEXT_S + "; -fx-text-alignment:center;");
        msgPlh.setWrapText(true); msgPlh.setAlignment(Pos.CENTER);
        vboxInformeFinanciero.getChildren().addAll(icoPlh, msgPlh);

        secInforme.getChildren().addAll(informeHdr, vboxInformeFinanciero);

        left.getChildren().addAll(metricas, secCasas, secInforme);
        leftScroll.setContent(left);

        // ── DERECHA ───────────────────────────────────────────────────
        ScrollPane rightScroll = new ScrollPane();
        rightScroll.setFitToWidth(true);
        rightScroll.setStyle("-fx-background:" + C_BG + "; -fx-background-color:" + C_BG + ";");
        rightScroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        VBox right = new VBox(16);
        right.setPadding(new Insets(20, 20, 20, 12));

        // Card IA
        VBox cardIA = new VBox(14);
        cardIA.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-background-radius:16; -fx-padding:20;");
        cardIA.setEffect(new DropShadow(10, 0, 3, Color.color(0.05,0.35,0.85,0.25)));
        Label iaTit = new Label("🤖  Asistente IA Solar");
        iaTit.setStyle("-fx-font-size:15px; -fx-font-weight:bold; -fx-text-fill:white;");
        Label iaSub = new Label("Pregunta sobre paneles, costos e instalación solar.");
        iaSub.setStyle("-fx-font-size:12px; -fx-text-fill:rgba(255,255,255,0.85); -fx-wrap-text:true;");
        iaSub.setWrapText(true);
        HBox iaOnl = new HBox(6); iaOnl.setAlignment(Pos.CENTER_LEFT);
        Label onlD = new Label("●"); onlD.setStyle("-fx-text-fill:#86EFAC; -fx-font-size:11px;");
        Label onlT = new Label("En línea"); onlT.setStyle("-fx-font-size:11px; -fx-text-fill:rgba(255,255,255,0.82);");
        iaOnl.getChildren().addAll(onlD, onlT);
        Button btnIA = new Button("Abrir Chat IA  →");
        btnIA.setMaxWidth(Double.MAX_VALUE);
        btnIA.setStyle("-fx-background-color:white; -fx-text-fill:" + C_PRIMARY + ";"
                + "-fx-font-size:13px; -fx-font-weight:bold; -fx-background-radius:10;"
                + "-fx-cursor:hand; -fx-padding:11 0;");
        btnIA.setOnAction(e -> new chatBootFX(solarServicio).mostrar());
        cardIA.getChildren().addAll(iaTit, iaSub, iaOnl, btnIA);

        // Card perfil
        VBox cardPerfil = new VBox(0);
        cardPerfil.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:16;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:16;");
        cardPerfil.setEffect(new DropShadow(8, 0, 2, Color.color(0,0,0,0.06)));

        VBox perfilHdr = new VBox(8);
        perfilHdr.setAlignment(Pos.CENTER);
        perfilHdr.setPadding(new Insets(20, 20, 16, 20));
        perfilHdr.setStyle("-fx-background-color:" + C_BG + "; -fx-background-radius:16 16 0 0;"
                + "-fx-border-color:transparent transparent " + C_BORDER + " transparent;");
        Label avG = new Label(usuarioLogueado.getNombre().substring(0,1).toUpperCase());
        avG.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-text-fill:white;"
                + "-fx-font-size:26px; -fx-font-weight:bold; -fx-background-radius:34;"
                + "-fx-min-width:68; -fx-min-height:68; -fx-alignment:center;");
        avG.setEffect(new DropShadow(8, Color.color(0.05,0.35,0.85,0.25)));
        HBox avBox = new HBox(avG); avBox.setAlignment(Pos.CENTER);
        Label pNom = new Label(usuarioLogueado.getNombre() + " " + usuarioLogueado.getApellido());
        pNom.setStyle("-fx-font-size:16px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        pNom.setAlignment(Pos.CENTER); pNom.setMaxWidth(Double.MAX_VALUE);
        Label pBadge = new Label("Usuario Registrado");
        pBadge.setStyle("-fx-background-color:" + C_PRIMARY_L + "; -fx-text-fill:" + C_PRIMARY + ";"
                + "-fx-font-size:11px; -fx-font-weight:bold; -fx-padding:3 12; -fx-background-radius:20;");
        HBox pBBox = new HBox(pBadge); pBBox.setAlignment(Pos.CENTER);
        perfilHdr.getChildren().addAll(avBox, pNom, pBBox);

        VBox perfilInfo = new VBox(0);
        perfilInfo.setPadding(new Insets(14));
        perfilInfo.getChildren().addAll(
            infoFila("✉","Correo",   usuarioLogueado.getCorreo()),
            new Separator() {{ setStyle("-fx-background-color:" + C_BORDER + ";"); }},
            infoFila("📱","Teléfono", usuarioLogueado.getTelefono() != null ? usuarioLogueado.getTelefono() : "—"),
            new Separator() {{ setStyle("-fx-background-color:" + C_BORDER + ";"); }},
            infoFila("🏠","Casas",    (usuarioLogueado.getCasas() != null ? usuarioLogueado.getCasas().size() : 0) + " registradas")
        );
        cardPerfil.getChildren().addAll(perfilHdr, perfilInfo);

        // Card consejo
        VBox cardConsejo = new VBox(10);
        cardConsejo.setStyle("-fx-background-color:" + C_WARNING_L + "; -fx-background-radius:14;"
                + "-fx-border-color:" + C_WARNING + "55; -fx-border-left-color:" + C_WARNING + ";"
                + "-fx-border-radius:14; -fx-padding:16; -fx-border-width:1 1 1 4;");
        Label csTit = new Label("💡  Dato Importante");
        csTit.setStyle("-fx-font-size:13px; -fx-font-weight:bold; -fx-text-fill:" + C_WARNING + ";");
        Label csTxt = new Label("Valledupar recibe hasta 7.1 horas de sol pico diarias. "
                + "Una instalación solar aquí puede recuperar la inversión en 4-6 años.");
        csTxt.setStyle("-fx-font-size:12px; -fx-text-fill:#92400E; -fx-wrap-text:true;");
        csTxt.setWrapText(true);
        cardConsejo.getChildren().addAll(csTit, csTxt);

        Region spacerR = new Region(); VBox.setVgrow(spacerR, Priority.ALWAYS);
        right.getChildren().addAll(cardIA, cardPerfil, cardConsejo, spacerR);
        rightScroll.setContent(right);

        split.getItems().addAll(leftScroll, rightScroll);
        return split;
    }

    // ── Refrescar casas ───────────────────────────────────────────────
    private void refrescarCasas() {
        listaCasasBox.getChildren().clear();
        List<Casa> casas = usuarioLogueado.getCasas();

        if (casas == null || casas.isEmpty()) {
            VBox empty = new VBox(10); empty.setAlignment(Pos.CENTER);
            empty.setPadding(new Insets(30));
            Label eIco = new Label("🏠"); eIco.setStyle("-fx-font-size:36px;");
            Label eTxt = new Label("No tienes propiedades registradas.\nHaz clic en '+ Nueva Propiedad' para comenzar.");
            eTxt.setStyle("-fx-font-size:13px; -fx-text-fill:" + C_TEXT_S + "; -fx-text-alignment:center;");
            eTxt.setWrapText(true); eTxt.setAlignment(Pos.CENTER);
            empty.getChildren().addAll(eIco, eTxt);
            listaCasasBox.getChildren().add(empty);
            return;
        }

        List<PanelSolar> paneles = solarServicio.getGestorPaneles().listarPorPrecioAscendente();

        for (int i = 0; i < casas.size(); i++) {
            final int idx = i;
            Casa c = casas.get(i);
            double hsp = new CalculadoraPanels(c, null, 0).getHorasSolEstimadas();

            VBox card = new VBox(0);
            card.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:14;"
                    + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:14;");
            card.setEffect(new DropShadow(5, 0, 1, Color.color(0,0,0,0.05)));

            // Header
            HBox hdr = new HBox(10); hdr.setAlignment(Pos.CENTER_LEFT);
            hdr.setPadding(new Insets(12, 14, 10, 14));
            hdr.setStyle("-fx-background-color:" + C_BG + "; -fx-background-radius:14 14 0 0;"
                    + "-fx-border-color:transparent transparent " + C_BORDER + " transparent;");
            Label badge = new Label("Casa #" + (i+1));
            badge.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-text-fill:white;"
                    + "-fx-font-size:11px; -fx-font-weight:bold; -fx-padding:4 12; -fx-background-radius:20;");
            Label dirL = new Label(c.getDireccion());
            dirL.setStyle("-fx-font-size:14px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
            dirL.setMaxWidth(Double.MAX_VALUE); HBox.setHgrow(dirL, Priority.ALWAYS);

            // ── Botón Eliminar ──
            Button btnEliminar = new Button("🗑 Eliminar");
            btnEliminar.setStyle("-fx-background-color:" + C_ERROR_L + "; -fx-text-fill:" + C_ERROR + ";"
                    + "-fx-font-size:11px; -fx-font-weight:bold; -fx-cursor:hand;"
                    + "-fx-background-radius:8; -fx-padding:5 12;"
                    + "-fx-border-color:" + C_ERROR + "44; -fx-border-radius:8;");
            btnEliminar.setOnMouseEntered(e -> btnEliminar.setStyle(
                    "-fx-background-color:" + C_ERROR + "; -fx-text-fill:white;"
                    + "-fx-font-size:11px; -fx-font-weight:bold; -fx-cursor:hand;"
                    + "-fx-background-radius:8; -fx-padding:5 12;"));
            btnEliminar.setOnMouseExited(e -> btnEliminar.setStyle(
                    "-fx-background-color:" + C_ERROR_L + "; -fx-text-fill:" + C_ERROR + ";"
                    + "-fx-font-size:11px; -fx-font-weight:bold; -fx-cursor:hand;"
                    + "-fx-background-radius:8; -fx-padding:5 12;"
                    + "-fx-border-color:" + C_ERROR + "44; -fx-border-radius:8;"));
            btnEliminar.setOnAction(e -> {
                Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
                confirm.setTitle("Eliminar Propiedad");
                confirm.setHeaderText(null);
                confirm.setContentText("¿Eliminar la propiedad \"" + c.getDireccion() + "\"?\nEsta acción no se puede deshacer.");
                Optional<ButtonType> result = confirm.showAndWait();
                if (result.isPresent() && result.get() == ButtonType.OK) {
                    // Eliminar de BD si tiene ID
                    if (c.getIdCasa() > 0) {
                        try {
                            new CasaDAO().eliminar(c.getIdCasa());
                        } catch (Exception ex) {
                            System.err.println("Error al eliminar casa: " + ex.getMessage());
                        }
                    }
                    usuarioLogueado.getCasas().remove(idx);
                    panelesPorCasa.remove(idx);
                    // Reindexar el map
                    Map<Integer, PanelSolar> nuevoMap = new HashMap<>();
                    for (int k : panelesPorCasa.keySet()) {
                        if (k > idx) nuevoMap.put(k - 1, panelesPorCasa.get(k));
                        else if (k < idx) nuevoMap.put(k, panelesPorCasa.get(k));
                    }
                    panelesPorCasa.clear(); panelesPorCasa.putAll(nuevoMap);
                    refrescarCasas(); actualizarMetricas();
                }
            });

            hdr.getChildren().addAll(badge, dirL, btnEliminar);

            // Chips info
            HBox chips = new HBox(10); chips.setAlignment(Pos.CENTER_LEFT);
            chips.setPadding(new Insets(10, 14, 10, 14));
            chips.setStyle("-fx-border-color:transparent transparent " + C_BORDER + " transparent;");
            chips.getChildren().addAll(
                chip("📍 " + c.getCiudad(), C_TEXT_S, "#F1F5F9"),
                chip("⚡ " + String.format("%.0f", c.getConsumoMensualKWh()) + " kWh/mes", C_PRIMARY, C_PRIMARY_L),
                chip("☀ " + String.format("%.1f", hsp) + " h/día", C_WARNING, C_WARNING_L)
            );

            // Selector panel
            VBox selectorSec = new VBox(8);
            selectorSec.setPadding(new Insets(12, 14, 12, 14));
            selectorSec.setStyle("-fx-border-color:transparent transparent " + C_BORDER + " transparent;");
            Label selLbl = new Label("Panel Solar Asignado");
            selLbl.setStyle("-fx-font-size:12px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
            ComboBox<PanelSolar> combo = new ComboBox<>();
            combo.getItems().addAll(paneles);
            combo.setPromptText("— Seleccionar panel solar —");
            combo.setMaxWidth(Double.MAX_VALUE); combo.setPrefHeight(40);
            combo.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-border-color:" + C_BORDER + ";"
                    + "-fx-border-radius:8; -fx-background-radius:8; -fx-font-size:13px;");
            combo.setCellFactory(lv -> new ListCell<PanelSolar>() {
                @Override protected void updateItem(PanelSolar p, boolean empty) {
                    super.updateItem(p, empty);
                    if (empty || p == null) { setText(null); setGraphic(null); return; }
                    VBox cell = new VBox(2);
                    Label n = new Label(p.getNombre());
                    n.setStyle("-fx-font-size:13px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
                    Label d = new Label(p.getTipo() + "  •  " + (int)p.getPotenciaWatts() + " W  •  η "
                            + p.getEficiencia() + "%  •  $" + String.format("%,.0f", p.getCostoUnidad()));
                    d.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
                    cell.getChildren().addAll(n, d); setGraphic(cell); setText(null);
                }
            });
            combo.setButtonCell(new ListCell<PanelSolar>() {
                @Override protected void updateItem(PanelSolar p, boolean empty) {
                    super.updateItem(p, empty);
                    setText(empty || p == null ? "— Seleccionar panel solar —"
                            : p.getNombre() + "  (" + (int)p.getPotenciaWatts() + " W)");
                }
            });
            if (panelesPorCasa.containsKey(idx)) combo.setValue(panelesPorCasa.get(idx));
            selectorSec.getChildren().addAll(selLbl, combo);

            // Resultado chips
            HBox resBox = new HBox(10);
            resBox.setPadding(new Insets(10, 14, 14, 14));
            resBox.setVisible(panelesPorCasa.containsKey(idx));
            resBox.setManaged(panelesPorCasa.containsKey(idx));
            if (panelesPorCasa.containsKey(idx)) {
                PanelSolar p = panelesPorCasa.get(idx);
                CalculadoraPanels calc = new CalculadoraPanels(c, p, p.getCostoInstalacion());
                resBox.getChildren().addAll(
                    chipResultado("🔋 " + calc.calcularNumeroPaneles() + " paneles requeridos", C_PRIMARY, C_PRIMARY_L),
                    chipResultado("⚡ " + String.format("%.0f", calc.calcularGeneracionMensualKWh()) + " kWh/mes", C_SUCCESS, C_SUCCESS_L),
                    chipResultado("💰 $" + String.format("%,.0f", calc.calcularCostoTotal()) + " inversión", C_WARNING, C_WARNING_L)
                );
            }
            combo.setOnAction(ev -> {
                PanelSolar sel = combo.getValue(); if (sel == null) return;
                panelesPorCasa.put(idx, sel);
                CalculadoraPanels calc = new CalculadoraPanels(c, sel, sel.getCostoInstalacion());
                resBox.getChildren().clear();
                resBox.getChildren().addAll(
                    chipResultado("🔋 " + calc.calcularNumeroPaneles() + " paneles requeridos", C_PRIMARY, C_PRIMARY_L),
                    chipResultado("⚡ " + String.format("%.0f", calc.calcularGeneracionMensualKWh()) + " kWh/mes", C_SUCCESS, C_SUCCESS_L),
                    chipResultado("💰 $" + String.format("%,.0f", calc.calcularCostoTotal()) + " inversión", C_WARNING, C_WARNING_L)
                );
                resBox.setVisible(true); resBox.setManaged(true);
                actualizarMetricas();
            });

            card.getChildren().addAll(hdr, chips, selectorSec, resBox);
            listaCasasBox.getChildren().add(card);
        }
    }

    // ── Generar informe ───────────────────────────────────────────────
    private void generarInformeTodas() {
        List<Casa> casas = usuarioLogueado.getCasas();
        if (casas == null || casas.isEmpty()) { alerta("Sin propiedades", "Registra al menos una propiedad.", Alert.AlertType.WARNING); return; }
        if (panelesPorCasa.isEmpty()) { alerta("Sin paneles", "Selecciona un panel para al menos una propiedad.", Alert.AlertType.WARNING); return; }

        vboxInformeFinanciero.getChildren().clear();
        vboxInformeFinanciero.setAlignment(Pos.TOP_LEFT);
        vboxInformeFinanciero.setPadding(new Insets(16));
        vboxInformeFinanciero.setSpacing(14);

        double totalInv = 0, totalAhorro = 0;

        for (int i = 0; i < casas.size(); i++) {
            Casa c = casas.get(i);
            PanelSolar panel = panelesPorCasa.get(i);
            if (panel == null) continue;

            CalculadoraPanels calc = new CalculadoraPanels(c, panel, panel.getCostoInstalacion());
            int    numP    = calc.calcularNumeroPaneles();
            double hsp     = calc.getHorasSolEstimadas();
            double gen     = calc.calcularGeneracionMensualKWh();
            double inv     = calc.calcularCostoTotal();
            double costoPanel = panel.getCostoUnidad() * numP;
            double costoInst  = panel.getCostoInstalacion() * numP;
            double ahorro  = Math.min(c.getConsumoMensualKWh(), gen) * 1000.0;
            int    meses   = ahorro > 0 ? (int) Math.ceil(inv / ahorro) : 0;
            totalInv    += inv; totalAhorro += ahorro;

            VBox cardCasa = new VBox(12);
            cardCasa.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:12;"
                    + "-fx-border-color:" + C_BORDER + "; -fx-border-left-color:" + C_PRIMARY + ";"
                    + "-fx-border-radius:12; -fx-padding:16; -fx-border-width:1 1 1 5;");
            cardCasa.setEffect(new DropShadow(4, 0, 1, Color.color(0,0,0,0.04)));

            // Header
            HBox cHdr = new HBox(10); cHdr.setAlignment(Pos.CENTER_LEFT);
            Label cBadge = new Label("Casa #" + (i+1));
            cBadge.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-text-fill:white;"
                    + "-fx-font-size:11px; -fx-font-weight:bold; -fx-padding:3 10; -fx-background-radius:20;");
            VBox cInfo = new VBox(2);
            Label cDir = new Label(c.getDireccion() + "  —  " + c.getCiudad());
            cDir.setStyle("-fx-font-size:14px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
            Label cConsumo = new Label("Consumo: " + String.format("%.0f", c.getConsumoMensualKWh()) + " kWh/mes  •  HSP: " + String.format("%.1f", hsp) + " h/día");
            cConsumo.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
            cInfo.getChildren().addAll(cDir, cConsumo); HBox.setHgrow(cInfo, Priority.ALWAYS);
            cHdr.getChildren().addAll(cBadge, cInfo);

            // Panel info destacado
            HBox panelInfo = new HBox(14); panelInfo.setAlignment(Pos.CENTER_LEFT);
            panelInfo.setStyle("-fx-background-color:" + C_PRIMARY_L + "; -fx-background-radius:10; -fx-padding:12 14;");
            Label pIco = new Label("⚡"); pIco.setStyle("-fx-font-size:22px;");
            VBox pTxt = new VBox(3);
            Label pNom = new Label(panel.getNombre());
            pNom.setStyle("-fx-font-size:14px; -fx-font-weight:bold; -fx-text-fill:" + C_PRIMARY + ";");
            Label pDet = new Label(panel.getTipo() + "  •  " + (int)panel.getPotenciaWatts() + " W  •  η " + panel.getEficiencia() + "%  •  Garantía: " + panel.getGarantiaAnios() + " años");
            pDet.setStyle("-fx-font-size:11px; -fx-text-fill:#374151;");
            pTxt.getChildren().addAll(pNom, pDet); HBox.setHgrow(pTxt, Priority.ALWAYS);

            // Cantidad paneles muy visible
            VBox cantBox = new VBox(2); cantBox.setAlignment(Pos.CENTER);
            cantBox.setStyle("-fx-background-color:" + C_PRIMARY + "; -fx-background-radius:10; -fx-padding:10 16;");
            Label cantNum = new Label(String.valueOf(numP));
            cantNum.setStyle("-fx-font-size:26px; -fx-font-weight:900; -fx-text-fill:white;");
            Label cantLbl = new Label("paneles");
            cantLbl.setStyle("-fx-font-size:11px; -fx-text-fill:rgba(255,255,255,0.85);");
            cantBox.getChildren().addAll(cantNum, cantLbl);
            panelInfo.getChildren().addAll(pIco, pTxt, cantBox);

            // Grid datos técnicos
            HBox datosTec = new HBox(0);
            datosTec.setStyle("-fx-background-color:" + C_BG + "; -fx-background-radius:10;");
            datosTec.getChildren().addAll(
                datoCell("Generación",  String.format("%.0f kWh/mes", gen), C_SUCCESS),
                sep(), datoCell("Cobertura",   gen >= c.getConsumoMensualKWh() ? "100%" : String.format("%.0f%%", (gen/c.getConsumoMensualKWh())*100), gen >= c.getConsumoMensualKWh() ? C_SUCCESS : C_WARNING),
                sep(), datoCell("Retorno",     meses > 0 ? (meses/12) + "a " + (meses%12) + "m" : "N/A", C_TEXT_S),
                sep(), datoCell("Costo/Panel", "$" + String.format("%,.0f", panel.getCostoUnidad()), C_PRIMARY)
            );
            datosTec.getChildren().stream().filter(n -> n instanceof VBox).forEach(n -> HBox.setHgrow(n, Priority.ALWAYS));

            // Desglose costos
            HBox montos = new HBox(10);
            montos.getChildren().addAll(
                montoCard("🔋 Paneles (" + numP + " und.)", "$" + String.format("%,.0f", costoPanel),  C_PRIMARY, C_PRIMARY_L),
                montoCard("🔧 Instalación",               "$" + String.format("%,.0f", costoInst),   "#7C3AED", "#F5F3FF"),
                montoCard("💰 Inversión Total",            "$" + String.format("%,.0f", inv),         C_SUCCESS, C_SUCCESS_L),
                montoCard("📈 Ahorro Mensual",             "$" + String.format("%,.0f", ahorro),      C_WARNING, C_WARNING_L)
            );
            montos.getChildren().forEach(n -> HBox.setHgrow(n, Priority.ALWAYS));

            cardCasa.getChildren().addAll(cHdr, panelInfo, datosTec, montos);
            vboxInformeFinanciero.getChildren().add(cardCasa);
        }

        // Totales globales
        VBox cardTotal = new VBox(10);
        cardTotal.setStyle("-fx-background-color:" + C_SUCCESS + "; -fx-background-radius:12; -fx-padding:16;");
        Label tTit = new Label("💼  Resumen Global — Todas las Propiedades");
        tTit.setStyle("-fx-font-size:14px; -fx-font-weight:bold; -fx-text-fill:white;");
        HBox tMontos = new HBox(12);
        tMontos.getChildren().addAll(
            montoCardBlanco("Total Inversión",  "$" + String.format("%,.0f", totalInv)),
            montoCardBlanco("Ahorro Total/Mes", "$" + String.format("%,.0f", totalAhorro)),
            montoCardBlanco("Ahorro Total/Año", "$" + String.format("%,.0f", totalAhorro * 12))
        );
        tMontos.getChildren().forEach(n -> HBox.setHgrow(n, Priority.ALWAYS));
        cardTotal.getChildren().addAll(tTit, tMontos);
        vboxInformeFinanciero.getChildren().add(cardTotal);
    }

    // ── Actualizar métricas ───────────────────────────────────────────
    private void actualizarMetricas() {
        int tot = usuarioLogueado.getCasas() != null ? usuarioLogueado.getCasas().size() : 0;
        lblMetricaCasas.setText(String.valueOf(tot));
        if (!panelesPorCasa.isEmpty())
            lblMetricaPanel.setText(panelesPorCasa.size() > 1
                    ? panelesPorCasa.size() + " asignados"
                    : panelesPorCasa.values().iterator().next().getNombre());
        else lblMetricaPanel.setText("—");
        if (usuarioLogueado.getCasas() != null) {
            double c = usuarioLogueado.getCasas().stream().mapToDouble(Casa::getConsumoMensualKWh).sum();
            lblMetricaConsumo.setText(String.format("%.0f", c));
        }
    }

    // ── Helpers UI ────────────────────────────────────────────────────
    private VBox metricaCard(String icon, String titulo, Label valor, String sub, String color, String bg) {
        VBox box = new VBox(6);
        box.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:14;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-left-color:" + color + ";"
                + "-fx-border-radius:14; -fx-padding:16 18; -fx-border-width:1 1 1 5;");
        box.setEffect(new DropShadow(6, 0, 2, Color.color(0,0,0,0.05)));
        HBox hdr = new HBox(7); hdr.setAlignment(Pos.CENTER_LEFT);
        Label ico = new Label(icon); ico.setStyle("-fx-font-size:15px;");
        Label tit = new Label(titulo); tit.setStyle("-fx-font-size:12px; -fx-text-fill:" + C_TEXT_S + "; -fx-font-weight:bold;");
        hdr.getChildren().addAll(ico, tit);
        valor.setStyle("-fx-font-size:28px; -fx-font-weight:900; -fx-text-fill:" + color + ";");
        Label subL = new Label(sub); subL.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
        box.getChildren().addAll(hdr, valor, subL);
        return box;
    }

    private Button botonHeaderBlanco(String texto) {
        Button b = new Button(texto);
        b.setStyle("-fx-background-color:rgba(255,255,255,0.18); -fx-text-fill:white;"
                + "-fx-font-size:12px; -fx-font-weight:bold; -fx-cursor:hand;"
                + "-fx-background-radius:10; -fx-padding:7 16;"
                + "-fx-border-color:rgba(255,255,255,0.4); -fx-border-radius:10;");
        b.setOnMouseEntered(e -> b.setStyle(b.getStyle().replace("rgba(255,255,255,0.18)","rgba(255,255,255,0.32)")));
        b.setOnMouseExited(e  -> b.setStyle(b.getStyle().replace("rgba(255,255,255,0.32)","rgba(255,255,255,0.18)")));
        return b;
    }

    private Label chip(String texto, String color, String bg) {
        Label l = new Label(texto);
        l.setStyle("-fx-background-color:" + bg + "; -fx-text-fill:" + color + ";"
                + "-fx-font-size:12px; -fx-font-weight:bold; -fx-padding:5 12; -fx-background-radius:20;");
        return l;
    }

    private Label chipResultado(String texto, String color, String bg) {
        Label l = new Label(texto);
        l.setStyle("-fx-background-color:" + bg + "; -fx-text-fill:" + color + ";"
                + "-fx-font-size:12px; -fx-font-weight:bold; -fx-padding:6 14; -fx-background-radius:20;"
                + "-fx-border-color:" + color + "55; -fx-border-radius:20;");
        return l;
    }

    private HBox infoFila(String icon, String label, String value) {
        HBox row = new HBox(12); row.setAlignment(Pos.CENTER_LEFT);
        row.setPadding(new Insets(11, 16, 11, 16));
        Label ico = new Label(icon); ico.setStyle("-fx-font-size:15px; -fx-min-width:24;");
        Label lbl = new Label(label + ":"); lbl.setStyle("-fx-font-size:12px; -fx-text-fill:" + C_TEXT_S + "; -fx-min-width:70;");
        Label val = new Label(value); val.setStyle("-fx-font-size:13px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        row.getChildren().addAll(ico, lbl, val);
        return row;
    }

    private VBox datoCell(String titulo, String valor, String color) {
        VBox v = new VBox(4); v.setAlignment(Pos.CENTER); v.setPadding(new Insets(10, 14, 10, 14));
        Label t  = new Label(titulo); t.setStyle("-fx-font-size:10px; -fx-text-fill:" + C_TEXT_S + "; -fx-font-weight:bold;");
        Label va = new Label(valor);  va.setStyle("-fx-font-size:15px; -fx-font-weight:bold; -fx-text-fill:" + color + ";");
        v.getChildren().addAll(t, va); return v;
    }

    private Region sep() {
        Region r = new Region(); r.setPrefWidth(1);
        r.setStyle("-fx-background-color:" + C_BORDER + ";"); return r;
    }

    private VBox montoCard(String titulo, String monto, String color, String bg) {
        VBox box = new VBox(4); box.setAlignment(Pos.CENTER_LEFT);
        box.setStyle("-fx-background-color:" + bg + "; -fx-background-radius:10;"
                + "-fx-border-color:" + color + "33; -fx-border-radius:10; -fx-padding:12 14;");
        Label t = new Label(titulo); t.setStyle("-fx-font-size:10px; -fx-text-fill:" + C_TEXT_S + "; -fx-font-weight:bold;");
        Label m = new Label(monto);  m.setStyle("-fx-font-size:16px; -fx-font-weight:900; -fx-text-fill:" + color + ";");
        box.getChildren().addAll(t, m); return box;
    }

    private VBox montoCardBlanco(String titulo, String monto) {
        VBox box = new VBox(4); box.setAlignment(Pos.CENTER_LEFT);
        box.setStyle("-fx-background-color:rgba(255,255,255,0.18); -fx-background-radius:10; -fx-padding:12 14;");
        Label t = new Label(titulo); t.setStyle("-fx-font-size:10px; -fx-text-fill:rgba(255,255,255,0.82); -fx-font-weight:bold;");
        Label m = new Label(monto);  m.setStyle("-fx-font-size:18px; -fx-font-weight:900; -fx-text-fill:white;");
        box.getChildren().addAll(t, m); return box;
    }

    private void alerta(String t, String m, Alert.AlertType tipo) {
        Alert a = new Alert(tipo); a.setTitle(t); a.setHeaderText(null); a.setContentText(m); a.showAndWait();
    }
}