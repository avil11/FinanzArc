import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom"; // Importante para la navegación
import "./Ingreso.css";

const API_BASE_URL = "http://localhost:60496/api";

function Ingreso() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [listaIngresos, setListaIngresos] = useState([]); // Datos reales de la API
  const [busqueda, setBusqueda] = useState(""); // Para el filtro de categoría/nombre
  const [vermas, setVerMas] = useState(null); // Para expandir filas y mostrar más detalles
  // Estado del formulario (Coincide con los nombres de tu tabla SQL)
  const [form, setForm] = useState({
    IdIngreso: null,
    IdUsuario: null,
    IdCuenta: 1, // Valor por defecto o dinámico
    IdTipoIngreso: 1,
    IdDivisa: 1,
    MontoIngreso: "",
    FechaIngreso: new Date().toISOString().split('T')[0],
    Descripcion: ""
  });


  const COLORES = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];

  // --- EFECTOS INICIALES ---
  useEffect(() => {
    obtenerDatosUsuarioYRegistros();
  }, []);

  // --- LÓGICA DE API ---

  // 1. Identificamos al usuario y luego traemos sus ingresos
  const obtenerDatosUsuarioYRegistros = async () => {
    const token = localStorage.getItem("Token");
    try {
      const res = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const usuario = await res.json();

      // Actualizamos el ID del usuario en el form para futuros registros
      setForm(prev => ({ ...prev, IdUsuario: usuario.IdUsuario }));

      // Traemos los ingresos de este usuario
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

  // 2. Guardar (POST o PUT)
  const manejarGuardar = async () => {
    // Si tiene ID, usamos PUT al endpoint con ID; si no, POST al endpoint general
    const esEdicion = form.IdIngreso !== null;
    const url = esEdicion
      ? `${API_BASE_URL}/Ingreso/${form.IdIngreso}`
      : `${API_BASE_URL}/Ingreso`;

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
        obtenerDatosUsuarioYRegistros(); // Recargar tabla
      }
    } catch (err) {
      console.error("Error al guardar ingreso", err);
    }
  };

  // 3. Eliminar
  const eliminarIngreso = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;

    fetch(`${API_BASE_URL}/Ingreso/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` }
    }).then(() => obtenerDatosUsuarioYRegistros());
  };

  // --- AYUDANTES DE UI ---
  const resetearForm = () => {
    setForm({ ...form, IdIngreso: null, MontoIngreso: "", Descripcion: "", FechaIngreso: new Date().toISOString().split('T')[0] });
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

  // Filtrado de la tabla según el buscador
  const ingresosFiltrados = listaIngresos.filter(i =>
    i.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Datos para el gráfico (agrupados por descripción o tipo)
  const datosGrafico = ingresosFiltrados.map(i => ({
    nombre: i.Descripcion,
    valor: Number(i.MontoIngreso)
  })).slice(0, 5);

  const [itemSeleccionado, setItemSeleccionado] = useState(null); // Nuevo estado

  const verDetalles = (item) => {
    setItemSeleccionado(item);
    setVerMas(true);
  };


  return (
    <div className="pagina-ingreso-contenedor">
      <div className="encabezado-simple">
        <h1 className="titulo-seccion">Fuentes de Ingreso</h1>
        <p className="texto-gris">Gestiona tus entradas de dinero basándote en tu base de datos real.</p>
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
            <h2 className="subtitulo-seccion">Buscar por descripción:</h2>
            <div className="grupo-input-buscar">
              <input
                type="text"
                placeholder="Ej: Sueldo, Venta..."
                className="input-buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
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
                {ingresosFiltrados.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Descripcion}</td>
                    <td className="monto-destacado" style={{color: 'rgb(70, 130, 180)'}}>${Number(item.MontoIngreso).toLocaleString()}</td>
                    <td className="texto-gris">{new Date(item.FechaIngreso).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon" onClick={() => prepararEdicion(item)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminarIngreso(item.IdIngreso)}>🗑️</button>
                      <button
                        className="btn-icon"
                        onClick={() => { verDetalles(item); }}
                      >
                        📊
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button className="boton-primario" onClick={() => { resetearForm(); setModalAbierto(true); }}>
        Agregar Ingreso
      </button>

      <div style={vermas === true ? { display: "block" } : { display: "none" }}>
        

        {vermas && itemSeleccionado && (
          <div className="seccion-detalle-inferior">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2 style={{ margin: 0 }}>Detalles del Ingreso</h2>
              <button onClick={() => setVerMas(false)} className="btn-link">
                Cerrar 
              </button>
            </div>

            <div className="tabla-responsive">
              <table className="tabla-ingresos">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Cuenta</th>
                    <th>Tipo de Ingreso</th>
                    <th>Divisa</th>
                  </tr>
                  <tr>
                    <td>{itemSeleccionado.Descripcion}</td>
                    <td>${Number(itemSeleccionado.MontoIngreso).toLocaleString()}</td>
                    <td>{new Date(itemSeleccionado.FechaIngreso).toLocaleDateString()}</td>
                    <td>{itemSeleccionado.IdCuenta}</td>
                    <td>{itemSeleccionado.IdTipoIngreso}</td>
                    <td>{itemSeleccionado.IdDivisa}</td>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        )}

       
      </div>
      <div>
         {/* MODAL CONECTADO AL ESTADO 'FORM' */}
        {modalAbierto && (
  <div className="capa-modal">
    <div className="contenido-modal">
      <h3 className="modal-titulo">
        {form.IdIngreso ? "Editar Ingreso" : "Nuevo Ingreso"}
      </h3>
      
      <div className="formulario-grid">
        {/* Fila 1: Descripción */}
        <div className="formulario-grupo full-width">
          <label>Descripción</label>
          <input 
            type="text" 
            placeholder="Ej: Sueldo mensual, Venta de servicios..."
            value={form.Descripcion} 
            onChange={(e) => setForm({...form, Descripcion: e.target.value})}
          />
        </div>

        {/* Fila 2: Monto y Fecha */}
        <div className="formulario-grupo">
          <label>Monto ($)</label>
          <input 
            type="number" 
            step="0.01"
            value={form.MontoIngreso} 
            onChange={(e) => setForm({...form, MontoIngreso: e.target.value})}
          />
        </div>

        <div className="formulario-grupo">
          <label>Fecha</label>
          <input 
            type="date" 
            value={form.FechaIngreso} 
            onChange={(e) => setForm({...form, FechaIngreso: e.target.value})}
          />
        </div>

        {/* Fila 3: Cuentas y Tipos (Faltantes) */}
        <div className="formulario-grupo">
          <label>Cuenta de Destino</label>
          <select 
            value={form.IdCuenta} 
            onChange={(e) => setForm({...form, IdCuenta: parseInt(e.target.value)})}
          >
            <option value={1}>Caja de Ahorro</option>
            <option value={2}>Efectivo</option>
            <option value={3}>Billetera Virtual</option>
          </select>
        </div>

        <div className="formulario-grupo">
          <label>Tipo de Ingreso</label>
          <select 
            value={form.IdTipoIngreso} 
            onChange={(e) => setForm({...form, IdTipoIngreso: parseInt(e.target.value)})}
          >
            <option value={1}>Sueldo</option>
            <option value={2}>Inversiones</option>
            <option value={3}>Venta</option>
            <option value={4}>Otros</option>
          </select>
        </div>

        {/* Fila 4: Divisa */}
        <div className="formulario-grupo">
          <label>Divisa</label>
          <select 
            value={form.IdDivisa} 
            onChange={(e) => setForm({...form, IdDivisa: parseInt(e.target.value)})}
          >
            <option value={1}>Pesos (ARS)</option>
            <option value={2}>Dólares (USD)</option>
          </select>
        </div>
      </div>

      <div className="formulario-acciones">
        <button className="boton-secundario" onClick={() => setModalAbierto(false)}>
          Cancelar
        </button>
        <button className="boton-primario" onClick={manejarGuardar}>
          {form.IdIngreso ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
export default Ingreso;