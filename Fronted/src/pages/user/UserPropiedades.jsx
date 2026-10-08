import { useEffect, useState } from "react";
import { usuarioApi } from "../../api/usuarioApi";

export default function UserPropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [nuevaPropiedad, setNuevaPropiedad] = useState({ nombre: "", direccion: "", consumoKw: "" });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.id) {
      cargarPropiedades();
    }
  }, []);

  const cargarPropiedades = async () => {
    try {
      const data = await usuarioApi.getPropiedades(user.id);
      setPropiedades(data || []);
    } catch (err) {
      console.error("Error al cargar propiedades:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await usuarioApi.guardarPropiedad(user.id, nuevaPropiedad);
      setNuevaPropiedad({ nombre: "", direccion: "", consumoKw: "" });
      cargarPropiedades();
    } catch (err) {
      alert("Error al guardar la propiedad");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Gestión de Propiedades</h2>

      {/* Formulario de Alta */}
      <form onSubmit={handleCrear} style={{ marginBottom: "30px", background: "#f8f9fa", padding: "15px", borderRadius: "5px" }}>
        <h3>Agregar Nueva Propiedad</h3>
        <input
          type="text"
          placeholder="Nombre de la propiedad (Ej: Sede Principal)"
          value={nuevaPropiedad.nombre}
          onChange={(e) => setNuevaPropiedad({ ...nuevaPropiedad, nombre: e.target.value })}
          required
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Dirección"
          value={nuevaPropiedad.direccion}
          onChange={(e) => setNuevaPropiedad({ ...nuevaPropiedad, direccion: e.target.value })}
          required
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <input
          type="number"
          placeholder="Consumo Promedio (kWh)"
          value={nuevaPropiedad.consumoKw}
          onChange={(e) => setNuevaPropiedad({ ...nuevaPropiedad, consumoKw: e.target.value })}
          required
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", background: "#007bff", color: "#fff", border: "none" }}>
          Guardar
        </button>
      </form>

      {/* Lista / Tabla de Propiedades */}
      <h3>Listado de Propiedades</h3>
      {loading ? (
        <p>Cargando datos...</p>
      ) : propiedades.length === 0 ? (
        <p>No hay propiedades registradas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "10px" }}>Nombre</th>
              <th style={{ padding: "10px" }}>Dirección</th>
              <th style={{ padding: "10px" }}>Consumo Promedio</th>
            </tr>
          </thead>
          <tbody>
            {propiedades.map((prop, idx) => (
              <tr key={prop.id || idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{prop.nombre}</td>
                <td style={{ padding: "10px" }}>{prop.direccion}</td>
                <td style={{ padding: "10px" }}>{prop.consumoKw} kWh</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}