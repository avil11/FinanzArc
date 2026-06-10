import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Ingreso.css";

import { obtenerTasas } from "../../../apiConfig";

const API_BASE_URL = "http://localhost:60496/api";

function Ingreso() {

  const [modalAbierto, setModalAbierto] = useState(false);
  const [listaIngresos, setListaIngresos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vermas, setVerMas] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [tasas, setTasas] = useState({ USD: 1, EUR: 1 });
  
  const [tipoIngreso, setTipoIngreso] = useState([]);
  const [divisa, setDivisa] = useState([]);

  const [form, setForm] = useState({
    IdIngreso: null,
    IdUsuario: null,
    IdTipoIngreso: "",
    IdDivisa: "",
    MontoIngreso: "",
    FechaIngreso: new Date().toISOString().split('T')[0],
    Descripcion: ""
  });
  useEffect(() => {
    const cargarDatos = async () => {
      const tasasActuales = await obtenerTasas();
      setTasas(tasasActuales);
      obtenerDatosUsuarioYRegistros();
    };
    cargarDatos();
  }, []);

   // USE EFFECT PARA TRAER INFORMACION DE LA TABLA TipoIngreso
   useEffect(() => {
     const fetchTipoIngreso = async () => {
       try {
         const response = await fetch(`${API_BASE_URL}/TipoIngreso`); // Asegúrate de que la ruta sea esta
         const data = await response.json();
         setTipoIngreso(data);
       } catch (error) {
         console.error("Error al cargar tipo de ingresos:", error);
       }
     };
 
     fetchTipoIngreso();
   }, []);
   // USE EFFECT PARA TRAER INFORMACION DE LA TABLA Divisa
   useEffect(() => {
     const fetchDivisa = async () => {
       try {
         const response = await fetch(`${API_BASE_URL}/Divisa`); // Asegúrate de que la ruta sea esta
         const data = await response.json();
         setDivisa(data);
       } catch (error) {
         console.error("Error al cargar los tipos de divisas:", error);
       }
     };
 
     fetchDivisa();
   }, []);

  const COLORES = ["#007AFF", "#FF9500", "#34C759", "#AF52DE"];

  const obtenerDatosUsuarioYRegistros = async () => {
    const token = localStorage.getItem("Token");
    try {
      const res = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const usuario = await res.json();
      setForm(prev => ({ ...prev, IdUsuario: usuario.IdUsuario }));
      cargarIngresos(usuario.IdUsuario);
    } catch (err) {
      console.error("Error al identificar usuario", err);
    }
  };

  const cargarIngresos = (idUsuario) => {
    fetch(`${API_BASE_URL}/Ingreso/ByUsuario/${idUsuario}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` }
    })
      .then(res => res.json())
      .then(data => setListaIngresos(data))
      .catch(err => console.error("Error cargando ingresos", err));
  };

  const manejarGuardar = async () => {
    const esEdicion = form.IdIngreso !== null;
    const url = esEdicion ? `${API_BASE_URL}/Ingreso/${form.IdIngreso}` : `${API_BASE_URL}/Ingreso`;
    const metodo = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("Token")}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setModalAbierto(false);
        resetearForm();
        obtenerDatosUsuarioYRegistros();
      }
    } catch (err) {
      console.error("Error al guardar ingreso", err);
    }
  };

  const eliminarIngreso = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    fetch(`${API_BASE_URL}/Ingreso/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` }
    }).then(() => obtenerDatosUsuarioYRegistros());
  };
  const calcularMontoEnPesos = (monto, idDivisa) => {
    if (idDivisa === 2) return monto * tasas.USD;
    if (idDivisa === 3) return monto * tasas.EUR;
    return monto;
  };

  const FormatearMoneda = (monto, idDivisa) => {
    const totalPesos = calcularMontoEnPesos(monto, idDivisa);
    if (idDivisa === 1) return `$${monto.toLocaleString()}`;
    const simbolo = idDivisa === 2 ? "USD" : "EUR";
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>{simbolo} {monto.toLocaleString()}</span>
        <span style={{ fontSize: "10px", color: "#888" }}>≈ ${totalPesos.toLocaleString()} ARS</span>
      </div>
    );
  };
  const ingresosFiltrados = useMemo(() => {
    return listaIngresos.filter(i =>
      i.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [listaIngresos, busqueda]);

  const datosGrafico = useMemo(() => {
    const data = ingresosFiltrados.map(i => ({
      nombre: i.Descripcion,
      valor: calcularMontoEnPesos(Number(i.MontoIngreso), i.IdDivisa)
    })).slice(0, 5);
    return data.length > 0 ? data : [{ nombre: "Sin datos", valor: 0 }];
  }, [ingresosFiltrados, tasas]);
  const totalMonto = useMemo(() => {
    return ingresosFiltrados.reduce((acc, item) => acc + calcularMontoEnPesos(Number(item.MontoIngreso), item.IdDivisa), 0);
  }, [ingresosFiltrados, tasas]);
  const resetearForm = () => {
    setForm(prev => ({
      ...prev,
      IdIngreso: null,
      MontoIngreso: "",
      Descripcion: "",
      FechaIngreso: new Date().toISOString().split('T')[0],
      IdCuenta: 1,
      IdTipoIngreso: 1,
      IdDivisa: 1
    }));
  };
  const prepararEdicion = (item) => {
    setForm({
      IdIngreso: item.IdIngreso,
      IdUsuario: item.IdUsuario,
      IdCuenta: item.IdCuenta,
      IdTipoIngreso: item.IdTipoIngreso,
      IdDivisa: item.IdDivisa,
      MontoIngreso: item.MontoIngreso,
      FechaIngreso: item.FechaIngreso.split('T')[0],
      Descripcion: item.Descripcion
    });
    setModalAbierto(true);
  };


  return (
    <div className="pagina-ingreso-contenedor">
      <div className="encabezado-simple">
        <h1 className="titulo-seccion">Fuentes de Ingreso</h1>
        <p className="texto-gris">Administra todos tus ingresos en este apartado. <br /> Cotizaciones: 1 USD = ${tasas.USD} | 1 EUR = ${tasas.EUR}</p>
      </div>

      <div className="pagina-ingreso-tarjeta">
        <div className="tarjeta">
          {ingresosFiltrados.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "280px",
              textAlign: "center",
              color: "#a0a0a0"
            }}>
              <span style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📊</span>
              <p style={{ fontSize: "14px", margin: 0, padding: "0 20px", lineHeight: "1.5" }}>
                {listaIngresos.length === 0
                  ? "No hay ingresos registrados para generar el gráfico de distribución."
                  : "No hay datos que coincidan para mostrar en el gráfico."}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={datosGrafico}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={6}
                  dataKey="valor"
                  nameKey="nombre"
                  stroke="none"
                >
                  {datosGrafico.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.valor === 0 ? "#333" : COLORES[i % COLORES.length]} />
                  ))}
                </Pie>

                <text x="50%" y="50%" fill="#fff" textAnchor="middle" dominantBaseline="central">
                  <tspan x="50%" dy="-0.5em" fontSize="14" fill="#a0a0a0">Total (ARS)</tspan>
                  <tspan x="50%" dy="1.5em" fontSize="20" fontWeight="bold">
                    ${totalMonto.toLocaleString()}
                  </tspan>
                </text>

                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200, 178, 119, 0.3)", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="contenedor-tabla-filtradaCategoria">
          <div className="buscador-ingreso-categoria">
            <h2 className="subtitulo-seccion">Filtrar Ingresos:</h2>
            <input
              type="text"
              placeholder="Buscar por descripción..."
              className="input-buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="tabla-responsive">
            <table className="tabla-ingresos">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "3rem 1rem", color: "#a0a0a0" }}>
                      {listaIngresos.length === 0
                        ? "No tenés registrado ningún ingreso. ¡Registrá tu primer ingreso abajo!"
                        : "No se encontraron ingresos que coincidan con tu búsqueda."}
                    </td>
                  </tr>
                ) : (
                  ingresosFiltrados.map((item) => (
                    <tr key={item.IdIngreso || Math.random()}>
                      <td>{item.Descripcion}</td>
                      <td className="monto-destacado" style={{ color: 'rgb(70, 130, 180)' }}>
                        {FormatearMoneda(Number(item.MontoIngreso), item.IdDivisa)}
                      </td>
                      <td className="texto-gris">{new Date(item.FechaIngreso).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-icon" onClick={() => prepararEdicion(item)}>✏️</button>
                        <button className="btn-icon" onClick={() => eliminarIngreso(item.IdIngreso)}>🗑️</button>
                        <button className="btn-icon" onClick={() => { setItemSeleccionado(item); setVerMas(true); }}>📊</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button className="boton-primario" onClick={() => { resetearForm(); setModalAbierto(true); }}>
        Registrar Ingreso
      </button>

      {/* SECCIÓN DE DETALLES */}
      {vermas && itemSeleccionado && (
        <div className="seccion-detalle-inferior" style={{ marginTop: "20px", padding: "20px", backgroundColor: "#1e1e1f", borderRadius: "12px", border: "1px solid #333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, color: "#c8b277" }}>Detalle de: {itemSeleccionado.Descripcion}</h2>
            <button onClick={() => setVerMas(false)} className="btn-link" style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>Cerrar ✕</button>
          </div>

          <div className="grid-detalles" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {/*DINAMICO TIPO INGRESO: */}
            <div className="tarjeta-dato">
              <label style={{ display: "block", color: "#888", fontSize: "12px" }}>Tipo de Ingreso</label>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>
                {["Sueldo", "Inversiones", "Ventas", "Otros"][itemSeleccionado.IdTipoIngreso - 1] || "No definido"}
              </p>
            </div>
          
            <div className="tarjeta-dato">
              <label style={{ display: "block", color: "#888", fontSize: "12px" }}>Cuenta Destino</label>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>
                {itemSeleccionado.IdCuenta === 1 ? "Caja Principal" : "Ahorros"}
              </p>
            </div>

            <div className="tarjeta-dato">
              <label style={{ display: "block", color: "#888", fontSize: "12px" }}>Divisa</label>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>
                {itemSeleccionado.IdDivisa === 1 ? "Peso Argentino (ARS)" : itemSeleccionado.IdDivisa === 2 ? "Dólar (USD)" : "Euro (EUR)"}
              </p>
            </div>

            <div className="tarjeta-dato">
              <label style={{ display: "block", color: "#888", fontSize: "12px" }}>ID de Registro</label>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600", fontFamily: "monospace", color: "#c8b277" }}>
                #{itemSeleccionado.IdIngreso}
              </p>
            </div>
          </div>
        </div>
      )}
      {modalAbierto && (
        <div className="capa-modal">
          <div className="contenido-modal">
            <h3 className="modal-titulo">{form.IdIngreso ? "Editar Ingreso" : "Nuevo Ingreso"}</h3>
            <div className="formulario-grid">
              <div className="formulario-grupo full-width">
                <label>Descripción</label>
                <input
                  type="text"
                  value={form.Descripcion}
                  onChange={(e) => setForm({ ...form, Descripcion: e.target.value })}
                  placeholder='"Ingreso de aguinaldo..."' 
                />
              </div>
              <div className="formulario-grupo">
                <label>Monto</label>
                <input
                  type="number"
                  value={form.MontoIngreso}
                  onChange={(e) => setForm({ ...form, MontoIngreso: e.target.value })}
                  placeholder='"850.000..."' 
                />
              </div>
              <div className="formulario-grupo">
                <label>Fecha</label>
                <input
                  type="date"
                  value={form.FechaIngreso}
                  onChange={(e) => setForm({ ...form, FechaIngreso: e.target.value })}
                />
              </div>

              {/*DINAMICO CON TABLA TipoIngreso*/}
              <div className="formulario-grupo">
                <label>Tipo ingreso</label>
                <select
                  value={form.IdTipoIngreso}
                  onChange={(e) => setForm({ ...form, IdTipoIngreso: parseInt(e.target.value) })}
                >
                  {tipoIngreso.map(cat => (
                    <option key={cat.IdTipoIngreso} value={cat.IdTipoIngreso}>
                      {cat.Nombre}
                    </option>
                  ))}
                </select>
              </div>
              {/* SELECCIONADOR DE DIVISA DINAMICO */}
              <div className="formulario-grupo">
                <label>TIPO DIVISA</label>
                <select
                  value={form.IdDivisa}
                  onChange={(e) => setForm({ ...form, IdDivisa: parseInt(e.target.value) })}
                >
                  {divisa.map(modo => (
                    <option key={modo.IdDivisa} value={modo.IdDivisa}>
                      {modo.CodigoISO}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="boton-primario" onClick={manejarGuardar}>Guardar Ingreso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ingreso;