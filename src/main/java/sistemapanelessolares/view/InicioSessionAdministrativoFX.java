package sistemapanelessolares.view;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

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
import sistemapanelessolares.logica.SolarService;

public class InicioSessionAdministrativoFX {

    private final SolarService solarServicio;
    private final Connection   conexionDB;

    private static final String C_SECONDARY = "#4B5563";
    private static final String C_SECONDARY_D= "#374151";
    private static final String C_BG        = "#F5F7FA";
    private static final String C_SURFACE   = "#FFFFFF";
    private static final String C_TEXT      = "#1F2937";
    private static final String C_TEXT_S    = "#6B7280";
    private static final String C_BORDER    = "#E5E7EB";
    private static final String C_ERROR     = "#DC2626";
    private static final String C_WARNING   = "#F4B400";

    private static final String CAMPO = "-fx-background-color: " + C_SURFACE + ";"
            + "-fx-border-color: " + C_BORDER + "; -fx-border-radius: 8; -fx-background-radius: 8;"
            + "-fx-text-fill: " + C_TEXT + "; -fx-prompt-text-fill: " + C_TEXT_S + ";"
            + "-fx-font-size: 13px; -fx-padding: 10 14;";

    private static final String BTN_ADMIN = "-fx-background-color: " + C_SECONDARY + "; -fx-text-fill: white;"
            + "-fx-font-size: 14px; -fx-font-weight: bold; -fx-background-radius: 10;"
            + "-fx-cursor: hand; -fx-padding: 12 0;";

    public InicioSessionAdministrativoFX(SolarService solarServicio, Connection conexionDB) {
        this.solarServicio = solarServicio;
        this.conexionDB    = conexionDB;
    }

    public void mostrarVentanaAcceso(Stage stage) {
        stage.setTitle("EnergiApp — Acceso Administrativo");

        StackPane root = new StackPane();
        root.setStyle("-fx-background-color: " + C_BG + ";");

        HBox mainLayout = new HBox(0);
        mainLayout.setMaxWidth(980);
        mainLayout.setMaxHeight(620);
        mainLayout.setEffect(new DropShadow(30, 0, 8, Color.color(0,0,0,0.12)));

        // ── PANEL IZQUIERDO ───────────────────────────────────────────
        VBox left = new VBox(18);
        left.setPrefWidth(370);
        left.setStyle("-fx-background-color: " + C_SECONDARY + "; -fx-background-radius: 18 0 0 18;");
        left.setAlignment(Pos.CENTER);
        left.setPadding(new Insets(45, 35, 35, 35));

        javafx.scene.Node logoNode;
        InputStream logoIs = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.jpeg");
        if (logoIs == null) logoIs = getClass().getResourceAsStream("/images/logoEnergiapp.jpeg");
        if (logoIs != null) {
            ImageView iv = new ImageView(new Image(logoIs));
            iv.setFitWidth(90); iv.setFitHeight(90); iv.setPreserveRatio(true);
            Circle clip = new Circle(45, 45, 45); iv.setClip(clip);
            iv.setEffect(new DropShadow(12, Color.color(0,0,0,0.2)));
            HBox lb = new HBox(iv); lb.setAlignment(Pos.CENTER); logoNode = lb;
        } else {
            Label fb = new Label("🛠"); fb.setStyle("-fx-font-size: 48px;"); logoNode = fb;
        }

        Label lblApp = new Label("EnergiApp");
        lblApp.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        // Badge Admin
        Label badge = new Label("⬡  ADMINISTRADOR");
        badge.setStyle("-fx-background-color: rgba(244,180,0,0.2); -fx-text-fill: " + C_WARNING + ";"
                + "-fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 5 14;"
                + "-fx-background-radius: 20; -fx-border-color: " + C_WARNING + "; -fx-border-radius: 20;");

        Region sep = new Region(); sep.setPrefHeight(1); sep.setMaxWidth(160);
        sep.setStyle("-fx-background-color: rgba(255,255,255,0.25);");

        VBox permisos = new VBox(10); permisos.setAlignment(Pos.CENTER_LEFT); permisos.setMaxWidth(250);
        String[] ps = { "📋  Gestión de catálogo de paneles", "👥  Administración de usuarios",
                        "🔧  Configuración del sistema", "📊  Reportes y métricas globales" };
        for (String p : ps) {
            Label l = new Label(p);
            l.setStyle("-fx-font-size: 12px; -fx-text-fill: rgba(255,255,255,0.85);");
            permisos.getChildren().add(l);
        }

        Region spacerL = new Region(); VBox.setVgrow(spacerL, Priority.ALWAYS);
        Label lblAcceso = new Label("Acceso restringido a personal autorizado");
        lblAcceso.setStyle("-fx-font-size: 10px; -fx-text-fill: rgba(255,255,255,0.50);");
        lblAcceso.setWrapText(true);

        left.getChildren().addAll(logoNode, lblApp, badge, sep, permisos, spacerL, lblAcceso);

        // ── PANEL DERECHO ─────────────────────────────────────────────
        VBox right = new VBox(16);
        right.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-background-radius: 0 18 18 0;");
        right.setAlignment(Pos.CENTER);
        right.setPadding(new Insets(50, 50, 40, 50));
        HBox.setHgrow(right, Priority.ALWAYS);

        Label lblTitulo = new Label("Iniciar Sesión");
        lblTitulo.setStyle("-fx-font-size: 26px; -fx-font-weight: 900; -fx-text-fill: " + C_TEXT + ";");
        Label lblSub = new Label("Ingresa tus credenciales de administrador");
        lblSub.setStyle("-fx-font-size: 13px; -fx-text-fill: " + C_TEXT_S + ";");

        Label lCorreo = campoLabel("Correo Administrativo");
        TextField txtCorreo = campoTexto("admin@energiapp.com");
        Label lPass = campoLabel("Contraseña");
        PasswordField txtPass = campoPass("••••••••");

        Button btnIngresar = new Button("Autenticar Administrador");
        btnIngresar.setMaxWidth(Double.MAX_VALUE); btnIngresar.setStyle(BTN_ADMIN);
        btnIngresar.setOnMouseEntered(e -> btnIngresar.setStyle(BTN_ADMIN + "-fx-background-color: " + C_SECONDARY_D + ";"));
        btnIngresar.setOnMouseExited(e  -> btnIngresar.setStyle(BTN_ADMIN));

        btnIngresar.setOnAction(e -> {
            String correo = txtCorreo.getText().trim();
            String pass   = txtPass.getText();
            if (correo.isEmpty() || pass.isEmpty()) {
                alerta("Campos vacíos", "Complete todos los campos.", Alert.AlertType.WARNING); return;
            }
            if (conexionDB != null) {
                String sql = "SELECT nombre, rol FROM administrativos WHERE correo = ? AND contrasena = ?";
               try (PreparedStatement stmt = conexionDB.prepareStatement(sql))  {
                    stmt.setString(1, correo); stmt.setString(2, pass);
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) {
                        alerta("Bienvenido", "Acceso concedido — " + rs.getString("nombre"), Alert.AlertType.INFORMATION);
                        new dashboardadminitradorFX(solarServicio, conexionDB).mostrar(stage);
                    } else {
                        alerta("Acceso denegado", "Credenciales incorrectas.", Alert.AlertType.ERROR);
                    }
                } catch (Exception ex) {
                    alerta("Error", ex.getMessage(), Alert.AlertType.ERROR);
                }
            } else {
                if (correo.equalsIgnoreCase("admin@energiapp.com") && pass.equals("admin123")) {
                    new dashboardadminitradorFX(solarServicio, conexionDB).mostrar(stage);
                } else {
                    alerta("Acceso denegado", "Credenciales incorrectas.", Alert.AlertType.ERROR);
                }
            }
        });

        Button btnVolver = new Button("← Volver al inicio");
        btnVolver.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_TEXT_S + ";"
                + "-fx-font-size: 12px; -fx-cursor: hand;");
        btnVolver.setOnAction(e -> { try { new IngresoFX().start(stage); } catch (Exception ex) { ex.printStackTrace(); } });

        right.getChildren().addAll(lblTitulo, lblSub,
                new Region() {{ setPrefHeight(8); }},
                lCorreo, txtCorreo, lPass, txtPass,
                new Region() {{ setPrefHeight(4); }},
                btnIngresar,
                new Region() {{ setPrefHeight(10); }},
                btnVolver);

        mainLayout.getChildren().addAll(left, right);
        root.getChildren().add(mainLayout);
        StackPane.setAlignment(mainLayout, Pos.CENTER);

        Scene scene = new Scene(root, 1200, 700);
        stage.setScene(scene); stage.setMaximized(true);
        stage.setMinWidth(900); stage.setMinHeight(580);
        stage.show();
    }

    private Label campoLabel(String texto) {
        Label l = new Label(texto);
        l.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        return l;
    }

    private TextField campoTexto(String prompt) {
        TextField tf = new TextField(); tf.setPromptText(prompt);
        tf.setStyle(CAMPO); tf.setMaxWidth(Double.MAX_VALUE);
        tf.focusedProperty().addListener((obs, o, f) ->
            tf.setStyle(CAMPO + (f ? "-fx-border-color: " + C_SECONDARY + "; -fx-border-width: 1.5;" : "")));
        return tf;
    }

    private PasswordField campoPass(String prompt) {
        PasswordField pf = new PasswordField(); pf.setPromptText(prompt);
        pf.setStyle(CAMPO); pf.setMaxWidth(Double.MAX_VALUE);
        pf.focusedProperty().addListener((obs, o, f) ->
            pf.setStyle(CAMPO + (f ? "-fx-border-color: " + C_SECONDARY + "; -fx-border-width: 1.5;" : "")));
        return pf;
    }

    private void alerta(String titulo, String msg, Alert.AlertType tipo) {
        Alert a = new Alert(tipo); a.setTitle(titulo); a.setHeaderText(null); a.setContentText(msg); a.showAndWait();
    }
}