package com.energiapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
@PropertySource("classpath:conexionbd.properties")
public class EnergiAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnergiAppApplication.class, args);
    }
}
