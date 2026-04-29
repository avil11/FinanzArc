import React, { useEffect, useState, useCallback } from 'react';
import './Comparativa.css';

const API_BASE_URL = "http://localhost:60496/api";

function Comparativa() {
    const [cargando, setCargando] = useState(true);
    const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, neto: 0 });
    const [movimientos, setMovimientos] = useState([]);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const idUsuario = userData.IdUsuario || 3;

    const cargarMesActual = useCallback(async () => {
        setCargando(true);
        try {
            const [resI, resG, resHI, resHG] = await Promise.all([
                fetch(`${API_BASE_URL}/Ingreso/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/Gasto/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/HistorialIngreso/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/HistorialGasto/ByUsuario/${idUsuario}`)
            ]);

            const ingresosVivos = resI.ok ? await resI.json() : [];
            const gastosVivos = resG.ok ? await resG.json() : [];
            const histIngresos = resHI.ok ? await resHI.json() : [];
            const histGastos = resHG.ok ? await resHG.json() : [];

            // --- LÓGICA DE 6 AM ---
            const ahora = new Date();
            // "ahoraAjustado" nos dice en qué mes estamos según el horario de 6am a 6am
            const ahoraAjustado = new Date(ahora.getTime());
            ahoraAjustado.setHours(ahoraAjustado.getHours() - 6);

            const mesCorriente = ahoraAjustado.getMonth();
            const anioCorriente = ahoraAjustado.getFullYear();

            const filtro6AM = (item) => {
                const fechaStr = item.FechaIngreso || item.FechaGasto || item.Fecha;
                if (!fechaStr) return false;
                
                const fechaOriginal = new Date(fechaStr);
                // Restamos 6 horas: si son las 05:00 AM del día 1, 
                // para JS pasará a ser las 23:00 PM del día anterior (mes anterior).
                const fechaVirtual = new Date(fechaOriginal.getTime());
                fechaVirtual.setHours(fechaVirtual.getHours() - 6);

                return fechaVirtual.getMonth() === mesCorriente && 
                       fechaVirtual.getFullYear() === anioCorriente;
            };

            // 1. BALANCE (Solo tablas vivas filtradas por 6AM)
            const totalI = ingresosVivos.filter(filtro6AM).reduce((acc, curr) => acc + (curr.MontoIngreso || 0), 0);
            const totalG = gastosVivos.filter(filtro6AM).reduce((acc, curr) => acc + (curr.MontoGasto || 0), 0);
            setResumen({ ingresos: totalI, gastos: totalG, neto: totalI - totalG });
            
            // 2. DETALLE (Normalización de nombres + filtro 6AM)
            const listaIngresos = [
                ...ingresosVivos.filter(filtro6AM).map(i => ({
                    tipo: 'ingreso', monto: i.MontoIngreso, desc: i.NombreIngreso || "Ingreso",
                    fechaObj: new Date(i.FechaIngreso)
                })),
                ...histIngresos.filter(filtro6AM).map(i => ({
                    tipo: 'ingreso', monto: i.Monto, desc: "Ingreso Archivado",
                    fechaObj: new Date(i.Fecha)
                }))
            ];

            const listaGastos = [
                ...gastosVivos.filter(filtro6AM).map(g => ({
                    tipo: 'gasto', monto: g.MontoGasto, desc: g.NombreGasto || "Gasto",
                    fechaObj: new Date(g.FechaGasto)
                })),
                ...histGastos.filter(filtro6AM).map(g => ({
                    tipo: 'gasto', monto: g.Monto, desc: "Gasto Archivado",
                    fechaObj: new Date(g.Fecha)
                }))
            ];

            setMovimientos([...listaIngresos, ...listaGastos].sort((a, b) => b.fechaObj - a.fechaObj));

        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setCargando(false);
        }
    }, [idUsuario]);

    const archivarMesActual = async () => {
        if (!window.confirm("¿Archivar mes? El balance volverá a cero según el horario 6AM-6AM.")) return;
        try {
            setCargando(true);
            const response = await fetch(`${API_BASE_URL}/Cierre/FinalizarMes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ IdUsuario: idUsuario })
            });
            if (response.ok) {
                alert("¡Mes archivado!");
                await cargarMesActual(); 
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarMesActual(); }, [cargarMesActual]);

    // ... (El resto del return del componente se mantiene igual que antes)
    if (cargando) return <div className="comparativaFlex"><div className="loader-mes">Sincronizando...</div></div>;

    return (
        <div className="comparativaFlex">
            {/* Aquí va todo tu JSX que ya tenías */}
            <div className='comparativa-seccion-root'>
                <div className="comparativa-container layout-split">
                    <div className='comparativa-main-card'>
                        <h1>Balance Mensual (6AM-6AM)</h1>
                        <div className="comparativa-stats-grid">
                            <div className="stat-box income">
                                <span className='ingresoSpan'>INGRESOS</span>
                                <span className='ingresoSpanDinero'>+ ${resumen.ingresos.toLocaleString()}</span>
                            </div>
                            <div className="stat-box expense">
                                <span className='gastoSpan'>GASTOS</span>
                                <span className='gastoSpanDinero'>- ${resumen.gastos.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="net-balance-hero">
                            <h2 className={resumen.neto >= 0 ? 'net-pos' : 'net-neg'}>
                                ${resumen.neto.toLocaleString()}
                            </h2>
                        </div>
                        <button className="btn-finalizar-ciclo-azul" onClick={archivarMesActual}>
                            ARCHIVAR MES
                        </button>
                    </div>

                    <div className="comparativa-details-sidebar">
                        <h3>Detalle del Mes</h3>
                        <div className="sidebar-scroll-area">
                            {movimientos.map((m, idx) => (
                                <div key={idx} className="movimiento-item-card">
                                    <div className="mov-info">
                                        <small>{m.fechaObj.toLocaleDateString()}</small>
                                        <p>{m.desc}</p>
                                    </div>
                                    <span className={m.tipo === 'ingreso' ? 'm-pos' : 'm-neg'}>
                                        ${m.monto.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Comparativa;