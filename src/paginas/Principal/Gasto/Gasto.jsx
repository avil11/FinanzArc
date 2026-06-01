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
  const [tasas, setTasas] = useState({ USD: 1, EUR: 1 });

  const [form, setForm] = useState({
    IdGasto: null, IdUsuario: null, IdCuenta: 1, IdCategoria: 1,
    IdModoPago: 1, IdDivisa: 1, MontoGasto: "", 
    FechaGasto: new Date().toISOString().split('T')[0], Descripcion: ""
  });

  const COLORES = ["#FF4B4B", "#c8b277", "#8a733f", "#4a4a4a"];

  useEffect(() => {
    obtenerCotizaciones();
    obtenerDatosUsuarioYRegistros();
  }, []);

  const obtenerCotizaciones = async () => {
    try {
      const [resUsd, resEur] = await Promise.all([
        fetch("https://dolarapi.com/v1/dolares/oficial"),
        fetch("https://dolarapi.com/v1/cotizaciones/eur")
      ]);
      const usd = await resUsd.json();
      const eur = await resEur.json();
      setTasas({ USD: usd.venta, EUR: eur.venta });
    } catch (err) { setTasas({ USD: 1200, EUR: 1300 }); }
  };

  const obtenerDatosUsuarioYRegistros = async () => {
    const token = localStorage.getItem("Token");
    try {
      const res = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, { headers: { "Authorization": `Bearer ${token}` } });
      const usuario = await res.json();
      setForm(prev => ({ ...prev, IdUsuario: usuario.IdUsuario }));
      cargarGastos(usuario.IdUsuario);
    } catch (err) { console.error("Error", err); }
  };

  const cargarGastos = (idUsuario) => {
    fetch(`${API_BASE_URL}/Gasto/ByUsuario/${idUsuario}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` } })
      .then(res => res.json())
      .then(data => setListaGastos(data))
      .catch(err => console.error("Error", err));
  };

  const manejarGuardar = async () => {
    const esEdicion = form.IdGasto !== null;
    const url = esEdicion ? `${API_BASE_URL}/Gasto/${form.IdGasto}` : `${API_BASE_URL}/Gasto`;
    await fetch(url, {
      method: esEdicion ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("Token")}` },
      body: JSON.stringify(form)
    });
    setModalAbierto(false);
    resetearForm();
    obtenerDatosUsuarioYRegistros();
  };

  const eliminarGasto = (id) => {
    if (!window.confirm("¿Estás seguro?")) return;
    fetch(`${API_BASE_URL}/Gasto/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` } })
      .then(() => obtenerDatosUsuarioYRegistros());
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

  const gastosFiltrados = useMemo(() => listaGastos.filter(i => i.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())), [listaGastos, busqueda]);
  const totalMonto = useMemo(() => gastosFiltrados.reduce((acc, item) => acc + calcularMontoEnPesos(Number(item.MontoGasto), item.IdDivisa), 0), [gastosFiltrados, tasas]);

  const resetearForm = () => setForm({ ...form, IdGasto: null, MontoGasto: "", Descripcion: "", FechaGasto: new Date().toISOString().split('T')[0], IdCategoria: 1, IdModoPago: 1, IdCuenta: 1, IdDivisa: 1 });
  const prepararEdicion = (item) => { setForm({ ...item, FechaGasto: item.FechaGasto.split('T')[0] }); setModalAbierto(true); };

  return (
    <div className="pagina-ingreso-contenedor">
      <div className="encabezado-simple">
        <h1 className="titulo-seccion">Control de Gastos</h1>
        <p className="texto-gris">Cotizaciones: 1 USD = ${tasas.USD} | 1 EUR = ${tasas.EUR}</p>
      </div>

      <div className="pagina-ingreso-tarjeta">
        <div className="tarjeta">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={gastosFiltrados.map(i => ({ nombre: i.Descripcion, valor: calcularMontoEnPesos(Number(i.MontoGasto), i.IdDivisa) }))} dataKey="valor" innerRadius={70} outerRadius={100}>
                {gastosFiltrados.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Pie>
              <text x="50%" y="50%" fill="#fff" textAnchor="middle" dominantBaseline="central">
                <tspan x="50%" dy="-0.5em" fontSize="14" fill="#a0a0a0">Total</tspan>
                <tspan x="50%" dy="1.5em" fontSize="20" fontWeight="bold">${totalMonto.toLocaleString()}</tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="contenedor-tabla-filtradaCategoria">
          <div className="buscador-ingreso-categoria">
            <h2 className="subtitulo-seccion">Filtrar Gastos:</h2>
            <input type="text" placeholder="Buscar..." className="input-buscar" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="tabla-responsive">
            <table className="tabla-ingresos">
              <thead><tr><th>Descripción</th><th>Monto</th><th>Fecha</th><th>Acciones</th></tr></thead>
              <tbody>
                {gastosFiltrados.map((item) => (
                  <tr key={item.IdGasto}>
                    <td>{item.Descripcion}</td>
                    <td className="monto-destacado" style={{ color: '#FF4B4B' }}>{FormatearMoneda(Number(item.MontoGasto), item.IdDivisa)}</td>
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

      <button className="boton-primario" onClick={() => { resetearForm(); setModalAbierto(true); }}>Registrar Gasto</button>

      {vermas && itemSeleccionado && (
        <div className="seccion-detalle-inferior" style={{ marginTop: "20px", padding: "20px", backgroundColor: "#1e1e1f", borderRadius: "12px", border: "1px solid #333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2>Detalle: {itemSeleccionado.Descripcion}</h2>
            <button onClick={() => setVerMas(false)} className="btn-link">Cerrar ✕</button>
          </div>
          <div className="formulario-grid">
            <div className="formulario-grupo"><label>Categoría</label><p>{["Alimentación", "Transporte", "Servicios", "Ocio"][itemSeleccionado.IdCategoria - 1]}</p></div>
            <div className="formulario-grupo"><label>Modo Pago</label><p>{["Efectivo", "Débito", "Crédito", "Transferencia"][itemSeleccionado.IdModoPago - 1]}</p></div>
            <div className="formulario-grupo"><label>Cuenta</label><p>{itemSeleccionado.IdCuenta === 1 ? "Caja Principal" : "Ahorros"}</p></div>
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="capa-modal">
          <div className="contenido-modal">
            <h3 className="modal-titulo">{form.IdGasto ? "Editar Gasto" : "Nuevo Gasto"}</h3>
            <div className="formulario-grid">
              <div className="formulario-grupo full-width"><label>Descripción</label><input type="text" value={form.Descripcion} onChange={(e) => setForm({...form, Descripcion: e.target.value})} /></div>
              <div className="formulario-grupo"><label>Monto</label><input type="number" value={form.MontoGasto} onChange={(e) => setForm({...form, MontoGasto: e.target.value})} /></div>
              <div className="formulario-grupo"><label>Fecha</label><input type="date" value={form.FechaGasto} onChange={(e) => setForm({...form, FechaGasto: e.target.value})} /></div>
              
              <div className="formulario-grupo">
                <label>Categoría</label>
                <select value={form.IdCategoria} onChange={(e) => setForm({...form, IdCategoria: parseInt(e.target.value)})}>
                  <option value={1}>Alimentación</option>
                  <option value={2}>Transporte</option>
                  <option value={3}>Servicios</option>
                  <option value={4}>Ocio</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>Modo de Pago</label>
                <select value={form.IdModoPago} onChange={(e) => setForm({...form, IdModoPago: parseInt(e.target.value)})}>
                  <option value={1}>Efectivo</option>
                  <option value={2}>Débito</option>
                  <option value={3}>Crédito</option>
                  <option value={4}>Transferencia</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>Cuenta</label>
                <select value={form.IdCuenta} onChange={(e) => setForm({...form, IdCuenta: parseInt(e.target.value)})}>
                  <option value={1}>Caja Principal</option>
                  <option value={2}>Ahorros</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>Divisa</label>
                <select value={form.IdDivisa} onChange={(e) => setForm({...form, IdDivisa: parseInt(e.target.value)})}>
                  <option value={1}>ARS</option><option value={2}>USD</option><option value={3}>EUR</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="boton-primario" onClick={manejarGuardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gasto;