package sistemapanelessolares.view;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

import sistemapanelessolares.dominio.Cita;
import sistemapanelessolares.dominio.Mantenimiento;
import sistemapanelessolares.excepciones.SistemaSolarException;
import sistemapanelessolares.logica.SolarService;

import java.util.List;
import java.util.Optional;

/**
 * Pestaña administrativa: ve todas las citas (instalación/mantenimiento/inspección)
 * y los mantenimientos programados, con acciones para confirmar, cancelar,
 * completar y registrar la ejecución de un mantenimiento.
 */
public class PestanaCitasAdminFX {

    private final SolarService solarServicio;
    private VBox listaCitasBox;
    private VBox listaMantenimientosBox;

    private static final String C_SECONDARY = "#4B5563";
    private static final String C_BG        = "#F5F7FA";
    private static final String C_SURFACE   = "#FFFFFF";
    private static final String C_TEXT      = "#1F2937";
    private static final String C_TEXT_S    = "#6B7280";
    private static final String C_BORDER    = "#E5E7EB";
    private static final String C_SUCCESS   = "#16A34A";
    private static final String C_WARNING   = "#D97706";
    private static final String C_ERROR     = "#DC2626";
    private static final String C_PURPLE    = "#7C3AED";

    public PestanaCitasAdminFX(SolarService solarServicio) {
        this.solarServicio = solarServicio;
    }

    public Tab crearPestana() {
        Tab tab = new Tab("📅  Citas y Mantenimiento");
        tab.setClosable(false);

        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background:" + C_BG + "; -fx-background-color:" + C_BG + ";");
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        VBox contenedor = new VBox(20);
        contenedor.setPadding(new Insets(20));
        contenedor.setStyle("-fx-background-color:" + C_BG + ";");

        contenedor.getChildren().addAll(construirListaCitas(), construirListaMantenimientos());
        scroll.setContent(contenedor);
        tab.setContent(scroll);

        refrescarCitas();
        refrescarMantenimientos();
        return tab;
    }

    // ── CITAS ────────────────────────────────────────────────────────────
    private VBox construirListaCitas() {
        VBox card = new VBox(0);
        card.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:14;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:14;");
        card.setEffect(new DropShadow(6, 0, 2, Color.color(0,0,0,0.05)));

        HBox hdr = new HBox();
        hdr.setPadding(new Insets(14, 18, 12, 18));
        hdr.setStyle("-fx-background-color:" + C_SECONDARY + "; -fx-background-radius:14 14 0 0;");
        Label lbl = new Label("🗓️  Todas las Citas");
        lbl.setStyle("-fx-font-size:15px; -fx-font-weight:900; -fx-text-fill:white;");
        Region sp = new Region(); HBox.setHgrow(sp, Priority.ALWAYS);
        Button btnRefrescar = new Button("🔄 Actualizar");
        btnRefrescar.setStyle("-fx-background-color:rgba(255,255,255,0.2); -fx-text-fill:white;"
                + "-fx-font-size:11px; -fx-font-weight:bold; -fx-background-radius:8; -fx-cursor:hand; -fx-padding:6 12;");
        btnRefrescar.setOnAction(e -> refrescarCitas());
        hdr.getChildren().addAll(lbl, sp, btnRefrescar);

        listaCitasBox = new VBox(10);
        listaCitasBox.setPadding(new Insets(16));
        card.getChildren().addAll(hdr, listaCitasBox);
        return card;
    }

    private void refrescarCitas() {
        listaCitasBox.getChildren().clear();
        List<Cita> citas = solarServicio.getGestorCitas().listarTodas();
        if (citas.isEmpty()) {
            Label vacio = new Label("No hay citas registradas.");
            vacio.setStyle("-fx-font-size:12px; -fx-text-fill:" + C_TEXT_S + ";");
            listaCitasBox.getChildren().add(vacio);
            return;
        }
        for (Cita c : citas) listaCitasBox.getChildren().add(tarjetaCita(c));
    }

    private HBox tarjetaCita(Cita c) {
        HBox fila = new HBox(12);
        fila.setAlignment(Pos.CENTER_LEFT);
        fila.setPadding(new Insets(12));
        fila.setStyle("-fx-background-color:" + C_BG + "; -fx-background-radius:10;");

        VBox info = new VBox(3);
        String nombreCliente = c.getNombreCliente() != null ? c.getNombreCliente() : "—";
        Label lTipo = new Label(c.getTipoServicio() + " — " + c.getFecha() + " " + c.getHora() + "  •  " + nombreCliente);
        lTipo.setStyle("-fx-font-size:13px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        Label lDir = new Label(c.getDireccionVisita() != null ? c.getDireccionVisita() : "—");
        lDir.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
        info.getChildren().addAll(lTipo, lDir);
        HBox.setHgrow(info, Priority.ALWAYS);

        Label estado = new Label(c.getEstado());
        estado.setStyle(estiloEstado(c.getEstado()));

        Button btnConfirmar = accionBtn("Confirmar", C_SUCCESS);
        btnConfirmar.setDisable(!c.getEstado().equals("PENDIENTE"));
        btnConfirmar.setOnAction(e -> {
            Optional<String> tecnico = pedirTecnico();
            tecnico.ifPresent(t -> ejecutar(() -> solarServicio.getGestorCitas().confirmarCita(c.getIdCita(), t)));
        });

        Button btnCompletar = accionBtn("Completar", "#0D5BD7");
        btnCompletar.setDisable(!c.getEstado().equals("CONFIRMADA"));
        btnCompletar.setOnAction(e -> ejecutar(() -> solarServicio.getGestorCitas().completarCita(c.getIdCita())));

        Button btnCancelar = accionBtn("Cancelar", C_ERROR);
        btnCancelar.setDisable(c.getEstado().equals("CANCELADA") || c.getEstado().equals("COMPLETADA"));
        btnCancelar.setOnAction(e -> ejecutar(() -> solarServicio.getGestorCitas().cancelarCita(c.getIdCita(), "Cancelada por administración")));

        fila.getChildren().addAll(info, estado, btnConfirmar, btnCompletar, btnCancelar);
        return fila;
    }

    // ── MANTENIMIENTOS ───────────────────────────────────────────────────
    private VBox construirListaMantenimientos() {
        VBox card = new VBox(0);
        card.setStyle("-fx-background-color:" + C_SURFACE + "; -fx-background-radius:14;"
                + "-fx-border-color:" + C_BORDER + "; -fx-border-radius:14;");
        card.setEffect(new DropShadow(6, 0, 2, Color.color(0,0,0,0.05)));

        HBox hdr = new HBox();
        hdr.setPadding(new Insets(14, 18, 12, 18));
        hdr.setStyle("-fx-background-color:" + C_PURPLE + "; -fx-background-radius:14 14 0 0;");
        Label lbl = new Label("🔧  Mantenimientos (pendientes y vencidos)");
        lbl.setStyle("-fx-font-size:15px; -fx-font-weight:900; -fx-text-fill:white;");
        Region sp = new Region(); HBox.setHgrow(sp, Priority.ALWAYS);
        Button btnRefrescar = new Button("🔄 Actualizar");
        btnRefrescar.setStyle("-fx-background-color:rgba(255,255,255,0.2); -fx-text-fill:white;"
                + "-fx-font-size:11px; -fx-font-weight:bold; -fx-background-radius:8; -fx-cursor:hand; -fx-padding:6 12;");
        btnRefrescar.setOnAction(e -> refrescarMantenimientos());
        hdr.getChildren().addAll(lbl, sp, btnRefrescar);

        listaMantenimientosBox = new VBox(10);
        listaMantenimientosBox.setPadding(new Insets(16));
        card.getChildren().addAll(hdr, listaMantenimientosBox);
        return card;
    }

    private void refrescarMantenimientos() {
        listaMantenimientosBox.getChildren().clear();
        List<Mantenimiento> pendientes = solarServicio.getGestorMantenimiento().listarPendientes();
        if (pendientes.isEmpty()) {
            Label vacio = new Label("No hay mantenimientos pendientes.");
            vacio.setStyle("-fx-font-size:12px; -fx-text-fill:" + C_TEXT_S + ";");
            listaMantenimientosBox.getChildren().add(vacio);
            return;
        }
        for (Mantenimiento m : pendientes) listaMantenimientosBox.getChildren().add(tarjetaMantenimiento(m));
    }

    private HBox tarjetaMantenimiento(Mantenimiento m) {
        HBox fila = new HBox(12);
        fila.setAlignment(Pos.CENTER_LEFT);
        fila.setPadding(new Insets(12));
        fila.setStyle("-fx-background-color:" + C_BG + "; -fx-background-radius:10;");

        VBox info = new VBox(3);
        String nombreCliente = m.getNombreCliente() != null ? m.getNombreCliente() : "—";
        Label lTipo = new Label(m.getTipoMantenimiento() + " — programado " + m.getFechaProgramada() + "  •  " + nombreCliente);
        lTipo.setStyle("-fx-font-size:13px; -fx-font-weight:bold; -fx-text-fill:" + C_TEXT + ";");
        Label lCasa = new Label(m.getCasa() != null ? m.getCasa().getDireccion() : "—");
        lCasa.setStyle("-fx-font-size:11px; -fx-text-fill:" + C_TEXT_S + ";");
        info.getChildren().addAll(lTipo, lCasa);
        HBox.setHgrow(info, Priority.ALWAYS);

        Label estado = new Label(m.estaVencido() ? "VENCIDO" : m.getEstado());
        estado.setStyle(estiloEstado(m.estaVencido() ? "CANCELADA" : m.getEstado()));

        Button btnRegistrar = accionBtn("Registrar realizado", C_SUCCESS);
        btnRegistrar.setOnAction(e -> registrarMantenimientoRealizado(m));

        fila.getChildren().addAll(info, estado, btnRegistrar);
        return fila;
    }

    private void registrarMantenimientoRealizado(Mantenimiento m) {
        Dialog<javafx.util.Pair<String, Double>> dialog = new Dialog<>();
        dialog.setTitle("Registrar mantenimiento realizado");
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        TextField txtTecnico = new TextField();
        txtTecnico.setPromptText("Nombre del técnico");
        TextField txtCosto = new TextField();
        txtCosto.setPromptText("Costo del mantenimiento");
        TextArea txtObs = new TextArea();
        txtObs.setPromptText("Observaciones");
        txtObs.setPrefRowCount(3);

        VBox contenido = new VBox(10, new Label("Técnico:"), txtTecnico,
                new Label("Costo:"), txtCosto, new Label("Observaciones:"), txtObs);
        contenido.setPadding(new Insets(16));
        dialog.getDialogPane().setContent(contenido);

        dialog.setResultConverter(bt -> {
            if (bt == ButtonType.OK) {
                try {
                    return new javafx.util.Pair<>(txtTecnico.getText().trim(),
                            Double.parseDouble(txtCosto.getText().trim().isEmpty() ? "0" : txtCosto.getText().trim()));
                } catch (NumberFormatException nfe) {
                    return null;
                }
            }
            return null;
        });

        Optional<javafx.util.Pair<String, Double>> resultado = dialog.showAndWait();
        resultado.ifPresent(datos -> ejecutar(() -> solarServicio.getGestorMantenimiento()
                .registrarMantenimientoRealizado(m.getIdMantenimiento(), datos.getKey(), datos.getValue(), txtObs.getText())));
    }

    // ── Helpers ─────────────────────────────────────────────────────────
    private Optional<String> pedirTecnico() {
        TextInputDialog dialog = new TextInputDialog();
        dialog.setTitle("Confirmar cita");
        dialog.setHeaderText(null);
        dialog.setContentText("Nombre del técnico asignado:");
        return dialog.showAndWait();
    }

    private void ejecutar(Runnable accion) {
        try {
            accion.run();
            refrescarCitas();
            refrescarMantenimientos();
        } catch (SistemaSolarException sse) {
            alerta("No se pudo completar la acción", sse.getMessage(), Alert.AlertType.ERROR);
        }
    }

    private Button accionBtn(String texto, String color) {
        Button b = new Button(texto);
        b.setStyle("-fx-background-color:" + color + "22; -fx-text-fill:" + color + ";"
                + "-fx-font-size:11px; -fx-font-weight:bold; -fx-cursor:hand;"
                + "-fx-background-radius:8; -fx-padding:6 12; -fx-border-color:" + color + "55; -fx-border-radius:8;");
        return b;
    }

    private String estiloEstado(String estado) {
        String color = switch (estado) {
            case "CONFIRMADA", "COMPLETADA", "COMPLETADO" -> C_SUCCESS;
            case "CANCELADA", "CANCELADO" -> C_ERROR;
            case "REPROGRAMADA" -> C_WARNING;
            default -> C_TEXT_S;
        };
        return "-fx-background-color:" + color + "22; -fx-text-fill:" + color + ";"
                + "-fx-font-size:11px; -fx-font-weight:bold; -fx-padding:5 12; -fx-background-radius:20;";
    }

    private void alerta(String titulo, String mensaje, Alert.AlertType tipo) {
        Alert a = new Alert(tipo);
        a.setTitle(titulo); a.setHeaderText(null); a.setContentText(mensaje);
        a.showAndWait();
    }
}