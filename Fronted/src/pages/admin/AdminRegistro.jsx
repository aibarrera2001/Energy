import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminRegistro() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('CREAR'); // 'CREAR' o 'UNIR'
  const [empresasExistentes, setEmpresasExistentes] = useState([]);

  const [formData, setFormData] = useState({
    nombreAdmin: '',
    correoAdmin: '',
    telefonoAdmin: '',
    contrasena: '',
    contrasenaConf: '',
    empresaIdExistente: '',
    nombreEmpresa: '',
    nit: '',
    ciudad: 'Valledupar',
    direccion: '',
    telefonoEmpresa: '',
    emailEmpresa: '',
    aportes: '',
    diferenciadores: ''
  });

  const [paneles, setPaneles] = useState([
    { nombre: 'Panel X200', tipo: 'Monocristalino', potencia: 450, eficiencia: 20.5, stock: 10, precio: 500000 }
  ]);
  // 1. Cargar lista de empresas con la ruta Proxy de Vite (/api/admin/empresas)
  useEffect(() => {
    let mounted = true;

    if (modo === 'UNIR') {
      fetch('/api/admin/empresas')
        .then((res) => {
          if (!res.ok) throw new Error('Servidor no disponible');
          return res.json();
        })
        .then((data) => {
          if (mounted) {
            if (Array.isArray(data) && data.length > 0) {
              setEmpresasExistentes(data);
            } else {
              setEmpresasExistentes([
                { idEmpresa: 1, nombre: 'Solar Caribe SAS', nit: '900123456-1', ciudad: 'Valledupar' }
              ]);
            }
          }
        })
        .catch(() => {
          if (mounted) {
            setEmpresasExistentes([
              { idEmpresa: 1, nombre: 'Solar Caribe SAS', nit: '900123456-1', ciudad: 'Valledupar' }
            ]);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [modo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePanelChange = (index, field, value) => {
    const nuevosPaneles = [...paneles];
    nuevosPaneles[index][field] = value;
    setPaneles(nuevosPaneles);
  };

  const agregarPanel = () => {
    setPaneles([...paneles, { nombre: '', tipo: 'Monocristalino', potencia: 400, eficiencia: 20, stock: 5, precio: 450000 }]);
  };

  const removerPanel = (index) => {
    setPaneles(paneles.filter((_, i) => i !== index));
  };

  // 2. Enviar registro con parseo numérico estricto para evitar error 500 en Spring Boot
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contrasena !== formData.contrasenaConf) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const [nombre, ...resto] = formData.nombreAdmin.trim().split(' ');

    const payload = {
      tipoRegistro: modo,
      nombreAdmin: nombre,
      apellidoAdmin: resto.join(' ') || '-',
      correoAdmin: formData.correoAdmin,
      telefonoAdmin: formData.telefonoAdmin,
      contrasenaAdmin: formData.contrasena,
      idEmpresaExistente: modo === 'UNIR' ? Number(formData.empresaIdExistente) : null,
      nombreEmpresa: formData.nombreEmpresa,
      nit: formData.nit,
      ciudadEmpresa: formData.ciudad,
      direccionEmpresa: formData.direccion,
      telefonoEmpresa: formData.telefonoEmpresa,
      emailEmpresa: formData.emailEmpresa,
      aportes: formData.aportes,
      diferenciadores: formData.diferenciadores
    };

    try {
      const res = await fetch('/api/admin/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const mensajeText = await res.text();
        alert(mensajeText || 'Registro completado correctamente.');
        navigate('/admin-login');
      } else {
        const errorText = await res.text();
        alert(`Error en el servidor (${res.status}): ${errorText}`);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      alert('Error de conexión con el servidor Spring Boot.');
    }
  };

  return (
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', padding: '2rem 1rem', color: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem' }}>
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>⚡</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0' }}>Registro de Administrador</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>Energiapp • Región Caribe Colombiana</p>
        </div>

        {/* Pestañas para elegir modo */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', backgroundColor: '#0F172A', padding: '0.4rem', borderRadius: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setModo('CREAR')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: modo === 'CREAR' ? '#6366F1' : 'transparent',
              color: modo === 'CREAR' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            🏢 Crear Nueva Empresa
          </button>
          <button
            type="button"
            onClick={() => setModo('UNIR')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: modo === 'UNIR' ? '#6366F1' : 'transparent',
              color: modo === 'UNIR' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            🤝 Unirme a Empresa Existente
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* DATOS DEL ADMINISTRADOR */}
          <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#818CF8', marginBottom: '1rem' }}>👤 Datos del Administrador</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Nombre Completo *</label>
                <input type="text" name="nombreAdmin" value={formData.nombreAdmin} onChange={handleChange} required placeholder="Ana Martínez" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Correo Electrónico *</label>
                <input type="email" name="correoAdmin" value={formData.correoAdmin} onChange={handleChange} required placeholder="admin@empresa.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Teléfono *</label>
                <input type="tel" name="telefonoAdmin" value={formData.telefonoAdmin} onChange={handleChange} required placeholder="+57 3001234567" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Contraseña *</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="••••••••" minLength={8} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Confirmar Contraseña *</label>
                <input type="password" name="contrasenaConf" value={formData.contrasenaConf} onChange={handleChange} required placeholder="••••••••" minLength={8} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* OPCIÓN: UNIRSE A EMPRESA EXISTENTE */}
          {modo === 'UNIR' && (
            <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#818CF8', marginBottom: '1rem' }}>🏢 Seleccionar Empresa Registrada</h3>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Empresa *</label>
                <select name="empresaIdExistente" value={formData.empresaIdExistente} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Selecciona una empresa --</option>
                  {empresasExistentes.map((emp) => (
                    <option key={emp.idEmpresa || emp.id_empresa} value={emp.idEmpresa || emp.id_empresa}>
                      {emp.nombre} (NIT: {emp.nit}) - {emp.ciudad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* OPCIÓN: CREAR NUEVA EMPRESA */}
          {modo === 'CREAR' && (
            <>
              <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#818CF8', marginBottom: '1rem' }}>📋 Datos Básicos de la Empresa</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Nombre de la Empresa *</label>
                    <input type="text" name="nombreEmpresa" value={formData.nombreEmpresa} onChange={handleChange} required placeholder="Solar Caribe SAS" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>NIT *</label>
                    <input type="text" name="nit" value={formData.nit} onChange={handleChange} required placeholder="900123456-1" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Ciudad *</label>
                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required placeholder="Valledupar" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Dirección *</label>
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required placeholder="Cra 7 #12-34" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Teléfono Empresa *</label>
                    <input type="tel" name="telefonoEmpresa" value={formData.telefonoEmpresa} onChange={handleChange} required placeholder="+57 3009998877" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>Email Empresa *</label>
                    <input type="email" name="emailEmpresa" value={formData.emailEmpresa} onChange={handleChange} required placeholder="contacto@empresa.com" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>¿Qué aporta su empresa? *</label>
                    <textarea name="aportes" value={formData.aportes} onChange={handleChange} required placeholder="Instalación y mantenimiento fotovoltaico..." style={{ ...inputStyle, minHeight: '60px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>¿En qué destaca? (Diferenciadores) *</label>
                    <textarea name="diferenciadores" value={formData.diferenciadores} onChange={handleChange} required placeholder="GarantíaExtendida, Servicio 24/7..." style={{ ...inputStyle, minHeight: '60px' }} />
                  </div>
                </div>
              </div>

              {/* INVENTARIO DE PANELES */}
              <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#818CF8', margin: 0 }}>🔋 Inventario Inicial de Paneles</h3>
                  <button type="button" onClick={agregarPanel} style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                    + Agregar Panel
                  </button>
                </div>

                {paneles.map((p, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Modelo" value={p.nombre} onChange={(e) => handlePanelChange(index, 'nombre', e.target.value)} required style={inputStyle} />
                    <input type="text" placeholder="Tipo" value={p.tipo} onChange={(e) => handlePanelChange(index, 'tipo', e.target.value)} required style={inputStyle} />
                    <input type="number" placeholder="W" value={p.potencia} onChange={(e) => handlePanelChange(index, 'potencia', e.target.value)} required style={inputStyle} />
                    <input type="text" placeholder="%" value={p.eficiencia} onChange={(e) => handlePanelChange(index, 'eficiencia', e.target.value)} required style={inputStyle} />
                    <input type="number" placeholder="Stock" value={p.stock} onChange={(e) => handlePanelChange(index, 'stock', e.target.value)} required style={inputStyle} />
                    <input type="number" placeholder="Precio ($)" value={p.precio} onChange={(e) => handlePanelChange(index, 'precio', e.target.value)} required style={inputStyle} />
                    {paneles.length > 1 && (
                      <button type="button" onClick={() => removerPanel(index)} style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/admin-login')} style={{ flex: 1, padding: '0.85rem', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ flex: 2, padding: '0.85rem', backgroundColor: '#6366F1', color: '#FFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              Registrar Administrador
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem',
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '0.4rem',
  color: '#FFFFFF',
  fontSize: '0.9rem',
  boxSizing: 'border-box'
};