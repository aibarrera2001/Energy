package sistemapanelessolares.dominio;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;

public class SolarAPIUsuario {

    // Base de datos estática ampliada de ciudades colombianas (HSP promedio diario anual)
    private static final Map<String, Double> MAPA_HORAS_SOL = new HashMap<>();

    static {
        // Región Caribe (Alta radiación)
        MAPA_HORAS_SOL.put("valledupar", 5.8);
        MAPA_HORAS_SOL.put("aguachica", 5.6);
        MAPA_HORAS_SOL.put("cartagena", 6.9);
        MAPA_HORAS_SOL.put("barranquilla", 7.0);
        MAPA_HORAS_SOL.put("santa marta", 6.2);
        MAPA_HORAS_SOL.put("riohacha", 6.5);
        MAPA_HORAS_SOL.put("sincelejo", 5.5);
        MAPA_HORAS_SOL.put("monteria", 5.2);

        // Región Andina (Variable por nubosidad/altitud)
        MAPA_HORAS_SOL.put("bogota", 3.6);
        MAPA_HORAS_SOL.put("medellin", 4.2);
        MAPA_HORAS_SOL.put("cali", 4.8);
        MAPA_HORAS_SOL.put("bucaramanga", 4.5);
        MAPA_HORAS_SOL.put("pereira", 4.0);
        MAPA_HORAS_SOL.put("manizales", 3.8);
        MAPA_HORAS_SOL.put("armenia", 4.1);
        MAPA_HORAS_SOL.put("ibague", 4.6);
        MAPA_HORAS_SOL.put("neiva", 5.1);
        MAPA_HORAS_SOL.put("cucuta", 5.3);
        MAPA_HORAS_SOL.put("pasto", 3.9);
        MAPA_HORAS_SOL.put("tunja", 3.7);
        MAPA_HORAS_SOL.put("popayan", 4.2);

        // Llanos Orientales y Amazonía
        MAPA_HORAS_SOL.put("villavicencio", 4.3);
        MAPA_HORAS_SOL.put("yopal", 4.7);
        MAPA_HORAS_SOL.put("florencia", 3.5);
        MAPA_HORAS_SOL.put("leticia", 3.8);
    }

    /**
     * Obtiene las horas de sol promedio diarias estimadas para una ubicación.
     * Intenta usar la API en línea; si falla o no hay coordenadas, usa los datos estáticos de la ciudad.
     */
    public static double obtenerHorasSolPico(double latitud, double longitud, String ciudad) {
        
        // Si hay coordenadas válidas, intentamos conectar a internet primero
        if (latitud != 0.0 || longitud != 0.0) {
            try {
                String url = String.format(Locale.US, "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&daily=shortwave_radiation_sum&timezone=auto", latitud, longitud);
                
                System.out.println("Conectando a: " + url);

                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                System.out.println("Respuesta recibida. Código de estado: " + response.statusCode());

                if (response.statusCode() == 200) {
                    JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
                    double radiacion = jsonResponse.get("daily").getAsJsonObject()
                                                  .get("shortwave_radiation_sum").getAsJsonArray()
                                                  .get(0).getAsDouble();
                    
                    double hsp = radiacion / 3.6; // Conversión de MJ/m² a HSP
                    
                    if (hsp > 0.5) {
                        System.out.println("Horas Sol Pico calculadas por API: " + hsp);
                        return hsp;
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠ Error de conexión con la API: " + e.getMessage() + ". Activando datos estáticos.");
            }
        }

        // --- PLAN DE RESPALDO: DATOS ESTÁTICOS ---
        if (ciudad != null) {
            String ciudadClave = ciudad.trim().toLowerCase();
            if (MAPA_HORAS_SOL.containsKey(ciudadClave)) {
                System.out.println(" ✔ Usando base de datos estática para: " + ciudad + " (" + MAPA_HORAS_SOL.get(ciudadClave) + "h)");
                return MAPA_HORAS_SOL.get(ciudadClave);
            }
        }
        
        System.out.println(" ⚠ Ciudad no encontrada en el catálogo estático o datos ausentes. Aplicando promedio general (5.0h).");
        return 5.0; // Fallback total
    }
}