import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Comparativa.css';

const API_BASE_URL = "http://localhost:60496/api";

function Comparativa() {
    const { periodo } = useParams();
    const [cargando, setCargando] = useState(true);
    const [finanzas, setFinanzas] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0 });

    useEffect(() => {
        const obtenerDatos = async () => {
            const token = localStorage.getItem("Token");
            
            if (!token) {
                console.warn("No hay token guardado.");
                setCargando(false);
                return;
            }

            setCargando(true);
            try {
                const response = await fetch(`${API_BASE_URL}/comparativa/${periodo}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Enviamos el token para que C# lo busque
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setFinanzas({
                        totalIngresos: data.totalIngresos ?? 0,
                        totalGastos: data.totalGastos ?? 0,
                        balance: data.balance ?? 0
                    });
                } else {
                    console.error("Error en la respuesta de la API:", response.status);
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setCargando(false);
            }
        };

        if (periodo) { obtenerDatos(); }
    }, [periodo]);

    const renderCards = (titulo, descripcion) => (
        <div className='finalizar-Comparativa-Contenedor'>
            <div className="finalizar-TituloSeccion">
                <h1>{titulo}</h1>
                <p>{descripcion}</p>
            </div>
            
            <div className="data-grid-placeholder">
                <div className="card-dato">
                    <span>Total Ingresos</span>
                    <strong style={{ color: '#4dff88' }}>
                        + ${finanzas.totalIngresos.toLocaleString('es-AR')}
                    </strong>
                </div>
                <div className="card-dato">
                    <span>Total Gastos</span>
                    <strong style={{ color: '#ff4d4d' }}>
                        - ${finanzas.totalGastos.toLocaleString('es-AR')}
                    </strong>
                </div>
                <div className="card-dato" style={{ borderLeft: '4px solid #fff' }}>
                    <span>Balance Neto</span>
                    <strong style={{ color: finanzas.balance >= 0 ? '#4dff88' : '#ff4d4d' }}>
                        ${finanzas.balance.toLocaleString('es-AR')}
                    </strong>
                </div>
            </div>
        </div>
    );

    return (
        <div className='comparativaDivSeccion'>
            <div className="comparativaDiv">
                {cargando ? (
                    <p style={{ color: 'white', textAlign: 'center' }}>Validando sesión y consultando datos...</p>
                ) : (
                    <>
                        {periodo === 'dia' && renderCards("Cierre Diario", "Análisis basado en tu token de usuario.")}
                        {periodo === 'semana' && renderCards("Cierre Semanal", "Resumen de los últimos 7 días.")}
                        {periodo === 'mes' && renderCards("Cierre Mensual", "Balance total del mes actual.")}
                        {!['dia', 'semana', 'mes'].includes(periodo) && <h2>Seleccioná un periodo</h2>}
                    </>
                )}
            </div>
        </div>
    );
}

export default Comparativa;