import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./General.css";

const API_BASE_URL = "http://localhost:60496/api";
const API_ENDPOINTS = {
  gastos: "/Gasto",
  ingresos: "/Ingreso",
  usuarios: "/Usuarios",
  ahorros: "/MetaAhorro"
};

const GastoIngreso = () => {
  const [mostrarSaludo, setMostrarSaludo] = useState(true);
  const [datosGastos, setDatosGastos] = useState([]);
  const [datosIngresos, setDatosIngresos] = useState([]);
  const [metasAhorro, setMetasAhorro] = useState([]);

  const COLORES = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);
    return () => clearTimeout(temporizador);
  }, []);

  useEffect(() => {
    obtenerDatos();
  }, []);

  // --- Lógica de API (Mantenida igual) ---
  const obtenerDatos = () => {
    const token = localStorage.getItem("Token");
    if (!token) return;
    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken/${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        let idusuario = data.IdUsuario;
        obtenerGastos(idusuario);
        obtenerIngresos(idusuario);
        obtenerAhorros(idusuario);
      })
      .catch((error) => console.error("Error identificando usuario:", error));
  };

  const obtenerGastos = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.gastos}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const gastosProcesados = data.map((item) => ({
          name: item.Descripcion || "Sin descripción",
          valor: Number(item.MontoGasto) || 0,
        }));
        setDatosGastos(gastosProcesados);
      })
      .catch((error) => console.error("Error gastos:", error));
  };

  const obtenerIngresos = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ingresos}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const ingresosProcesados = data.map((item) => ({
          name: item.Descripcion || "Sin Descripción",
          valor: Number(item.MontoIngreso) || 0,
        }));
        setDatosIngresos(ingresosProcesados);
      })
      .catch((error) => console.error("Error ingresos:", error));
  };

  const obtenerAhorros = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const metasProcesadas = data.map((item) => ({
          etiqueta: item.Nombre || "Meta de ahorro",
          actual: Number(item.MontoGuardado ?? 0),
          objetivo: Number(item.MontoObjetivo ?? 0),
        }));
        setMetasAhorro(metasProcesadas);
      })
      .catch((error) => console.error("Error ahorros:", error));
  };

  const calcularTotal = (datos) => datos.reduce((acum, item) => acum + Number(item.valor || 0), 0);
  const obtenerTopCinco = (items) => [...items].sort((a, b) => b.valor - a.valor).slice(0, 5);

  const renderCenterLabel = ({ cx, cy }, total) => (
    <>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight="600">Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#c8b277" fontSize={16} fontWeight="700">
        ${total.toLocaleString()}
      </text>
    </>
  );

  // --- Componente de Estado Vacío Reutilizable ---
  const EstadoVacio = ({ titulo, mensaje, icono = "📊", sugerencia }) => (
    <div className="tarjeta-general aviso-vacio">
      {titulo && <h3>{titulo}</h3>}
      <div className="contenido-aviso-vacio">
        <div className="icono-placeholder">{icono}</div>
        <p>{mensaje}</p>
        <span className="sugerencia">{sugerencia || "Registra movimientos para ver el progreso aquí."}</span>
      </div>
    </div>
  );

  const BarraProgreso = ({ actual, objetivo, etiqueta }) => {
    const porcentaje = objetivo > 0 ? Math.min(100, (actual / objetivo) * 100) : 0;
    return (
      <div className="item-progreso-general">
        <div className="info-progreso-general">
          <span style={{ fontWeight: "500", color: "#ffffff" }}>{etiqueta}</span>
          <span style={{ color: "#c8b277", fontWeight: "bold" }}>{porcentaje.toFixed(0)}%</span>
        </div>
        <div className="pista-barra-general">
          <div className="relleno-barra-general" style={{ width: `${porcentaje}%` }} />
        </div>
        <div className="texto-monto-general">
          ${actual.toLocaleString()} / ${objetivo.toLocaleString()}
        </div>
      </div>
    );
  };

  let nombre = localStorage.getItem("Nombre");
  let apellido = localStorage.getItem("Apellido");

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general">
        <h2>{mostrarSaludo ? `¡Bienvenido, ${nombre} ${apellido}!` : "Resumen Financiero"}</h2>
        <p style={{ color: "#888888" }}>Gestioná tu patrimonio en FinanzARC</p>
      </div>

      <div className="panel-graficos-general">
        {/* GRÁFICO GASTOS */}
        {datosGastos.length > 0 ? (
          <div className="tarjeta-general">
            <h3>Gastos por Categoría</h3>
            <div className="grafico-con-leyenda">
              <div className="grafico-pie">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={datosGastos}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      label={(props) => renderCenterLabel(props, calcularTotal(datosGastos))}
                      labelLine={false}
                    >
                      {datosGastos.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200,178,119,0.3)", color: "#fff", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="leyenda-grafico">
                {obtenerTopCinco(datosGastos).map((item, index) => (
                  <div className="item-leyenda" key={index}>
                    <span className="item-color-circulo" style={{ backgroundColor: COLORES[index % COLORES.length] }} />
                    <div className="leyenda-texto">
                      <span>{item.name}</span>
                      <strong>${item.valor.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EstadoVacio titulo="Gastos por Categoría" mensaje="No se encontraron gastos registrados." />
        )}

        {/* GRÁFICO INGRESOS */}
        {datosIngresos.length > 0 ? (
          <div className="tarjeta-general">
            <h3>Fuentes de Ingreso</h3>
            <div className="grafico-con-leyenda">
              <div className="grafico-pie">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={datosIngresos}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      label={(props) => renderCenterLabel(props, calcularTotal(datosIngresos))}
                      labelLine={false}
                    >
                      {datosIngresos.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200,178,119,0.3)", color: "#fff", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="leyenda-grafico">
                {obtenerTopCinco(datosIngresos).map((item, index) => (
                  <div className="item-leyenda" key={index}>
                    <span className="item-color-circulo" style={{ backgroundColor: COLORES[index % COLORES.length] }} />
                    <div className="leyenda-texto">
                      <span>{item.name}</span>
                      <strong>${item.valor.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EstadoVacio titulo="Fuentes de Ingreso" mensaje="No se encontraron ingresos registrados." />
        )}
      </div>

      {/* SECCIÓN AHORROS UNIFICADA */}
      <div className="contenedor-ahorros-general">
        <div className="encabezado-ahorros-flex">
          <h3 className="titulo-ahorros-general">Objetivos de Ahorro</h3>
          <button onClick={() => setModalAgregarAbierto(true)} className="boton-primario">
            Agregar Meta
          </button>
        </div>

        {metasAhorro.length > 0 ? (
          <div className="grid-ahorros-general">
            {metasAhorro.map((meta, indice) => (
              <div key={indice} className="tarjeta-ahorro-item">
                <BarraProgreso actual={meta.actual} objetivo={meta.objetivo} etiqueta={meta.etiqueta} />
                <button className="boton-editar-ahorro" onClick={() => setModalEditarAbierto(true)}>
                  Editar
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* AQUÍ APLICAMOS EL MISMO DISEÑO QUE EN LOS GRÁFICOS */
          <EstadoVacio
            icono="🎯"
            mensaje="Aún no tienes metas de ahorro configuradas."
            sugerencia="Haz clic en 'Agregar Meta' para empezar a planificar tus objetivos financieros."
          />
        )}
      </div>

      {/* MODALES */}
      {(modalAgregarAbierto || modalEditarAbierto) && (
        <div className="capa-modal" onClick={() => { setModalAgregarAbierto(false); setModalEditarAbierto(false); }}>

          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>

            <h3>{modalAgregarAbierto ? "Nueva Meta de Ahorro" : "Editar Meta de Ahorro"}</h3>
            <div className="formulario-cuerpo">
              <div className="formulario-cuerpo">
                <div className="formulario-grupo">
                  <label htmlFor="nombreMeta">Nombre de la Meta</label>
                  <input
                    type="text"
                    id="nombreMeta"
                    placeholder="Ej: Fondo de Emergencia"
                    autoComplete="off"
                  />
                </div>

                <div className="formulario-grupo">
                  <label htmlFor="montoObjetivo">Monto Objetivo ($)</label>
                  <input
                    type="number"
                    id="montoObjetivo"
                    placeholder="0.00"
                    min="0"
                  />
                </div>

                <div className="formulario-grupo">
                  <label htmlFor="montoActual">Monto Actual ($)</label>
                  <input
                    type="number"
                    id="montoActual"
                    placeholder="0.00"
                    min="0"
                  />
                </div>

                <div className="formulario-grupo">
                  <label htmlFor="fechaObjetivo">Fecha Objetivo</label>
                  <input type="date" id="fechaObjetivo" />
                </div>

                <div className="formulario-grupo">
                  <label htmlFor="fechaInicio">Fecha de Inicio</label>
                  <input type="date" id="fechaInicio" />
                </div>

                <div className="formulario-grupo">
                  <label htmlFor="divisa">Divisa</label>
                  <select id="divisa">
                    <option value="ARS">ARS - Peso Argentino</option>
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="formulario-acciones">
              <div className="formulario-acciones">
                <button
                  className="boton-secundario"
                  onClick={() => { setModalAgregarAbierto(false); setModalEditarAbierto(false); }}
                >
                  Cancelar
                </button>
                <button
                  className="boton-primario modal-btn"
                  onClick={() => {
                    // Aquí iría tu lógica para recolectar los datos de los inputs
                    setModalAgregarAbierto(false);
                    setModalEditarAbierto(false);
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GastoIngreso;