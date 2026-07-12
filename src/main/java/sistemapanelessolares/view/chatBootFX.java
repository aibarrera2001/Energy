package sistemapanelessolares.view;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.TextAlignment;
import javafx.stage.Stage;
import sistemapanelessolares.logica.SolarService;

import java.io.InputStream;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class chatBootFX {

    private final SolarService solarServicio;

    // Paleta azul claro
    private static final String BURBUJA_IA    = "-fx-background-color: #FFFFFF;"
            + "-fx-background-radius: 18 18 18 4; -fx-padding: 12 16;";
    private static final String BURBUJA_USER  = "-fx-background-color: #1565C0;"
            + "-fx-background-radius: 18 18 4 18; -fx-padding: 12 16;";
    private static final String TXT_IA        = "-fx-text-fill: #1A2B3C; -fx-font-size: 13px;";
    private static final String TXT_USER      = "-fx-text-fill: white; -fx-font-size: 13px;";
    private static final String TXT_HORA      = "-fx-text-fill: #90A4AE; -fx-font-size: 10px;";
    private static final String INPUT_STYLE   = "-fx-background-color: rgba(255,255,255,0.92);"
            + "-fx-background-radius: 24; -fx-padding: 10 18; -fx-font-size: 13px;"
            + "-fx-border-color: #BBDEFB; -fx-border-radius: 24; -fx-border-width: 1.5;";
    private static final String BTN_ENVIAR    = "-fx-background-color: #1565C0;"
            + "-fx-text-fill: white; -fx-font-weight: bold; -fx-font-size: 13px;"
            + "-fx-background-radius: 24; -fx-cursor: hand; -fx-padding: 10 22;";
    private static final String BTN_HOVER     = "-fx-background-color: #0D47A1;"
            + "-fx-text-fill: white; -fx-font-weight: bold; -fx-font-size: 13px;"
            + "-fx-background-radius: 24; -fx-cursor: hand; -fx-padding: 10 22;";

    public chatBootFX(SolarService solarServicio) {
        this.solarServicio = solarServicio;
    }

    public void mostrar() {
        Stage stage = new Stage();
        stage.setTitle("EnergiApp — Asistente IA");

        // ── FONDO con imagen ──────────────────────────────────────────
        StackPane fondoPane = new StackPane();

        // Imagen de fondo
        InputStream is = getClass().getResourceAsStream("/images/fondo_chatboot.jpg");
        if (is != null) {
            ImageView bgView = new ImageView(new Image(is));
            bgView.setPreserveRatio(false);
            bgView.setSmooth(true);
            bgView.fitWidthProperty().bind(fondoPane.widthProperty());
            bgView.fitHeightProperty().bind(fondoPane.heightProperty());
            fondoPane.getChildren().add(bgView);
        } else {
            // Fallback gradiente si no carga la imagen
            fondoPane.setStyle("-fx-background-color: linear-gradient(to bottom, #E3F2FD, #BBDEFB);");
        }

        // ── HEADER ───────────────────────────────────────────────────
        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);
        header.setPadding(new Insets(14, 20, 14, 20));
        header.setStyle("-fx-background-color: rgba(255,255,255,0.75);"
                + "-fx-background-radius: 16 16 0 0;");

        // Logo en header
        Label lblLogo = new Label();
        InputStream logoIs = getClass().getResourceAsStream("/images/logoEnergiapp.jpeg");
        if (logoIs != null) {
            ImageView logoView = new ImageView(new Image(logoIs));
            logoView.setFitHeight(28); logoView.setPreserveRatio(true);
            lblLogo.setGraphic(logoView);
        } else {
            lblLogo.setText("⚡");
            lblLogo.setStyle("-fx-font-size: 20px;");
        }

        VBox headerTexto = new VBox(2);
        Label lblTitulo = new Label("Asistente Solar IA");
        lblTitulo.setStyle("-fx-font-size: 15px; -fx-font-weight: bold; -fx-text-fill: #0D47A1;");
        Label lblSubt = new Label("¿En qué puedo ayudarte hoy?");
        lblSubt.setStyle("-fx-font-size: 11px; -fx-text-fill: #546E7A;");
        headerTexto.getChildren().addAll(lblTitulo, lblSubt);

        Region espH = new Region(); HBox.setHgrow(espH, Priority.ALWAYS);

        // Indicador "en línea"
        Label lblOnline = new Label("● En línea");
        lblOnline.setStyle("-fx-text-fill: #43A047; -fx-font-size: 11px; -fx-font-weight: bold;");

        header.getChildren().addAll(lblLogo, headerTexto, espH, lblOnline);

        // ── ÁREA DE CONVERSACIÓN ──────────────────────────────────────
        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        scroll.setPrefHeight(380);

        VBox mensajes = new VBox(14);
        mensajes.setPadding(new Insets(16, 20, 16, 20));
        mensajes.setStyle("-fx-background-color: transparent;");
        scroll.setContent(mensajes);

        // Mensaje de bienvenida de la IA
        agregarMensajeIA(mensajes, scroll,
                "¡Hola! 👋 Soy tu asistente de energía solar.\n"
                + "Puedo ayudarte con cálculos de paneles, costos de instalación y más. ¿Qué deseas consultar?");

        // ── INPUT BAR ────────────────────────────────────────────────
        HBox inputBar = new HBox(10);
        inputBar.setPadding(new Insets(12, 20, 16, 20));
        inputBar.setAlignment(Pos.CENTER);
        inputBar.setStyle("-fx-background-color: rgba(255,255,255,0.72);"
                + "-fx-background-radius: 0 0 16 16;");

        TextField input = new TextField();
        input.setPromptText("Escribe tu consulta...");
        input.setStyle(INPUT_STYLE);
        input.setPrefHeight(42);
        HBox.setHgrow(input, Priority.ALWAYS);

        Button btnEnviar = new Button("Enviar  ➤");
        btnEnviar.setStyle(BTN_ENVIAR);
        btnEnviar.setPrefHeight(42);
        btnEnviar.setOnMouseEntered(e -> btnEnviar.setStyle(BTN_HOVER));
        btnEnviar.setOnMouseExited(e  -> btnEnviar.setStyle(BTN_ENVIAR));

        // Acción enviar
        Runnable enviar = () -> {
            String pregunta = input.getText().trim();
            if (pregunta.isEmpty()) return;

            agregarMensajeUsuario(mensajes, scroll, pregunta);
            input.clear();
            btnEnviar.setDisable(true);

            // Indicador "escribiendo..."
            Label typing = new Label("  IA escribiendo...");
            typing.setStyle("-fx-text-fill: #90A4AE; -fx-font-size: 11px; -fx-font-style: italic;");
            mensajes.getChildren().add(typing);
            scrollAbajo(scroll);

            new Thread(() -> {
                String respuesta;
                try {
                    if (solarServicio != null && solarServicio.getChatController() != null) {
                        respuesta = solarServicio.consultarChat(pregunta);
                    } else {
                        respuesta = "El asistente IA no está disponible en este momento.";
                    }
                } catch (Exception ex) {
                    respuesta = "Error al conectar con el asistente: " + ex.getMessage();
                }
                final String resp = respuesta;
                javafx.application.Platform.runLater(() -> {
                    mensajes.getChildren().remove(typing);
                    agregarMensajeIA(mensajes, scroll, resp);
                    btnEnviar.setDisable(false);
                });
            }).start();
        };

        btnEnviar.setOnAction(e -> enviar.run());
        input.setOnAction(e -> enviar.run());

        inputBar.getChildren().addAll(input, btnEnviar);

        // ── PANEL CENTRAL (tarjeta semitransparente) ──────────────────
        VBox panelChat = new VBox();
        panelChat.setMaxWidth(750);
        panelChat.setMinWidth(500);

        DropShadow sombra = new DropShadow(20, 0, 6, Color.color(0, 0, 0, 0.18));
        panelChat.setEffect(sombra);
        panelChat.setStyle("-fx-background-color: rgba(240,248,255,0.55);"
                + "-fx-background-radius: 18; -fx-border-color: rgba(187,222,251,0.6);"
                + "-fx-border-radius: 18; -fx-border-width: 1;");

        VBox.setVgrow(scroll, Priority.ALWAYS);
        panelChat.getChildren().addAll(header, scroll, inputBar);

        fondoPane.getChildren().add(panelChat);
        StackPane.setAlignment(panelChat, Pos.CENTER);
        StackPane.setMargin(panelChat, new Insets(30));

        stage.setScene(new Scene(fondoPane, 820, 620));
        stage.setMinWidth(650);
        stage.setMinHeight(520);
        stage.show();
    }

    // ── Burbuja IA (izquierda) ────────────────────────────────────────
    private void agregarMensajeIA(VBox contenedor, ScrollPane scroll, String texto) {
        HBox fila = new HBox(10);
        fila.setAlignment(Pos.CENTER_LEFT);

        // Avatar IA
        Label avatar = new Label("🤖");
        avatar.setStyle("-fx-font-size: 20px;");

        VBox burbuja = new VBox(4);
        Label msg = new Label(texto);
        msg.setStyle(TXT_IA);
        msg.setWrapText(true);
        msg.setMaxWidth(460);
        msg.setTextAlignment(TextAlignment.LEFT);

        Label hora = new Label(horaActual());
        hora.setStyle(TXT_HORA);

        VBox bubble = new VBox(4, msg, hora);
        bubble.setStyle(BURBUJA_IA);
        DropShadow s = new DropShadow(6, 0, 2, Color.color(0,0,0,0.10));
        bubble.setEffect(s);
        bubble.setMaxWidth(480);

        burbuja.getChildren().add(bubble);
        fila.getChildren().addAll(avatar, burbuja);
        contenedor.getChildren().add(fila);
        scrollAbajo(scroll);
    }

    // ── Burbuja usuario (derecha) ─────────────────────────────────────
    private void agregarMensajeUsuario(VBox contenedor, ScrollPane scroll, String texto) {
        HBox fila = new HBox(10);
        fila.setAlignment(Pos.CENTER_RIGHT);

        VBox burbuja = new VBox(4);
        Label msg = new Label(texto);
        msg.setStyle(TXT_USER);
        msg.setWrapText(true);
        msg.setMaxWidth(460);
        msg.setTextAlignment(TextAlignment.LEFT);

        Label hora = new Label(horaActual());
        hora.setStyle("-fx-text-fill: #BBDEFB; -fx-font-size: 10px;");
        hora.setAlignment(Pos.CENTER_RIGHT);

        VBox bubble = new VBox(4, msg, hora);
        bubble.setStyle(BURBUJA_USER);
        DropShadow s = new DropShadow(6, 0, 2, Color.color(0,0,0,0.15));
        bubble.setEffect(s);
        bubble.setMaxWidth(480);

        // Avatar usuario
        Label avatar = new Label("👤");
        avatar.setStyle("-fx-font-size: 20px;");

        burbuja.getChildren().add(bubble);
        fila.getChildren().addAll(burbuja, avatar);
        contenedor.getChildren().add(fila);
        scrollAbajo(scroll);
    }

    // ── Scroll al fondo ───────────────────────────────────────────────
    private void scrollAbajo(ScrollPane scroll) {
        javafx.application.Platform.runLater(() -> scroll.setVvalue(1.0));
    }

    private String horaActual() {
        return LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
    }
}