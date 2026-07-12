package sistemapanelessolares.view;

import java.io.InputStream;
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
import sistemapanelessolares.dao.UsuarioDAO;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.logica.SolarService;

import java.sql.Connection;
import java.util.List;

public class inicioSessionUsuarioFX {

    private final SolarService solarServicio;
    private final Connection   conexionDB;
    private Usuario usuarioLogueado;

    private static final String C_PRIMARY   = "#0D5BD7";
    private static final String C_PRIMARY_D = "#0A47B0";
    private static final String C_BG        = "#F5F7FA";
    private static final String C_SURFACE   = "#FFFFFF";
    private static final String C_TEXT      = "#1F2937";
    private static final String C_TEXT_S    = "#6B7280";
    private static final String C_BORDER    = "#E5E7EB";
    private static final String C_ERROR     = "#DC2626";
    private static final String C_SUCCESS   = "#16A34A";

    private static final String CAMPO = "-fx-background-color: " + C_SURFACE + ";"
            + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 8; -fx-background-radius: 8;"
            + "-fx-text-fill: " + C_TEXT + "; -fx-prompt-text-fill: " + C_TEXT_S + ";"
            + "-fx-font-size: 13px; -fx-padding: 10 14;";

    private static final String BTN_PRIMARY = "-fx-background-color: " + C_PRIMARY + "; -fx-text-fill: white;"
            + "-fx-font-size: 14px; -fx-font-weight: bold; -fx-background-radius: 10;"
            + "-fx-cursor: hand; -fx-padding: 12 0;";

    private static final String BTN_OUTLINE = "-fx-background-color: transparent; -fx-text-fill: " + C_PRIMARY + ";"
            + "-fx-font-size: 13px; -fx-font-weight: bold;"
            + "-fx-border-color: " + C_PRIMARY + "; -fx-border-radius: 10; -fx-background-radius: 10;"
            + "-fx-cursor: hand; -fx-padding: 11 0;";

    public inicioSessionUsuarioFX(SolarService solarServicio, Connection conexionDB) {
        this.solarServicio = solarServicio;
        this.conexionDB    = conexionDB;
    }

    public void mostrarVentanaAcceso(Stage stage) {
        stage.setTitle("EnergiApp — Acceso de Usuario");

        StackPane root = new StackPane();
        root.setStyle("-fx-background-color: " + C_BG + ";");

        HBox mainLayout = new HBox(0);
        mainLayout.setMaxWidth(980);
        mainLayout.setMaxHeight(660);
        mainLayout.setEffect(new DropShadow(30, 0, 8, Color.color(0,0,0,0.12)));

        // ── PANEL IZQUIERDO ───────────────────────────────────────────
        VBox left = new VBox(20);
        left.setPrefWidth(380);
        left.setStyle("-fx-background-color: " + C_PRIMARY + "; -fx-background-radius: 18 0 0 18;");
        left.setAlignment(Pos.CENTER);
        left.setPadding(new Insets(45, 35, 35, 35));

        javafx.scene.Node logoNode;
        InputStream logoIs = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.jpeg");
        if (logoIs == null) logoIs = getClass().getResourceAsStream("/images/logoEnergiapp.jpeg");
        if (logoIs != null) {
            ImageView iv = new ImageView(new Image(logoIs));
            iv.setFitWidth(100); iv.setFitHeight(100); iv.setPreserveRatio(true);
            Circle clip = new Circle(50, 50, 50); iv.setClip(clip);
            iv.setEffect(new DropShadow(15, Color.color(0,0,0,0.25)));
            HBox lb = new HBox(iv); lb.setAlignment(Pos.CENTER); logoNode = lb;
        } else {
            Label fb = new Label("⚡"); fb.setStyle("-fx-font-size: 48px;"); logoNode = fb;
        }

        Label lblApp = new Label("EnergiApp");
        lblApp.setStyle("-fx-font-size: 26px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label lblSlogan = new Label("Calcula, gestiona y optimiza\ntu energía solar");
        lblSlogan.setStyle("-fx-font-size: 13px; -fx-text-fill: rgba(255,255,255,0.82);"
                + "-fx-text-alignment: center; -fx-wrap-text: true;");
        lblSlogan.setWrapText(true); lblSlogan.setAlignment(Pos.CENTER);

        Region sep = new Region(); sep.setPrefHeight(1); sep.setMaxWidth(160);
        sep.setStyle("-fx-background-color: rgba(255,255,255,0.3);");

        VBox info = new VBox(10); info.setAlignment(Pos.CENTER_LEFT); info.setMaxWidth(260);
        String[] tips = { "⚡  Registro de propiedades y consumos", "📊  Informe financiero personalizado",
                          "🤖  Asistente IA integrado", "🌤  Datos reales de radiación solar" };
        for (String t : tips) {
            Label l = new Label(t);
            l.setStyle("-fx-font-size: 12px; -fx-text-fill: rgba(255,255,255,0.88);");
            info.getChildren().add(l);
        }

        Region spacerL = new Region(); VBox.setVgrow(spacerL, Priority.ALWAYS);
        Label lblUni = new Label("Universidad Popular Del Cesar  •  2026");
        lblUni.setStyle("-fx-font-size: 10px; -fx-text-fill: rgba(255,255,255,0.50);");

        left.getChildren().addAll(logoNode, lblApp, lblSlogan, sep, info, spacerL, lblUni);

        // ── PANEL DERECHO ─────────────────────────────────────────────
        VBox right = new VBox(0);
        right.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-background-radius: 0 18 18 0;");
        right.setAlignment(Pos.CENTER);
        right.setPadding(new Insets(40, 45, 35, 45));
        HBox.setHgrow(right, Priority.ALWAYS);

        // Tabs
        ToggleGroup tg = new ToggleGroup();
        ToggleButton tabLogin = crearTab("Iniciar Sesión", tg, true);
        ToggleButton tabReg   = crearTab("Crear Cuenta",   tg, false);

        HBox tabs = new HBox(0, tabLogin, tabReg);
        tabs.setStyle("-fx-background-color: " + C_BG + "; -fx-background-radius: 10; -fx-padding: 4;");
        tabs.setMaxWidth(340); tabs.setAlignment(Pos.CENTER);
        HBox.setHgrow(tabLogin, Priority.ALWAYS); HBox.setHgrow(tabReg, Priority.ALWAYS);

        // LOGIN PANEL
        VBox panelLogin = new VBox(14);
        panelLogin.setPadding(new Insets(22, 0, 0, 0));

        Label lblLoginTitle = new Label("Bienvenido de nuevo");
        lblLoginTitle.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        Label lblLoginSub = new Label("Ingresa tus credenciales para continuar");
        lblLoginSub.setStyle("-fx-font-size: 12px; -fx-text-fill: " + C_TEXT_S + ";");

        Label lCorreo = campo("Correo electrónico"); TextField txtCorreo = campoTexto("correo@email.com");
        Label lPass   = campo("Contraseña");         PasswordField txtPass = campoPass("••••••••");

        Button btnLogin = new Button("Iniciar Sesión");
        btnLogin.setMaxWidth(Double.MAX_VALUE); btnLogin.setStyle(BTN_PRIMARY);
        hoverBtn(btnLogin, BTN_PRIMARY, C_PRIMARY_D);

        panelLogin.getChildren().addAll(lblLoginTitle, lblLoginSub,
                new Region() {{ setPrefHeight(4); }}, lCorreo, txtCorreo, lPass, txtPass,
                new Region() {{ setPrefHeight(4); }}, btnLogin);

        btnLogin.setOnAction(e -> {
            String correo = txtCorreo.getText().trim();
            String pass   = txtPass.getText();
            if (correo.isEmpty() || pass.isEmpty()) {
                alerta("Campos vacíos", "Complete correo y contraseña.", Alert.AlertType.WARNING); return;
            }
            if (conexionDB != null) {
                UsuarioDAO dao = new UsuarioDAO();
                Usuario auth = dao.buscarPorCorreo(correo);
                if (auth != null && auth.getContrasena().equals(pass)) {
                    usuarioLogueado = auth;
                    CasaDAO cDao = new CasaDAO();
                    List<Casa> casas = cDao.listarPorUsuario(usuarioLogueado.getIdUsuario());
                    casas.forEach(usuarioLogueado::agregarCasa);
                    new DashboardusuarioFx(usuarioLogueado, solarServicio, conexionDB).mostrar(stage);
                } else {
                    alerta("Acceso denegado", "Correo o contraseña incorrectos.", Alert.AlertType.ERROR);
                }
            } else {
                usuarioLogueado = new Usuario("Usuario", "Temporal", "000", correo, pass);
                new DashboardusuarioFx(usuarioLogueado, solarServicio, conexionDB).mostrar(stage);
            }
        });

        // REGISTRO PANEL
        VBox panelReg = new VBox(10);
        panelReg.setPadding(new Insets(22, 0, 0, 0));
        panelReg.setVisible(false); panelReg.setManaged(false);

        Label lblRegTitle = new Label("Crear nueva cuenta");
        lblRegTitle.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        Label lblRegSub = new Label("Completa el formulario para registrarte");
        lblRegSub.setStyle("-fx-font-size: 12px; -fx-text-fill: " + C_TEXT_S + ";");

        TextField txtNombre   = campoTexto("Nombre");
        TextField txtApellido = campoTexto("Apellido");
        TextField txtTelefono = campoTexto("Teléfono");
        TextField txtEmail    = campoTexto("Correo electrónico");
        PasswordField txtPassReg = campoPass("Contraseña (mín. 6 caracteres)");

        // Grid 2 columnas para nombre/apellido
        GridPane gridReg = new GridPane(); gridReg.setHgap(10); gridReg.setVgap(10);
        gridReg.add(campo("Nombre"),    0, 0); gridReg.add(txtNombre,   0, 1);
        gridReg.add(campo("Apellido"),  1, 0); gridReg.add(txtApellido, 1, 1);
        ColumnConstraints cc = new ColumnConstraints(); cc.setPercentWidth(50);
        gridReg.getColumnConstraints().addAll(cc, new ColumnConstraints() {{ setPercentWidth(50); }});
        GridPane.setHgrow(txtNombre, Priority.ALWAYS); GridPane.setHgrow(txtApellido, Priority.ALWAYS);

        Button btnReg = new Button("Crear Cuenta");
        btnReg.setMaxWidth(Double.MAX_VALUE); btnReg.setStyle(BTN_OUTLINE);
        hoverBtn(btnReg, BTN_OUTLINE, null);

        panelReg.getChildren().addAll(lblRegTitle, lblRegSub,
                new Region() {{ setPrefHeight(4); }}, gridReg,
                campo("Teléfono"), txtTelefono,
                campo("Correo"),   txtEmail,
                campo("Contraseña"), txtPassReg,
                new Region() {{ setPrefHeight(4); }}, btnReg);

        btnReg.setOnAction(e -> {
            String nombre = txtNombre.getText().trim(), apellido = txtApellido.getText().trim();
            String telefono = txtTelefono.getText().trim(), email = txtEmail.getText().trim();
            String pass = txtPassReg.getText();
            if (nombre.isEmpty() || email.isEmpty() || pass.isEmpty()) {
                alerta("Campos requeridos", "Nombre, correo y contraseña son obligatorios.", Alert.AlertType.WARNING); return;
            }
            if (conexionDB != null) {
                try {
                    UsuarioDAO dao = new UsuarioDAO();
                    Usuario nuevo = new Usuario(nombre, apellido, telefono, email, pass);
                    dao.guardar(nuevo);
                    alerta("Cuenta creada", "Registro exitoso. Ya puedes iniciar sesión.", Alert.AlertType.INFORMATION);
                    txtNombre.clear(); txtApellido.clear(); txtTelefono.clear();
                    txtEmail.clear(); txtPassReg.clear();
                    tabLogin.setSelected(true);
                    panelLogin.setVisible(true); panelLogin.setManaged(true);
                    panelReg.setVisible(false);  panelReg.setManaged(false);
                    actualizarTab(tabLogin, tabReg);
                } catch (Exception ex) {
                    alerta("Error", ex.getMessage(), Alert.AlertType.ERROR);
                }
            } else {
                alerta("Sin conexión", "No hay conexión a la base de datos.", Alert.AlertType.ERROR);
            }
        });

        // Tab switch
        tabLogin.setOnAction(e -> {
            panelLogin.setVisible(true); panelLogin.setManaged(true);
            panelReg.setVisible(false);  panelReg.setManaged(false);
            actualizarTab(tabLogin, tabReg);
        });
        tabReg.setOnAction(e -> {
            panelLogin.setVisible(false); panelLogin.setManaged(false);
            panelReg.setVisible(true);    panelReg.setManaged(true);
            actualizarTab(tabReg, tabLogin);
        });
        actualizarTab(tabLogin, tabReg);

        // Volver
        Button btnVolver = new Button("← Volver al inicio");
        btnVolver.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_TEXT_S + ";"
                + "-fx-font-size: 12px; -fx-cursor: hand;");
        btnVolver.setOnAction(e -> { try { new IngresoFX().start(stage); } catch (Exception ex) { ex.printStackTrace(); } });

        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        VBox scrollContent = new VBox(0, tabs, panelLogin, panelReg);
        scroll.setContent(scrollContent);
        VBox.setVgrow(scroll, Priority.ALWAYS);

        right.getChildren().addAll(scroll, new Region() {{ setPrefHeight(10); }}, btnVolver);

        mainLayout.getChildren().addAll(left, right);
        root.getChildren().add(mainLayout);
        StackPane.setAlignment(mainLayout, Pos.CENTER);

        Scene scene = new Scene(root, 1200, 700);
        stage.setScene(scene); stage.setMaximized(true);
        stage.setMinWidth(900); stage.setMinHeight(600);
        stage.show();
    }

    private ToggleButton crearTab(String texto, ToggleGroup grupo, boolean selected) {
        ToggleButton tb = new ToggleButton(texto);
        tb.setToggleGroup(grupo); tb.setSelected(selected);
        tb.setMaxWidth(Double.MAX_VALUE);
        tb.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_TEXT_S + ";"
                + "-fx-font-size: 13px; -fx-font-weight: bold;"
                + "-fx-background-radius: 8; -fx-cursor: hand; -fx-padding: 8 0;");
        return tb;
    }

    private void actualizarTab(ToggleButton activo, ToggleButton inactivo) {
        activo.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-text-fill: " + C_PRIMARY + ";"
                + "-fx-font-size: 13px; -fx-font-weight: bold;"
                + "-fx-background-radius: 8; -fx-cursor: hand; -fx-padding: 8 0;"
                + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 4, 0, 0, 1);");
        inactivo.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_TEXT_S + ";"
                + "-fx-font-size: 13px; -fx-font-weight: bold;"
                + "-fx-background-radius: 8; -fx-cursor: hand; -fx-padding: 8 0;");
    }

    private Label campo(String texto) {
        Label l = new Label(texto);
        l.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        return l;
    }

    private TextField campoTexto(String prompt) {
        TextField tf = new TextField(); tf.setPromptText(prompt);
        tf.setStyle(CAMPO); tf.setMaxWidth(Double.MAX_VALUE);
        tf.focusedProperty().addListener((obs, o, f) ->
            tf.setStyle(CAMPO + (f ? "-fx-border-color: " + C_PRIMARY + "; -fx-border-width: 1.5;" : "")));
        return tf;
    }

    private PasswordField campoPass(String prompt) {
        PasswordField pf = new PasswordField(); pf.setPromptText(prompt);
        pf.setStyle(CAMPO); pf.setMaxWidth(Double.MAX_VALUE);
        pf.focusedProperty().addListener((obs, o, f) ->
            pf.setStyle(CAMPO + (f ? "-fx-border-color: " + C_PRIMARY + "; -fx-border-width: 1.5;" : "")));
        return pf;
    }

    private void hoverBtn(Button b, String base, String hoverColor) {
        b.setOnMouseEntered(e -> b.setStyle(base + (hoverColor != null ? "-fx-background-color: " + hoverColor + ";" : "-fx-opacity: 0.85;")));
        b.setOnMouseExited(e  -> b.setStyle(base));
        b.setOnMousePressed(e -> b.setStyle(base + "-fx-scale-x: 0.98; -fx-scale-y: 0.98;"));
        b.setOnMouseReleased(e-> b.setStyle(base));
    }

    private void alerta(String titulo, String msg, Alert.AlertType tipo) {
        Alert a = new Alert(tipo); a.setTitle(titulo); a.setHeaderText(null); a.setContentText(msg); a.showAndWait();
    }
}