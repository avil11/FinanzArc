import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Link } from "react-router-dom";
import '../General/General.css';
import './Comparativa.css';
import { obtenerTasas } from '../../../apiConfig'; // Ajusta la ruta

const API_BASE_URL = "http://localhost:60496/api";

const Comparativa = () => {
    // --- ESTADOS GLOBALES ---
    const [cargando, setCargando] = useState(true);
    const [idUsuario, setIdUsuario] = useState(null);
    const [rolHabilitado, setRolHabilitado] = useState(true);
    const [tipoPresentacion, setTipoPresentacion] = useState(1);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalArchivarAbierto, setModalArchivarAbierto] = useState(false);
    const [datosModal, setDatosModal] = useState({ titulo: "", items: [], tipo: "" });
    const [mostrarGraficoLinea, setMostrarGraficoLinea] = useState(false);
    const [datosLinea, setDatosLinea] = useState([]);
    const [cargandoLinea, setCargandoLinea] = useState(false);
    const [maximoGrafico, setMaximoGrafico] = useState(0);

    const [tasas, setTasas] = useState({ USD: 0, EUR: 0 });
    const DIVISAS_MAP = { 1: 'ARS', 2: 'USD', 3: 'EUR' };

    // Paletas de colores para los gráficos
    const coloresIngreso = ["#007AFF", "#FF9500", "#34C759", "#AF52DE"];
    const coloresGasto = ["#FF4B4B", "#FFD700", "#4B79FF", "#FF7F50"];

    // Gestión de offsets (0 = mes actual, -1 = mes pasado, etc.)
    const [offsets, setOffsets] = useState({ gastoA: 0, gastoB: -1, ingresoA: 0, ingresoB: -1 });

    // Valores totales y listas detalladas
    const [datos, setDatos] = useState({
        gastoATotal: 0, gastoALista: [],
        gastoBTotal: 0, gastoBLista: [],
        ingresoATotal: 0, ingresoALista: [],
        ingresoBTotal: 0, ingresoBLista: []
    });

    // --- LÓGICA DE USUARIO Y TOKEN ---
    const validarUsuario = useCallback(async () => {
        const token = localStorage.getItem("Token");
        if (!token) { setCargando(false); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) {
                const user = await res.json();
                const rolUsuario = user.IdRol || user.idRol;
                if (rolUsuario === 3 || rolUsuario === 4) {
                    setIdUsuario(user.IdUsuario);
                    setRolHabilitado(true);
                } else {
                    setRolHabilitado(false);
                    setCargando(false);
                }
            } else { setCargando(false); }
        } catch (error) { console.error(error); setCargando(false); }
    }, []);

    // --- UTILIDADES DE FECHAS ---
    const getNombreMes = (offset) => {
        const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + (offset || 0));
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const getRangoMes = (offset) => {
        const ahora = new Date();
        const inicio = new Date(ahora.getFullYear(), ahora.getMonth() + offset, 1, 6, 0, 0);
        const fin = new Date(ahora.getFullYear(), ahora.getMonth() + offset + 1, 1, 5, 59, 59);
        return { inicio: inicio.toISOString(), fin: fin.toISOString() };
    };

    const calcularMontoEnPesos = useCallback((monto, idDivisa) => {
        if (idDivisa === 2) return monto * tasas.USD;
        if (idDivisa === 3) return monto * tasas.EUR;
        return monto;
    }, [tasas]);

    const cargarDatoIndividual = useCallback(async (tipo, offset, clave) => {
        if (!idUsuario) return;
        const { inicio, fin } = getRangoMes(offset);
        const epVivo = tipo === 'gasto' ? `/Gasto/ByUsuario/${idUsuario}` : `/Ingreso/ByUsuario/${idUsuario}`;
        const epHist = tipo === 'gasto' ? `/HistorialGasto/ByUsuario/${idUsuario}` : `/HistorialIngreso/ByUsuario/${idUsuario}`;

        try {
            const [resV, resH] = await Promise.all([fetch(`${API_BASE_URL}${epVivo}`), fetch(`${API_BASE_URL}${epHist}`)]);
            const vivos = resV.ok ? await resV.json() : [];
            const historial = resH.ok ? await resH.json() : [];

            const todos = [...vivos, ...historial];

            // 1. Filtrar los del mes correspondiente
            const filtrados = todos.filter(item => {
                const fechaStr = item.FechaGasto || item.FechaIngreso || item.Fecha;
                if (!fechaStr) return false;
                const f = new Date(fechaStr);
                return (f >= new Date(inicio) && f <= new Date(fin));
            });

            // 2. Mapear para el gráfico (convirtiendo a pesos)
            const listaFormateada = filtrados.map(item => ({
                nombre: item.Descripcion || item.NombreIngreso || "Registro Histórico",
                valor: calcularMontoEnPesos(Number(item.MontoGasto || item.MontoIngreso || item.Monto || 0), item.IdDivisa || 1)
            }));

            // 3. Sumar el total
            const total = listaFormateada.reduce((acc, curr) => acc + curr.valor, 0);

            setDatos(prev => ({
                ...prev,
                [`${clave}Total`]: total,
                [`${clave}Lista`]: listaFormateada
            }));
        } catch (error) { console.error("Error cargando datos:", error); }
    }, [idUsuario, calcularMontoEnPesos]);

    const cargarTodosLosDatos = useCallback(async () => {
        if (!idUsuario) return;
        setCargando(true);
        await Promise.all([
            cargarDatoIndividual('gasto', offsets.gastoA, 'gastoA'),
            cargarDatoIndividual('gasto', offsets.gastoB, 'gastoB'),
            cargarDatoIndividual('ingreso', offsets.ingresoA, 'ingresoA'),
            cargarDatoIndividual('ingreso', offsets.ingresoB, 'ingresoB')
        ]);
        setCargando(false);
    }, [idUsuario, offsets, cargarDatoIndividual]);

    // ... (Tu función cargarDatosLinea queda igual) ...
    const cargarDatosLinea = useCallback(async () => {
        if (!idUsuario) return;
        try {
            setCargandoLinea(true);
            const [resIngresos, resHistIngresos, resGastos, resHistGastos] = await Promise.all([
                fetch(`${API_BASE_URL}/Ingreso/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/HistorialIngreso/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/Gasto/ByUsuario/${idUsuario}`),
                fetch(`${API_BASE_URL}/HistorialGasto/ByUsuario/${idUsuario}`)
            ]);
            const ingresos = resIngresos.ok ? await resIngresos.json() : [];
            const histIngresos = resHistIngresos.ok ? await resHistIngresos.json() : [];
            const gastos = resGastos.ok ? await resGastos.json() : [];
            const histGastos = resHistGastos.ok ? await resHistGastos.json() : [];
            const todosIngresos = [...ingresos, ...histIngresos];
            const todosGastos = [...gastos, ...histGastos];
            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const añoActual = new Date().getFullYear();

            const datosPorMes = meses.map((mes, index) => {
                const totalIngresos = todosIngresos.reduce((acc, item) => {
                    const fecha = new Date(item.FechaIngreso || item.Fecha);
                    if (fecha.getMonth() === index && fecha.getFullYear() === añoActual) {
                        return acc + calcularMontoEnPesos(Number(item.MontoIngreso || item.Monto || 0), item.IdDivisa || 1);
                    }
                    return acc;
                }, 0);
                const totalGastos = todosGastos.reduce((acc, item) => {
                    const fecha = new Date(item.FechaGasto || item.Fecha);
                    if (fecha.getMonth() === index && fecha.getFullYear() === añoActual) {
                        return acc + calcularMontoEnPesos(Number(item.MontoGasto || item.Monto || 0), item.IdDivisa || 1);
                    }
                    return acc;
                }, 0);
                return { mes, ingresos: totalIngresos, gastos: totalGastos };
            });

            let maximo = 0;
            datosPorMes.forEach(item => { const mayor = Math.max(item.ingresos, item.gastos); if (mayor > maximo) maximo = mayor; });
            setMaximoGrafico(maximo + 1000);

            setDatosLinea([]);
            for (let i = 0; i < datosPorMes.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 120));
                setDatosLinea(prev => [...prev, datosPorMes[i]]);
            }
        } catch (error) { console.error(error); } finally { setCargandoLinea(false); }
    }, [idUsuario, calcularMontoEnPesos]);

    useEffect(() => { const cargarTasas = async () => { const valores = await obtenerTasas(); setTasas(valores); }; cargarTasas(); }, []);
    useEffect(() => { validarUsuario(); }, [validarUsuario]);
    useEffect(() => { if (idUsuario && rolHabilitado) { cargarTodosLosDatos(); } }, [idUsuario, rolHabilitado, cargarTodosLosDatos]);
    useEffect(() => { if (tipoPresentacion === 3 && idUsuario) { cargarDatosLinea(); } }, [tipoPresentacion, idUsuario]);

    const archivarMesActual = async () => {
        if (!idUsuario) return;
        try {
            setCargando(true); setModalArchivarAbierto(false);
            const response = await fetch(`${API_BASE_URL}/Cierre/FinalizarMes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ IdUsuario: idUsuario }) });
            if (response.ok) { alert("¡Mes archivado correctamente!"); await cargarTodosLosDatos(); }
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const abrirDetalleMes = async (tipo, offset, titulo) => {
        if (!idUsuario) return;
        const { inicio, fin } = getRangoMes(offset);
        const epVivo = tipo === 'gasto' ? `/Gasto/ByUsuario/${idUsuario}` : `/Ingreso/ByUsuario/${idUsuario}`;
        const epHist = tipo === 'gasto' ? `/HistorialGasto/ByUsuario/${idUsuario}` : `/HistorialIngreso/ByUsuario/${idUsuario}`;
        try {
            const [resV, resH] = await Promise.all([fetch(`${API_BASE_URL}${epVivo}`), fetch(`${API_BASE_URL}${epHist}`)]);
            const combinados = [...(resV.ok ? await resV.json() : []), ...(resH.ok ? await resH.json() : [])];
            const filtrados = combinados.filter(item => { const f = new Date(item.FechaGasto || item.FechaIngreso || item.Fecha); return f >= new Date(inicio) && f <= new Date(fin); });
            setDatosModal({ titulo: `${titulo} - ${getNombreMes(offset)}`, items: filtrados, tipo });
            setModalAbierto(true);
        } catch (error) { console.error(error); }
    };

    const calcularDiferencia = (valorA, valorB, esGasto = true) => {
        const diferencia = valorA - valorB;
        const porcentaje = valorB !== 0 ? ((diferencia / valorB) * 100).toFixed(1) : "100";
        const esPositivo = esGasto ? diferencia <= 0 : diferencia >= 0;
        return { monto: Math.abs(diferencia), percentage: Math.abs(porcentaje), clase: esPositivo ? "tendencia-positiva" : "tendencia-negativa", texto: diferencia >= 0 ? "Más que periodo" : "Menos que periodo" };
    };

    // --- COMPONENTE INTERNO: GRÁFICO ---
    const GraficoConNav = ({ titulo, valorTotal, listaDetalle, offset, setOffsetKey, tipo, syncOffsets = [] }) => {
        const esVacio = valorTotal === 0;
        const paleta = tipo === 'gasto' ? coloresGasto : coloresIngreso;

        // Si la lista está vacía, para que no rompa el gráfico le pasamos un dummy
        const dataGrafico = listaDetalle.length > 0 ? listaDetalle : [{ nombre: "Total", valor: 0 }];

        const handleOffsetChange = (newVal) => {
            setOffsets(p => {
                const updated = { ...p, [setOffsetKey]: newVal };
                syncOffsets.forEach(key => { updated[key] = newVal; });
                return updated;
            });
        };

        return (
            <div className="tarjeta-general grafico-ajustado">
                <div className="encabezado-grafico-nav">
                    <span className="badge-periodo">{titulo}</span>
                    <div className="selector-mes-nav">
                        <button onClick={() => handleOffsetChange(offset - 1)}>❮</button>
                        <span>{getNombreMes(offset)}</span>
                        <button onClick={() => handleOffsetChange(offset + 1)} disabled={offset >= 0}>❯</button>
                    </div>
                </div>
                <div className="contenedor-chart-relativo">
                    {esVacio ? (
                        <div className="estado-vacio-grafico"><div className="circulo-vacio"><span>Sin datos</span></div></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={dataGrafico}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="valor"
                                    nameKey="nombre"
                                    stroke="none"
                                    paddingAngle={5} // Esto hace los cortes
                                >
                                    {dataGrafico.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={paleta[index % paleta.length]} />
                                    ))}
                                </Pie>

                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1f', borderRadius: '10px', border: '1px solid rgba(200, 178, 119, 0.3)', color: '#fff' }}
                                    itemStyle={{ color: '#c8b277' }}
                                    formatter={(value, name) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name]}
                                />

                                <text x="50%" y="45%" textAnchor="middle" fill="#888" fontSize="12">Total</text>
                                <text x="50%" y="60%" textAnchor="middle" fill="#c8b277" fontSize="18" fontWeight="bold">${valorTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</text>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <button className="btn-ver-detalles" onClick={() => abrirDetalleMes(tipo, offset, titulo)} disabled={esVacio}>Ver Detalle</button>
            </div>
        );
    };

    // --- RENDERIZADO DE VISTAS ---
    const renderContenido = () => {
        if (tipoPresentacion === 1) {
            return (
                <div className="comparativa-grid-layout">
                    <div className="seccion-comparativa-fila">
                        <h2 className="subtitulo-seccion">Comparacion Mensual Gasto </h2>
                        <div className="fila-comparativa-master">
                            <GraficoConNav titulo="Gastos Periodo A" valorTotal={datos.gastoATotal} listaDetalle={datos.gastoALista} offset={offsets.gastoA} setOffsetKey="gastoA" tipo="gasto" />
                            <div className="tarjeta-balance-central">
                                <div className="icon-comparar">vs</div>
                                <div className={`info-balance ${calcularDiferencia(datos.gastoATotal, datos.gastoBTotal, true).clase}`}>
                                    <p className="monto-balance">${calcularDiferencia(datos.gastoATotal, datos.gastoBTotal, true).monto.toLocaleString()}</p>
                                    <span className="porcentaje-balance">{calcularDiferencia(datos.gastoATotal, datos.gastoBTotal, true).texto} B ({calcularDiferencia(datos.gastoATotal, datos.gastoBTotal, true).percentage}%)</span>
                                </div>
                            </div>
                            <GraficoConNav titulo="Gastos Periodo B" valorTotal={datos.gastoBTotal} listaDetalle={datos.gastoBLista} offset={offsets.gastoB} setOffsetKey="gastoB" tipo="gasto" />
                        </div>
                    </div>
                    <div className="seccion-comparativa-fila" style={{ marginTop: '50px' }}>
                        <h2 className="subtitulo-seccion">Comparacion Mensual Ingresos</h2>
                        <div className="fila-comparativa-master">
                            <GraficoConNav titulo="Ingresos Periodo A" valorTotal={datos.ingresoATotal} listaDetalle={datos.ingresoALista} offset={offsets.ingresoA} setOffsetKey="ingresoA" tipo="ingreso" />
                            <div className="tarjeta-balance-central">
                                <div className="icon-comparar">vs</div>
                                <div className={`info-balance ${calcularDiferencia(datos.ingresoATotal, datos.ingresoBTotal, false).clase}`}>
                                    <p className="monto-balance">${calcularDiferencia(datos.ingresoATotal, datos.ingresoBTotal, false).monto.toLocaleString()}</p>
                                    <span className="porcentaje-balance">{calcularDiferencia(datos.ingresoATotal, datos.ingresoBTotal, false).texto} B ({calcularDiferencia(datos.ingresoATotal, datos.ingresoBTotal, false).percentage}%)</span>
                                </div>
                            </div>
                            <GraficoConNav titulo="Ingresos Periodo B" valorTotal={datos.ingresoBTotal} listaDetalle={datos.ingresoBLista} offset={offsets.ingresoB} setOffsetKey="ingresoB" tipo="ingreso" />
                        </div>
                    </div>
                </div>
            );
        } else if (tipoPresentacion === 2) {
            return (
                <div className="comparativa-grid-layout">
                    <div className="seccion-comparativa-fila">
                        <h2 className="subtitulo-seccion">Balance Mensual</h2>
                        <div className="fila-comparativa-master">
                            <GraficoConNav titulo="Ingresos A" valorTotal={datos.ingresoATotal} listaDetalle={datos.ingresoALista} offset={offsets.ingresoA} setOffsetKey="ingresoA" tipo="ingreso" syncOffsets={["gastoA"]} />
                            <div className="tarjeta-balance-central">
                                <div className="icon-comparar">DIF</div>
                                <div className={`info-balance ${(datos.ingresoATotal - datos.gastoATotal) >= 0 ? "tendencia-positiva" : "tendencia-negativa"}`}>
                                    <p className="monto-balance">${Math.abs(datos.ingresoATotal - datos.gastoATotal).toLocaleString()}</p>
                                    <span className="porcentaje-balance">Resultado Neto</span>
                                </div>
                            </div>
                            <GraficoConNav titulo="Gastos A" valorTotal={datos.gastoATotal} listaDetalle={datos.gastoALista} offset={offsets.gastoA} setOffsetKey="gastoA" tipo="gasto" syncOffsets={["ingresoA"]} />
                        </div>
                    </div>
                </div>
            );
        } else if (tipoPresentacion === 3) {
            // ... (Gráfico Lineal se mantiene igual)
            return (
                <div className="tarjeta-general grafico-linea-container">
                    <div className="header-linea">
                        <h2>Evolución Financiera Anual</h2>
                        <p>Comparación mensual de ingresos y gastos</p>
                    </div>

                    {/* Contenedor del gráfico */}
                    <div>
                        <ResponsiveContainer width="100%" height={500}>
                            {/* Aumentamos el margin a 50px en todos los lados para dar padding interno */}
                            <LineChart data={datosLinea} margin={{ top: 50, right: 50, left: 50, bottom: 50 }}>

                                {/* Hacemos la grilla un poco más sutil */}
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2b" vertical={false} />

                                <XAxis dataKey="mes" stroke="#888" tick={{ fill: '#888' }} />

                                {/* Formateamos el eje Y para que muestre el signo $ y los puntos de mil */}
                                <YAxis
                                    stroke="#888"
                                    domain={[0, maximoGrafico]}
                                    tick={{ fill: '#888' }}
                                    tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                />

                                {/* Tooltip con la misma lógica y estilo que los gráficos de pastel */}
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e1e1f",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        borderRadius: "10px",
                                        color: "#fff"
                                    }}
                                    itemStyle={{ fontWeight: 500 }}
                                    formatter={(value, name) => [
                                        `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                                        name // Muestra "Ingresos" o "Gastos"
                                    ]}
                                />

                                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                {/* Añadimos name="..." con mayúscula para que se lea mejor en el Tooltip y la Leyenda */}
                                <Line
                                    type="monotone"
                                    name="Ingresos"
                                    dataKey="ingresos"
                                    stroke="#007AFF"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: "#1e1e1f", stroke: "#007AFF", strokeWidth: 2 }}
                                    activeDot={{ r: 7, strokeWidth: 0, fill: "#007AFF" }}
                                    animationDuration={1500}
                                    animationBegin={300}
                                />
                                <Line
                                    type="monotone"
                                    name="Gastos"
                                    dataKey="gastos"
                                    stroke="#FF4B4B"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: "#1e1e1f", stroke: "#FF4B4B", strokeWidth: 2 }}
                                    activeDot={{ r: 7, strokeWidth: 0, fill: "#FF4B4B" }}
                                    animationDuration={1500}
                                    animationBegin={300}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {cargandoLinea && <div className="toast-loading">Generando gráfico...</div>}
                </div>
            );
        }
    }

    if (!rolHabilitado) {
        // ... (Tu render de error de permisos se mantiene igual)
        return (
            <div className="contenedor-principal-general" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="tarjeta-general" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔒</div>
                    <h2 style={{ color: '#FF4B4B', marginBottom: '15px' }}>Apartado No Habilitado</h2>
                    <p style={{ color: '#888', marginBottom: '25px', lineHeight: '1.6' }}>Para acceder a las métricas avanzadas de comparativas y balances mensuales, necesitas mejorar tu suscripción actual.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button className="botonesComparativa btn-principal" onClick={() => alert("Redirigiendo a planes...")}>Mejorar mi Plan🚀</button>
                        <Link to="/Principal" className="botonesComparativa btn-volver" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Volver al Inicio</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor-principal-general">
            {/* ENCABEZADO PRINCIPAL */}
            <div className="seccion-encabezado-general">
                <div className="titulo-principal-general">
                    <h2>{tipoPresentacion === 1 ? "Comparativa Mensual Detallada" : null}</h2>
                    <h2> {tipoPresentacion === 2 ? "Balance de Ingresos y Gastos" : null}</h2>
                    <h2> {tipoPresentacion === 3 ? "Gráfico de Desempeño Económico" : null}</h2>
                    <p className="descripcion-encabezado">
                        {tipoPresentacion === 1
                            ? "Seleccione dos meses diferentes para contrastar los registros y determinar el porcentaje de crecimiento o decrecimiento. Recomendamos poner en el gráfico izquierdo el mes más reciente a evaluar. Ejemplo: Comparar mes actual en periodo A con el mes anterior en periodo B."
                            : null}

                        {tipoPresentacion === 2
                            ? "Esta función cruza los datos de ingresos y gastos de un mismo periodo para mostrar su resultado neto real. Seleccione el mes que desea analizar para comprender rápidamente si su balance fue positivo, logrando un control efectivo sobre su capacidad de ahorro o déficit."
                            : null}

                        {tipoPresentacion === 3
                            ? "Analice visualmente el comportamiento anual de sus finanzas mediante nuestro gráfico de líneas. Esta vista le permite identificar al instante tendencias a largo plazo, picos de gastos inusuales y los meses de mayor rendimiento, facilitando una planificación económica estratégica."
                            : null}
                    </p>
                </div>

                <div className='botonesFuncionesComparativa'>
                    <div className='botonesBalanceComparativa'>
                        <button onClick={() => { setTipoPresentacion(3); setMostrarGraficoLinea(true); }} className='botonesComparativa btn-principal'>Ver Evolución Anual</button>
                        <button onClick={() => setTipoPresentacion(tipoPresentacion === 1 ? 2 : 1)} className='botonesComparativa btn-principal'>{tipoPresentacion === 1 ? "Ver Balances mensuales" : "Ver Comparativa Mensual"}</button>
                        <button onClick={() => setModalArchivarAbierto(true)} className='botonesComparativa btn-secundario'>Archivar datos actuales</button>
                    </div>
                    <div className='botonVolverPrincipal'>
                        <Link to="/Principal" className="botonesComparativa btn-volver">⇐⇐⇐ IR A INICIO ⇐⇐⇐</Link>
                    </div>
                </div>
            </div>

            {renderContenido()}

            {/* MODAL: DETALLES DE MOVIMIENTOS */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
                    <div className="modal-contenido" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{datosModal.titulo}</h3>
                            <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <table className="tabla-detalle">
                                <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead>
                                <tbody>
                                    {datosModal.items.map((item, i) => {
                                        const monto = item.MontoGasto || item.MontoIngreso || item.Monto;
                                        const idDivisa = item.IdDivisa;
                                        const moneda = DIVISAS_MAP[idDivisa];

                                        return (
                                            <tr key={i}>
                                                <td>{new Date(item.FechaGasto || item.FechaIngreso || item.Fecha).toLocaleDateString()}</td>
                                                <td>{item.Descripcion || item.NombreIngreso || "Registro Histórico"}</td>
                                                <td className={datosModal.tipo === 'gasto' ? 'texto-rojo' : 'texto-verde'}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        <span>${monto.toLocaleString()} {moneda}</span>
                                                        {idDivisa !== 1 && tasas[moneda] > 0 && (
                                                            <span style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>
                                                                ({(monto * tasas[moneda]).toLocaleString(undefined, { maximumFractionDigits: 0 })} ARS)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIRMACIÓN DE ARCHIVADO */}
            {modalArchivarAbierto && (
                <div className="modal-overlay" onClick={() => setModalArchivarAbierto(false)}>
                    <div className="modal-contenido" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Archivar Mes Actual</h3>
                            <button className="btn-cerrar" onClick={() => setModalArchivarAbierto(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <h3>¿Estás seguro de que deseas archivar los datos de <strong>{getNombreMes(0)}</strong>?</h3>
                            <p>¡Cuidado! Si apretás el botón, los números de este mes se guardan en una caja cerrada y ya no los vas a poder cambiar.</p>
                            <div className="modal-acciones">
                                <button className="botonesComparativa btn-cancelar-modal" onClick={() => setModalArchivarAbierto(false)}>Cancelar</button>
                                <button className="botonesComparativa btn-confirmar-modal" onClick={archivarMesActual}>Confirmar y Archivar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {cargando && <div className="toast-loading">Actualizando...</div>}
        </div>
    );
};

export default Comparativa;