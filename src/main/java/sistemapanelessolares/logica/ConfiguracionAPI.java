package sistemapanelessolares.logica;

import io.github.cdimascio.dotenv.Dotenv;

public class ConfiguracionAPI {
    private static final Dotenv dotenv = Dotenv.load();
    
    // Mantenemos el nombre "OpenAI" en el método para no romper el resto del sistema,
    // pero por dentro busca la clave de DeepSeek en el archivo .env
    public static String obtenerClaveOpenAI() {
        String clave = dotenv.get("DEEPSEEK_API_KEY");
        if (clave == null || clave.isEmpty()) {
            throw new IllegalArgumentException("DEEPSEEK_API_KEY no está configurada en el archivo .env");
        }
        return clave;
    }
    
    public static String obtenerURLOpenAI() {
        return "https://api.deepseek.com/v1/chat/completions";
    }
    
    public static String obtenerModeloOpenAI() {
        return dotenv.get("DEEPSEEK_MODEL", "deepseek-chat");
    }
}