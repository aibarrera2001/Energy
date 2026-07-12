# ChatController - Guía de Integración con Base de Datos

## 📋 Descripción General

El `ChatController` mejorado ahora tiene capacidad de acceder a la base de datos a través de `SolarService`, permitiendo que el chatbot ofrezca información actualizada sobre:

- **Paneles solares disponibles** (nombre, tipo, potencia, eficiencia, precio)
- **Catálogo actualizado** en tiempo real desde la BD
- **Recomendaciones personalizadas** basadas en consumo del usuario
- **Detalles específicos** de cada panel

## 🔧 Arquitectura

```
ChatController
    ├── ChatBoot (OpenAI API)
    └── SolarService (Acceso a BD)
        ├── GestorPaneles
        ├── Registro
        ├── Autentificación
        └── HistorialChat
```

## 💻 Cómo Usar

### Opción 1: Con Acceso a Base de Datos (Recomendado)

```java
// En tu clase principal o vista
SolarService solarService = new SolarService();  // Con BD en memoria
// O: SolarService solarService = new SolarService(conexionDB);  // Con BD real

ChatController chatController = solarService.getChatController();

// El chat ahora tiene acceso a toda la información de la BD
String respuesta = chatController.procesarMensaje("¿Qué paneles solares tienen mejor eficiencia?");
System.out.println(respuesta);
```

### Opción 2: Sin Acceso a Base de Datos

```java
ChatController chatController = new ChatController();

// El chat funciona pero solo con información estática
String respuesta = chatController.procesarMensaje("¿Cuánto cuesta instalar 5 paneles?");
System.out.println(respuesta);
```

## 📚 Métodos Disponibles

### `procesarMensaje(String mensaje)`
- **Descripción:** Procesa un mensaje enriquecido con datos de BD si está disponible
- **Retorna:** Respuesta del chatbot contextualizada
- **Ejemplo:**
  ```java
  String respuesta = chatController.procesarMensaje("¿Qué paneles me recomiendas?");
  ```

### `obtenerListaPanelesDisponibles()`
- **Descripción:** Obtiene listado formateado de todos los paneles en la BD
- **Retorna:** String con información de cada panel
- **Ejemplo:**
  ```java
  String paneles = chatController.obtenerListaPanelesDisponibles();
  System.out.println(paneles);
  ```

### `obtenerDetallePanel(int idPanel)`
- **Descripción:** Obtiene información detallada de un panel específico
- **Parámetros:** ID del panel
- **Retorna:** Detalles completos del panel
- **Ejemplo:**
  ```java
  String detalles = chatController.obtenerDetallePanel(1);
  System.out.println(detalles);
  ```

### `obtenerRecomendacionPersonalizada(double consumoDiarioKWh)`
- **Descripción:** Genera recomendación personalizada basada en consumo
- **Parámetros:** Consumo diario en KWh
- **Retorna:** Recomendación con panel sugerido, cantidad y costo
- **Ejemplo:**
  ```java
  String recomendacion = chatController.obtenerRecomendacionPersonalizada(25.5);
  System.out.println(recomendacion);
  ```

## 🎯 Ejemplos de Uso Completo

### Ejemplo 1: Chat interactivo con BD

```java
public class EjemploChatConBD {
    public static void main(String[] args) {
        SolarService solarService = new SolarService();
        ChatController chatController = solarService.getChatController();

        // Chat 1: Preguntar sobre paneles
        String pregunta1 = "¿Qué tipos de paneles solares tienen disponibles?";
        System.out.println("Usuario: " + pregunta1);
        System.out.println("Bot: " + chatController.procesarMensaje(pregunta1));

        // Chat 2: Preguntar sobre costos
        String pregunta2 = "¿Cuánto cuesta instalar 8 paneles de 400W?";
        System.out.println("\nUsuario: " + pregunta2);
        System.out.println("Bot: " + chatController.procesarMensaje(pregunta2));

        // Chat 3: Obtener lista de paneles directamente
        System.out.println("\n" + chatController.obtenerListaPanelesDisponibles());

        // Chat 4: Recomendación personalizada
        String recomendacion = chatController.obtenerRecomendacionPersonalizada(20.0);
        System.out.println("\n" + recomendacion);
    }
}
```

### Ejemplo 2: Integración en Vista JavaFX

```java
public class ChatBootFXMejorado extends Application {
    private SolarService solarService;
    private ChatController chatController;
    private TextArea txtChat;
    private TextField txtInput;

    @Override
    public void start(Stage primaryStage) {
        // Inicializar servicio
        solarService = new SolarService();
        chatController = solarService.getChatController();

        // Crear interfaz
        VBox root = new VBox();
        txtChat = new TextArea();
        txtChat.setWrapText(true);
        txtInput = new TextField();
        
        Button btnEnviar = new Button("Enviar");
        btnEnviar.setOnAction(e -> enviarMensaje());

        root.getChildren().addAll(txtChat, new HBox(txtInput, btnEnviar));
        primaryStage.setScene(new Scene(root, 600, 400));
        primaryStage.show();
    }

    private void enviarMensaje() {
        String mensaje = txtInput.getText();
        if (!mensaje.isEmpty()) {
            txtChat.appendText("Tú: " + mensaje + "\n");
            
            // Procesar con BD integrada
            String respuesta = chatController.procesarMensaje(mensaje);
            txtChat.appendText("Bot: " + respuesta + "\n\n");
            
            txtInput.clear();
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
```

## 🔒 Seguridad y Configuración

### Sistema Prompt Dinámico
El prompt se genera dinámicamente incluyendo:
- Información actual de paneles de la BD
- Precios actualizados
- Capacidades del chatbot

### Enriquecimiento de Mensajes
Los mensajes se enriquecen automáticamente con contexto de BD:
```
Usuario pregunta: "¿Qué paneles disponibles tienen?"
Mensaje enriquecido: "¿Qué paneles disponibles tienen?
[Contexto BD: Paneles disponibles: SunPower Maxeon 3, Canadian Solar HiKu, ...]"
```

## ⚙️ Configuración Recomendada

### En SolarService
```java
// Con BD
SolarService service = new SolarService(conexionDB);

// Sin BD (datos en memoria)
SolarService service = new SolarService();
```

### En ChatController
```java
// Con acceso a BD (automático desde SolarService)
ChatController chat = solarService.getChatController();

// Sin acceso a BD (fallback estático)
ChatController chat = new ChatController();
```

## 📊 Flujo de Datos

```
Usuario escribe mensaje
        ↓
ChatController.procesarMensaje()
        ↓
Enriquecimiento con contexto BD (si está disponible)
        ↓
ChatBoot.enviarMensaje() → OpenAI
        ↓
Respuesta contextualizada con datos de EnergiApp
        ↓
Guardado en HistorialChat (opcional)
        ↓
Usuario recibe respuesta
```

## 🚀 Próximos Pasos

1. Integrar en tus vistas JavaFX (`IngresoFX`, `DashboardUsuarioFX`, etc.)
2. Guardar historial de chat con `procesarMensajeChat(idUsuario, mensaje)`
3. Mostrar recomendaciones personalizadas basadas en consumo
4. Permitir al usuario ver detalles de paneles desde el chat
