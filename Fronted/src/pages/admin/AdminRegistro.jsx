import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

export default function AdminRegistro() {
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    email: "",
    password: ""
  });
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.registro(formData);
      setMensaje({ tipo: "exito", texto: "Registro exitoso. Redirigiendo al login..." });
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al registrar la empresa." });
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Registro de Administrador / Empresa</h2>
      {mensaje.texto && (
        <p style={{ color: mensaje.tipo === "exito" ? "green" : "red" }}>{mensaje.texto}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Nombre de la Empresa:</label>
          <input
            type="text"
            name="nombreEmpresa"
            value={formData.nombreEmpresa}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Correo Corporativo:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button type="submit" style={{ width: "100%", padding: "10px", background: "#28a745", color: "#fff", border: "none" }}>
          Registrar Empresa
        </button>
      </form>
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        ¿Ya tienes cuenta? <Link to="/admin/login">Inicia Sesión</Link>
      </p>
    </div>
  );
}