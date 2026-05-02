import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Gasto.css";

const API_BASE_URL = "http://localhost:60496/api";

function Gasto() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [listaGastos, setListaGastos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vermas, setVerMas] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const [form, setForm] = useState({
    IdGasto: null,
    IdUsuario: null,
    IdCuenta: 1,
    IdCategoria: 1,
    IdModoPago: 1,
    IdDivisa: 1,
    MontoGasto: "",
    FechaGasto: new Date().toISOString().split('T')[0],
    Descripcion: ""
  });

  const COLORES = ["#FF4B4B", "#c8b277", "#8a733f", "#4a4a4a"];

  useEffect(() => {
    obtenerDatosUsuarioYRegistros();
  }, []);

  // --- LÓGICA DE API ---
  const obtenerDatosUsuarioYRegistros = async () => {
    const token = localStorage.getItem("Token");
    try {
      const res = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const usuario = await res.json();
      setForm(prev => ({ ...prev, IdUsuario: usuario.IdUsuario }));
      cargarGastos(usuario.IdUsuario);
    } catch (err) {
      console.error("Error al identificar usuario", err);
    }
  };

  const cargarGastos = (idUsuario) => {
    fetch(`${API_BASE_URL}/Gasto/ByUsuario/${idUsuario}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` }
    })
      .then(res => res.json())
      .then(data => setListaGastos(data))
      .catch(err => console.error("Error cargando gastos", err));
  };

  const manejarGuardar = async () => {
    const esEdicion = form.IdGasto !== null;
    const url = esEdicion ? `${API_BASE_URL}/Gasto/${form.IdGasto}` : `${API_BASE_URL}/Gasto`;
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
      console.error("Error al guardar gasto", err);
    }
  };

  const eliminarGasto = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este gasto?")) return;
    fetch(`${API_BASE_URL}/Gasto/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` }
    }).then(() => obtenerDatosUsuarioYRegistros());
  };

  // --- PROCESAMIENTO DE DATOS (Optimizado con useMemo) ---
  const gastosFiltrados = useMemo(() => {
    return listaGastos.filter(i =>
      i.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [listaGastos, busqueda]);

  const datosGrafico = useMemo(() => {
    const data = gastosFiltrados.map(i => ({
      nombre: i.Descripcion,
      valor: Number(i.MontoGasto)
    })).slice(0, 5);
    return data.length > 0 ? data : [{ nombre: "Sin datos", valor: 0 }];
  }, [gastosFiltrados]);

  const totalMonto = useMemo(() => {
    return gastosFiltrados.reduce((acc, item) => acc + Number(item.MontoGasto), 0);
  }, [gastosFiltrados]);

  // --- AYUDANTES DE UI ---
  const resetearForm = () => {
    setForm(prev => ({
      ...prev,
      IdGasto: null,
      MontoGasto: "",
      Descripcion: "",
      FechaGasto: new Date().toISOString().split('T')[0]
    }));
  };

  const prepararEdicion = (item) => {
    setForm({
      IdGasto: item.IdGasto,
      IdUsuario: item.IdUsuario,
      IdCuenta: item.IdCuenta,
      IdCategoria: item.IdCategoria,
      IdModoPago: item.IdModoPago,
      IdDivisa: item.IdDivisa,
      MontoGasto: item.MontoGasto,
      FechaGasto: item.FechaGasto.split('T')[0],
      Descripcion: item.Descripcion
    });
    setModalAbierto(true);
  };

  return (
    <div className="pagina-ingreso-contenedor">
      <div className="encabezado-simple">
        <h1 className="titulo-seccion">Control de Gastos</h1>
        <p className="texto-gris">Administra todos tus consumos y pagos de forma centralizada. Consulta el historial de tus gastos fijos y variables, categoriza tus salidas y visualiza el impacto total en tu economía en tiempo real.</p>
      </div>

      <div className="pagina-ingreso-tarjeta">
        <div className="tarjeta">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={datosGrafico}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nombre"
                stroke="none"
              >
                {datosGrafico.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.valor === 0 ? "#333" : COLORES[i % COLORES.length]} />
                ))}
              </Pie>
              {/* Texto central posicionado manualmente */}
              <text x="50%" y="50%" fill="#fff" textAnchor="middle" dominantBaseline="central">
                <tspan x="50%" dy="-0.5em" fontSize="14" fill="#a0a0a0">Total</tspan>
                <tspan x="50%" dy="1.5em" fontSize="20" fontWeight="bold">
                  ${totalMonto.toLocaleString()}
                </tspan>
              </text>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1f",
                  border: "1px solid rgba(200, 178, 119, 0.3)",
                  borderRadius: "8px"
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="contenedor-tabla-filtradaCategoria">
          <div className="buscador-ingreso-categoria">
            <h2 className="subtitulo-seccion">Filtrar Gastos:</h2>
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
                {gastosFiltrados.map((item) => (
                  <tr key={item.IdGasto || Math.random()}>
                    <td>{item.Descripcion}</td>
                    <td className="monto-destacado" style={{ color: 'rgb(180, 70, 70)' }}>
                      ${Number(item.MontoGasto).toLocaleString()}
                    </td>
                    <td className="texto-gris">{new Date(item.FechaGasto).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon" onClick={() => prepararEdicion(item)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminarGasto(item.IdGasto)}>🗑️</button>
                      <button className="btn-icon" onClick={() => { setItemSeleccionado(item); setVerMas(true); }}>📊</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button className="boton-primario" onClick={() => { resetearForm(); setModalAbierto(true); }}>
        Registrar Gasto
      </button>

      {/* SECCIÓN DE DETALLES */}
      {vermas && itemSeleccionado && (
        <div className="seccion-detalle-inferior">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>Detalles del Gasto</h2>
            <button onClick={() => setVerMas(false)} className="btn-link">Cerrar ✕</button>
          </div>
          <div className="tabla-responsive">
            <table className="tabla-ingresos">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Modo Pago</th>
                  <th>Cuenta</th>
                  <th>Divisa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ID: {itemSeleccionado.IdCategoria}</td>
                  <td>ID: {itemSeleccionado.IdModoPago}</td>
                  <td>ID: {itemSeleccionado.IdCuenta}</td>
                  <td>{itemSeleccionado.IdDivisa === 1 ? "ARS" : "USD"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE GASTOS */}
      {modalAbierto && (
        <div className="capa-modal">
          <div className="contenido-modal">
            <h3 className="modal-titulo">{form.IdGasto ? "Editar Gasto" : "Nuevo Gasto"}</h3>
            <div className="formulario-grid">
              <div className="formulario-grupo full-width">
                <label>Descripción</label>
                <input
                  type="text"
                  value={form.Descripcion}
                  onChange={(e) => setForm({ ...form, Descripcion: e.target.value })}
                />
              </div>
              <div className="formulario-grupo">
                <label>Monto ($)</label>
                <input
                  type="number"
                  value={form.MontoGasto}
                  onChange={(e) => setForm({ ...form, MontoGasto: e.target.value })}
                />
              </div>
              <div className="formulario-grupo">
                <label>Fecha</label>
                <input
                  type="date"
                  value={form.FechaGasto}
                  onChange={(e) => setForm({ ...form, FechaGasto: e.target.value })}
                />
              </div>
              <div className="formulario-grupo">
                <label>Categoría</label>
                <select value={form.IdCategoria} onChange={(e) => setForm({ ...form, IdCategoria: parseInt(e.target.value) })}>
                  <option value={1}>Alimentación</option>
                  <option value={2}>Transporte</option>
                  <option value={3}>Servicios</option>
                  <option value={4}>Ocio</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>Modo de Pago</label>
                <select value={form.IdModoPago} onChange={(e) => setForm({ ...form, IdModoPago: parseInt(e.target.value) })}>
                  <option value={1}>Efectivo</option>
                  <option value={2}>Tarjeta de Débito</option>
                  <option value={3}>Tarjeta de Crédito</option>
                  <option value={4}>Transferencia</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>Cuenta</label>
                <select value={form.IdCuenta} onChange={(e) => setForm({ ...form, IdCuenta: parseInt(e.target.value) })}>
                  <option value={1}>Caja Principal</option>
                  <option value={2}>Ahorros</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>Divisa</label>
                <select value={form.IdDivisa} onChange={(e) => setForm({ ...form, IdDivisa: parseInt(e.target.value) })}>
                  <option value={1}>ARS</option>
                  <option value={2}>USD</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="boton-primario" onClick={manejarGuardar}>Guardar Gasto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gasto;
