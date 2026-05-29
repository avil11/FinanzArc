import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Link } from "react-router-dom";
import '../General/General.css';
import './Comparativa.css';

// URL base para las peticiones al backend
const API_BASE_URL = "http://localhost:60496/api";

const Comparativa = () => {
    // --- ESTADOS GLOBALES ---
    const [cargando, setCargando] = useState(true);
    const [idUsuario, setIdUsuario] = useState(null);
    const [rolHabilitado, setRolHabilitado] = useState(true); // Estado para controlar el acceso por rol
    const [tipoPresentacion, setTipoPresentacion] = useState(1); // 1: Mes vs Mes, 2: Ingreso vs Gasto
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalArchivarAbierto, setModalArchivarAbierto] = useState(false);
    const [datosModal, setDatosModal] = useState({ titulo: "", items: [], tipo: "" });
    const [mostrarGraficoLinea, setMostrarGraficoLinea] = useState(false);
    const [datosLinea, setDatosLinea] = useState([]);
    const [cargandoLinea, setCargandoLinea] = useState(false);
    const [maximoGrafico, setMaximoGrafico] = useState(0);

    // Paletas de colores para los gráficos
    const coloresIngreso = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];
    const coloresGasto = ["#FF4B4B", "#c8b277", "#8a733f", "#4a4a4a"];

    // Gestión de offsets (0 = mes actual, -1 = mes pasado, etc.)
    const [offsets, setOffsets] = useState({
        gastoA: 0, gastoB: -1,
        ingresoA: 0, ingresoB: -1
    });

    // Valores totales calculados
    const [datos, setDatos] = useState({
        gastoA: 0, gastoB: 0,
        ingresoA: 0, ingresoB: 0
    });

    // --- LÓGICA DE USUARIO Y TOKEN ---
    const validarUsuario = useCallback(async () => {
        const token = localStorage.getItem("Token");
        if (!token) {
            setCargando(false);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.ok) {
                const user = await res.json();

                // Extraemos el ID de Rol (Asegúrate de cambiar 'IdRol' si en tu BD se llama 'idRol' o similar)
                const rolUsuario = user.IdRol || user.idRol;

                // Validamos si cumple con el rol habilitante (3 o 4)
                if (rolUsuario === 3 || rolUsuario === 4) {
                    setIdUsuario(user.IdUsuario);
                    setRolHabilitado(true);
                } else {
                    setRolHabilitado(false);
                    setCargando(false); // Apagamos la carga para mostrar el cartel de bloqueo
                }
            } else {
                setCargando(false);
            }
        } catch (error) {
            console.error("Error validando usuario:", error);
            setCargando(false);
        }
    }, []);

    // --- UTILIDADES DE FECHAS ---
    const getNombreMes = (offset) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() + (offset || 0));
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const getRangoMes = (offset) => {
        const ahora = new Date();
        const inicio = new Date(ahora.getFullYear(), ahora.getMonth() + offset, 1, 6, 0, 0);
        const fin = new Date(ahora.getFullYear(), ahora.getMonth() + offset + 1, 1, 5, 59, 59);
        return { inicio: inicio.toISOString(), fin: fin.toISOString() };
    };

    // --- CARGA DE DATOS ---
    const cargarDatoIndividual = useCallback(async (tipo, offset, clave) => {
        if (!idUsuario) return;
        const { inicio, fin } = getRangoMes(offset);
        const epVivo = tipo === 'gasto' ? `/Gasto/ByUsuario/${idUsuario}` : `/Ingreso/ByUsuario/${idUsuario}`;
        const epHist = tipo === 'gasto' ? `/HistorialGasto/ByUsuario/${idUsuario}` : `/HistorialIngreso/ByUsuario/${idUsuario}`;

        try {
            const [resV, resH] = await Promise.all([
                fetch(`${API_BASE_URL}${epVivo}`),
                fetch(`${API_BASE_URL}${epHist}`)
            ]);
            const vivos = resV.ok ? await resV.json() : [];
            const historial = resH.ok ? await resH.json() : [];

            // Sumar montos filtrando por el rango de fechas del offset
            const total = [...vivos, ...historial].reduce((acc, item) => {
                const fechaStr = item.FechaGasto || item.FechaIngreso || item.Fecha;
                if (!fechaStr) return acc;
                const f = new Date(fechaStr);
                return (f >= new Date(inicio) && f <= new Date(fin))
                    ? acc + (item.MontoGasto || item.MontoIngreso || item.Monto || 0)
                    : acc;
            }, 0);

            setDatos(prev => ({ ...prev, [clave]: total }));
        } catch (error) { console.error("Error cargando datos:", error); }
    }, [idUsuario]);

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

    const cargarDatosLinea = useCallback(async () => {
        if (!idUsuario) return;

        try {
            setCargandoLinea(true);

            const [
                resIngresos,
                resHistIngresos,
                resGastos,
                resHistGastos
            ] = await Promise.all([
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

            const meses = [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic"
            ];

            const añoActual = new Date().getFullYear();

            const datosPorMes = meses.map((mes, index) => {

                const totalIngresos = todosIngresos.reduce((acc, item) => {

                    const fecha = new Date(
                        item.FechaIngreso ||
                        item.Fecha
                    );

                    if (
                        fecha.getMonth() === index &&
                        fecha.getFullYear() === añoActual
                    ) {
                        return acc + (
                            item.MontoIngreso ||
                            item.Monto ||
                            0
                        );
                    }

                    return acc;

                }, 0);

                const totalGastos = todosGastos.reduce((acc, item) => {

                    const fecha = new Date(
                        item.FechaGasto ||
                        item.Fecha
                    );

                    if (
                        fecha.getMonth() === index &&
                        fecha.getFullYear() === añoActual
                    ) {
                        return acc + (
                            item.MontoGasto ||
                            item.Monto ||
                            0
                        );
                    }

                    return acc;

                }, 0);

                return {
                    mes,
                    ingresos: totalIngresos,
                    gastos: totalGastos
                };
            });

            // MAXIMO DEL EJE Y
            let maximo = 0;

            datosPorMes.forEach(item => {
                const mayor = Math.max(item.ingresos, item.gastos);

                if (mayor > maximo) {
                    maximo = mayor;
                }
            });

            setMaximoGrafico(maximo + 1000);

            // ANIMACION DE CARGA PROGRESIVA
            setDatosLinea([]);

            for (let i = 0; i < datosPorMes.length; i++) {

                await new Promise(resolve => setTimeout(resolve, 120));

                setDatosLinea(prev => [
                    ...prev,
                    datosPorMes[i]
                ]);
            }

        } catch (error) {

            console.error(error);

        } finally {

            setCargandoLinea(false);
        }

    }, [idUsuario]);

    // Función para cerrar el mes y mover datos al historial (Backend)
    const archivarMesActual = async () => {
        if (!idUsuario) return;
        try {
            setCargando(true);
            setModalArchivarAbierto(false);
            const response = await fetch(`${API_BASE_URL}/Cierre/FinalizarMes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ IdUsuario: idUsuario })
            });
            if (response.ok) {
                alert("¡Mes archivado correctamente!");
                await cargarTodosLosDatos();
            }
        } catch (error) { console.error(error); }
        finally { setCargando(false); }
    };

    // Obtener detalles para el modal de desglose
    const abrirDetalleMes = async (tipo, offset, titulo) => {
        if (!idUsuario) return;
        const { inicio, fin } = getRangoMes(offset);
        const epVivo = tipo === 'gasto' ? `/Gasto/ByUsuario/${idUsuario}` : `/Ingreso/ByUsuario/${idUsuario}`;
        const epHist = tipo === 'gasto' ? `/HistorialGasto/ByUsuario/${idUsuario}` : `/HistorialIngreso/ByUsuario/${idUsuario}`;
        try {
            const [resV, resH] = await Promise.all([fetch(`${API_BASE_URL}${epVivo}`), fetch(`${API_BASE_URL}${epHist}`)]);
            const combinados = [...(resV.ok ? await resV.json() : []), ...(resH.ok ? await resH.json() : [])];
            const filtrados = combinados.filter(item => {
                const f = new Date(item.FechaGasto || item.FechaIngreso || item.Fecha);
                return f >= new Date(inicio) && f <= new Date(fin);
            });
            setDatosModal({ titulo: `${titulo} - ${getNombreMes(offset)}`, items: filtrados, tipo });
            setModalAbierto(true);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { validarUsuario(); }, [validarUsuario]);
    useEffect(() => { if (idUsuario && rolHabilitado) { cargarTodosLosDatos(); } }, [idUsuario, rolHabilitado, cargarTodosLosDatos]);

    useEffect(() => {
        // Si el usuario llega a la vista 3, cargamos los datos
        if (tipoPresentacion === 3 && idUsuario) {
            cargarDatosLinea();
        }
    }, [tipoPresentacion, idUsuario]); // Observa cómo reacciona a 'tipoPresentacion'
    // Función para calcular variaciones porcentuales
    const calcularDiferencia = (valorA, valorB, esGasto = true) => {
        const diferencia = valorA - valorB;
        const porcentaje = valorB !== 0 ? ((diferencia / valorB) * 100).toFixed(1) : "100";
        const esPositivo = esGasto ? diferencia <= 0 : diferencia >= 0;
        return {
            monto: Math.abs(diferencia),
            percentage: Math.abs(porcentaje),
            clase: esPositivo ? "tendencia-positiva" : "tendencia-negativa",
            texto: diferencia >= 0 ? "Más que periodo" : "Menos que periodo"
        };
    };

    // --- COMPONENTE INTERNO: GRÁFICO ---
    const GraficoConNav = ({ titulo, valor, offset, setOffsetKey, tipo, syncOffsets = [] }) => {
        const esVacio = valor === 0;
        const paleta = tipo === 'gasto' ? coloresGasto : coloresIngreso;

        const handleOffsetChange = (newVal) => {
            setOffsets(p => {
                const updated = { ...p, [setOffsetKey]: newVal };
                syncOffsets.forEach(key => { updated[key] = newVal; }); // Sincroniza meses en modo Ingreso vs Gasto
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
                                <Pie data={[{ v: valor }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="v" stroke="none" startAngle={90} endAngle={450}>
                                    <Cell fill={paleta[0]} />
                                </Pie>
                                <Tooltip contentStyle={{ background: "#1a1a1b", border: "none", color: "#fff" }} />
                                <text x="50%" y="45%" textAnchor="middle" fill="#888" fontSize="12">Total</text>
                                <text x="50%" y="60%" textAnchor="middle" fill="#c8b277" fontSize="18" fontWeight="bold">${valor.toLocaleString()}</text>
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
            // VISTA 1: COMPARATIVA MENSUAL (MES A vs MES B)
            return (
                <div className="comparativa-grid-layout">
                    <div className="seccion-comparativa-fila">
                        <h2 className="subtitulo-seccion">Comparacion Mensual Gasto </h2>
                        <div className="fila-comparativa-master">
                            <GraficoConNav titulo="Gastos Periodo A" valor={datos.gastoA} offset={offsets.gastoA} setOffsetKey="gastoA" tipo="gasto" />
                            <div className="tarjeta-balance-central">
                                <div className="icon-comparar">vs</div>
                                <div className={`info-balance ${calcularDiferencia(datos.gastoA, datos.gastoB, true).clase}`}>
                                    <p className="monto-balance">${calcularDiferencia(datos.gastoA, datos.gastoB, true).monto.toLocaleString()}</p>
                                    <span className="porcentaje-balance">{calcularDiferencia(datos.gastoA, datos.gastoB, true).texto} B ({calcularDiferencia(datos.gastoA, datos.gastoB, true).porcentaje}%)</span>
                                </div>
                            </div>
                            <GraficoConNav titulo="Gastos Periodo B" valor={datos.gastoB} offset={offsets.gastoB} setOffsetKey="gastoB" tipo="gasto" />
                        </div>
                    </div>
                    <div className="seccion-comparativa-fila" style={{ marginTop: '50px' }}>
                        <h2 className="subtitulo-seccion">Comparacion Mensual Ingresos</h2>
                        <div className="fila-comparativa-master">
                            <GraficoConNav titulo="Ingresos Periodo A" valor={datos.ingresoA} offset={offsets.ingresoA} setOffsetKey="ingresoA" tipo="ingreso" />
                            <div className="tarjeta-balance-central">
                                <div className="icon-comparar">vs</div>
                                <div className={`info-balance ${calcularDiferencia(datos.ingresoA, datos.ingresoB, false).clase}`}>
                                    <p className="monto-balance">${calcularDiferencia(datos.ingresoA, datos.ingresoB, false).monto.toLocaleString()}</p>
                                    <span className="porcentaje-balance">{calcularDiferencia(datos.ingresoA, datos.ingresoB, false).texto} B ({calcularDiferencia(datos.ingresoA, datos.ingresoB, false).porcentaje}%)</span>
                                </div>
                            </div>
                            <GraficoConNav titulo="Ingresos Periodo B" valor={datos.ingresoB} offset={offsets.ingresoB} setOffsetKey="ingresoB" tipo="ingreso" />
                        </div>
                    </div>
                </div>
            );
        } else if (tipoPresentacion === 2) {
            // VISTA 2: BALANCE CRUZADO (INGRESO vs GASTO DEL MISMO MES)
            return (
                <div className="comparativa-grid-layout">
                    <div className="seccion-comparativa-fila">
                        <h2 className="subtitulo-seccion">Balance Mensual</h2>
                        <div className="fila-comparativa-master">
                            <GraficoConNav titulo="Ingresos A" valor={datos.ingresoA} offset={offsets.ingresoA} setOffsetKey="ingresoA" tipo="ingreso" syncOffsets={["gastoA"]} />
                            <div className="tarjeta-balance-central">
                                <div className="icon-comparar">DIF</div>
                                <div className={`info-balance ${(datos.ingresoA - datos.gastoA) >= 0 ? "tendencia-positiva" : "tendencia-negativa"}`}>
                                    <p className="monto-balance">${(datos.ingresoA - datos.gastoA).toLocaleString()}</p>
                                    <span className="porcentaje-balance">Resultado Neto</span>
                                </div>
                            </div>
                            <GraficoConNav titulo="Gastos A" valor={datos.gastoA} offset={offsets.gastoA} setOffsetKey="gastoA" tipo="gasto" syncOffsets={["ingresoA"]} />
                        </div>
                    </div>
                </div>
            );
        } else if (tipoPresentacion === 3) {


            return (
                <div className="tarjeta-general grafico-linea-container">
                    <div className="header-linea">
                        <h2>Evolución Financiera Anual</h2>
                        <p>Comparación mensual de ingresos y gastos</p>
                    </div>

                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart
                            data={datosLinea}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="mes" stroke="#999" />
                            <YAxis stroke="#999" domain={[0, maximoGrafico]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1a1a1b",
                                    border: "none",
                                    borderRadius: "10px",
                                    color: "#fff"
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="ingresos"
                                stroke="#007AFF"
                                strokeWidth={4}
                                dot={{ r: 5 }}
                                // --- NUEVAS PROPIEDADES DE ANIMACIÓN ---
                                animationDuration={2500}        // Duración en milisegundos (un poco más lento = más elegante)
                                animationEasing="ease-in-out"   // Aceleración y desaceleración suave
                            />
                            <Line
                                type="monotone"
                                dataKey="gastos"
                                stroke="#FF4B4B"
                                strokeWidth={4}
                                dot={{ r: 5 }}
                                // --- NUEVAS PROPIEDADES DE ANIMACIÓN ---
                                animationDuration={2500}
                                animationEasing="ease-in-out"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {cargandoLinea && (
                        <div className="toast-loading">Generando gráfico...</div>
                    )}
                </div>
            );
        }
    }


    // --- RENDERIZADO PRINCIPAL CON VERIFICADOR ---
    if (!rolHabilitado) {
        return (
            <div className="contenedor-principal-general" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="tarjeta-general" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔒</div>
                    <h2 style={{ color: '#FF4B4B', marginBottom: '15px' }}>Apartado No Habilitado</h2>
                    <p style={{ color: '#888', marginBottom: '25px', lineHeight: '1.6' }}>
                        Para acceder a las métricas avanzadas de comparativas y balances mensuales, necesitas mejorar tu suscripción actual.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button className="botonesComparativa btn-principal" onClick={() => alert("Redirigiendo a planes...")}>
                            Mejorar mi Plan🚀
                        </button>
                        <Link to="/Principal" className="botonesComparativa btn-volver" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                            Volver al Inicio
                        </Link>
                    </div>
                    <div className='botonesBalanceComparativa'>
                        <button
                            onClick={() => setMostrarGraficoLinea(!mostrarGraficoLinea)} className='botonesComparativa btn-principal'>
                            {mostrarGraficoLinea ? "Volver a Comparativas" : "Ver Evolución Anual"}
                        </button>
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
                    <h2>Comparativa {tipoPresentacion === 1 ? "Mensual" : "Ingreso vs Gasto"}</h2>
                    <p className="descripcion-encabezado">
                        {tipoPresentacion === 1
                            ? "Seleccione dos meses diferentes para contrastar los registros y determinar el porcentaje de crecimiento o decrecimiento. Esta funcionalidad es clave para entender cómo evolucionan sus hábitos financieros y asegurar un control riguroso sobre cada partida presupuestaria."
                            : "Esta función te permite ver, de forma segura y clara, cuánta plata entró y cuánta plata salió en el mes que elijas. Al seleccionar un mes, la aplicación ajusta automáticamente ambos valores para que siempre veas la información del mismo período. Así, vas a tener la tranquilidad de saber exactamente si tus cuentas están en equilibrio, con datos precisos y sin errores de confusión."}
                    </p>
                </div>

                <div className='botonesFuncionesComparativa'>
                    <div className='botonesBalanceComparativa'>
                        <button
                            onClick={() => {
                                setTipoPresentacion(3);
                                setMostrarGraficoLinea(true);
                            }}
                            className='botonesComparativa btn-principal'
                        >
                            Ver Evolución Anual
                        </button>
                        <button
                            onClick={() => setTipoPresentacion(tipoPresentacion === 1 ? 2 : 1)}
                            className='botonesComparativa btn-principal'
                        >
                            {tipoPresentacion === 1 ? "Ver Balances mensuales" : "Ver Comparativa Mensual"}
                        </button>
                        <button>

                        </button>

                        <button
                            onClick={() => setModalArchivarAbierto(true)}
                            className='botonesComparativa btn-secundario'
                        >
                            Archivar datos actuales
                        </button>
                    </div>

                    <div className='botonVolverPrincipal'>
                        <Link to="/Principal" className="botonesComparativa btn-volver">
                            Volver
                        </Link>
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
                                    {datosModal.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{new Date(item.FechaGasto || item.FechaIngreso || item.Fecha).toLocaleDateString()}</td>
                                            <td>{item.Descripcion || item.NombreIngreso || "Registro Histórico"}</td>
                                            <td className={datosModal.tipo === 'gasto' ? 'texto-rojo' : 'texto-verde'}>
                                                ${(item.MontoGasto || item.MontoIngreso || item.Monto).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
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
                            <h3>
                                ¿Estás seguro de que deseas archivar los datos de <strong>{getNombreMes(0)}</strong>?
                            </h3>

                            <p>
                                ¡Cuidado! Si apretás el botón, los números de este mes se guardan en una caja cerrada y ya no los vas a poder cambiar.
                                Esto sirve para que las listas de 'Ingresos' y 'Gastos' queden vacías y limpias, así no te confundís con los gastos viejos
                                y podés anotar lo nuevo sin problemas.
                            </p>

                            <div className="modal-acciones">
                                <button
                                    className="botonesComparativa btn-cancelar-modal"
                                    onClick={() => setModalArchivarAbierto(false)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="botonesComparativa btn-confirmar-modal"
                                    onClick={archivarMesActual}
                                >
                                    Confirmar y Archivar
                                </button>
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