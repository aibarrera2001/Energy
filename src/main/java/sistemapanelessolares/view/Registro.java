package sistemapanelessolares.view;

import java.sql.Connection;
import java.util.Optional;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.dao.UsuarioDAO;
import sistemapanelessolares.dao.CasaDAO;

public class Registro {

    private final Connection conexionDB;
    private final UsuarioDAO userDAO;
    private final CasaDAO homeDAO;

    private static final String FONDO_DIALOGO  = "-fx-background-color: #0D1B2A;";
    private static final String ESTILO_CAMPO   =
            "-fx-background-color: rgba(21,101,192,0.15);"
          + "-fx-border-color: rgba(144,202,249,0.4);"
          + "-fx-border-radius: 8; -fx-background-radius: 8;"
          + "-fx-text-fill: #E8F4FD; -fx-prompt-text-fill: #546E7A;"
          + "-fx-font-size: 13px; -fx-padding: 8 12 8 12;";
    private static final String ESTILO_LABEL   =
            "-fx-text-fill: #90CAF9; -fx-font-size: 12px; -fx-font-weight: bold;";
    private static final String ESTILO_TITULO  =
            "-fx-text-fill: #E8F4FD; -fx-font-size: 20px; -fx-font-weight: 900;";
    private static final String ESTILO_SUBTITULO =
            "-fx-text-fill: #B0BEC5; -fx-font-size: 12px;";
    private static final String BTN_PRIMARIO   =
            "-fx-background-color: #1565C0; -fx-text-fill: white;"
          + "-fx-font-size: 13px; -fx-font-weight: bold;"
          + "-fx-background-radius: 10; -fx-cursor: hand; -fx-padding: 10 24 10 24;";
    private static final String BTN_CANCELAR   =
            "-fx-background-color: transparent; -fx-text-fill: #90CAF9;"
          + "-fx-font-size: 13px; -fx-font-weight: bold;"
          + "-fx-border-color: rgba(144,202,249,0.5);"
          + "-fx-border-radius: 10; -fx-background-radius: 10;"
          + "-fx-cursor: hand; -fx-padding: 10 24 10 24;";
    private static final String TARJETA        =
            "-fx-background-color: rgba(21,101,192,0.12);"
          + "-fx-background-radius: 16;"
          + "-fx-border-color: rgba(144,202,249,0.25);"
          + "-fx-border-radius: 16; -fx-border-width: 1; -fx-padding: 20;";

    public Registro(Connection conexionDB) {
        this.conexionDB = conexionDB;
        if (conexionDB != null) {
            this.userDAO = new UsuarioDAO();
            this.homeDAO = new CasaDAO();
        } else {
            this.userDAO = null;
            this.homeDAO = null;
        }
    }

    // ── Registrar Usuario ─────────────────────────────────────────────
    public Optional<Usuario> mostrarModalRegistroUsuario() {
        Dialog<Usuario> dialog = new Dialog<>();
        dialog.setTitle("EnergiApp — Registro de Cuenta");
        DialogPane dp = dialog.getDialogPane();
        dp.setStyle(FONDO_DIALOGO
                + "-fx-border-color: rgba(144,202,249,0.35);"
                + "-fx-border-width: 1.5; -fx-border-radius: 18; -fx-background-radius: 18;");
        dp.setPrefWidth(480);
        dp.getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        dp.lookupButton(ButtonType.OK).setVisible(false);
        dp.lookupButton(ButtonType.OK).setManaged(false);
        dp.lookupButton(ButtonType.CANCEL).setVisible(false);
        dp.lookupButton(ButtonType.CANCEL).setManaged(false);

        Label lblTitulo = new Label("Crear Nueva Cuenta");
        lblTitulo.setStyle(ESTILO_TITULO);
        lblTitulo.setEffect(new DropShadow(10, Color.web("#90CAF9")));
        Label lblSub = new Label("Complete los campos para registrarse");
        lblSub.setStyle(ESTILO_SUBTITULO);
        Region sep = new Region();
        sep.setPrefHeight(1);
        sep.setStyle("-fx-background-color: rgba(144,202,249,0.3);");
        sep.setMaxWidth(Double.MAX_VALUE);
        VBox encabezado = new VBox(6, lblTitulo, lblSub, sep);
        encabezado.setPadding(new Insets(0, 0, 10, 0));

        TextField txtNombre   = crearCampo("Nombre");
        TextField txtApellido = crearCampo("Apellido");
        TextField txtTelefono = crearCampo("Telefono");
        TextField txtCorreo   = crearCampo("ejemplo@mail.com");
        PasswordField txtPassword = new PasswordField();
        txtPassword.setPromptText("Contrasena");
        txtPassword.setStyle(ESTILO_CAMPO);

        GridPane grid = new GridPane();
        grid.setHgap(12); grid.setVgap(14); grid.setStyle(TARJETA);
        agregarFila(grid, "Nombre",     txtNombre,   0);
        agregarFila(grid, "Apellido",   txtApellido, 1);
        agregarFila(grid, "Telefono",   txtTelefono, 2);
        agregarFila(grid, "Correo",     txtCorreo,   3);
        agregarFila(grid, "Contrasena", txtPassword, 4);

        Button btnRegistrar = new Button("Crear Cuenta");
        btnRegistrar.setStyle(BTN_PRIMARIO);
        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle(BTN_CANCELAR);
        HBox botonesBox = new HBox(12, btnCancelar, btnRegistrar);
        botonesBox.setAlignment(Pos.CENTER_RIGHT);
        botonesBox.setPadding(new Insets(10, 0, 0, 0));

        VBox contenido = new VBox(18, encabezado, grid, botonesBox);
        contenido.setPadding(new Insets(24));
        dp.setContent(contenido);

        btnCancelar.setOnAction(e -> dialog.close());
        btnRegistrar.setOnAction(e -> {
            if (txtNombre.getText().trim().isEmpty()
                    || txtCorreo.getText().trim().isEmpty()
                    || txtPassword.getText().isEmpty()) {
                mostrarAlerta("Campos Requeridos",
                        "Nombre, correo y contrasena son obligatorios.", Alert.AlertType.WARNING);
                return;
            }
            dialog.setResult(new Usuario(
                    txtNombre.getText().trim(), txtApellido.getText().trim(),
                    txtTelefono.getText().trim(), txtCorreo.getText().trim(),
                    txtPassword.getText()));
            dialog.close();
        });

        Optional<Usuario> resultado = dialog.showAndWait();
        if (resultado != null && resultado.isPresent() && conexionDB != null && userDAO != null) {
            try {
                userDAO.guardar(resultado.get());
                if (resultado.get().getIdUsuario() > 0) {
                    mostrarAlerta("Exito", "Usuario registrado correctamente.", Alert.AlertType.INFORMATION);
                    return Optional.of(resultado.get());
                }
            } catch (Exception e) {
                mostrarAlerta("Error", "Error al registrar: " + e.getMessage(), Alert.AlertType.ERROR);
            }
        }
        return resultado == null ? Optional.empty() : resultado;
    }

    // ── Registrar Casa ────────────────────────────────────────────────
    public Optional<Casa> mostrarModalRegistroCasa(int idUsuario) {
        Dialog<Casa> dialog = new Dialog<>();
        dialog.setTitle("EnergiApp — Registrar Propiedad");
        DialogPane dp = dialog.getDialogPane();
        dp.setStyle(FONDO_DIALOGO
                + "-fx-border-color: rgba(144,202,249,0.35);"
                + "-fx-border-width: 1.5; -fx-border-radius: 18; -fx-background-radius: 18;");
        dp.setPrefWidth(480);
        dp.getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        dp.lookupButton(ButtonType.OK).setVisible(false);
        dp.lookupButton(ButtonType.OK).setManaged(false);
        dp.lookupButton(ButtonType.CANCEL).setVisible(false);
        dp.lookupButton(ButtonType.CANCEL).setManaged(false);

        Label lblTitulo = new Label("Registrar Propiedad");
        lblTitulo.setStyle(ESTILO_TITULO);
        lblTitulo.setEffect(new DropShadow(10, Color.web("#90CAF9")));
        Label lblSub = new Label("Ingrese los datos de consumo de su vivienda");
        lblSub.setStyle(ESTILO_SUBTITULO);
        Region sep = new Region();
        sep.setPrefHeight(1);
        sep.setStyle("-fx-background-color: rgba(144,202,249,0.3);");
        sep.setMaxWidth(Double.MAX_VALUE);
        VBox encabezado = new VBox(6, lblTitulo, lblSub, sep);
        encabezado.setPadding(new Insets(0, 0, 10, 0));

        TextField txtDireccion = crearCampo("Ej: Calle 15 #4-12");
        TextField txtCiudad    = crearCampo("Ciudad");
        txtCiudad.setText("Valledupar");
        TextField txtConsumo   = crearCampo("Ej: 450.5 kWh");
        TextField txtLat       = crearCampo("Latitud (opcional)");
        txtLat.setText("0");
        TextField txtLon       = crearCampo("Longitud (opcional)");
        txtLon.setText("0");

        GridPane grid = new GridPane();
        grid.setHgap(12); grid.setVgap(14); grid.setStyle(TARJETA);
        agregarFila(grid, "Direccion",             txtDireccion, 0);
        agregarFila(grid, "Ciudad",                txtCiudad,    1);
        agregarFila(grid, "Consumo Mensual (kWh)", txtConsumo,   2);
        agregarFila(grid, "Latitud",               txtLat,       3);
        agregarFila(grid, "Longitud",              txtLon,       4);

        Button btnGuardar  = new Button("Guardar Propiedad");
        btnGuardar.setStyle(BTN_PRIMARIO);
        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle(BTN_CANCELAR);
        HBox botonesBox = new HBox(12, btnCancelar, btnGuardar);
        botonesBox.setAlignment(Pos.CENTER_RIGHT);
        botonesBox.setPadding(new Insets(10, 0, 0, 0));

        VBox contenido = new VBox(18, encabezado, grid, botonesBox);
        contenido.setPadding(new Insets(24));
        dp.setContent(contenido);

        btnCancelar.setOnAction(e -> dialog.close());
        btnGuardar.setOnAction(e -> {
            try {
                double consumo = Double.parseDouble(txtConsumo.getText().trim());
                double lat     = Double.parseDouble(txtLat.getText().trim());
                double lon     = Double.parseDouble(txtLon.getText().trim());
                dialog.setResult(new Casa(
                        txtDireccion.getText().trim(), txtCiudad.getText().trim(),
                        consumo, lat, lon));
                dialog.close();
            } catch (NumberFormatException ex) {
                mostrarAlerta("Formato Incorrecto",
                        "Consumo, latitud y longitud deben ser numeros validos.",
                        Alert.AlertType.ERROR);
            }
        });

        Optional<Casa> resultado = dialog.showAndWait();
        if (resultado != null && resultado.isPresent() && conexionDB != null && homeDAO != null) {
            homeDAO.guardar(resultado.get(), idUsuario);
            mostrarAlerta("Propiedad Registrada", "Vivienda registrada con exito.", Alert.AlertType.INFORMATION);
        }
        return resultado == null ? Optional.empty() : resultado;
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private TextField crearCampo(String prompt) {
        TextField tf = new TextField();
        tf.setPromptText(prompt);
        tf.setStyle(ESTILO_CAMPO);
        tf.setMaxWidth(Double.MAX_VALUE);
        return tf;
    }

    private void agregarFila(GridPane grid, String labelTxt, Control campo, int fila) {
        Label lbl = new Label(labelTxt);
        lbl.setStyle(ESTILO_LABEL);
        lbl.setMinWidth(160);
        GridPane.setHgrow(campo, Priority.ALWAYS);
        grid.add(lbl, 0, fila);
        grid.add(campo, 1, fila);
    }

    private void mostrarAlerta(String titulo, String mensaje, Alert.AlertType tipo) {
        Alert alerta = new Alert(tipo);
        alerta.setTitle(titulo);
        alerta.setHeaderText(null);
        alerta.setContentText(mensaje);
        alerta.showAndWait();
    }
}