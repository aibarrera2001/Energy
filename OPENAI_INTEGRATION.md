# Integración OpenAI en ChatBoot

## 📋 Resumen
Se ha integrado **OpenAI API** en la clase `ChatBoot` para proporcionar respuestas de chat basadas en GPT.

## 🔧 Cambios Realizados

### 1. **Dependencias actualizadas** (`pom.xml`)
```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

### 2. **Nueva clase de configuración** 
📁 `src/main/java/sistemapanelessolares/logica/ConfiguracionAPI.java`
- Lee la clave de API desde `.env`
- Valida que la configuración esté presente
- Proporciona acceso seguro a las variables de entorno

### 3. **Clase ChatBoot actualizada**
📁 `src/main/java/sistemapanelessolares/dominio/ChatBoot.java`
- Cambio de Gemini a OpenAI API
- Nuevo constructor sin parámetros que carga automáticamente desde `.env`
- Formato JSON compatible con OpenAI
- Header de autenticación: `Authorization: Bearer {API_KEY}`

### 4. **Archivo de configuración**
📁 `.env` (no debe versionarse)
```
OPENAI_API_KEY=tu_clave_aqui
OPENAI_MODEL=gpt-3.5-turbo
```

## 💻 Cómo Usar

### Opción 1: Con constructor automático (Recomendado)
```java
import sistemapanelessolares.dominio.ChatBoot;

// Carga automáticamente desde .env
ChatBoot chat = new ChatBoot();
String respuesta = chat.enviarMensaje("¿Cuál es la temperatura ideal para paneles solares?");
System.out.println(respuesta);
```

### Opción 2: Con parámetros explícitos
```java
ChatBoot chat = new ChatBoot(
    "https://api.openai.com/v1/chat/completions",
    "sk-proj-..."
);
String respuesta = chat.enviarMensaje("Tu pregunta aquí");
```

## 🔐 Seguridad

✅ **La clave de API NO se guarda en Git**
- El archivo `.env` está en `.gitignore`
- Solo localmente en tu máquina

⚠️ **Importante:**
1. **Revoca tu clave actual** en [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Genera una nueva clave
3. Actualiza solo en el archivo `.env`

## 📦 Compilación

```bash
# Instalar dependencias
mvn clean install

# Compilar
mvn compile

# Ejecutar
mvn exec:java -Dexec.mainClass="sistemapanelessolares.app.main"
```

## 🎯 Parámetros del Modelo

En el archivo `.env` puedes ajustar:

- **OPENAI_MODEL**: 
  - `gpt-4` - Más potente (costo mayor)
  - `gpt-4-turbo` - Balance optimo
  - `gpt-3.5-turbo` - Más económico (default)

Dentro de `enviarMensaje()` también puedes ajustar:
- `temperature`: 0.7 (creatividad: 0-2)
- `max_tokens`: 500 (límite de respuesta)

## ✨ Ejemplo Completo

```java
public class EjemploChat {
    public static void main(String[] args) {
        try {
            // Crear instancia del ChatBoot
            ChatBoot chatBot = new ChatBoot();
            
            // Enviar mensaje
            String pregunta = "¿Cómo maximizar la eficiencia de paneles solares?";
            String respuesta = chatBot.enviarMensaje(pregunta);
            
            // Mostrar resultado
            System.out.println("📝 Pregunta: " + pregunta);
            System.out.println("🤖 Respuesta: " + respuesta);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

## 🚀 Próximos Pasos

1. Genera una nueva clave de OpenAI
2. Configúrala en el archivo `.env`
3. Ejecuta `mvn clean install` para descargar dependencias
4. Prueba el chat
