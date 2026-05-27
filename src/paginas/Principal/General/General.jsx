import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import "./General.css";

const API_BASE_URL = "http://localhost:60496/api";
const API_ENDPOINTS = {
  gastos: "/Gasto",
  ingresos: "/Ingreso",
  usuarios: "/Usuarios",
  ahorros: "/MetaAhorro",
  cuentas: "/Cuenta",
  transacciones: "/Transacciones"
};

// Instituciones simuladas para la conexión de Open Banking
const institucionesSoportadas = [
  { id: 1, nombre: "Banco Galicia", tipo: "galicia", divisa: 1, saldo: 450000 },
  { id: 2, nombre: "Mercado Pago", tipo: "mp", divisa: 1, saldo: 125000 },
  { id: 3, nombre: "BBVA Francés", tipo: "bbva", divisa: 1, saldo: 890000 },
  { id: 4, nombre: "Brubank (USD)", tipo: "bru-usd", divisa: 2, saldo: 1500 }
];

const GastoIngreso = () => {
  const [mostrarSaludo, setMostrarSaludo] = useState(true);
  const [datosGastos, setDatosGastos] = useState([]);
  const [datosIngresos, setDatosIngresos] = useState([]);
  const [metasAhorro, setMetasAhorro] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [idUsuarioActual, setIdUsuarioActual] = useState(null);
  const [modalConectarAbierto, setModalConectarAbierto] = useState(false);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [cargandoConexion, setCargandoConexion] = useState(false);
  const [cargandoCsv, setCargandoCsv] = useState(false);
  const [archivoCsv, setArchivoCsv] = useState(null);

  const [metaForm, setMetaForm] = useState({
    IdMetaAhorro: null, Nombre: "", MontoObjetivo: "", MontoGuardado: "", FechaObjetivo: "", FechaInicio: "", Divisa: "1"
  });

  const COLORES = ["#007AFF", "#c8b277", "#8a733f", "#4a4a4a"];
  const COLORESgasto = ["#FF4B4B", "#c8b277", "#8a733f", "#4a4a4a"];

  useEffect(() => {
    const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);
    obtenerDatos();
    return () => clearTimeout(temporizador);
  }, []);

  const obtenerDatos = () => {
    const token = localStorage.getItem("Token");
    if (!token) return;
    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setIdUsuarioActual(data.IdUsuario);
      obtenerGastos(data.IdUsuario);
      obtenerIngresos(data.IdUsuario);
      obtenerAhorros(data.IdUsuario);
      obtenerCuentas(data.IdUsuario);
    });
  };

  const obtenerCuentas = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.cuentas}/ByUsuario/${idusuario}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` }
    })
    .then(res => res.json())
    .then(data => setCuentas(data || []));
  };

  const manejarDesvincularCuenta = (idCuenta) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cuenta?")) return;
    fetch(`${API_BASE_URL}${API_ENDPOINTS.cuentas}/${idCuenta}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("Token")}` }
    })
    .then(res => {
      if (res.ok) {
        obtenerCuentas(idUsuarioActual);
      } else {
        alert("Error al desvincular la cuenta.");
      }
    })
    .catch(error => {
      console.error("Error al desvincular:", error);
      alert("Hubo un problema de red al intentar desvincular la cuenta.");
    });
  };

  const obtenerGastos = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.gastos}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const gastosProcesados = data.map((item) => ({
          name: item.Descripcion || "Sin descripción",
          valor: Number(item.MontoGasto) || 0,
        }));
        setDatosGastos(gastosProcesados);
      })
      .catch((error) => console.error("Error gastos:", error));
  };

  const obtenerIngresos = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ingresos}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const ingresosProcesados = data.map((item) => ({
          name: item.Descripcion || "Sin Descripción",
          valor: Number(item.MontoIngreso) || 0,
        }));
        setDatosIngresos(ingresosProcesados);
      })
      .catch((error) => console.error("Error ingresos:", error));
  };

  const obtenerAhorros = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/ByUsuario/${idusuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const metasProcesadas = data.map((item) => ({
          ...item,
          etiqueta: item.Nombre || "Meta de ahorro",
          actual: Number(item.MontoGuardado ?? 0),
          objetivo: Number(item.MontoObjetivo ?? 0),
        }));
        setMetasAhorro(metasProcesadas);
      })
      .catch((error) => console.error("Error ahorros:", error));
  };

  const manejarSeleccionCsv = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.endsWith(".csv")) {
      alert("Por favor, selecciona un archivo en formato CSV.");
      setArchivoCsv(null);
      e.target.value = null;
      return;
    }
    setArchivoCsv(file);
  };

  const manejarSubidaCsv = async () => {
    if (!archivoCsv) {
      alert("Debes seleccionar un archivo primero.");
      return;
    }

    setCargandoCsv(true);
    const formData = new FormData();
    formData.append("archivo", archivoCsv);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.transacciones}/importar-csv`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("Token")}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setModalImportarAbierto(false);
        setArchivoCsv(null);
        obtenerDatos();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error de red al subir CSV:", error);
      alert("Hubo un problema al procesar el archivo. Verifica tu conexión.");
    } finally {
      setCargandoCsv(false);
    }
  };

  const simularConexionBancaria = (institucion) => {
    if (!idUsuarioActual) return;
    setCargandoConexion(true);

    setTimeout(() => {
      const tokenSincronizacionGenerado = `${institucion.tipo}-${Math.floor(Math.random() * 10000)}`;

      const nuevaCuentaExterna = {
        IdUsuario: idUsuarioActual,
        IdDivisa: institucion.divisa,
        Nombre: institucion.nombre,
        SaldoActual: institucion.saldo,
        EsExterna: true, 
        TokenSincronizacion: tokenSincronizacionGenerado,
        FechaCreacion: new Date().toISOString()
      };

      fetch(`${API_BASE_URL}${API_ENDPOINTS.cuentas}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("Token")}`
        },
        body: JSON.stringify(nuevaCuentaExterna)
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error guardando la cuenta bancaria externa");
          return response.text().then(text => text ? JSON.parse(text) : {});
        })
        .then(() => {
          alert(`¡${institucion.nombre} vinculada e importada de forma segura!`);
          setModalConectarAbierto(false);
          obtenerCuentas(idUsuarioActual); 
        })
        .catch((error) => console.error("Error guardando cuenta externa:", error))
        .finally(() => setCargandoConexion(false));
    }, 2500);
  };

  const manejarCambioInput = (e) => {
    setMetaForm({
      ...metaForm,
      [e.target.name]: e.target.value
    });
  };

  const manejarGuardarMeta = () => {
    const token = localStorage.getItem("Token");

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
      .then(res => res.json())
      .then(userData => {
        const metaAGuardar = {
          IdMetaAhorro: metaForm.IdMetaAhorro,
          Nombre: metaForm.Nombre,
          MontoObjetivo: parseFloat(metaForm.MontoObjetivo),
          MontoGuardado: parseFloat(metaForm.MontoGuardado),
          FechaMeta: metaForm.FechaObjetivo,
          FechaInicio: metaForm.FechaInicio,
          IdDivisa: metaForm.Divisa,
          IdUsuario: userData.IdUsuario
        };
        guardarMetaApi(metaAGuardar);
      });
  };

  const guardarMetaApi = (metaAGuardar) => {
    const esEdicion = metaAGuardar.IdMetaAhorro !== null && metaAGuardar.IdMetaAhorro !== undefined;
    const url = esEdicion
      ? `${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaAGuardar.IdMetaAhorro}`
      : `${API_BASE_URL}${API_ENDPOINTS.ahorros}`;

    const metodo = esEdicion ? "PUT" : "POST";

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("Token")}`
      },
      body: JSON.stringify(metaAGuardar)
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error al ${esEdicion ? 'editar' : 'guardar'} la meta`);
        return response.text().then(text => text ? JSON.parse(text) : {});
      })
      .then(() => {
        setModalAgregarAbierto(false);
        setModalEditarAbierto(false);
        obtenerDatos();
      })
      .catch((error) => console.error("Error guardando meta:", error));
  };

  const calcularTotal = (datos) => datos.reduce((acum, item) => acum + Number(item.valor || 0), 0);
  const obtenerTopCinco = (items) => [...items].sort((a, b) => b.valor - a.valor).slice(0, 5);

  const renderCenterLabel = ({ cx, cy }, total) => (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight="600">Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#c8b277" fontSize={16} fontWeight="700">
        ${total.toLocaleString()}
      </text>
    </g>
  );

  const EstadoVacio = ({ titulo, mensaje, icono = "📊", sugerencia }) => (
    <div className="tarjeta-general aviso-vacio">
      {titulo && <h3>{titulo}</h3>}
      <div className="contenido-aviso-vacio">
        <div className="icono-placeholder">{icono}</div>
        <p>{mensaje}</p>
        <span className="sugerencia">{sugerencia || "Registra movimientos para ver el progreso aquí."}</span>
      </div>
    </div>
  );

  const BarraProgreso = ({ actual, objetivo, etiqueta }) => {
    const porcentaje = objetivo > 0 ? Math.min(100, (actual / objetivo) * 100) : 0;
    return (
      <div className="item-progreso-general">
        <div className="info-progreso-general">
          <span style={{ fontWeight: "500", color: "#ffffff" }}>{etiqueta}</span>
          <span style={{ color: "#c8b277", fontWeight: "bold" }}>{porcentaje.toFixed(0)}%</span>
        </div>
        <div className="pista-barra-general">
          <div className="relleno-barra-general" style={{ width: `${porcentaje}%` }} />
        </div>
        <div className="texto-monto-general">
          ${actual.toLocaleString()} / ${objetivo.toLocaleString()}
        </div>
      </div>
    );
  };

  const manejarEliminarMeta = () => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaForm.IdMetaAhorro}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al eliminar la meta");
        setModalEditarAbierto(false);
        obtenerDatos();
      })
      .catch((error) => console.error("Error eliminando meta:", error));
  };

  const nombre = localStorage.getItem("Nombre") || "Usuario";
  const apellido = localStorage.getItem("Apellido") || "";

  const abrirModalAgregar = () => {
    setMetaForm({ IdMetaAhorro: null, Nombre: "", MontoObjetivo: "", MontoGuardado: "", FechaObjetivo: "", FechaInicio: "", Divisa: "1" });
    setModalAgregarAbierto(true);
  };

  const abrirModalEditar = (meta) => {
    setMetaForm({
      IdMetaAhorro: meta.IdMetaAhorro,
      Nombre: meta.Nombre || "",
      MontoObjetivo: meta.MontoObjetivo || "",
      MontoGuardado: meta.actual || meta.MontoGuardado || 0,
      FechaObjetivo: meta.FechaMeta ? meta.FechaMeta.split('T')[0] : (meta.FechaObjetivo ? meta.FechaObjetivo.split('T')[0] : ""),
      FechaInicio: meta.FechaInicio ? meta.FechaInicio.split('T')[0] : "",
      IdDivisa: parseInt(meta.IdDivisa) || 1
    });
    setModalEditarAbierto(true);
  };

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general">
        <div className="titulo-principal-general">
          <h2>{mostrarSaludo ? `¡Bienvenido, ${nombre} ${apellido}!` : "El Control Total de tu Economía"}</h2>
          <p style={{ color: "#888888" }}>Ya sea para organizar los gastos del hogar o administrar tu emprendimiento, centralizá toda tu información en un solo lugar. Olvidate de las anotaciones sueltas o planillas complicadas y accedé a métricas en tiempo real desde cualquier dispositivo para tomar las mejores decisiones.</p>
        </div>
        <div className="botones-functions-comparativas">
          <Link to="/comparativa" className="botonesComparativa">
            Mostrar Balance
          </Link>
        </div>
      </div>

      <div className="contenedor-ahorros-general" style={{ marginBottom: "30px" }}>
        <div className="encabezado-ahorros-flex">
          <h3 className="titulo-ahorros-general">Cuentas y Tarjetas Conectadas</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setModalImportarAbierto(true)} className="boton-secundario">
              📄 Importar CSV
            </button>
            <button onClick={() => setModalConectarAbierto(true)} className="boton-primario">
              🔌 Vincular Tarjeta / Banco
            </button>
          </div>
        </div>

        {cuentas.length > 0 ? (
          <div className="grid-ahorros-general" style={{ marginTop: "15px" }}>
            {cuentas.map((cuenta) => (
              <div key={cuenta.IdCuenta} className="tarjeta-ahorro-item" style={{ borderLeft: cuenta.EsExterna ? "4px solid #007AFF" : "4px solid #c8b277" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "#ffffff", fontSize: "15px" }}>{cuenta.Nombre}</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {cuenta.EsExterna && (
                      <span style={{ fontSize: "11px", backgroundColor: "#007AFF", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                        Sincronizada
                      </span>
                    )}
                    <button 
                      onClick={() => manejarDesvincularCuenta(cuenta.IdCuenta)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#FF4B4B", 
                        cursor: "pointer", 
                        fontSize: "11px", 
                        fontWeight: "600",
                        textDecoration: "underline",
                        padding: "2px 4px"
                      }}
                      title="Eliminar vinculación de esta cuenta"
                    >
                      Desvincular
                    </button>
                  </div>
                </div>
                <h3 style={{ margin: "12px 0 6px 0", color: cuenta.SaldoActual < 0 ? "#FF4B4B" : "#c8b277", fontSize: "20px" }}>
                  {cuenta.IdDivisa === 2 ? "USD" : "$"} {cuenta.SaldoActual.toLocaleString()}
                </h3>
                <small style={{ color: "#666" }}>
                  {cuenta.EsExterna ? `Token: ${cuenta.TokenSincronizacion}` : "Registro Manual"}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <EstadoVacio
            icono="💳"
            mensaje="No posees tarjetas ni cuentas corrientes vinculadas para sincronización automática."
            sugerencia="Hacé clic en 'Vincular Tarjeta / Banco' o importa tus movimientos con CSV."
          />
        )}
      </div>

      <div className="panel-graficos-general">
        {/* GRÁFICO GASTOS */}
        {datosGastos.length > 0 ? (
          <div className="tarjeta-general">
            <h3>Gastos por Categoría</h3>
            <div className="grafico-con-leyenda">
              <div className="grafico-pie">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={datosGastos}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      label={(props) => renderCenterLabel(props, calcularTotal(datosGastos))}
                      labelLine={false}
                    >
                      {datosGastos.map((_, i) => (
                        <Cell key={i} fill={COLORESgasto[i % COLORESgasto.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200,178,119,0.3)", color: "#fff", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="leyenda-grafico">
                {obtenerTopCinco(datosGastos).map((item, index) => (
                  <div className="item-leyenda" key={index}>
                    <span className="item-color-circulo" style={{ backgroundColor: COLORESgasto[index % COLORESgasto.length] }} />
                    <div className="leyenda-texto">
                      <span>{item.name}</span>
                      <strong>${item.valor.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EstadoVacio titulo="Gastos por Categoría" mensaje="No se encontraron gastos registrados." />
        )}

        {/* GRÁFICO INGRESOS */}
        {datosIngresos.length > 0 ? (
          <div className="tarjeta-general">
            <h3>Fuentes de Ingreso</h3>
            <div className="grafico-con-leyenda">
              <div className="grafico-pie">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={datosIngresos}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      label={(props) => renderCenterLabel(props, calcularTotal(datosIngresos))}
                      labelLine={false}
                    >
                      {datosIngresos.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e1f", border: "1px solid rgba(200,178,119,0.3)", color: "#fff", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="leyenda-grafico">
                {obtenerTopCinco(datosIngresos).map((item, index) => (
                  <div className="item-leyenda" key={index}>
                    <span className="item-color-circulo" style={{ backgroundColor: COLORES[index % COLORES.length] }} />
                    <div className="leyenda-texto">
                      <span>{item.name}</span>
                      <strong>${item.valor.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EstadoVacio titulo="Fuentes de Ingreso" mensaje="No se encontraron ingresos registrados." />
        )}
      </div>

      <div className="contenedor-ahorros-general">
        <div className="encabezado-ahorros-flex">
          <h3 className="titulo-ahorros-general">Objetivos de Ahorro</h3>
          <button onClick={abrirModalAgregar} className="boton-primario">
            Agregar Meta
          </button>
        </div>

        {metasAhorro.length > 0 ? (
          <div className="grid-ahorros-general">
            {metasAhorro.map((meta, indice) => (
              <div key={indice} className="tarjeta-ahorro-item">
                <BarraProgreso actual={meta.actual} objetivo={meta.objetivo} etiqueta={meta.etiqueta} />
                <button className="boton-editar-ahorro" onClick={() => abrirModalEditar(meta)}>
                  Editar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EstadoVacio
            icono="🎯"
            mensaje="Aún no tienes metas de ahorro configuradas."
            sugerencia="Haz clic en 'Agregar Meta' para empezar a planificar tus objetivos financieros."
          />
        )}
      </div>

      {/* MODAL: IMPORTAR CSV */}
      {modalImportarAbierto && (
        <div className="capa-modal" onClick={() => !cargandoCsv && setModalImportarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Importar Movimientos (CSV)</h3>
            
            <div className="formulario-cuerpo">
              <p style={{ color: "#aaa", marginBottom: "20px", fontSize: "13px", textAlign: "center", lineHeight: "1.5" }}>
                Sube el archivo <strong>.csv</strong> descargado de tu Home Banking. Asegúrate de que las columnas del archivo sean: <strong>Fecha, Descripcion, Monto</strong>.
              </p>
              
              <div style={{
                  border: "2px dashed rgba(200, 178, 119, 0.5)",
                  borderRadius: "12px",
                  padding: "40px 20px",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  marginBottom: "20px",
                  textAlign: "center"
              }}>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={manejarSeleccionCsv} 
                  style={{ display: "block", margin: "0 auto", color: "#fff" }}
                />
              </div>
            </div>

            <div className="formulario-acciones" style={{ marginTop: "20px", justifyContent: "center" }}>
              <button 
                className="boton-secundario" 
                onClick={() => setModalImportarAbierto(false)}
                disabled={cargandoCsv}
              >
                Cancelar
              </button>
              <button 
                className="boton-primario" 
                onClick={manejarSubidaCsv} 
                disabled={cargandoCsv || !archivoCsv}
                style={{ opacity: (cargandoCsv || !archivoCsv) ? 0.5 : 1 }}
              >
                {cargandoCsv ? "Procesando Archivo..." : "Subir e Importar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONEXIÓN ENTORNO SEGURO OPEN BANKING */}
      {modalConectarAbierto && (
        <div className="capa-modal" onClick={() => !cargandoConexion && setModalConectarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Vincular Proveedor Financiero</h3>
            
            {cargandoConexion ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div className="spinner-carga" style={{ margin: "0 auto", border: "4px solid rgba(200,178,119,0.1)", borderTop: "4px solid #c8b277", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
                <p style={{ marginTop: "20px", color: "#c8b277", fontWeight: "600" }}>Estableciendo túnel cifrado...</p>
                <small style={{ color: "#777" }}>Autorizando Token de lectura con el emisor bancario.</small>
              </div>
            ) : (
              <div className="formulario-cuerpo">
                <p style={{ color: "#aaa", marginBottom: "20px", fontSize: "13px", textAlign: "center", lineHeight: "1.5" }}>
                  Seleccioná la tarjeta o billetera virtual que deseas integrar. Al proceder, otorgarás permisos de lectura segura sobre los movimientos históricos.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {institucionesSoportadas.map((inst) => (
                    <button 
                      key={inst.id}
                      className="boton-secundario" 
                      style={{ justifyContent: "flex-start", padding: "14px", border: "1px solid #2d2d2e", display: "flex", gap: "10px", width: "100%", textAlign: "left" }}
                      onClick={() => simularConexionBancaria(inst)}
                    >
                      <span>💳</span> {inst.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!cargandoConexion && (
               <div className="formulario-acciones" style={{ marginTop: "20px", justifyContent: "center" }}>
                 <button className="boton-secundario" onClick={() => setModalConectarAbierto(false)}>Cancelar Conexión</button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR META */}
      {modalEditarAbierto && (
        <div className="capa-modal" onClick={() => setModalEditarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Meta de Ahorro</h3>
            <div className="formulario-cuerpo">
              <div className="formulario-grupo">
                <label htmlFor="nombreMeta">Nombre de la Meta</label>
                <input type="text" name="Nombre" value={metaForm.Nombre} onChange={manejarCambioInput} id="nombreMeta" placeholder="Ej: Fondo de Emergencia" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoGuardado">Monto Actual ($)</label>
                <input type="number" name="MontoGuardado" value={metaForm.MontoGuardado} onChange={manejarCambioInput} id="MontoGuardado" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoObjetivo">Monto Objetivo ($)</label>
                <input type="number" name="MontoObjetivo" value={metaForm.MontoObjetivo} onChange={manejarCambioInput} id="montoObjetivo" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaInicio">Fecha de Inicio</label>
                <input type="date" name="FechaInicio" value={metaForm.FechaInicio} onChange={manejarCambioInput} id="fechaInicio" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaObjetivo">Fecha Objetivo</label>
                <input type="date" name="FechaObjetivo" value={metaForm.FechaObjetivo} onChange={manejarCambioInput} id="fechaObjetivo" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="divisa">Divisa</label>
                <select name="Divisa" value={metaForm.IdDivisa} onChange={manejarCambioInput} id="divisa" >
                  <option value="1" >ARS - Peso Argentino</option>
                  <option value="2">USD - Dólar Estadounidense</option>
                  <option value="3">EUR - Euro</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" style={{ backgroundColor: '#dc3545' }} onClick={manejarEliminarMeta}>
                Eliminar
              </button>
              <button className="boton-secundario" onClick={() => setModalEditarAbierto(false)}>
                Cancelar
              </button>
              <button className="boton-primario" onClick={manejarGuardarMeta}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR META */}
      {modalAgregarAbierto && (
        <div className="capa-modal" onClick={() => setModalAgregarAbierto(false)}>
          <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva Meta de Ahorro</h3>
            <div className="formulario-cuerpo">
              <div className="formulario-grupo">
                <label htmlFor="nombreMeta">Nombre de la Meta</label>
                <input type="text" name="Nombre" value={metaForm.Nombre} onChange={manejarCambioInput} id="nombreMeta" placeholder="Ej: Fondo de Emergencia" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoGuardado">Monto Actual ($)</label>
                <input type="number" name="MontoGuardado" value={metaForm.MontoGuardado} onChange={manejarCambioInput} id="montoGuardado" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="montoObjetivo">Monto Objetivo ($)</label>
                <input type="number" name="MontoObjetivo" value={metaForm.MontoObjetivo} onChange={manejarCambioInput} id="montoObjetivo" placeholder="0.00" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaInicio">Fecha de Inicio</label>
                <input type="date" name="FechaInicio" value={metaForm.FechaInicio} onChange={manejarCambioInput} id="fechaInicio" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="fechaObjetivo">Fecha Objetivo</label>
                <input type="date" name="FechaObjetivo" value={metaForm.FechaObjetivo} onChange={manejarCambioInput} id="fechaObjetivo" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="divisa">Divisa</label>
                <select name="Divisa" value={metaForm.Divisa} onChange={manejarCambioInput} id="divisa">
                  <option value="1">ARS - Peso Argentino</option>
                  <option value="2">USD - Dólar Estadounidense</option>
                  <option value="3">EUR - Euro</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" onClick={() => setModalAgregarAbierto(false)}>
                Cancelar
              </button>
              <button className="boton-primario" onClick={manejarGuardarMeta}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GastoIngreso;