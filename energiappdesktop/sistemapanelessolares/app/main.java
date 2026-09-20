package sistemapanelessolares.app;

import java.sql.Connection;

import javafx.application.Application;
import javafx.stage.Stage;
import sistemapanelessolares.dao.ConexionDB;
import sistemapanelessolares.logica.SolarService;
import sistemapanelessolares.view.InicioSessionAdministrativoFX;

public class main extends Application {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("EnergiApp - Backend para empresa solar");
        System.out.println("Modo: una sola empresa");
        System.out.println("========================================");

        System.out.println(ConexionDB.getStatus());

        try (Connection conexion = ConexionDB.conectar()) {
            if (conexion != null && !conexion.isClosed()) {
                System.out.println("Conexion validada correctamente con la base de datos.");
            } else {
                System.out.println("No se pudo conectar. Revisa las variables DB_URL, DB_USER y DB_PASSWORD.");
            }
        } catch (Exception e) {
            System.err.println("Error al validar la conexion: " + e.getMessage());
        }

        System.out.println("Backend preparado para: inventario, citas, mantenimiento, clientes y gestion operativa.");
        launch(args);
    }

    @Override
    public void start(Stage stage) {
        SolarService solarService = new SolarService();
        Connection conexion = ConexionDB.conectar();
        if (conexion == null) {
            System.err.println("Advertencia: la aplicación inicia sin conexión a la base de datos.");
        }
        new InicioSessionAdministrativoFX(solarService, conexion).mostrarVentanaAcceso(stage);
    }
}