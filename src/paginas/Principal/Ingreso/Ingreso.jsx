import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Ingreso.css";

function Ingreso() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("Token"));

effect(() => {
    if (!isLoggedIn) {
      navigate("/"); // Redirige al inicio si no hay token
    }
}, [isLoggedIn]);
  // Azul Vibrante, Oro Principal, Oro Oscuro, Gris Plomo
  const COLORES = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];

  const datosMock = [
    { nombre: "Salario", valor: 5000 },
    { nombre: "Freelance", valor: 1500 },
    { nombre: "Inversiones", valor: 800 },
    { nombre: "Otros", valor: 700 },
  ];

  return (
    /* 🔥 CLAVE: Usamos una clase única para encapsular todo */
    <div className="pagina-ingreso-contenedor">
      <div style={{ display: "flex", width: "100%", justifyContent: "center", marginBottom: "30px" }}>
        <div style={{display:'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <h1 className="titulo-seccion">Fuentes de Ingreso</h1>
          <p style={{textAlign: 'center', maxWidth: '80%', color: "rgb(136, 136, 136)"}}>
            Visualiza y gestiona todas tus fuentes de ingreso en un solo lugar.           
          </p>
        </div>
      </div>
      <div className="pagina-ingreso-tarjeta">
        {/* GRÁFICO */}
        <div className="tarjeta">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={datosMock}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="valor"
              >
                {datosMock.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORES[i % COLORES.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1f",
                  border: "1px solid rgba(200, 178, 119, 0.3)",
                  color: "#fff",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#c8b277" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TABLA FILTRADA */}
        <div className="contenedor-tabla-filtradaCategoria">
          <div className="buscador-ingreso-categoria">
            <h2 className="subtitulo-seccion">Filtrar por categoría:</h2>

            <div className="grupo-input-buscar">
              <input
                type="text"
                placeholder="Ej: Salario, Freelance..."
                className="input-buscar"
              />
              <button type="button" className="boton-buscar">
                Buscar
              </button>
            </div>
          </div>
          <div className="tabla-responsive">
            <table className="tabla-ingresos">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Monto</th>
                  <th>Divisa</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {datosMock.slice(0, 3).map((ingreso, index) => (
                  <tr key={index}>
                    <td>{ingreso.nombre}</td>
                    <td className="monto-destacado">
                      ${ingreso.valor.toLocaleString()}
                    </td>
                    <td>ARS</td>
                    <td className="texto-gris">01/09/24</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABLA GENERAL */}
      <div className="contenedor-tabla">
        <h2 className="subtitulo-seccion">Historial Completo</h2>
        <div className="tabla-responsive">
          <table className="tabla-ingresos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Monto</th>
                <th>Divisa</th>
                <th>Descripción</th>
                <th>Fecha Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {datosMock.map((ingreso, index) => (
                <tr key={index}>
                  <td>{ingreso.nombre}</td>
                  <td className="monto-destacado">
                    ${ingreso.valor.toLocaleString()}
                  </td>
                  <td>ARS</td>
                  <td className="texto-gris">Descripción del ingreso</td>
                  <td className="texto-gris">01/09/2024</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button className="boton-primario" onClick={() => setModalAbierto(true)}>
        Agregar Ingreso
      </button>

      {/* MODAL */}
      {modalAbierto && (
        <div className="capa-modal">
          <div className="contenido-modal">
            <h3>Nuevo Ingreso</h3>
            <div className="formulario-grupo">
              <label>Nombre del Ingreso</label>
              <input type="text" placeholder="Ej: Bono Trimestral" />
            </div>
            <div className="formulario-grupo">
              <label>Monto ($)</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div className="formulario-grupo">
              <label>Divisa</label>
              <select defaultValue="ARS">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div className="formulario-acciones">
              <button
                className="boton-secundario"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button
                className="boton-primario modal-btn"
                onClick={() => setModalAbierto(false)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ingreso;
