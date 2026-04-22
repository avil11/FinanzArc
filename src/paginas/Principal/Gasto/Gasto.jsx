import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Gasto.css"; // Puedes renombrar este CSS a Finanzas.css para usarlo en ambos

const API_BASE_URL = "http://localhost:60496/api";

function Gasto() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [listaGastos, setListaGastos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vermas, setVerMas] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Estado del formulario basado en tu tabla SQL [dbo].[Gasto]
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

  const COLORES = ["#FF4B4B", "#c8b277", "#8a733f", "#4a4a4a"]; // Rojo para gastos

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

  // --- AYUDANTES DE UI ---

  const resetearForm = () => {
    setForm({
      ...form,
      IdGasto: null,
      MontoGasto: "",
      Descripcion: "",
      FechaGasto: new Date().toISOString().split('T')[0]
    });
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

  const verDetalles = (item) => {
    setItemSeleccionado(item);
    setVerMas(true);
  };

  const gastosFiltrados = listaGastos.filter(i =>
    i.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const datosGrafico = gastosFiltrados.map(i => ({
    nombre: i.Descripcion,
    valor: Number(i.MontoGasto)
  })).slice(0, 5);

  return (
    <div className="pagina-ingreso-contenedor">
      <div className="encabezado-simple">
        <h1 className="titulo-seccion">Control de Gastos</h1>
        <p className="texto-gris">Visualiza y gestiona tus salidas de dinero.</p>
      </div>

      <div className="pagina-ingreso-tarjeta">
        <div className="tarjeta">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={datosGrafico.length > 0 ? datosGrafico : [{ nombre: "Sin datos", valor: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nombre" // <--- AGREGÁ ESTO
              >
                {datosGrafico.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1f",
                  border: "1px solid rgba(200, 178, 119, 0.3)",
                  color: "#fff",
                  borderRadius: "8px"
                }}
                itemStyle={{ color: "#fff" }} // Opcional: para asegurar que el texto sea blanco
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
                {gastosFiltrados.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Descripcion}</td>
                    <td className="monto-destacado" style={{ color: 'rgb(180, 70, 70)' }}>${Number(item.MontoGasto).toLocaleString()}</td>
                    <td className="texto-gris">{new Date(item.FechaGasto).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon" onClick={() => prepararEdicion(item)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminarGasto(item.IdGasto)}>🗑️</button>
                      <button className="btn-icon" onClick={() => verDetalles(item)}>📊</button>
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