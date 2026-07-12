package sistemapanelessolares.logica;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import sistemapanelessolares.excepciones.ServicioExternoException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

/**
 * Integración con la API de chat (DeepSeek, compatible con el formato de OpenAI).
 * Vive en logica porque orquesta una llamada externa y reglas de negocio
 * (system prompt); no es un dato de dominio.
 *
 * Ya no devuelve strings de error como "⚠ Error..." o "❌ Error...": ante
 * cualquier fallo lanza ServicioExternoException para que el llamador decida
 * cómo mostrarlo (ver ChatController).
 */
public class ChatBoot {

    private final String apiUrl;
    private final String apiKey;
    private final String modelo;
    private final String systemPrompt;
    private final HttpClient httpClient;

    public ChatBoot(String apiUrl, String apiKey, String systemPrompt) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.modelo = ConfiguracionAPI.obtenerModeloOpenAI();
        this.systemPrompt = systemPrompt;
        this.httpClient = HttpClient.newHttpClient();
    }

    public ChatBoot(String systemPrompt) {
        this.apiUrl = ConfiguracionAPI.obtenerURLOpenAI();
        this.apiKey = ConfiguracionAPI.obtenerClaveOpenAI();
        this.modelo = ConfiguracionAPI.obtenerModeloOpenAI();
        this.systemPrompt = systemPrompt;
        this.httpClient = HttpClient.newHttpClient();
    }

    public ChatBoot() {
        this.apiUrl = ConfiguracionAPI.obtenerURLOpenAI();
        this.apiKey = ConfiguracionAPI.obtenerClaveOpenAI();
        this.modelo = ConfiguracionAPI.obtenerModeloOpenAI();
        this.systemPrompt = "";
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * Envía un mensaje al modelo y devuelve el texto de la respuesta.
     * @throws ServicioExternoException si la API responde con error o falla la conexión
     */
    public String enviarMensaje(String mensaje) {
        try {
            JsonArray messages = new JsonArray();

            if (systemPrompt != null && !systemPrompt.isEmpty()) {
                JsonObject systemMessage = new JsonObject();
                systemMessage.addProperty("role", "system");
                systemMessage.addProperty("content", systemPrompt);
                messages.add(systemMessage);
            }

            JsonObject messageObj = new JsonObject();
            messageObj.addProperty("role", "user");
            messageObj.addProperty("content", mensaje);
            messages.add(messageObj);

            JsonObject payload = new JsonObject();
            payload.addProperty("model", modelo);
            payload.add("messages", messages);
            payload.addProperty("temperature", 0.7);
            payload.addProperty("max_tokens", 500);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString(), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();

                if (json.has("choices") && !json.getAsJsonArray("choices").isEmpty()) {
                    JsonObject firstChoice = json.getAsJsonArray("choices").get(0).getAsJsonObject();
                    if (firstChoice.has("message")) {
                        JsonObject message = firstChoice.getAsJsonObject("message");
                        if (message.has("content")) {
                            return message.get("content").getAsString();
                        }
                    }
                }
                return response.body();
            }

            throw new ServicioExternoException(
                "La API de chat respondió con error " + response.statusCode() + ": " + response.body());

        } catch (ServicioExternoException e) {
            throw e;
        } catch (Exception e) {
            throw new ServicioExternoException("Error de conexión al enviar mensaje al chat: " + e.getMessage(), e);
        }
    }

    public String obtenerApiUrl() {
        return apiUrl;
    }

    public String obtenerApiKey() {
        return "***clave_configurada***";
    }

    public String obtenerModelo() {
        return modelo;
    }
}