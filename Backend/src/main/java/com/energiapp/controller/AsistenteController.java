package com.energiapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/asistente")
@CrossOrigin(origins = "*")
public class AsistenteController {

    private final DataSource dataSource;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public AsistenteController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostMapping("/consulta")
    public ResponseEntity<?> consultar(@RequestBody Map<String, Object> body) {
        int usuarioId = 0;
        if (body.get("usuarioId") != null) {
            usuarioId = Integer.parseInt(String.valueOf(body.get("usuarioId")));
        }
        String prompt = body.get("prompt") != null ? String.valueOf(body.get("prompt")).trim() : "";

        if (prompt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("respuesta", "Por favor escribe una consulta."));
        }

        PerfilEnergeticoUsuario perfil = obtenerPerfilUsuario(usuarioId);

        String respuestaFinal;
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            respuestaFinal = consultarGeminiConContexto(prompt, perfil);
        } else {
            respuestaFinal = generarRespuestaPersonalizadaLocal(prompt, perfil);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("respuesta", respuestaFinal);
        resp.put("propiedadesAnalizadas", perfil.totalPropiedades);
        resp.put("consumoMensualKwh", perfil.consumoMensualTotal);
        return ResponseEntity.ok(resp);
    }

    private PerfilEnergeticoUsuario obtenerPerfilUsuario(int usuarioId) {
        PerfilEnergeticoUsuario perfil = new PerfilEnergeticoUsuario();

        String sqlCasas = "SELECT id_casa, tipo_propiedad, ciudad, direccion, consumo_mensual " +
                          "FROM casas WHERE id_usuario = ? ORDER BY id_casa ASC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sqlCasas)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    perfil.totalPropiedades++;
                    double consumo = rs.getDouble("consumo_mensual");
                    perfil.consumoMensualTotal += consumo;
                    if (perfil.totalPropiedades == 1) {
                        perfil.ciudadPrincipal = rs.getString("ciudad");
                        perfil.tipoPropiedadPrincipal = rs.getString("tipo_propiedad");
                        perfil.direccionPrincipal = rs.getString("direccion");
                        perfil.consumoPrincipal = consumo;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error leyendo casas en AsistenteController: " + e.getMessage());
        }

        if (perfil.consumoPrincipal > 0) {
            double hsp = obtenerHspPorCiudad(perfil.ciudadPrincipal);
            perfil.hspEstimado = hsp;
            double potenciaRequeridaW = (perfil.consumoPrincipal / 30.0 / (hsp * 0.8)) * 1000.0;

            String sqlPanel = "SELECT nombre, potencia_w, precio FROM paneles_solares ORDER BY precio ASC LIMIT 1";
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sqlPanel);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    perfil.nombrePanelOptimo = rs.getString("nombre");
                    int potenciaW = rs.getInt("potencia_w");
                    double precioUnitario = rs.getDouble("precio");
                    int cantidad = (int) Math.ceil(potenciaRequeridaW / potenciaW);
                    if (cantidad < 1) cantidad = 1;

                    perfil.cantidadPanelesOptima = cantidad;
                    perfil.potenciaPanelW = potenciaW;
                    perfil.inversionEstimada = cantidad * precioUnitario;
                    perfil.generacionMensualEstimada = (cantidad * potenciaW / 1000.0) * hsp * 0.8 * 30.0;
                }
            } catch (Exception e) {
                System.err.println("Error leyendo paneles en AsistenteController: " + e.getMessage());
            }
        }

        String sqlCitas = "SELECT tipo_servicio, fecha, estado FROM citas WHERE id_usuario = ? ORDER BY fecha DESC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sqlCitas)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    perfil.ultimaCitaServicio = rs.getString("tipo_servicio");
                    perfil.ultimaCitaFecha = String.valueOf(rs.getDate("fecha"));
                    perfil.ultimaCitaEstado = rs.getString("estado");
                }
            }
        } catch (Exception ignored) {
        }

        return perfil;
    }

    private double obtenerHspPorCiudad(String ciudad) {
        if (ciudad == null) return 4.8;
        String c = ciudad.toLowerCase();
        if (c.contains("valledupar") || c.contains("riohacha") || c.contains("santa marta") || c.contains("barranquilla") || c.contains("cartagena")) {
            return 5.5;
        }
        if (c.contains("medellin") || c.contains("cali") || c.contains("bucaramanga") || c.contains("neiva")) {
            return 4.8;
        }
        if (c.contains("bogota") || c.contains("tunja") || c.contains("manizales")) {
            return 4.2;
        }
        return 4.8;
    }

    private String generarRespuestaPersonalizadaLocal(String prompt, PerfilEnergeticoUsuario p) {
        if (p.totalPropiedades == 0) {
            return "Aún no tienes propiedades registradas en tu cuenta. Registra tu inmueble con su consumo mensual en la pestaña **Propiedades** y podré calcular exactamente cuántos paneles necesitas, tu ahorro mensual en pesos y el retorno de inversión.";
        }

        String q = prompt.toLowerCase();
        double tarifaKwh = 850.0;
        double ahorroMensual = Math.min(p.consumoPrincipal, p.generacionMensualEstimada) * tarifaKwh;
        double ahorroAnual = ahorroMensual * 12.0;

        if (q.contains("panel") || q.contains("kit") || q.contains("cuanto") || q.contains("cuánto") || q.contains("recomienda") || q.contains("instalar")) {
            if (p.nombrePanelOptimo != null) {
                return String.format(
                    "Según los datos de tu **%s en %s** (consumo de **%.1f kWh/mes** y radiación solar de **%.1f HSP**), tu configuración óptima es de **%d paneles %s (%dW)**.\n\n" +
                    "• **Generación estimada:** %.1f kWh/mes\n" +
                    "• **Inversión aproximada:** $%,.0f COP\n" +
                    "• **Ahorro proyectado:** $%,.0f COP/mes (~$%,.0f COP/año)\n\n" +
                    "Puedes comparar todas las alternativas en **Paneles** o agendar tu visita técnica en **Citas**.",
                    p.tipoPropiedadPrincipal, p.ciudadPrincipal, p.consumoPrincipal, p.hspEstimado,
                    p.cantidadPanelesOptima, p.nombrePanelOptimo, p.potenciaPanelW,
                    p.generacionMensualEstimada, p.inversionEstimada, ahorroMensual, ahorroAnual
                );
            }
        }

        if (q.contains("ahorro") || q.contains("factura") || q.contains("pagar") || q.contains("dinero") || q.contains("inversion") || q.contains("inversión") || q.contains("retorno")) {
            double aniosRetorno = ahorroAnual > 0 ? (p.inversionEstimada / ahorroAnual) : 0;
            return String.format(
                "Para tu propiedad en **%s** con un consumo de **%.1f kWh/mes**, hoy pagas aproximadamente **$%,.0f COP/mes** (ref. $850/kWh).\n\n" +
                "Con el kit recomendado de **%d paneles (%dW)** generarías **%.1f kWh/mes**, logrando un **ahorro mensual de ~$%,.0f COP** ($%,.0f COP al año) y recuperando la inversión en aproximadamente **%.1f años**.",
                p.ciudadPrincipal, p.consumoPrincipal, p.consumoPrincipal * tarifaKwh,
                p.cantidadPanelesOptima, p.potenciaPanelW, p.generacionMensualEstimada,
                ahorroMensual, ahorroAnual, aniosRetorno
            );
        }

        if (q.contains("cita") || q.contains("visita") || q.contains("tecnico") || q.contains("técnico") || q.contains("mantenimiento")) {
            if (p.ultimaCitaServicio != null) {
                return String.format(
                    "Tienes registrada una solicitud de **%s** programada para el **%s** (estado actual: **%s**). " +
                    "Si deseas reprogramar o solicitar una nueva inspección para tu propiedad en **%s**, puedes hacerlo desde la pestaña **Citas**.",
                    p.ultimaCitaServicio, p.ultimaCitaFecha, p.ultimaCitaEstado, p.ciudadPrincipal
                );
            }
            return String.format(
                "Aún no tienes visitas técnicas agendadas para tu propiedad en **%s**. Te recomiendo agendar una **Visita Técnica de Viabilidad** o **Instalación de Paneles Solares** en la pestaña **Citas** para validar cubierta y acometida eléctrica.",
                p.ciudadPrincipal
            );
        }

        return String.format(
            "Analizando tu perfil en **%s** (consumo actual: **%.1f kWh/mes**):\n\n" +
            "1. **Optimización inmediata:** Programa electrodomésticos de alto consumo (aire acondicionado, lavadora, plancha) entre las **10:00 a.m. y las 3:00 p.m.**, franja de máxima irradiación en %s (%.1f HSP).\n" +
            "2. **Autosuficiencia solar:** Con **%d paneles %s**, cubrirías hasta **%.1f kWh/mes**, ahorrando cerca de **$%,.0f COP mensuales**.\n\n" +
            "¿Quieres que detalle el retorno de inversión o revisemos el estado de tus citas técnicas?",
            p.ciudadPrincipal, p.consumoPrincipal, p.ciudadPrincipal, p.hspEstimado,
            p.cantidadPanelesOptima, p.nombrePanelOptimo != null ? p.nombrePanelOptimo : "solares",
            p.generacionMensualEstimada, ahorroMensual
        );
    }

    private String consultarGeminiConContexto(String promptUsuario, PerfilEnergeticoUsuario p) {
        try {
            String contextoSistema = String.format(
                "Eres el Asistente IA experto de EnergiApp. Responde de forma clara, cercana y personalizada usando los datos reales del usuario: " +
                "Propiedades=%d, Ciudad=%s, Tipo=%s, ConsumoMensual=%.1f kWh, HSP=%.1f, KitOptimo=%d paneles %s (%dW), GeneracionEstimada=%.1f kWh/mes, Inversion=$%.0f COP, UltimaCita=%s (%s). " +
                "Pregunta del usuario: %s",
                p.totalPropiedades, p.ciudadPrincipal, p.tipoPropiedadPrincipal, p.consumoPrincipal,
                p.hspEstimado, p.cantidadPanelesOptima, p.nombrePanelOptimo, p.potenciaPanelW,
                p.generacionMensualEstimada, p.inversionEstimada, p.ultimaCitaServicio, p.ultimaCitaEstado, promptUsuario
            );

            String escaped = contextoSistema.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
            String jsonBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + escaped + "\"}]}]}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                String body = response.body();
                int idx = body.indexOf("\"text\":");
                if (idx != -1) {
                    int start = body.indexOf("\"", idx + 7) + 1;
                    int end = body.indexOf("\"", start);
                    if (end > start) {
                        return body.substring(start, end).replace("\\n", "\n").replace("\\\"", "\"");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Fallback a motor local por error Gemini API: " + e.getMessage());
        }
        return generarRespuestaPersonalizadaLocal(promptUsuario, p);
    }

    private static class PerfilEnergeticoUsuario {
        int totalPropiedades = 0;
        double consumoMensualTotal = 0;
        String ciudadPrincipal = "Valledupar";
        String tipoPropiedadPrincipal = "Casa";
        String direccionPrincipal = "";
        double consumoPrincipal = 0;
        double hspEstimado = 5.5;
        String nombrePanelOptimo = null;
        int cantidadPanelesOptima = 0;
        int potenciaPanelW = 0;
        double inversionEstimada = 0;
        double generacionMensualEstimada = 0;
        String ultimaCitaServicio = null;
        String ultimaCitaFecha = null;
        String ultimaCitaEstado = null;
    }
}