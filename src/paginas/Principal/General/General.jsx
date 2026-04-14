import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import './General.css';

const GastoIngreso = () => {
    const [mostrarSaludo, setMostrarSaludo] = useState(true);
    const COLORES = ['#d4af37', '#2e7d32', '#1976d2', '#616161'];

    useEffect(() => {
        const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);
        return () => clearTimeout(temporizador);
    }, []);

    const datosGastos = [
        { nombre: 'Alimentación', valor: 450 },
        { nombre: 'Transporte', valor: 280 },
        { nombre: 'Entretenimiento', valor: 150 },
        { nombre: 'Otros', valor: 120 },
    ];

    const datosIngresos = [
        { nombre: 'Salario', valor: 2000 },
        { nombre: 'Freelance', valor: 600 },
        { nombre: 'Inversiones', valor: 400 },
    ];

    const metasAhorro = [
        { etiqueta: 'Fondo de Emergencia', actual: 3500, objetivo: 5000 },
        { etiqueta: 'Vacaciones', actual: 1200, objetivo: 2000 },
        { etiqueta: 'Educación', actual: 2800, objetivo: 4000 },
    ];

    const BarraProgreso = ({ actual, objetivo, etiqueta }) => {
        const porcentaje = Math.min(100, (actual / objetivo) * 100);
        return (
            <div className="item-progreso">
                <div className="info-progreso">
                    <span style={{ fontWeight: '500' }}>{etiqueta}</span>
                    <span style={{ color: 'var(--dorado-acento)' }}>{porcentaje.toFixed(0)}%</span>
                </div>
                <div className="pista-barra">
                    <div className="relleno-barra" style={{ width: `${porcentaje}%` }} />
                </div>
                <div className="texto-monto">${actual.toLocaleString()} / ${objetivo.toLocaleString()}</div>
            </div>
        );
    };

    return (
        <div className="contenedor-principal">
            <div className="seccion-encabezado">
                {mostrarSaludo ? (
                    <h2>¡Bienvenido, Pepe Ramirez!</h2>
                ) : (
                    <h2>Resumen Financiero</h2>
                )}
                <p style={{ color: 'var(--texto-tenue)' }}>Gestioná tu patrimonio en FinanzARC</p>
            </div>
            
            <div className="panel-graficos">
                <div className="tarjeta">
                    <h3>Gastos por Categoría</h3>
                    <PieChart width={300} height={250}>
                        <Pie
                            data={datosGastos}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="valor"
                        >
                            {datosGastos.map((_, i) => (
                                <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', color: '#fff' }} />
                    </PieChart>
                </div>

                <div className="tarjeta">
                    <h3>Fuentes de Ingreso</h3>
                    <PieChart width={300} height={250}>
                        <Pie
                            data={datosIngresos}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="valor"
                        >
                            {datosIngresos.map((_, i) => (
                                <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', color: '#fff' }} />
                    </PieChart>
                </div>
            </div>
            
            <div className="contenedor-ahorros">
                <h3 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--texto-principal)' }}>
                    Objetivos de Ahorro
                </h3>
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
    );
};

export default GastoIngreso;