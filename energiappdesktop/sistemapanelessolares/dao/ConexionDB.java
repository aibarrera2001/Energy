package sistemapanelessolares.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {

    public static Connection conectar() {
        String url = System.getenv("DB_URL");
        String user = System.getenv("DB_USER");
        String password = System.getenv("DB_PASSWORD");

        if (url == null || user == null || password == null) {
            System.err.println("Faltan variables de entorno: DB_URL, DB_USER y DB_PASSWORD");
            return null;
        }

        try {
            Class.forName("org.postgresql.Driver");
            return DriverManager.getConnection(url, user, password);
        } catch (ClassNotFoundException e) {
            System.err.println("No se encontró el driver de PostgreSQL en el classpath.");
        } catch (SQLException e) {
            System.err.println("No se pudo conectar a la base de datos: " + e.getMessage());
        }
        return null;
    }

    public static String getStatus() {
        String url = System.getenv("DB_URL");
        String user = System.getenv("DB_USER");

        if (url == null || user == null || System.getenv("DB_PASSWORD") == null) {
            return "Base de datos sin configurar: define DB_URL, DB_USER y DB_PASSWORD";
        }
        return "Base de datos preparada para: " + url + " | usuario: " + user;
    }
}