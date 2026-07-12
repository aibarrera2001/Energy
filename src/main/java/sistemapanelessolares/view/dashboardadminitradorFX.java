package sistemapanelessolares.view;

import java.io.InputStream;
import java.sql.*;
import java.util.List;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.effect.DropShadow;
import javafx.scene.image.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

import sistemapanelessolares.dao.PanelSolarDAO;
import sistemapanelessolares.dao.ConexionDB;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.logica.SolarService;

public class dashboardadminitradorFX {

    private final SolarService solarServicio;
    private final Connection   conexionDB;

    private ListView<PanelSolar> listViewPaneles;
    private Label lblTotalBadge;
    private TextField txtNombrePanel, txtTipo, txtPotencia, txtEficiencia;
    private TextField txtCostoUnidad, txtCostoInstalacion, txtGarantia, txtDescripcion;

    // Paleta
    private static final String C_PRIMARY   = "#0D5BD7";
    private static final String C_SECONDARY = "#4B5563";
    private static final String C_BG        = "#F5F7FA";
    private static final String C_SURFACE   = "#FFFFFF";
    private static final String C_TEXT      = "#1F2937";
    private static final String C_TEXT_S    = "#6B7280";
    private static final String C_BORDER    = "#E5E7EB";
    private static final String C_SUCCESS   = "#16A34A";
    private static final String C_ERROR     = "#DC2626";
    private static final String C_WARNING   = "#F4B400";

    private static final String CAMPO = "-fx-background-color: " + C_SURFACE + ";"
            + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 8; -fx-background-radius: 8;"
            + "-fx-text-fill: " + C_TEXT + "; -fx-prompt-text-fill: " + C_TEXT_S + ";"
            + "-fx-font-size: 12px; -fx-padding: 8 12;";

    public dashboardadminitradorFX(SolarService solarServicio, Connection conexionDB) {
        this.solarServicio = solarServicio;
        this.conexionDB    = conexionDB;
    }

    public void mostrar(Stage stage) {
        stage.setTitle("EnergiApp — Panel Administrativo");

        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: " + C_BG + ";");

        // ── NAVBAR ────────────────────────────────────────────────────
        root.setTop(construirNavbar(stage));

        // ── TABS PRINCIPALES ──────────────────────────────────────────
        TabPane tabPane = new TabPane();
        tabPane.setStyle("-fx-background-color: " + C_BG + "; -fx-tab-min-height: 40px;");
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);

        Tab tabPaneles  = new Tab("⚡  Catálogo de Paneles", crearPanelPaneles());
        Tab tabUsuarios = new Tab("👥  Gestión de Usuarios",  crearPanelUsuarios());

        tabPane.getTabs().addAll(tabPaneles, tabUsuarios);
        root.setCenter(tabPane);

        Scene scene = new Scene(root, 1400, 800);
        stage.setScene(scene);
        stage.setMaximized(true);
        stage.setMinWidth(1100);
        stage.setMinHeight(680);
        stage.show();
    }

    // ── NAVBAR ────────────────────────────────────────────────────────
    private HBox construirNavbar(Stage stage) {
        HBox navbar = new HBox(16);
        navbar.setPadding(new Insets(12, 24, 12, 24));
        navbar.setAlignment(Pos.CENTER_LEFT);
        navbar.setStyle("-fx-background-color: " + C_SURFACE + ";"
                + "-fx-border-color: transparent transparent " + C_BORDER + " transparent;"
                + "-fx-border-width: 0 0 1 0;");
        navbar.setEffect(new DropShadow(4, 0, 2, Color.color(0,0,0,0.06)));

        javafx.scene.Node logoNode;
        InputStream logoIs = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.jpeg");
        if (logoIs != null) {
            ImageView iv = new ImageView(new Image(logoIs));
            iv.setFitWidth(36); iv.setFitHeight(36); iv.setPreserveRatio(true);
            Circle clip = new Circle(18, 18, 18); iv.setClip(clip);
            logoNode = iv;
        } else {
            Label fb = new Label("⚡"); fb.setStyle("-fx-font-size: 20px;"); logoNode = fb;
        }

        Label lblApp = new Label("EnergiApp");
        lblApp.setStyle("-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: " + C_TEXT + ";");
        Label lblRol = new Label("Panel Administrativo");
        lblRol.setStyle("-fx-font-size: 11px; -fx-text-fill: " + C_TEXT_S + ";");
        VBox lblBox = new VBox(2, lblApp, lblRol);

        Label badgeAdmin = new Label("ADMIN");
        badgeAdmin.setStyle("-fx-background-color: rgba(244,180,0,0.15); -fx-text-fill: " + C_WARNING + ";"
                + "-fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 3 10;"
                + "-fx-background-radius: 20; -fx-border-color: " + C_WARNING + "; -fx-border-radius: 20;");

        Region spacer = new Region(); HBox.setHgrow(spacer, Priority.ALWAYS);

        Button btnSalir = new Button("Cerrar Sesión");
        btnSalir.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_ERROR + ";"
                + "-fx-font-size: 12px; -fx-cursor: hand; -fx-border-color: " + C_ERROR + ";"
                + "-fx-border-radius: 8; -fx-background-radius: 8; -fx-padding: 6 16;");
        btnSalir.setOnAction(e -> new InicioSessionAdministrativoFX(solarServicio, conexionDB).mostrarVentanaAcceso(stage));

        navbar.getChildren().addAll(logoNode, lblBox, badgeAdmin, spacer, btnSalir);
        return navbar;
    }

    // ══════════════════════════════════════════════════════════════════
    // ── TAB: CATÁLOGO DE PANELES ──────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════
    private HBox crearPanelPaneles() {
        HBox layout = new HBox(16);
        layout.setPadding(new Insets(20));

        // Lista
        VBox panelLista = new VBox(14);
        panelLista.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-background-radius: 14;"
                + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 14; -fx-padding: 20;");
        panelLista.setEffect(new DropShadow(6, 0, 2, Color.color(0,0,0,0.06)));
        HBox.setHgrow(panelLista, Priority.ALWAYS);

        Label titulo = new Label("Catálogo de Paneles Solares");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        lblTotalBadge = new Label();
        lblTotalBadge.setStyle("-fx-background-color: rgba(13,91,215,0.1); -fx-text-fill: " + C_PRIMARY + ";"
                + "-fx-font-size: 11px; -fx-font-weight: bold; -fx-padding: 3 10; -fx-background-radius: 20;");
        HBox header = new HBox(10, titulo);
        Region sp = new Region(); HBox.setHgrow(sp, Priority.ALWAYS);
        header.getChildren().addAll(sp, lblTotalBadge);
        header.setAlignment(Pos.CENTER_LEFT);

        Separator sep = new Separator();
        sep.setStyle("-fx-background-color: " + C_BORDER + ";");

        listViewPaneles = new ListView<>();
        listViewPaneles.setStyle("-fx-background-color: transparent; -fx-border-color: transparent;");
        VBox.setVgrow(listViewPaneles, Priority.ALWAYS);

        listViewPaneles.setCellFactory(lv -> new ListCell<PanelSolar>() {
            @Override protected void updateItem(PanelSolar p, boolean empty) {
                super.updateItem(p, empty);
                if (empty || p == null) { setGraphic(null); setText(null); setStyle("-fx-background-color: transparent;"); return; }
                HBox card = new HBox(14);
                card.setPadding(new Insets(10, 14, 10, 14));
                card.setAlignment(Pos.CENTER_LEFT);
                card.setStyle("-fx-background-color: " + C_BG + "; -fx-background-radius: 10;"
                        + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 10;");

                Label ico = new Label("⚡"); ico.setStyle("-fx-font-size: 18px;");
                VBox info = new VBox(3);
                Label nombre = new Label(p.getNombre());
                nombre.setStyle("-fx-font-size: 13px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
                Label detalle = new Label(p.getTipo() + "  •  " + (int)p.getPotenciaWatts() + " W  •  η " + p.getEficiencia() + "%");
                detalle.setStyle("-fx-font-size: 11px; -fx-text-fill: " + C_TEXT_S + ";");
                info.getChildren().addAll(nombre, detalle);
                HBox.setHgrow(info, Priority.ALWAYS);

                Label precio = new Label("$" + String.format("%,.0f", p.getCostoUnidad()));
                precio.setStyle("-fx-font-size: 13px; -fx-font-weight: bold; -fx-text-fill: " + C_PRIMARY + ";");

                card.getChildren().addAll(ico, info, precio);
                setGraphic(card); setText(null);
                setStyle("-fx-background-color: transparent; -fx-padding: 3 0;");
            }
        });

        actualizarListaPaneles();
        lblTotalBadge.setText(listViewPaneles.getItems().size() + " modelos");

        panelLista.getChildren().addAll(header, sep, listViewPaneles);

        // Formulario
        VBox form = crearFormularioPaneles();

        layout.getChildren().addAll(panelLista, form);
        return layout;
    }

    private VBox crearFormularioPaneles() {
        VBox form = new VBox(12);
        form.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-background-radius: 14;"
                + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 14; -fx-padding: 20;");
        form.setEffect(new DropShadow(6, 0, 2, Color.color(0,0,0,0.06)));
        form.setPrefWidth(340); form.setMaxWidth(360);

        Label titulo = new Label("Registrar Nuevo Modelo");
        titulo.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        Separator sep = new Separator(); sep.setStyle("-fx-background-color: " + C_BORDER + ";");

        txtNombrePanel    = campo("Nombre del panel");
        txtTipo           = campo("Tipo (Monocristalino, etc.)");
        txtPotencia       = campo("Potencia (W)");
        txtEficiencia     = campo("Eficiencia (%)");
        txtCostoUnidad    = campo("Costo unidad ($)");
        txtCostoInstalacion = campo("Costo instalación ($)");
        txtGarantia       = campo("Garantía (años)");
        txtDescripcion    = campo("Descripción");

        GridPane grid = new GridPane(); grid.setHgap(10); grid.setVgap(8);
        addGridRow(grid, "Potencia (W)",     txtPotencia,         0, 0);
        addGridRow(grid, "Eficiencia (%)",   txtEficiencia,       0, 1);
        addGridRow(grid, "Costo Unidad",     txtCostoUnidad,      1, 0);
        addGridRow(grid, "Costo Inst.",      txtCostoInstalacion, 1, 1);
        ColumnConstraints cc = new ColumnConstraints(); cc.setPercentWidth(50);
        grid.getColumnConstraints().addAll(cc, new ColumnConstraints() {{ setPercentWidth(50); }});

        Button btnGuardar = new Button("💾  Guardar Panel");
        btnGuardar.setMaxWidth(Double.MAX_VALUE);
        btnGuardar.setStyle("-fx-background-color: " + C_PRIMARY + "; -fx-text-fill: white;"
                + "-fx-font-size: 13px; -fx-font-weight: bold; -fx-background-radius: 10; -fx-cursor: hand; -fx-padding: 11 0;");
        btnGuardar.setOnMouseEntered(e -> btnGuardar.setStyle(btnGuardar.getStyle().replace(C_PRIMARY, "#0A47B0")));
        btnGuardar.setOnMouseExited(e  -> btnGuardar.setStyle(btnGuardar.getStyle().replace("#0A47B0", C_PRIMARY)));

        btnGuardar.setOnAction(e -> {
            try {
                String nombre = txtNombrePanel.getText().trim(), tipo = txtTipo.getText().trim();
                String garantia = txtGarantia.getText().trim(), desc = txtDescripcion.getText().trim();
                if (nombre.isEmpty() || tipo.isEmpty() || garantia.isEmpty()
                        || txtPotencia.getText().trim().isEmpty() || txtEficiencia.getText().trim().isEmpty()
                        || txtCostoUnidad.getText().trim().isEmpty() || txtCostoInstalacion.getText().trim().isEmpty()) {
                    alerta("Campos vacíos", "Complete todos los campos.", Alert.AlertType.WARNING); return;
                }
                double pot = Double.parseDouble(txtPotencia.getText().trim());
                double efi = Double.parseDouble(txtEficiencia.getText().trim());
                double cu  = Double.parseDouble(txtCostoUnidad.getText().trim());
                double ci  = Double.parseDouble(txtCostoInstalacion.getText().trim());
                PanelSolar panel = new PanelSolar(nombre, tipo, pot, efi, cu, ci, garantia, desc);
                new PanelSolarDAO().guardar(panel);
                solarServicio.getGestorPaneles().agregarPanel(panel);
                alerta("Éxito", "Panel guardado correctamente en Supabase.", Alert.AlertType.INFORMATION);
                limpiarCampos();
                actualizarListaPaneles();
                lblTotalBadge.setText(listViewPaneles.getItems().size() + " modelos");
            } catch (NumberFormatException ex) {
                alerta("Formato incorrecto", "Ingrese solo números en Potencia, Eficiencia y Costos.", Alert.AlertType.ERROR);
            } catch (Exception ex) {
                alerta("Error", ex.getMessage(), Alert.AlertType.ERROR);
            }
        });

        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        VBox inner = new VBox(8,
                lbl("Nombre"), txtNombrePanel, lbl("Tipo"), txtTipo, grid,
                lbl("Garantía"), txtGarantia, lbl("Descripción"), txtDescripcion);
        inner.setStyle("-fx-background-color: transparent;");
        scroll.setContent(inner);
        VBox.setVgrow(scroll, Priority.ALWAYS);

        form.getChildren().addAll(titulo, sep, scroll, btnGuardar);
        return form;
    }

    // ══════════════════════════════════════════════════════════════════
    // ── TAB: GESTIÓN DE USUARIOS ──────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════
    private VBox crearPanelUsuarios() {
        VBox layout = new VBox(16);
        layout.setPadding(new Insets(20));

        Label titulo = new Label("Gestión de Usuarios");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        Label sub = new Label("Visualiza y administra el estado de las cuentas de usuario");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: " + C_TEXT_S + ";");

        // Stats rápidas
        HBox stats = new HBox(12);
        VBox sTotal  = crearStat("Total", "0", C_PRIMARY);
        VBox sActivo = crearStat("Activos", "0", C_SUCCESS);
        VBox sInact  = crearStat("Inactivos", "0", C_ERROR);
        stats.getChildren().addAll(sTotal, sActivo, sInact);

        // Tabla
        TableView<UsuarioRow> tabla = new TableView<>();
        tabla.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-border-color: " + C_BORDER + ";"
                + "-fx-border-radius: 10; -fx-background-radius: 10;");
        VBox.setVgrow(tabla, Priority.ALWAYS);

        TableColumn<UsuarioRow, Integer> colId = new TableColumn<>("ID");
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colId.setPrefWidth(60);

        TableColumn<UsuarioRow, String> colNombre = new TableColumn<>("Nombre");
        colNombre.setCellValueFactory(new PropertyValueFactory<>("nombre"));
        colNombre.setPrefWidth(150);

        TableColumn<UsuarioRow, String> colCorreo = new TableColumn<>("Correo");
        colCorreo.setCellValueFactory(new PropertyValueFactory<>("correo"));
        colCorreo.setPrefWidth(220);

        TableColumn<UsuarioRow, String> colTelefono = new TableColumn<>("Teléfono");
        colTelefono.setCellValueFactory(new PropertyValueFactory<>("telefono"));
        colTelefono.setPrefWidth(130);

        TableColumn<UsuarioRow, Integer> colCasas = new TableColumn<>("# Casas");
        colCasas.setCellValueFactory(new PropertyValueFactory<>("numeroCasas"));
        colCasas.setPrefWidth(80);

        TableColumn<UsuarioRow, String> colEstado = new TableColumn<>("Estado");
        colEstado.setCellValueFactory(new PropertyValueFactory<>("estado"));
        colEstado.setPrefWidth(100);
        colEstado.setCellFactory(col -> new TableCell<UsuarioRow, String>() {
            @Override protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) { setGraphic(null); return; }
                Label badge = new Label(item);
                boolean activo = item.equals("Activo");
                badge.setStyle("-fx-background-color: " + (activo ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)") + ";"
                        + "-fx-text-fill: " + (activo ? C_SUCCESS : C_ERROR) + ";"
                        + "-fx-font-size: 11px; -fx-font-weight: bold; -fx-padding: 3 10; -fx-background-radius: 20;");
                setGraphic(badge); setText(null);
            }
        });

        TableColumn<UsuarioRow, Void> colAccion = new TableColumn<>("Acción");
        colAccion.setPrefWidth(140);
        colAccion.setCellFactory(col -> new TableCell<UsuarioRow, Void>() {
            final Button btn = new Button();
            {
                btn.setStyle("-fx-font-size: 11px; -fx-cursor: hand; -fx-background-radius: 8; -fx-padding: 5 14;");
                btn.setOnAction(e -> {
                    UsuarioRow row = getTableView().getItems().get(getIndex());
                    boolean nuevoEstado = !row.isActivo();
                    actualizarEstadoUsuario(row.getId(), nuevoEstado);
                    row.setActivo(nuevoEstado);
                    row.setEstado(nuevoEstado ? "Activo" : "Inactivo");
                    getTableView().refresh();
                    cargarUsuariosEnTabla(tabla, sTotal, sActivo, sInact);
                });
            }
            @Override protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) { setGraphic(null); return; }
                UsuarioRow row = getTableView().getItems().get(getIndex());
                boolean activo = row.isActivo();
                btn.setText(activo ? "Desactivar" : "Activar");
                btn.setStyle("-fx-background-color: " + (activo ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)") + ";"
                        + "-fx-text-fill: " + (activo ? C_ERROR : C_SUCCESS) + ";"
                        + "-fx-font-size: 11px; -fx-cursor: hand; -fx-background-radius: 8; -fx-padding: 5 14;"
                        + "-fx-border-color: " + (activo ? C_ERROR : C_SUCCESS) + "; -fx-border-radius: 8;");
                setGraphic(btn);
            }
        });

        tabla.getColumns().addAll(colId, colNombre, colCorreo, colTelefono, colCasas, colEstado, colAccion);
        tabla.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        // Botón recargar
        Button btnRecargar = new Button("🔄  Actualizar lista");
        btnRecargar.setStyle("-fx-background-color: " + C_PRIMARY + "; -fx-text-fill: white;"
                + "-fx-font-size: 12px; -fx-font-weight: bold; -fx-background-radius: 8; -fx-cursor: hand; -fx-padding: 8 18;");
        btnRecargar.setOnAction(e -> cargarUsuariosEnTabla(tabla, sTotal, sActivo, sInact));

        cargarUsuariosEnTabla(tabla, sTotal, sActivo, sInact);

        HBox headerRow = new HBox(10, new VBox(2, titulo, sub));
        Region spH = new Region(); HBox.setHgrow(spH, Priority.ALWAYS);
        headerRow.getChildren().addAll(spH, btnRecargar);
        headerRow.setAlignment(Pos.CENTER_LEFT);

        layout.getChildren().addAll(headerRow, stats, tabla);
        return layout;
    }

    private VBox crearStat(String label, String valor, String color) {
        VBox box = new VBox(4);
        box.setAlignment(Pos.CENTER_LEFT);
        box.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-background-radius: 12;"
                + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 12; -fx-padding: 16 20;");
        box.setEffect(new DropShadow(4, 0, 1, Color.color(0,0,0,0.05)));
        box.setPrefWidth(160);
        Label lv = new Label(valor);
        lv.setStyle("-fx-font-size: 28px; -fx-font-weight: 900; -fx-text-fill: " + color + ";");
        Label ll = new Label(label);
        ll.setStyle("-fx-font-size: 12px; -fx-text-fill: " + C_TEXT_S + ";");
        box.getChildren().addAll(lv, ll);
        return box;
    }

    private void cargarUsuariosEnTabla(TableView<UsuarioRow> tabla, VBox sTotal, VBox sActivo, VBox sInact) {
        ObservableList<UsuarioRow> data = FXCollections.observableArrayList();
        String sql = "SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, "
                   + "COALESCE(u.activo, true) as activo, "
                   + "(SELECT COUNT(*) FROM casas c WHERE c.id_usuario = u.id_usuario) as num_casas "
                   + "FROM usuarios u ORDER BY u.id_usuario";
        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                boolean activo = rs.getBoolean("activo");
                data.add(new UsuarioRow(
                    rs.getInt("id_usuario"),
                    rs.getString("nombre") + " " + rs.getString("apellido"),
                    rs.getString("correo"),
                    rs.getString("telefono"),
                    rs.getInt("num_casas"),
                    activo
                ));
            }
        } catch (Exception e) {
            System.err.println("Error cargar usuarios: " + e.getMessage());
        }
        tabla.setItems(data);
        long activos  = data.stream().filter(UsuarioRow::isActivo).count();
        long inactivos = data.size() - activos;
        ((Label) sTotal.getChildren().get(0)).setText(String.valueOf(data.size()));
        ((Label) sActivo.getChildren().get(0)).setText(String.valueOf(activos));
        ((Label) sInact.getChildren().get(0)).setText(String.valueOf(inactivos));
    }

    private void actualizarEstadoUsuario(int id, boolean activo) {
        String sql = "UPDATE usuarios SET activo = ? WHERE id_usuario = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, activo);
            ps.setInt(2, id);
            ps.executeUpdate();
        } catch (Exception e) {
            // Si la columna no existe, intenta crearla primero
            try (Connection conn2 = ConexionDB.conectar();
                 Statement st = conn2.createStatement()) {
                st.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true");
                try (PreparedStatement ps2 = conn2.prepareStatement(sql)) {
                    ps2.setBoolean(1, activo); ps2.setInt(2, id); ps2.executeUpdate();
                }
            } catch (Exception ex) {
                System.err.println("Error actualizar estado: " + ex.getMessage());
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private TextField campo(String prompt) {
        TextField tf = new TextField(); tf.setPromptText(prompt);
        tf.setStyle(CAMPO); tf.setMaxWidth(Double.MAX_VALUE);
        tf.focusedProperty().addListener((obs,o,f) ->
            tf.setStyle(CAMPO + (f ? "-fx-border-color: " + C_PRIMARY + "; -fx-border-width: 1.5;" : "")));
        return tf;
    }
    private Label lbl(String t) {
        Label l = new Label(t); l.setStyle("-fx-font-size: 11px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";"); return l;
    }
    private void addGridRow(GridPane g, String label, TextField tf, int row, int col) {
        VBox cell = new VBox(4, lbl(label), tf); g.add(cell, col, row); GridPane.setHgrow(cell, Priority.ALWAYS);
    }
    private void actualizarListaPaneles() {
        if (solarServicio != null && listViewPaneles != null) {
            List<PanelSolar> p = solarServicio.obtenerPanelesParaCatalogo();
            if (p != null) { listViewPaneles.getItems().clear(); listViewPaneles.getItems().addAll(p); }
        }
    }
    private void limpiarCampos() {
        txtNombrePanel.clear(); txtTipo.clear(); txtPotencia.clear(); txtEficiencia.clear();
        txtCostoUnidad.clear(); txtCostoInstalacion.clear(); txtGarantia.clear(); txtDescripcion.clear();
    }
    private void alerta(String titulo, String msg, Alert.AlertType tipo) {
        Alert a = new Alert(tipo); a.setTitle(titulo); a.setHeaderText(null); a.setContentText(msg); a.showAndWait();
    }

    // ── Clase auxiliar para la tabla de usuarios ──────────────────────
    public static class UsuarioRow {
        private int    id;
        private String nombre, correo, telefono, estado;
        private int    numeroCasas;
        private boolean activo;

        public UsuarioRow(int id, String nombre, String correo, String telefono, int numeroCasas, boolean activo) {
            this.id = id; this.nombre = nombre; this.correo = correo;
            this.telefono = telefono; this.numeroCasas = numeroCasas;
            this.activo = activo; this.estado = activo ? "Activo" : "Inactivo";
        }

        public int     getId()          { return id; }
        public String  getNombre()      { return nombre; }
        public String  getCorreo()      { return correo; }
        public String  getTelefono()    { return telefono; }
        public int     getNumeroCasas() { return numeroCasas; }
        public String  getEstado()      { return estado; }
        public boolean isActivo()       { return activo; }
        public void    setActivo(boolean a)  { this.activo = a; }
        public void    setEstado(String s)   { this.estado = s; }
    }
}