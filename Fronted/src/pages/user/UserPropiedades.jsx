import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function UserPropiedades() {
  const navigate = useNavigate();
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const userId = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : null;

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de registro (con o sin consumo mensual)
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const [form, setForm] = useState({
    tipoPropiedad: 'CASA',
    direccion: '',
    ciudad: 'Valledupar',
    latitud: 10.4631,
    longitud: -73.2532,
    areaM2: '',
    esCasaNueva: false,
    consumoMensual: '',
  });

  // Mapa { [idArticulo]: cantidad }
  const [cantidadesArticulos, setCantidadesArticulos] = useState({});

  useEffect(() => {
    obtenerPropiedades();
    obtenerCatalogo();
  }, []);

  const obtenerPropiedades = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/casas/usuario/${userId}`);
      if (res && res.ok) {
        const data = await res.json();
        setPropiedades(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerCatalogo = async () => {
    setCargandoCatalogo(true);
    try {
      const res = await fetch(`${API_URL}/api/casas/catalogo-articulos`);
      if (res && res.ok) {
        const data = await res.json();
        setCatalogo(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al cargar catálogo de artículos:', err);
    } finally {
      setCargandoCatalogo(false);
    }
  };

  const cambiarCantidad = (idArticulo, delta) => {
    setCantidadesArticulos((prev) => {
      const actual = prev[idArticulo] || 0;
      const nuevo = Math.max(0, actual + delta);
      return { ...prev, [idArticulo]: nuevo };
    });
  };

  // Cálculo previo en vivo para mostrar al usuario antes de guardar
  const consumoEstimadoCuestionario = catalogo.reduce((acc, art) => {
    const cant = cantidadesArticulos[art.idArticulo] || 0;
    return acc + cant * Number(art.consumoKwhMes || 0);
  }, 0);

  const handleRegistrarPropiedad = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (!userId) {
      setErrorForm('No se encontró la sesión del usuario. Vuelve a iniciar sesión.');
      return;
    }

    const tipo = form.tipoPropiedad.toUpperCase();
    const areaNum = form.areaM2 ? Number(form.areaM2) : null;

    // Construir lista de ItemCuestionarioDTO esperada por CasaDTO
    const articulosCuestionario = Object.entries(cantidadesArticulos)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([idArticulo, cantidad]) => ({
        idArticulo: Number(idArticulo),
        cantidad: Number(cantidad),
      }));

    if (form.esCasaNueva && articulosCuestionario.length === 0) {
      setErrorForm('Selecciona al menos un artículo del cuestionario para estimar el consumo.');
      return;
    }

    if (!form.esCasaNueva && (!form.consumoMensual || Number(form.consumoMensual) <= 0)) {
      setErrorForm('Ingresa un consumo mensual válido en kWh o marca la opción de casa nueva sin recibo.');
      return;
    }

    const payload = {
      idUsuario: userId,
      tipoPropiedad: tipo,
      direccion: form.direccion.trim(),
      ciudad: form.ciudad.trim(),
      latitud: Number(form.latitud) || 0,
      longitud: Number(form.longitud) || 0,
      areaTerrazaTechoM2: tipo === 'CASA' || tipo === 'APARTAMENTO' ? areaNum : null,
      areaBalconM2: tipo === 'EDIFICIO' ? areaNum : null,
      areaDisponibleM2: tipo === 'FINCA' ? areaNum : null,
      esCasaNueva: form.esCasaNueva,
      consumoMensual: form.esCasaNueva ? 0 : Number(form.consumoMensual),
      articulosCuestionario: form.esCasaNueva ? articulosCuestionario : [],
    };

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/casas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al registrar la propiedad');
      }

      // Reiniciar y recargar propiedades
      setForm({
        tipoPropiedad: 'CASA',
        direccion: '',
        ciudad: 'Valledupar',
        latitud: 10.4631,
        longitud: -73.2532,
        areaM2: '',
        esCasaNueva: false,
        consumoMensual: '',
      });
      setCantidadesArticulos({});
      setMostrarFormulario(false);
      await obtenerPropiedades();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Agrupar catálogo por categoría para mejor visualización
  const catalogoPorCategoria = catalogo.reduce((acc, item) => {
    const cat = item.categoria || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const inputStyle = {
    width: '100%',
    padding: '0.68rem 0.85rem',
    borderRadius: '10px',
    border: `1px solid ${CARIBE_THEME.borde}`,
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    color: CARIBE_THEME.petroleo,
    backgroundColor: CARIBE_THEME.blanco,
    boxSizing: 'border-box',
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
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '2rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: CARIBE_THEME.turquesa,
                }}
              >
                Gestión de Inmuebles · Región Caribe
              </span>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(1.65rem, 2.8vw, 2.15rem)',
                  fontWeight: 700,
                  color: CARIBE_THEME.petroleo,
                  margin: '0.3rem 0 0.25rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Mis Propiedades
              </h1>
              <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.95rem' }}>
                Administra tus inmuebles y perfiles de consumo energético para el dimensionamiento solar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorForm('');
                setMostrarFormulario((prev) => !prev);
              }}
              style={{
                ...caribePrimaryButtonStyle,
                width: 'auto',
                padding: '0.75rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <span>{mostrarFormulario ? 'Cerrar formulario' : '+ Registrar propiedad'}</span>
              {!mostrarFormulario && <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />}
            </button>
          </header>

          {/* FORMULARIO DE REGISTRO (CON RECIBO O CASA NUEVA SIN CONSUMO MENSUAL) */}
          {mostrarFormulario && (
            <form
              onSubmit={handleRegistrarPropiedad}
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '1.75rem',
                marginBottom: '2rem',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.2rem',
                  margin: '0 0 1.2rem 0',
                  color: CARIBE_THEME.petroleo,
                }}
              >
                Registrar nueva propiedad
              </h2>

              {errorForm && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    marginBottom: '1rem',
                  }}
                >
                  {errorForm}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Tipo de propiedad
                  </label>
                  <select
                    value={form.tipoPropiedad}
                    onChange={(e) => setForm({ ...form, tipoPropiedad: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="EDIFICIO">Edificio</option>
                    <option value="FINCA">Finca</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Ciudad / Municipio
                  </label>
                  <input
                    type="text"
                    required
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Ej: Valledupar"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    {form.tipoPropiedad === 'FINCA' ? 'Dirección / Vereda (opcional)' : 'Dirección'}
                  </label>
                  <input
                    type="text"
                    required={form.tipoPropiedad !== 'FINCA'}
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Ej: Calle 20 # 18d-41"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Área disponible (m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={form.areaM2}
                    onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
                    placeholder="Ej: 45"
                    style={inputStyle}
                  />
                </div>
              </div>

              {form.tipoPropiedad === 'FINCA' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Latitud GPS
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitud}
                      onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Longitud GPS
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitud}
                      onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* SELECTOR DE MODO DE CONSUMO */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: CARIBE_THEME.marfil,
                  marginBottom: '1.25rem',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.esCasaNueva}
                    onChange={(e) => setForm({ ...form, esCasaNueva: e.target.checked })}
                    style={{ width: '17px', height: '17px', accentColor: CARIBE_THEME.turquesa }}
                  />
                  <span>Propiedad nueva / aún no tengo recibo de consumo mensual</span>
                </label>

                {!form.esCasaNueva ? (
                  <div style={{ marginTop: '0.9rem', maxWidth: '300px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Consumo mensual del recibo (kWh/mes)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      required={!form.esCasaNueva}
                      value={form.consumoMensual}
                      onChange={(e) => setForm({ ...form, consumoMensual: e.target.value })}
                      placeholder="Ej: 380"
                      style={inputStyle}
                    />
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.86rem', color: CARIBE_THEME.pizarra }}>
                        Selecciona los electrodomésticos que usarás en la vivienda para calcular el consumo automáticamente:
                      </p>
                      <span
                        style={{
                          backgroundColor: CARIBE_THEME.blanco,
                          border: `1px solid ${CARIBE_THEME.borde}`,
                          padding: '0.35rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: CARIBE_THEME.turquesa,
                        }}
                      >
                        Estimado: {consumoEstimadoCuestionario.toFixed(1)} kWh/mes
                      </span>
                    </div>

                    {cargandoCatalogo ? (
                      <p style={{ fontSize: '0.88rem', color: CARIBE_THEME.pizarra }}>Cargando catálogo de artículos...</p>
                    ) : catalogo.length === 0 ? (
                      <p style={{ fontSize: '0.88rem', color: '#991B1B' }}>
                        No hay artículos en la tabla <code>catalogo_articulos</code>. Verifica que esté poblada en Supabase.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.entries(catalogoPorCategoria).map(([categoria, items]) => (
                          <div key={categoria}>
                            <div
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: CARIBE_THEME.pizarra,
                                marginBottom: '0.45rem',
                              }}
                            >
                              {categoria}
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: '0.6rem',
                              }}
                            >
                              {items.map((art) => {
                                const cant = cantidadesArticulos[art.idArticulo] || 0;
                                return (
                                  <div
                                    key={art.idArticulo}
                                    style={{
                                      backgroundColor: CARIBE_THEME.blanco,
                                      border: `1px solid ${cant > 0 ? CARIBE_THEME.turquesa : CARIBE_THEME.borde}`,
                                      borderRadius: '10px',
                                      padding: '0.6rem 0.8rem',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{art.nombre}</div>
                                      <div style={{ fontSize: '0.75rem', color: CARIBE_THEME.pizarra }}>
                                        {art.consumoKwhMes} kWh/mes c/u
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <button
                                        type="button"
                                        onClick={() => cambiarCantidad(art.idArticulo, -1)}
                                        style={{
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '6px',
                                          border: `1px solid ${CARIBE_THEME.borde}`,
                                          backgroundColor: CARIBE_THEME.marfil,
                                          cursor: 'pointer',
                                          fontWeight: 700,
                                        }}
                                      >
                                        -
                                      </button>
                                      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {cant}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => cambiarCantidad(art.idArticulo, 1)}
                                        style={{
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '6px',
                                          border: `1px solid ${CARIBE_THEME.borde}`,
                                          backgroundColor: CARIBE_THEME.marfil,
                                          cursor: 'pointer',
                                          fontWeight: 700,
                                        }}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: '10px',
                    border: `1px solid ${CARIBE_THEME.borde}`,
                    backgroundColor: CARIBE_THEME.blanco,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{
                    ...caribePrimaryButtonStyle,
                    width: 'auto',
                    padding: '0.75rem 1.4rem',
                    opacity: guardando ? 0.7 : 1,
                  }}
                >
                  {guardando ? 'Guardando...' : 'Guardar propiedad'}
                </button>
              </div>
            </form>
          )}

          {/* LISTADO DE PROPIEDADES */}
          {loading ? (
            <p style={{ color: CARIBE_THEME.pizarra }}>Cargando tus propiedades...</p>
          ) : propiedades.length === 0 ? (
            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '1.2rem',
                    margin: '0 0 0.4rem 0',
                    color: CARIBE_THEME.petroleo,
                  }}
                >
                  Aún no has registrado ninguna propiedad
                </h2>
                <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.94rem' }}>
                  Agrega una vivienda, finca o local comercial para estimar los paneles solares recomendados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormulario(true)}
                style={{
                  ...caribePrimaryButtonStyle,
                  width: 'auto',
                  padding: '0.8rem 1.3rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Registrar primera propiedad</span>
                <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {propiedades.map((prop) => (
                <article
                  key={prop.idCasa || prop.id}
                  style={{
                    backgroundColor: CARIBE_THEME.blanco,
                    border: `1px solid ${CARIBE_THEME.borde}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: CARIBE_THEME.turquesa,
                        }}
                      >
                        {prop.tipoPropiedad || 'INMUEBLE'} · {prop.ciudad}
                      </span>
                      <CaribeIcons.Building size={18} color={CARIBE_THEME.turquesa} />
                    </div>

                    <h2
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '1.15rem',
                        margin: '0 0 0.35rem 0',
                        color: CARIBE_THEME.petroleo,
                      }}
                    >
                      {prop.direccion || 'Ubicación por coordenadas GPS'}
                    </h2>

                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        backgroundColor: CARIBE_THEME.marfil,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.74rem', color: CARIBE_THEME.pizarra }}>
                          {prop.esCasaNueva ? 'Consumo estimado' : 'Consumo mensual'}
                        </span>
                        <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', color: CARIBE_THEME.petroleo }}>
                          {Number(prop.consumoMensual || 0).toFixed(1)} kWh
                        </strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.74rem', color: CARIBE_THEME.pizarra }}>
                          Área disponible
                        </span>
                        <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', color: CARIBE_THEME.turquesa }}>
                          {prop.areaDisponibleM2 || prop.areaTerrazaTechoM2 || prop.areaBalconM2 || '—'} m²
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/paneles')}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      border: `1px solid ${CARIBE_THEME.borde}`,
                      backgroundColor: CARIBE_THEME.blanco,
                      color: CARIBE_THEME.petroleo,
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Ver paneles recomendados →
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}