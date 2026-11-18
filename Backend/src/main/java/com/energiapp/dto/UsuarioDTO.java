package com.energiapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class UsuarioDTO {
    private int idUsuario;
    private String nombre;
    private String apellido;
    private String rol;

    @JsonAlias({"email", "correo"})
    private String correo;

    private String telefono;

    @JsonAlias({"password", "contrasena"})
    private String contrasena;

    private String ciudad;

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
