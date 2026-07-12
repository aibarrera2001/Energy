package sistemapanelessolares.app;

import java.sql.Connection;
import javafx.application.Application;
import sistemapanelessolares.dao.ConexionDB;
import sistemapanelessolares.view.IngresoFX;

public class main {
    public static void main(String[] args) {

        System.out.println("Iniciando EnergiApp y conectando a Supabase...");

        Connection conexion = ConexionDB.conectar();

        if (conexion != null) {
            System.out.println("Conexion exitosa a Supabase!");
        } else {
            System.err.println("No se pudo conectar. La app iniciara sin persistencia.");
        }

        IngresoFX.setConexionDB(conexion);
        System.out.println("Desplegando Interfaz Grafica...");
        Application.launch(IngresoFX.class, args);
    }
}