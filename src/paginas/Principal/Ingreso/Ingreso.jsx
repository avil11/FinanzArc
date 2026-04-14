import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './Ingreso.css';

function Ingreso() {
    const [modalAbierto, setModalAbierto] = useState(false);
    const COLORES = ['#d4af37', '#2e7d32', '#1976d2', '#616161'];

    const datosMock = [
        { nombre: 'Salario', valor: 5000 },
        { nombre: 'Freelance', valor: 1500 },
        { nombre: 'Inversiones', valor: 800 },
        { nombre: 'Otros', valor: 700 }
    ];

    return (
        <div className="contenedor-principal">
            <h1 className="titulo-seccion">Fuentes de Ingreso</h1>

            <div className="tarjeta" style={{ width: '100%', maxWidth: '500px' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={datosMock}
                            cx="50%" cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="valor"
                        >
                            {datosMock.map((_, i) => (
                                <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h2 style={{ marginTop: '40px', color: 'var(--texto-principal)' }}>Detalle de Ingresos</h2>
                <table className="tabla-ingresos">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Monto</th>
                            <th>Divisa</th>
                            <th>Descripcion</th>
                            <th>Fecha Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosMock.map((ingreso, index) => (
                            <tr key={index}>
                                <td>{ingreso.nombre}</td>
                                <td>${ingreso.valor.toLocaleString()}</td>
                                <td>ARS</td>
                                <td>Descripción del ingreso</td>
                                <td>01/09/2024</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                        

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
                            <button className="boton-secundario" onClick={() => setModalAbierto(false)}>
                                Cancelar
                            </button>
                            <button className="boton-primario" onClick={() => setModalAbierto(false)}>
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