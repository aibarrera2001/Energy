package sistemapanelessolares.view;

import java.io.InputStream;
import java.sql.Connection;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.effect.DropShadow;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;
import sistemapanelessolares.logica.SolarService;

public class IngresoFX extends Application {

    private static Connection conexionDBStatic = null;
    private Connection conexionDB;
    private SolarService solarServicio;

    // ── PALETA NUEVA ──────────────────────────────────────────────────
    private static final String C_PRIMARY    = "#0D5BD7";
    private static final String C_PRIMARY_D  = "#0A47B0";
    private static final String C_BG         = "#F5F7FA";
    private static final String C_SURFACE    = "#FFFFFF";
    private static final String C_TEXT       = "#1F2937";
    private static final String C_TEXT_S     = "#6B7280";
    private static final String C_SUCCESS    = "#16A34A";
    private static final String C_BORDER     = "#E5E7EB";
    private static final String C_SECONDARY  = "#4B5563";

    public IngresoFX() {
        this.conexionDB    = conexionDBStatic;
        this.solarServicio = new SolarService(this.conexionDB);
    }

    public static void setConexionDB(Connection con) { conexionDBStatic = con; }

    @Override
    public void start(Stage stage) throws Exception {
        stage.setTitle("EnergiApp — Sistema de Gestión Solar");

        // ── FONDO ─────────────────────────────────────────────────────
        StackPane root = new StackPane();
        root.setStyle("-fx-background-color: " + C_BG + ";");

        // ── LAYOUT PRINCIPAL ──────────────────────────────────────────
        HBox mainLayout = new HBox(0);
        mainLayout.setMaxWidth(1100);
        mainLayout.setMaxHeight(700);
        mainLayout.setEffect(new DropShadow(40, 0, 10, Color.color(0,0,0,0.15)));

        // ── PANEL IZQUIERDO ───────────────────────────────────────────
        VBox left = new VBox(0);
        left.setPrefWidth(420);
        left.setStyle("-fx-background-color: " + C_PRIMARY + "; -fx-background-radius: 18 0 0 18;");
        left.setAlignment(Pos.CENTER);
        left.setPadding(new Insets(50, 40, 40, 40));

        // Logo
        javafx.scene.Node logoNode;
        InputStream logoIs = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.jpeg");
        if (logoIs == null) logoIs = getClass().getResourceAsStream("/sistemapanelessolares/resources/logo.jpeg");
        if (logoIs != null) {
            Image img = new Image(logoIs);
            ImageView iv = new ImageView(img);
            iv.setFitWidth(130); iv.setFitHeight(130); iv.setPreserveRatio(true);
            Circle clip = new Circle(65, 65, 65);
            iv.setClip(clip);
            DropShadow glow = new DropShadow(20, Color.color(0,0,0,0.3));
            iv.setEffect(glow);
            HBox logoBox = new HBox(iv); logoBox.setAlignment(Pos.CENTER);
            logoNode = logoBox;
        } else {
            Label fb = new Label("⚡"); fb.setStyle("-fx-font-size: 64px;");
            logoNode = fb;
        }

        Label lblApp = new Label("EnergiApp");
        lblApp.setStyle("-fx-font-size: 34px; -fx-font-weight: 900; -fx-text-fill: white;");
        lblApp.setPadding(new Insets(18, 0, 6, 0));

        Label lblSlogan = new Label("Potencia tu futuro con energía solar inteligente");
        lblSlogan.setStyle("-fx-font-size: 14px; -fx-text-fill: rgba(255,255,255,0.85);"
                + "-fx-text-alignment: center; -fx-wrap-text: true;");
        lblSlogan.setWrapText(true);
        lblSlogan.setMaxWidth(300);
        lblSlogan.setAlignment(Pos.CENTER);

        // Separador
        Region sep = new Region();
        sep.setPrefHeight(1); sep.setMaxWidth(200);
        sep.setStyle("-fx-background-color: rgba(255,255,255,0.3);");
        sep.setPadding(new Insets(16, 0, 16, 0));
        VBox.setMargin(sep, new Insets(20, 0, 20, 0));

        // Features
        VBox features = new VBox(12);
        features.setAlignment(Pos.CENTER_LEFT);
        features.setMaxWidth(280);
        String[] feats = {
            "✓  Cálculo automático de paneles solares",
            "✓  Conexión a base de datos en la nube",
            "✓  Asistente IA integrado",
            "✓  Análisis financiero y retorno de inversión"
        };
        for (String f : feats) {
            Label lf = new Label(f);
            lf.setStyle("-fx-font-size: 13px; -fx-text-fill: rgba(255,255,255,0.90);");
            features.getChildren().add(lf);
        }

        Region spacerL = new Region(); VBox.setVgrow(spacerL, Priority.ALWAYS);

        Label lblVersion = new Label("v2.6  •  Universidad Popular Del Cesar  •  2026");
        lblVersion.setStyle("-fx-font-size: 10px; -fx-text-fill: rgba(255,255,255,0.55);");

        left.getChildren().addAll(logoNode, lblApp, lblSlogan, sep, features, spacerL, lblVersion);

        // ── PANEL DERECHO ─────────────────────────────────────────────
        VBox right = new VBox(0);
        right.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-background-radius: 0 18 18 0;");
        right.setAlignment(Pos.CENTER);
        right.setPadding(new Insets(50, 50, 40, 50));
        HBox.setHgrow(right, Priority.ALWAYS);

        Label lblBienvenido = new Label("Bienvenido");
        lblBienvenido.setStyle("-fx-font-size: 30px; -fx-font-weight: 900; -fx-text-fill: " + C_TEXT + ";");

        Label lblSub = new Label("Selecciona tu tipo de acceso para continuar");
        lblSub.setStyle("-fx-font-size: 14px; -fx-text-fill: " + C_TEXT_S + ";");
        lblSub.setPadding(new Insets(4, 0, 32, 0));

        // Tarjeta Usuario
        VBox cardUser = crearCardAcceso(
            "👤", "Acceso de Usuario",
            "Gestiona tus propiedades, calcula paneles y genera informes energéticos.",
            C_PRIMARY, "Ingresar como Usuario"
        );
        cardUser.setOnMouseClicked(e -> {
            new inicioSessionUsuarioFX(solarServicio, conexionDB).mostrarVentanaAcceso(stage);
        });

        // Tarjeta Admin
        VBox cardAdmin = crearCardAcceso(
            "🛠", "Acceso Administrativo",
            "Administra paneles, usuarios y configuración del sistema.",
            C_SECONDARY, "Acceso Administrador"
        );
        cardAdmin.setOnMouseClicked(e -> {
            new InicioSessionAdministrativoFX(solarServicio, conexionDB).mostrarVentanaAcceso(stage);
        });

        Region spacerR = new Region(); spacerR.setPrefHeight(20);

        Button btnSalir = new Button("Cerrar Aplicación");
        btnSalir.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_TEXT_S + ";"
                + "-fx-font-size: 12px; -fx-cursor: hand; -fx-border-color: " + C_BORDER + ";"
                + "-fx-border-radius: 8; -fx-background-radius: 8; -fx-padding: 8 20;");
        btnSalir.setOnMouseEntered(e -> btnSalir.setStyle(btnSalir.getStyle() + "-fx-background-color: " + C_BG + ";"));
        btnSalir.setOnMouseExited(e -> btnSalir.setStyle("-fx-background-color: transparent; -fx-text-fill: " + C_TEXT_S + ";"
                + "-fx-font-size: 12px; -fx-cursor: hand; -fx-border-color: " + C_BORDER + ";"
                + "-fx-border-radius: 8; -fx-background-radius: 8; -fx-padding: 8 20;"));
        btnSalir.setOnAction(e -> stage.close());

        right.getChildren().addAll(lblBienvenido, lblSub, cardUser, new Region() {{ setPrefHeight(12); }}, cardAdmin, spacerR, btnSalir);

        mainLayout.getChildren().addAll(left, right);
        root.getChildren().add(mainLayout);
        StackPane.setAlignment(mainLayout, Pos.CENTER);

        Scene scene = new Scene(root, 1300, 750);
        stage.setScene(scene);
        stage.setMaximized(true);
        stage.setMinWidth(1000);
        stage.setMinHeight(650);
        stage.show();
    }

    private VBox crearCardAcceso(String icon, String titulo, String desc, String color, String btnLabel) {
        VBox card = new VBox(10);
        card.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-border-color: " + C_BORDER + ";"
                + "-fx-border-radius: 14; -fx-background-radius: 14; -fx-border-width: 1.5;"
                + "-fx-padding: 22; -fx-cursor: hand;");
        card.setEffect(new DropShadow(8, 0, 2, Color.color(0,0,0,0.06)));

        card.setOnMouseEntered(e -> card.setStyle("-fx-background-color: " + C_BG + "; -fx-border-color: " + color + ";"
                + "-fx-border-radius: 14; -fx-background-radius: 14; -fx-border-width: 1.5;"
                + "-fx-padding: 22; -fx-cursor: hand;"));
        card.setOnMouseExited(e -> card.setStyle("-fx-background-color: " + C_SURFACE + "; -fx-border-color: " + C_BORDER + ";"
                + "-fx-border-radius: 14; -fx-background-radius: 14; -fx-border-width: 1.5;"
                + "-fx-padding: 22; -fx-cursor: hand;"));

        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);
        Label ico = new Label(icon); ico.setStyle("-fx-font-size: 22px;");
        Label tit = new Label(titulo);
        tit.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: " + C_TEXT + ";");
        header.getChildren().addAll(ico, tit);

        Label d = new Label(desc);
        d.setStyle("-fx-font-size: 12px; -fx-text-fill: " + C_TEXT_S + "; -fx-wrap-text: true;");
        d.setWrapText(true);

        Label btn = new Label(btnLabel + "  →");
        btn.setStyle("-fx-text-fill: " + color + "; -fx-font-size: 13px; -fx-font-weight: bold;");

        card.getChildren().addAll(header, d, btn);
        return card;
    }

    public static void main(String[] args) { launch(args); }
}