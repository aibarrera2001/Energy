import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

export default function RegistroCasa() {
  const navigate = useNavigate();
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const idUsuario = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : 1;

  const [formData, setFormData] = useState({
    tipoPropiedad: 'CASA',
    direccion: '',
    ciudad: 'Valledupar',
    latitud: 10.4631,
    longitud: -73.2532,
    areaTerrazaTechoM2: '',
    areaBalconM2: '',
    areaDisponibleM2: '',
    consumoMensual: '',
    esCasaNueva: false,
  });

  const [catalogoArticulos, setCatalogoArticulos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (formData.esCasaNueva && catalogoArticulos.length === 0) {
      setCargandoCatalogo(true);
      fetch('http://localhost:8080/api/casas/catalogo-articulos')
        .catch(() => fetch('/api/casas/catalogo-articulos'))
        .then((res) => (res && res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCatalogoArticulos(data);
        })
        .catch((err) => console.error('Error cargando catálogo de artículos:', err))
        .finally(() => setCargandoCatalogo(false));
    }
  }, [formData.esCasaNueva, catalogoArticulos.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCantidadChange = (idArticulo, nuevaCantidad) => {
    const valor = Math.max(0, Number(nuevaCantidad) || 0);
    setCantidades((prev) => {
      const copia = { ...prev };
      if (valor === 0) {
        delete copia[idArticulo];
      } else {
        copia[idArticulo] = valor;
      }
      return copia;
    });
  };

  const consumoEstimadoCuestionario = catalogoArticulos.reduce((total, art) => {
    const cant = cantidades[art.idArticulo] || 0;
    return total + art.consumoKwhMes * cant;
  }, 0);

  const articulosPorCategoria = catalogoArticulos.reduce((acc, art) => {
    if (!acc[art.categoria]) acc[art.categoria] = [];
    acc[art.categoria].push(art);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const articulosCuestionario = Object.entries(cantidades).map(([idArticulo, cantidad]) => ({
      idArticulo: Number(idArticulo),
      cantidad: Number(cantidad),
    }));

    if (formData.esCasaNueva && articulosCuestionario.length === 0) {
      alert('Por favor selecciona al menos un electrodoméstico o artículo en el cuestionario.');
      setEnviando(false);
      return;
    }

    const payload = {
      idUsuario,
      tipoPropiedad: formData.tipoPropiedad,
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad,
      latitud: Number(formData.latitud) || 0.0,
      longitud: Number(formData.longitud) || 0.0,
      areaTerrazaTechoM2: formData.areaTerrazaTechoM2 ? Number(formData.areaTerrazaTechoM2) : null,
      areaBalconM2: formData.areaBalconM2 ? Number(formData.areaBalconM2) : null,
      areaDisponibleM2: formData.areaDisponibleM2 ? Number(formData.areaDisponibleM2) : null,
      esCasaNueva: formData.esCasaNueva,
      consumoMensual: formData.esCasaNueva ? 0.0 : Number(formData.consumoMensual),
      articulosCuestionario: formData.esCasaNueva ? articulosCuestionario : [],
    };

    try {
      const res = await fetch('http://localhost:8080/api/casas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() =>
        fetch('/api/casas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      );

      if (res && res.ok) {
        const casaGuardada = await res.json();
        alert(
          `¡Propiedad registrada con éxito!\nConsumo mensual asignado: ${Number(
            casaGuardada.consumoMensual
          ).toFixed(2)} kWh/mes`
        );
        navigate('/propiedades');
      } else {
        const errorMsg = res ? await res.text() : 'Sin respuesta del servidor';
        alert(`No se pudo registrar la propiedad: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error registrando casa:', err);
      alert('Error de conexión con el servidor backend.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: CARIBE_THEME.marfil,
        color: CARIBE_THEME.petroleo,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <UserSidebar />

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width, 260px)',
          width: 'calc(100% - var(--sidebar-width, 260px))',
          padding: '2.25rem 2.5rem',
          overflowY: 'auto',
          textAlign: 'left',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Cabecera */}
          <header
            style={{
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '2rem',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: CARIBE_THEME.turquesa,
              }}
            >
              Nuevo Inmueble · Región Caribe
            </span>
            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)',
                fontWeight: 700,
                color: CARIBE_THEME.petroleo,
                margin: '0.3rem 0 0.25rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              Registrar Propiedad y Perfil Energético
            </h1>
            <p style={{ color: CARIBE_THEME.pizarra, fontSize: '0.95rem', margin: 0 }}>
              Ingresa los datos de tu inmueble en la región Caribe para dimensionar tu sistema fotovoltaico.
            </p>
          </header>

          {/* Tarjeta principal del formulario */}
          <div
            style={{
              backgroundColor: CARIBE_THEME.blanco,
              border: `1px solid ${CARIBE_THEME.borde}`,
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Datos básicos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={caribeLabelStyle}>Tipo de Propiedad *</label>
                  <select name="tipoPropiedad" value={formData.tipoPropiedad} onChange={handleChange} style={caribeInputStyle}>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="FINCA">Finca</option>
                    <option value="EDIFICIO">Edificio / Comercio</option>
                  </select>
                </div>

                <div>
                  <label style={caribeLabelStyle}>Ciudad / Municipio *</label>
                  <select name="ciudad" value={formData.ciudad} onChange={handleChange} style={caribeInputStyle}>
                    <option value="Valledupar">Valledupar</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Santa Marta">Santa Marta</option>
                    <option value="Montería">Montería</option>
                    <option value="Sincelejo">Sincelejo</option>
                    <option value="Riohacha">Riohacha</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={caribeLabelStyle}>
                    Dirección {formData.tipoPropiedad !== 'FINCA' ? '*' : '(Opcional para Finca)'}
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required={formData.tipoPropiedad !== 'FINCA'}
                    placeholder="Ej: Calle 16 # 9-45, Barrio Novalito"
                    style={caribeInputStyle}
                  />
                </div>
              </div>

              {/* Coordenadas y áreas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={caribeLabelStyle}>Latitud {formData.tipoPropiedad === 'FINCA' ? '*' : ''}</label>
                  <input type="number" step="any" name="latitud" value={formData.latitud} onChange={handleChange} style={caribeInputStyle} />
                </div>
                <div>
                  <label style={caribeLabelStyle}>Longitud {formData.tipoPropiedad === 'FINCA' ? '*' : ''}</label>
                  <input type="number" step="any" name="longitud" value={formData.longitud} onChange={handleChange} style={caribeInputStyle} />
                </div>
                <div>
                  <label style={caribeLabelStyle}>Área Techo/Terraza (m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="areaTerrazaTechoM2"
                    value={formData.areaTerrazaTechoM2}
                    onChange={handleChange}
                    placeholder="60"
                    style={caribeInputStyle}
                  />
                </div>
                <div>
                  <label style={caribeLabelStyle}>Área Disponible Total (m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="areaDisponibleM2"
                    value={formData.areaDisponibleM2}
                    onChange={handleChange}
                    placeholder="45"
                    style={caribeInputStyle}
                  />
                </div>
              </div>

              {/* Interruptor casa nueva vs recibo */}
              <div
                style={{
                  backgroundColor: CARIBE_THEME.marfil,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  borderRadius: '14px',
                  padding: '1.35rem',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: CARIBE_THEME.petroleo,
                    fontSize: '0.96rem',
                  }}
                >
                  <input
                    type="checkbox"
                    name="esCasaNueva"
                    checked={formData.esCasaNueva}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', accentColor: CARIBE_THEME.turquesa }}
                  />
                  ¿Es una casa nueva o aún no cuentas con factura de consumo energético mensual?
                </label>

                {!formData.esCasaNueva ? (
                  <div style={{ marginTop: '1.1rem' }}>
                    <label style={caribeLabelStyle}>Consumo Mensual Promedio (kWh/mes según tu recibo) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      name="consumoMensual"
                      value={formData.consumoMensual}
                      onChange={handleChange}
                      required={!formData.esCasaNueva}
                      placeholder="Ej: 420"
                      style={{ ...caribeInputStyle, maxWidth: '280px' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      borderTop: `1px solid ${CARIBE_THEME.borde}`,
                      paddingTop: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: '1.05rem', color: CARIBE_THEME.petroleo }}>
                          Cuestionario de Carga Energética
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.86rem', color: CARIBE_THEME.pizarra }}>
                          Indica la cantidad de equipos que utilizarás en la vivienda para calcular tu demanda mensual.
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: CARIBE_THEME.petroleo,
                          color: CARIBE_THEME.marfil,
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          textAlign: 'right',
                        }}
                      >
                        <small style={{ color: 'rgba(247, 244, 235, 0.72)', display: 'block', fontSize: '0.74rem' }}>
                          Consumo Estimado
                        </small>
                        <strong style={{ color: CARIBE_THEME.amarillo, fontFamily: "'Sora', sans-serif", fontSize: '1.1rem' }}>
                          {consumoEstimadoCuestionario.toFixed(1)} kWh/mes
                        </strong>
                      </div>
                    </div>

                    {cargandoCatalogo ? (
                      <p style={{ color: CARIBE_THEME.pizarra, textAlign: 'center', padding: '1rem' }}>
                        Cargando catálogo de electrodomésticos...
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.4rem' }}>
                        {Object.entries(articulosPorCategoria).map(([categoria, items]) => (
                          <div key={categoria}>
                            <h4
                              style={{
                                margin: '0 0 0.6rem 0',
                                fontSize: '0.78rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: CARIBE_THEME.turquesa,
                              }}
                            >
                              {categoria}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {items.map((art) => {
                                const cantActual = cantidades[art.idArticulo] || 0;
                                return (
                                  <div
                                    key={art.idArticulo}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      backgroundColor: CARIBE_THEME.blanco,
                                      border: cantActual > 0 ? `1.5px solid ${CARIBE_THEME.turquesa}` : `1px solid ${CARIBE_THEME.borde}`,
                                      padding: '0.65rem 0.9rem',
                                      borderRadius: '10px',
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: CARIBE_THEME.petroleo }}>{art.nombre}</div>
                                      <small style={{ color: CARIBE_THEME.pizarra }}>{art.consumoKwhMes} kWh/mes por unidad</small>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleCantidadChange(art.idArticulo, cantActual - 1)}
                                        style={counterBtnStyle}
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={cantActual}
                                        onChange={(e) => handleCantidadChange(art.idArticulo, e.target.value)}
                                        style={{
                                          width: '50px',
                                          textAlign: 'center',
                                          backgroundColor: CARIBE_THEME.marfil,
                                          border: `1px solid ${CARIBE_THEME.borde}`,
                                          borderRadius: '8px',
                                          color: CARIBE_THEME.petroleo,
                                          padding: '0.3rem',
                                          fontWeight: 700,
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleCantidadChange(art.idArticulo, cantActual + 1)}
                                        style={counterBtnStyle}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    backgroundColor: CARIBE_THEME.blanco,
                    color: CARIBE_THEME.petroleo,
                    border: `1px solid ${CARIBE_THEME.borde}`,
                    padding: '0.8rem 1.3rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  style={{
                    ...caribePrimaryButtonStyle,
                    width: 'auto',
                    padding: '0.8rem 1.65rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: enviando ? 0.7 : 1,
                    cursor: enviando ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{enviando ? 'Guardando propiedad...' : 'Guardar propiedad'}</span>
                  {!enviando && <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

const counterBtnStyle = {
  width: '28px',
  height: '28px',
  backgroundColor: CARIBE_THEME.petroleo,
  color: CARIBE_THEME.marfil,
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  cursor: 'pointer',
};