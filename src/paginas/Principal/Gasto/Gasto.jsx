import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Gasto.css";

function Gasto() {
  const [modalAbierto, setModalAbierto] = useState(false);

  // Azul Vibrante, Oro Principal, Oro Oscuro, Gris Plomo
  const COLORES = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];

  const datosMock = [
    { nombre: "Supermercado", valor: 50000 },
    { nombre: "Electrodomestico", valor: 150000 },
    { nombre: "Indumentaria", valor: 80000 },
    { nombre: "Gastos hormigas", valor: 20000 },
  ];

  return (
    /* 🔥 CLAVE: Usamos una clase única para encapsular todo */
    <div className="pagina-gasto-contenedor">
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1 className="titulo-seccion">Fuentes de Gasto</h1>
          <p
            style={{
              textAlign: "center",
              maxWidth: "80%",
              color: "rgb(136, 136, 136)",
            }}
          >
            Visualiza y gestiona todas tus fuentes de Gasto en un solo lugar.
          </p>
        </div>
      </div>
      <div className="pagina-gasto-tarjeta">
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
          <div className="buscador-gasto-categoria">
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
            <table className="tabla-gasto">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Monto</th>
                  <th>Divisa</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {datosMock.slice(0, 3).map((gasto, index) => (
                  <tr key={index}>
                    <td>{gasto.nombre}</td>
                    <td className="monto-destacado">
                      ${gasto.valor.toLocaleString()}
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
          <table className="tabla-gasto">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Monto</th>
                <th>Divisa</th>
                <th>Descripción</th>
                <th>Fecha Gasto</th>
              </tr>
            </thead>
            <tbody>
              {datosMock.map((gasto, index) => (
                <tr key={index}>
                  <td>{gasto.nombre}</td>
                  <td className="monto-destacado">
                    ${gasto.valor.toLocaleString()}
                  </td>
                  <td>ARS</td>
                  <td className="texto-gris">Descripción del gasto</td>
                  <td className="texto-gris">01/09/2024</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button className="boton-primario" onClick={() => setModalAbierto(true)}>
        Agregar Gasto
      </button>
      {/* MODAL */}
      {modalAbierto && (
        <div className="capa-modal">
          <div className="contenido-modal">
            <h3>Nuevo Gasto</h3>
            <div className="formulario-grupo">
              <label>Nombre del Gasto</label>
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

export default Gasto;
