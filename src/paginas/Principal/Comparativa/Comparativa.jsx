import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Comparativa.css';

const API_BASE_URL = "http://localhost:60496/api";

function Comparativa() {
    const { periodo } = useParams(); // 'dia', 'semana' o 'mes'
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, neto: 0 });
    const [movimientos, setMovimientos] = useState([]);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const idUsuario = userData.IdUsuario || 20;

    const procesarDatos = useCallback(async () => {
        setCargando(true);
        try {
            const [resI, resG] = await Promise.all([
                fetch(`${API_BASE_URL}/Ingreso/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/Gasto/ByUsuario/${idUsuario}`)
            ]);

            const todosIngresos = resI.ok ? await resI.json() : [];
            const todosGastos = resG.ok ? await resG.json() : [];

            const hoy = new Date();

            const filtrarPorPeriodo = (item) => {
                const fechaItem = new Date(item.FechaIngreso || item.FechaGasto || item.Fecha);
                
                if (periodo === 'dia') {
                    return fechaItem.toDateString() === hoy.toDateString();
                }
                if (periodo === 'semana') {
                    const unaSemanaAtras = new Date();
                    unaSemanaAtras.setDate(hoy.getDate() - 7);
                    return fechaItem >= unaSemanaAtras && fechaItem <= hoy;
                }
                if (periodo === 'mes') {
                    return fechaItem.getMonth() === hoy.getMonth() &&
                           fechaItem.getFullYear() === hoy.getFullYear();
                }
                return false;
            };

            const ingresosFiltrados = todosIngresos.filter(filtrarPorPeriodo);
            const gastosFiltrados = todosGastos.filter(filtrarPorPeriodo);

            const totalI = ingresosFiltrados.reduce((acc, curr) => acc + (curr.MontoIngreso || 0), 0);
            const totalG = gastosFiltrados.reduce((acc, curr) => acc + (curr.MontoGasto || 0), 0);

            setResumen({ ingresos: totalI, gastos: totalG, neto: totalI - totalG });

            // Detalle solo para la vista de mes
            if (periodo === 'mes') {
                const listado = [
                    ...ingresosFiltrados.map(i => ({ ...i, tipo: 'ingreso', monto: i.MontoIngreso, desc: i.NombreIngreso, fecha: i.FechaIngreso })),
                    ...gastosFiltrados.map(g => ({ ...g, tipo: 'gasto', monto: g.MontoGasto, desc: g.NombreGasto, fecha: g.FechaGasto }))
                ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setMovimientos(listado);
            }
        } catch (e) {
            console.error("Error en reporte:", e);
        } finally {
            setCargando(false);
        }
    }, [idUsuario, periodo]);

    useEffect(() => {
        procesarDatos();
    }, [procesarDatos]);

    const esVistaMes = periodo === 'mes';

    if (cargando) return (
        <div className="comparativaFlex">
            <div className="loader-premium"><div className="spinner-gold"></div><p>Sincronizando Balance...</p></div>
        </div>
    );

    return (
        <div className="comparativaFlex">
            <div className='comparativa-seccion-root'>
                <div className={`comparativa-container ${esVistaMes ? 'layout-split' : 'layout-centered'}`}>

                    {/* TARJETA PRINCIPAL: BALANCE */}
                    <div className='comparativa-main-card'>
                        <div className="comparativa-header">
                            <div className="periodo-selector-pill">
                                <button className={periodo === 'dia' ? 'active' : ''} onClick={() => navigate('/comparativa/dia')}>DÍA</button>
                                <button className={periodo === 'semana' ? 'active' : ''} onClick={() => navigate('/comparativa/semana')}>SEMANA</button>
                                <button className={periodo === 'mes' ? 'active' : ''} onClick={() => navigate('/comparativa/mes')}>MES</button>
                            </div>
                            <h1>Balance {periodo === 'dia' ? 'Diario' : periodo === 'semana' ? 'Semanal' : 'Mensual'}</h1>
                        </div>

                        <div className="comparativa-stats-grid">
                            <div className="stat-box income">
                                <span className="stat-label">Ingresos</span>
                                <span className="stat-value">+ ${resumen.ingresos.toLocaleString('es-AR')}</span>
                            </div>
                            <div className="stat-box expense">
                                <span className="stat-label">Gastos</span>
                                <span className="stat-value">- ${resumen.gastos.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        <div className="net-balance-hero">
                            <div className="net-content">
                                <p>
                                    {periodo === 'dia' ? 'Resultado Neto de Hoy' : 
                                     periodo === 'semana' ? 'Balance últimos 7 días' : 
                                     'Saldo Final del Mes'}
                                </p>
                                <h2 className={resumen.neto >= 0 ? 'net-pos' : 'net-neg'}>
                                    {resumen.neto < 0 ? '-' : ''} ${Math.abs(resumen.neto).toLocaleString('es-AR')}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR: SOLO SE MUESTRA EN MES */}
                    {esVistaMes && (
                        <div className="comparativa-details-sidebar">
                            <div className="sidebar-header">
                                <h3>Movimientos del Mes</h3>
                                <span className="badge-count">{movimientos.length} mov.</span>
                            </div>
                            <div className="sidebar-scroll-area">
                                {movimientos.length === 0 ? (
                                    <p className="vacio-txt">Sin movimientos registrados</p>
                                ) : (
                                    movimientos.map((m, i) => (
                                        <div key={i} className="movimiento-item-card">
                                            <div className="mov-info">
                                                <small>{new Date(m.fecha).toLocaleDateString()}</small>
                                                <p>{m.desc}</p>
                                            </div>
                                            <span className={m.tipo === 'ingreso' ? 'm-pos' : 'm-neg'}>
                                                {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Comparativa;