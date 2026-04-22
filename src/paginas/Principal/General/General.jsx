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

  // Estado para controlar los valores del formulario
  const [metaForm, setMetaForm] = useState({
    IdMetaAhorro: null,
    Nombre: "",
    MontoObjetivo: "",
    MontoGuardado: "",
    FechaObjetivo: "",
    FechaInicio: "",
    Divisa: "ARS"
  });

  useEffect(() => {
    const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);
    return () => clearTimeout(temporizador);
  }, []);

  useEffect(() => {
    obtenerDatos();
  }, []);

  // --- Lógica de API ---
  const obtenerDatos = () => {
    const token = localStorage.getItem("Token");
    if (!token) return;

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al validar sesión");
        return response.json();
      })
      .then((data) => {
        obtenerGastos(data.IdUsuario);
        obtenerIngresos(data.IdUsuario);
        obtenerAhorros(data.IdUsuario);
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
          ...item,
          etiqueta: item.Nombre || "Meta de ahorro",
          actual: Number(item.MontoGuardado ?? 0),
          objetivo: Number(item.MontoObjetivo ?? 0),
        }));
        setMetasAhorro(metasProcesadas);
      })
      .catch((error) => console.error("Error ahorros:", error));
  };

  // Función para actualizar el estado cuando se escribe en los inputs
  const manejarCambioInput = (e) => {
    setMetaForm({
      ...metaForm,
      [e.target.name]: e.target.value
    });
  };

  // --- Lógica para Crear / Editar Meta ---
  const manejarGuardarMeta = () => {
    const token = localStorage.getItem("Token");

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
      .then(res => res.json())
      .then(userData => {
        const metaAGuardar = {
          IdMetaAhorro: metaForm.IdMetaAhorro,
          Nombre: metaForm.Nombre,
          MontoObjetivo: parseFloat(metaForm.MontoObjetivo),
          MontoGuardado: parseFloat(metaForm.MontoGuardado),
          FechaMeta: metaForm.FechaObjetivo,
          FechaInicio: metaForm.FechaInicio,
          IdDivisa: metaForm.Divisa,
          IdUsuario: userData.IdUsuario
        };
        console.log("Meta a guardar:", metaAGuardar);
        guardarMetaApi(metaAGuardar);
      });
  };

  // MODIFICADO: Ahora maneja POST y PUT dinámicamente
  const guardarMetaApi = (metaAGuardar) => {
    const esEdicion = metaAGuardar.IdMetaAhorro !== null && metaAGuardar.IdMetaAhorro !== undefined;

    // Si es edición, se agrega el ID al endpoint
    const url = esEdicion
      ? `${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaAGuardar.IdMetaAhorro}`
      : `${API_BASE_URL}${API_ENDPOINTS.ahorros}`;

    // Si es edición usamos PUT, si no, POST
    const metodo = esEdicion ? "PUT" : "POST";

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("Token")}`
      },
      body: JSON.stringify(metaAGuardar)
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error al ${esEdicion ? 'editar' : 'guardar'} la meta`);

        // Validamos por si el PUT devuelve 204 No Content para evitar errores de parseo
        return response.text().then(text => text ? JSON.parse(text) : {});
      })
      .then(() => {
        setModalAgregarAbierto(false);
        setModalEditarAbierto(false);
        obtenerDatos(); // Recargamos todo
      })
      .catch((error) => console.error("Error guardando meta:", error));
  };

  // --- Funciones de Renderizado ---
  const calcularTotal = (datos) => datos.reduce((acum, item) => acum + Number(item.valor || 0), 0);
  const obtenerTopCinco = (items) => [...items].sort((a, b) => b.valor - a.valor).slice(0, 5);

  const renderCenterLabel = ({ cx, cy }, total) => (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight="600">Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#c8b277" fontSize={16} fontWeight="700">
        ${total.toLocaleString()}
      </text>
    </g>
  );

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

  const manejarEliminarMeta = () => {
    console.log("Eliminar meta ID:", metaForm.IdMetaAhorro);
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaForm.IdMetaAhorro}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al eliminar la meta");
        setModalEditarAbierto(false);
        obtenerDatos(); // Recargamos todo
      })
      .catch((error) => console.error("Error eliminando meta:", error));

  }

  const nombre = localStorage.getItem("Nombre") || "Usuario";
  const apellido = localStorage.getItem("Apellido") || "";

  // Helper para resetear el formulario al agregar
  const abrirModalAgregar = () => {
    setMetaForm({ IdMetaAhorro: null, Nombre: "", MontoObjetivo: "", MontoGuardado: "", FechaObjetivo: "", FechaInicio: "", Divisa: "ARS" });
    setModalAgregarAbierto(true);
  };

  // Helper para cargar los datos de la meta seleccionada
  const abrirModalEditar = (meta) => {
    setMetaForm({
      IdMetaAhorro: meta.IdMetaAhorro,
      Nombre: meta.Nombre || "",
      MontoObjetivo: meta.MontoObjetivo || "",
      // CAMBIO AQUÍ: Usamos 'actual' que es el nombre que le diste en obtenerAhorros
      MontoGuardado: meta.actual || meta.MontoGuardado || 0,
      FechaObjetivo: meta.FechaMeta ? meta.FechaMeta.split('T')[0] : (meta.FechaObjetivo ? meta.FechaObjetivo.split('T')[0] : ""),
      FechaInicio: meta.FechaInicio ? meta.FechaInicio.split('T')[0] : "",
      IdDivisa: parseInt(meta.IdDivisa) || 1
    });

    setModalEditarAbierto(true);
  };

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

      <div className="contenedor-ahorros-general">
        <div className="encabezado-ahorros-flex">
          <h3 className="titulo-ahorros-general">Objetivos de Ahorro</h3>
          <button onClick={abrirModalAgregar} className="boton-primario">
            Agregar Meta
          </button>
        </div>

        {metasAhorro.length > 0 ? (
          <div className="grid-ahorros-general">
            {metasAhorro.map((meta, indice) => (
              <div key={indice} className="tarjeta-ahorro-item">
                <BarraProgreso actual={meta.actual} objetivo={meta.objetivo} etiqueta={meta.etiqueta} />
                <button className="boton-editar-ahorro" onClick={() => abrirModalEditar(meta)}>
                  Editar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EstadoVacio
            icono="🎯"
            mensaje="Aún no tienes metas de ahorro configuradas."
            sugerencia="Haz clic en 'Agregar Meta' para empezar a planificar tus objetivos financieros."
          />
        )}
      </div>

      {/* MODAL EDITAR */}
      {(modalEditarAbierto) && (
        <div className="capa-modal" onClick={() => setModalEditarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Meta de Ahorro</h3>
            <div className="formulario-cuerpo">
              <div className="formulario-grupo">
                <label htmlFor="nombreMeta">Nombre de la Meta</label>
                <input type="text" name="Nombre" value={metaForm.Nombre} onChange={manejarCambioInput} id="nombreMeta" placeholder="Ej: Fondo de Emergencia" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoGuardado">Monto Actual ($)</label>
                <input type="number" name="MontoGuardado" value={metaForm.MontoGuardado} onChange={manejarCambioInput} id="MontoGuardado" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoObjetivo">Monto Objetivo ($)</label>
                <input type="number" name="MontoObjetivo" value={metaForm.MontoObjetivo} onChange={manejarCambioInput} id="montoObjetivo" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaInicio">Fecha de Inicio</label>
                <input type="date" name="FechaInicio" value={metaForm.FechaInicio} onChange={manejarCambioInput} id="fechaInicio" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaObjetivo">Fecha Objetivo</label>
                <input type="date" name="FechaObjetivo" value={metaForm.FechaObjetivo} onChange={manejarCambioInput} id="fechaObjetivo" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="divisa">Divisa</label>
                <select name="Divisa" value={metaForm.IdDivisa} onChange={manejarCambioInput} id="divisa" >
                  <option value="1" >ARS - Peso Argentino</option>
                  <option value="2">USD - Dólar Estadounidense</option>
                  <option value="3">EUR - Euro</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" style={{ backgroundColor: '#dc3545' }} onClick={manejarEliminarMeta}>
                Eliminar
              </button>
              <button className="boton-secundario" onClick={() => setModalEditarAbierto(false)}>
                Cancelar
              </button>
              <button className="boton-primario" onClick={manejarGuardarMeta}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR */}
      {(modalAgregarAbierto) && (
        <div className="capa-modal" onClick={() => setModalAgregarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva Meta de Ahorro</h3>
            <div className="formulario-cuerpo">
              <div className="formulario-grupo">
                <label htmlFor="nombreMeta">Nombre de la Meta</label>
                <input type="text" name="Nombre" value={metaForm.Nombre} onChange={manejarCambioInput} id="nombreMeta" placeholder="Ej: Fondo de Emergencia" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoGuardado">Monto Actual ($)</label>
                <input type="number" name="MontoGuardado" value={metaForm.MontoGuardado} onChange={manejarCambioInput} id="montoGuardado" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoObjetivo">Monto Objetivo ($)</label>
                <input type="number" name="MontoObjetivo" value={metaForm.MontoObjetivo} onChange={manejarCambioInput} id="montoObjetivo" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaInicio">Fecha de Inicio</label>
                <input type="date" name="FechaInicio" value={metaForm.FechaInicio} onChange={manejarCambioInput} id="fechaInicio" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaObjetivo">Fecha Objetivo</label>
                <input type="date" name="FechaObjetivo" value={metaForm.FechaObjetivo} onChange={manejarCambioInput} id="fechaObjetivo" />
              </div>

              <div className="formulario-grupo">
                <label htmlFor="divisa">Divisa</label>
                <select name="Divisa" value={metaForm.Divisa} onChange={manejarCambioInput} id="divisa">
                  <option value="1">ARS - Peso Argentino</option>
                  <option value="2">USD - Dólar Estadounidense</option>
                  <option value="3">EUR - Euro</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" onClick={() => setModalAgregarAbierto(false)}>
                Cancelar
              </button>
              <button className="boton-primario" onClick={manejarGuardarMeta}>
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