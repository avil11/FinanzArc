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

  const abrirmodalAgregar = () => {
    setModalAgregarAbierto(true);
  };
  const abrirModalEditar = (meta, indice) => {
    console.log("Meta seleccionada para editar:", meta);
    setModalEditarAbierto(true);
  }
  useEffect(() => {
    const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);
    return () => clearTimeout(temporizador);
  }, []);

  useEffect(() => {
    obtenerDatos();
  }, []);

  let nombre = localStorage.getItem("Nombre");
  let apellido = localStorage.getItem("Apellido");
  
  function obtenerDatos() {
    const token = localStorage.getItem("Token");
    if (!token) {
      console.error("No se encontró el token de autenticación.");
      return;
    }
    
    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        let idusuario = data.IdUsuario;
        obtenerGastos(idusuario);
        obtenerIngresos(idusuario);
        obtenerAhorros(idusuario);
      })
      .catch((error) => console.error("Error:", error));
  }

  function obtenerGastos(idusuario) {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.gastos}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Gastos obtenidos:", data);
        const gastosProcesados = data.map((item) => ({
          name: item.Descripcion || "Sin descripción",
          valor: Number(item.MontoGasto) || 0,
        }));
        setDatosGastos(gastosProcesados);
      })
      .catch((error) => console.error("Error gastos:", error));
  }

  function obtenerIngresos(idusuario) {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ingresos}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Ingresos obtenidos:", data);
        const ingresosProcesados = data.map((item) => ({
          name: item.Descripcion || "Sin Descripción",
          valor: Number(item.MontoIngreso) || 0,
        }));
        setDatosIngresos(ingresosProcesados);
      })
      .catch((error) => console.error("Error ingresos:", error));
  }

  function obtenerAhorros(idusuario) {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Metas de ahorro obtenidas:", data);
        const metasProcesadas = data.map((item) => ({
          etiqueta: item.Nombre || "Meta de ahorro",
          actual: Number(item.MontoGuardado ?? 0),
          objetivo: Number(item.MontoObjetivo ?? 0),
        }));
        setMetasAhorro(metasProcesadas);
      })
      .catch((error) => console.error("Error ahorros:", error));
  }
   

  const calcularTotal = (datos) => datos.reduce((acum, item) => acum + Number(item.valor || 0), 0);

  const obtenerTopCinco = (items) => [...items].sort((a, b) => b.valor - a.valor).slice(0, 5);
  const topGastos = obtenerTopCinco(datosGastos);
  const topIngresos = obtenerTopCinco(datosIngresos);

  const renderCenterLabel = ({ cx, cy, viewBox }, total) => (
    <>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight="600">
        Total
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#c8b277" fontSize={16} fontWeight="700">
        ${total.toLocaleString()}
      </text>
    </>
  );

  const BarraProgreso = ({ actual, objetivo, etiqueta }) => {
    const actualMonto = Number(actual || 0);
    const objetivoMonto = Number(objetivo || 0);
    const porcentaje = objetivoMonto > 0 ? Math.min(100, (actualMonto / objetivoMonto) * 100) : 0;
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
          ${actualMonto.toLocaleString()} / ${objetivoMonto.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general">
        {mostrarSaludo ? (
          <h2>¡Bienvenido, {nombre} {apellido}!</h2>
        ) : (
          <h2>Resumen Financiero</h2>
        )}
        <p style={{ color: "#888888" }}>Gestioná tu patrimonio en FinanzARC</p>
      </div>

      <div className="panel-graficos-general">
        <div className="tarjeta-general">
          <h3>Gastos por Categoría</h3>
          <div className="grafico-con-leyenda">
            <div className="grafico-pie">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={datosGastos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="valor"
                    label={(props) => renderCenterLabel(props, calcularTotal(datosGastos))}
                    labelLine={false}
                  >
                    {datosGastos.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200, 178, 119, 0.3)", color: "#fff", borderRadius: "8px" }} itemStyle={{ color: "#c8b277" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="leyenda-grafico">
              {topGastos.length > 0 ? (
                topGastos.map((item, index) => (
                  <div className="item-leyenda" key={index}>
                    <span className="item-color-circulo" style={{ backgroundColor: COLORES[index % COLORES.length] }} />
                    <div className="leyenda-texto">
                      <span>{item.name}</span>
                      <strong>${Number(item.valor || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay datos de gastos disponibles.</p>
              )}
            </div>
          </div>
        </div>

        <div className="tarjeta-general">
          <h3>Fuentes de Ingreso</h3>
          <div className="grafico-con-leyenda">
            <div className="grafico-pie">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={datosIngresos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="valor"
                    label={(props) => renderCenterLabel(props, calcularTotal(datosIngresos))}
                    labelLine={false}
                  >
                    {datosIngresos.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200, 178, 119, 0.3)", color: "#fff", borderRadius: "8px" }} itemStyle={{ color: "#c8b277" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="leyenda-grafico">
              {topIngresos.length > 0 ? (
                topIngresos.map((item, index) => (
                  <div className="item-leyenda" key={index}>
                    <span className="item-color-circulo" style={{ backgroundColor: COLORES[index % COLORES.length] }} />
                    <div className="leyenda-texto">
                      <span>{item.name}</span>
                      <strong>${Number(item.valor || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay datos de ingresos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-ahorros-general">
        <h3 className="titulo-ahorros-general">Objetivos de Ahorro</h3>
        <div className="grid-ahorros-general">
          {metasAhorro.length > 0 ? (
            metasAhorro.map((meta, indice) => (
              <BarraProgreso key={indice} actual={meta.actual} objetivo={meta.objetivo} etiqueta={meta.etiqueta} />
            ))
          ) : (
            <p className="sin-metas-ahorro">No se registraron metas para ahorros</p>
          )}
          {metasAhorro.length > 0 ? (
            metasAhorro.map((meta, indice) => (
              <button onClick={() => abrirModalEditar(meta,indice) } key={indice}>
                Editar
              </button>
            ))
          ) : (
            <p className="sin-metas-ahorro">No se registraron metas para ahorros</p>
          )}
      

        <button onClick={() => abrirmodalAgregar()} className="boton-primario">
          Agregar Meta
        </button>


        </div>
      </div>

       {/* MODAL */}
      {modalAgregarAbierto && (
        <div className="capa-modal" onClick={() => setModalAgregarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva Meta de Ahorro</h3>
            <div className="formulario-grupo">
              <label>Nombre de la Meta</label>
              <input type="text" placeholder="Ej: Fondo de Emergencia" />
            </div>
            <div className="formulario-grupo">
              <label>Monto Objetivo ($)</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div className="formulario-grupo">
              <label>Monto Actual ($)</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div className="formulario-grupo">
              <label>Fecha Objetivo</label>
              <input type="date" />
            </div>
            <div className="formulario-grupo">
              <label>Fecha de Inicio</label>
              <input type="date" />
            </div>
            <div className="formulario-grupo">
              <label>Divisa</label>
              <select defaultValue="1">
                <option value="3">USD</option>
                <option value="2">EUR</option>
                <option value="1">ARS</option>
              </select>
            </div>
            <div className="formulario-acciones">
              <button
                type="button"
                className="boton-secundario"
                onClick={() => setModalAgregarAbierto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario modal-btn"
                onClick={() => setModalAgregarAbierto(false)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarAbierto && (
        <div className="capa-modal" onClick={() => setModalAgregarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva Meta de Ahorro</h3>
            <div className="formulario-grupo">
              <label>Nombre de la Meta</label>
              <input type="text" placeholder="Ej: Fondo de Emergencia" />
            </div>
            <div className="formulario-grupo">
              <label>Monto Objetivo ($)</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div className="formulario-grupo">
              <label>Monto Actual ($)</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div className="formulario-grupo">
              <label>Fecha Objetivo</label>
              <input type="date" />
            </div>
            <div className="formulario-grupo">
              <label>Fecha de Inicio</label>
              <input type="date" />
            </div>
            <div className="formulario-grupo">
              <label>Divisa</label>
              <select defaultValue="1">
                <option value="3">USD</option>
                <option value="2">EUR</option>
                <option value="1">ARS</option>
              </select>
            </div>
            <div className="formulario-acciones">
              <button
                type="button"
                className="boton-secundario"
                onClick={() => setModalEditarAbierto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario modal-btn"
                onClick={() => setModalEditarAbierto(false)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GastoIngreso;
