package com.energiapp.dto;

public class AdminAuthResponseDTO {
    private Integer idAdmin;
    private String nombreAdmin;
    private String correoAdmin;
    private String rol;
    
    // Información de la Empresa asociada
    private Integer idEmpresa;
    private String nombreEmpresa;
    private String nitEmpresa;
    private String ciudadEmpresa;
    private String direccionEmpresa;
    private String telefonoEmpresa;
    private String emailEmpresa;

    // Getters y Setters
    public Integer getIdAdmin() { return idAdmin; }
    public void setIdAdmin(Integer idAdmin) { this.idAdmin = idAdmin; }
    public String getNombreAdmin() { return nombreAdmin; }
    public void setNombreAdmin(String nombreAdmin) { this.nombreAdmin = nombreAdmin; }
    public String getCorreoAdmin() { return correoAdmin; }
    public void setCorreoAdmin(String correoAdmin) { this.correoAdmin = correoAdmin; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Integer getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Integer idEmpresa) { this.idEmpresa = idEmpresa; }
    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }
    public String getNitEmpresa() { return nitEmpresa; }
    public void setNitEmpresa(String nitEmpresa) { this.nitEmpresa = nitEmpresa; }
    public String getCiudadEmpresa() { return ciudadEmpresa; }
    public void setCiudadEmpresa(String ciudadEmpresa) { this.ciudadEmpresa = ciudadEmpresa; }
    public String getDireccionEmpresa() { return direccionEmpresa; }
    public void setDireccionEmpresa(String direccionEmpresa) { this.direccionEmpresa = direccionEmpresa; }
    public String getTelefonoEmpresa() { return telefonoEmpresa; }
    public void setTelefonoEmpresa(String telefonoEmpresa) { this.telefonoEmpresa = telefonoEmpresa; }
    public String getEmailEmpresa() { return emailEmpresa; }
    public void setEmailEmpresa(String emailEmpresa) { this.emailEmpresa = emailEmpresa; }
}