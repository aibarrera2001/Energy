package com.energiapp.dao;

import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioDAO {

    private final DataSource dataSource;

    public UsuarioDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Métodos para interactuar con energiapp_db usando JDBC
}