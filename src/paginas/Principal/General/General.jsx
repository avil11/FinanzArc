import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./General.css";

const GastoIngreso = () => {
  const [mostrarSaludo, setMostrarSaludo] = useState(true);
  // Azul Vibrante, Oro Principal, Oro Oscuro, Gris Plomo
  const COLORES = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];

  useEffect(() => {
    const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);
    return () => clearTimeout(temporizador);
  }, []);

  const datosGastos = [
    { nombre: "Alimentación", valor: 450 },
    { nombre: "Transporte", valor: 280 },
    { nombre: "Entretenimiento", valor: 150 },
    { nombre: "Otros", valor: 120 },
  ];

  const datosIngresos = [
    { nombre: "Salario", valor: 2000 },
    { nombre: "Freelance", valor: 600 },
    { nombre: "Inversiones", valor: 400 },
  ];

  const metasAhorro = [
    { etiqueta: "Fondo de Emergencia", actual: 3500, objetivo: 350000 },
    { etiqueta: "Vacaciones", actual: 1200, objetivo: 2000 },
    { etiqueta: "Educación", actual: 2800, objetivo: 4000 },
  ];

  const BarraProgreso = ({ actual, objetivo, etiqueta }) => {
    const porcentaje = Math.min(100, (actual / objetivo) * 100);
    return (
      <div className="item-progreso-general">
        <div className="info-progreso-general">
          <span style={{ fontWeight: "500", color: "#ffffff" }}>
            {etiqueta}
          </span>
          <span style={{ color: "#c8b277", fontWeight: "bold" }}>
            {porcentaje.toFixed(0)}%
          </span>
        </div>
        <div className="pista-barra-general">
          <div
            className="relleno-barra-general"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <div className="texto-monto-general">
          ${actual.toLocaleString()} / ${objetivo.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general">
        {mostrarSaludo ? (
          <h2>¡Bienvenido, Pepe Ramirez!</h2>
        ) : (
          <h2>Resumen Financiero</h2>
        )}
        <p style={{ color: "#888888" }}>Gestioná tu patrimonio en FinanzARC</p>
      </div>

      <div className="panel-graficos-general">
        <div className="tarjeta-general">
          <h3>Gastos por Categoría</h3>
          {/* El ResponsiveContainer hace que se adapte al celular */}
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
              >
                {datosGastos.map((_, i) => (
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

        <div className="tarjeta-general">
          <h3>Fuentes de Ingreso</h3>
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
              >
                {datosIngresos.map((_, i) => (
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
      </div>

      <div className="contenedor-ahorros-general">
        <h3 className="titulo-ahorros-general">Objetivos de Ahorro</h3>
        <div className="grid-ahorros-general">
          {metasAhorro.map((meta, indice) => (
            <BarraProgreso
              key={indice}
              actual={meta.actual}
              objetivo={meta.objetivo}
              etiqueta={meta.etiqueta}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GastoIngreso;
