package sistemapanelessolares.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {

    public static Connection conectar() {
        try {
            Class.forName("org.postgresql.Driver");

            String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/solar_caribe");
            String user = System.getenv().getOrDefault("DB_USER", "postgres");
            String password = System.getenv().getOrDefault("DB_PASSWORD", "root");

            return DriverManager.getConnection(url, user, password);
        } catch (ClassNotFoundException e) {
            System.err.println("No se encontro el driver de PostgreSQL en el classpath.");
            return null;
        } catch (SQLException e) {
            System.err.println("No se pudo conectar a la base de datos: " + e.getMessage());
            return null;
        }
    }

    public static String getStatus() {
        String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/solar_caribe");
        String user = System.getenv().getOrDefault("DB_USER", "postgres");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "root");

        if (System.getenv("DB_URL") == null || System.getenv("DB_USER") == null || System.getenv("DB_PASSWORD") == null) {
            return "Base de datos configurada con los valores por defecto: " + url + " | usuario: " + user + " | password: root";
        }

        return "Base de datos preparada para: " + url + " | usuario: " + user;
    }
}