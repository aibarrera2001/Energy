package com.energiapp.dto;

public class RegistroEmpresaAdminDTO {
    // Datos de la Empresa
    private String nombreEmpresa;
    private String nit;
    private String ciudadEmpresa;
    private String direccionEmpresa;
    private String telefonoEmpresa;
    private String emailEmpresa;
    private String tipoRegistro;          // "CREAR" o "UNIR"
    private Integer idEmpresaExistente;
    private String aportes;
    private String diferenciadores;
        
    // Datos del Administrador
    private String nombreAdmin;
    private String apellidoAdmin;
    private String telefonoAdmin;
    private String correoAdmin;
    private String contrasenaAdmin;

    // Getters y Setters
    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }
    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }
    public String getCiudadEmpresa() { return ciudadEmpresa; }
    public void setCiudadEmpresa(String ciudadEmpresa) { this.ciudadEmpresa = ciudadEmpresa; }
    public String getDireccionEmpresa() { return direccionEmpresa; }
    public void setDireccionEmpresa(String direccionEmpresa) { this.direccionEmpresa = direccionEmpresa; }
    public String getTelefonoEmpresa() { return telefonoEmpresa; }
    public void setTelefonoEmpresa(String telefonoEmpresa) { this.telefonoEmpresa = telefonoEmpresa; }
    public String getEmailEmpresa() { return emailEmpresa; }
    public String getTipoRegistro() { return tipoRegistro; }
    public void setTipoRegistro(String tipoRegistro) { this.tipoRegistro = tipoRegistro; }
    public Integer getIdEmpresaExistente() { return idEmpresaExistente; }
    public void setIdEmpresaExistente(Integer idEmpresaExistente) { this.idEmpresaExistente = idEmpresaExistente; }
    public String getAportes() { return aportes; }
    public void setAportes(String aportes) { this.aportes = aportes; }
    public String getDiferenciadores() { return diferenciadores; }
    public void setDiferenciadores(String diferenciadores) { this.diferenciadores = diferenciadores; }
    public void setEmailEmpresa(String emailEmpresa) { this.emailEmpresa = emailEmpresa; }
    public String getNombreAdmin() { return nombreAdmin; }
    public void setNombreAdmin(String nombreAdmin) { this.nombreAdmin = nombreAdmin; }
    public String getApellidoAdmin() { return apellidoAdmin; }
    public void setApellidoAdmin(String apellidoAdmin) { this.apellidoAdmin = apellidoAdmin; }
    public String getTelefonoAdmin() { return telefonoAdmin; }
    public void setTelefonoAdmin(String telefonoAdmin) { this.telefonoAdmin = telefonoAdmin; }
    public String getCorreoAdmin() { return correoAdmin; }
    public void setCorreoAdmin(String correoAdmin) { this.correoAdmin = correoAdmin; }
    public String getContrasenaAdmin() { return contrasenaAdmin; }
    public void setContrasenaAdmin(String contrasenaAdmin) { this.contrasenaAdmin = contrasenaAdmin; }
}