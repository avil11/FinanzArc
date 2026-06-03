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

  const [cotizaciones, setCotizaciones] = useState({
    USD: 1300,
    EUR: 1450
  });

  const [modalConectarAbierto, setModalConectarAbierto] = useState(false);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  const [cargandoConexion, setCargandoConexion] = useState(false);
  const [cargandoCsv, setCargandoCsv] = useState(false);

  const [archivoCsv, setArchivoCsv] = useState(null);

  const [metaForm, setMetaForm] = useState({
    IdMetaAhorro: null,
    Nombre: "",
    MontoObjetivo: "",
    MontoGuardado: "",
    FechaObjetivo: "",
    FechaInicio: "",
    Divisa: "1"
  });

  const COLORES = ["#007AFF", "#FF9500", "#34C759", "#AF52DE"];
  const COLORESgasto = ["#FF4B4B","#FFD700", "#4B79FF", "#FF7F50"];

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setMostrarSaludo(false);
    }, 4000);

    obtenerCotizaciones();
    obtenerDatos();

    return () => clearTimeout(temporizador);
  }, []);

  // =========================
  // COTIZACIONES
  // =========================

  const obtenerCotizaciones = async () => {
    const API_KEY = "2ba96ae66f6deb72572261fe";

    try {
      // Llamamos a la API para obtener tasas base USD
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
      const data = await response.json();

      if (data.result === "success") {
        const usdToArs = data.conversion_rates.ARS; // Cuántos pesos vale 1 dólar
        const eurToUsd = data.conversion_rates.EUR; // Cuántos euros vale 1 dólar

        // Calculamos EUR a ARS: (1 Euro en USD) * (1 USD en ARS)
        // Como la API nos da el EUR expresado en USD, dividimos 1 por ese valor 
        // para obtener el valor del Euro en USD, y luego multiplicamos por pesos.
        const eurToArs = (1 / eurToUsd) * usdToArs;

        setCotizaciones({
          USD: Number(usdToArs).toFixed(2),
          EUR: Number(eurToArs).toFixed(2)
        });
      }
    } catch (error) {
      console.error("Error obteniendo cotizaciones:", error);
      setCotizaciones({ USD: "1300.00", EUR: "1450.00" });
    }
  };

  const convertirAPesos = (monto, divisa) => {
    const valor = Number(monto) || 0;
    const cotUSD = Number(cotizaciones.USD);
    const cotEUR = Number(cotizaciones.EUR);

    switch (Number(divisa)) {
      case 2:
        return valor * cotUSD;
      case 3:
        return valor * cotEUR;
      default:
        return valor;
    }
  };

  // =========================
  // DATOS
  // =========================

  const obtenerDatos = () => {
    const token = localStorage.getItem("Token");

    if (!token) return;

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

  // =========================
  // CUENTAS
  // =========================

  const obtenerCuentas = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.cuentas}/ByUsuario/${idusuario}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then(res => res.json())
      .then(data => setCuentas(data || []));
  };

  const manejarDesvincularCuenta = (idCuenta) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cuenta?")) return;

    fetch(`${API_BASE_URL}${API_ENDPOINTS.cuentas}/${idCuenta}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then(res => {
        if (res.ok) {
          obtenerCuentas(idUsuarioActual);
        } else {
          alert("Error al desvincular la cuenta.");
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  // =========================
  // GASTOS
  // =========================

  const obtenerGastos = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.gastos}/ByUsuario/${idusuario}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then(res => res.json())
      .then(data => {

        const gastosProcesados = data.map(item => ({
          name: item.Descripcion || "Sin descripción",

          valor: convertirAPesos(
            item.MontoGasto,
            item.IdDivisa
          ),

          monedaOriginal:
            Number(item.IdDivisa) === 2
              ? "USD"
              : Number(item.IdDivisa) === 3
                ? "EUR"
                : "ARS"
        }));

        setDatosGastos(gastosProcesados);
      })
      .catch(error => console.error(error));
  };

  // =========================
  // INGRESOS
  // =========================

  const obtenerIngresos = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ingresos}/ByUsuario/${idusuario}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then(res => res.json())
      .then(data => {

        const ingresosProcesados = data.map(item => ({
          name: item.Descripcion || "Sin Descripción",

          valor: convertirAPesos(
            item.MontoIngreso,
            item.IdDivisa
          ),

          monedaOriginal:
            Number(item.IdDivisa) === 2
              ? "USD"
              : Number(item.IdDivisa) === 3
                ? "EUR"
                : "ARS"
        }));

        setDatosIngresos(ingresosProcesados);
      })
      .catch(error => console.error(error));
  };

  // =========================
  // AHORROS
  // =========================

  const obtenerAhorros = (idusuario) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/ByUsuario/${idusuario}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then(res => res.json())
      .then(data => {

        const metasProcesadas = data.map(item => ({
          ...item,

          etiqueta: item.Nombre || "Meta de ahorro",

          actual: convertirAPesos(
            item.MontoGuardado,
            item.IdDivisa
          ),

          objetivo: convertirAPesos(
            item.MontoObjetivo,
            item.IdDivisa
          )
        }));

        setMetasAhorro(metasProcesadas);
      })
      .catch(error => console.error(error));
  };

  // =========================
  // CSV
  // =========================

  const manejarSeleccionCsv = (e) => {
    const file = e.target.files[0];

    if (file && !file.name.endsWith(".csv")) {
      alert("Selecciona un archivo CSV.");
      return;
    }

    setArchivoCsv(file);
  };

  const manejarSubidaCsv = async () => {
    if (!archivoCsv) {
      alert("Selecciona un archivo.");
      return;
    }

    setCargandoCsv(true);

    const formData = new FormData();

    formData.append("archivo", archivoCsv);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.transacciones}/importar-csv`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        setModalImportarAbierto(false);

        obtenerDatos();
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setCargandoCsv(false);
    }
  };

  // =========================
  // OPEN BANKING
  // =========================

  const simularConexionBancaria = (institucion) => {
    if (!idUsuarioActual) return;

    setCargandoConexion(true);

    setTimeout(() => {

      const nuevaCuentaExterna = {
        IdUsuario: idUsuarioActual,
        IdDivisa: institucion.divisa,
        Nombre: institucion.nombre,
        SaldoActual: institucion.saldo,
        EsExterna: true,
        TokenSincronizacion: `${institucion.tipo}-${Math.floor(Math.random() * 10000)}`,
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
        .then(() => {
          alert(`${institucion.nombre} vinculada`);

          setModalConectarAbierto(false);

          obtenerCuentas(idUsuarioActual);
        })
        .finally(() => setCargandoConexion(false));

    }, 2500);
  };

  // =========================
  // METAS
  // =========================

  const manejarCambioInput = (e) => {
    setMetaForm({
      ...metaForm,
      [e.target.name]: e.target.value
    });
  };

  const manejarGuardarMeta = () => {
    const token = localStorage.getItem("Token");

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
      })
      .catch(error => console.error("Error obteniendo usuario:", error));
  };


  const guardarMetaApi = (metaAGuardar) => {
    const esEdicion =
      metaAGuardar.IdMetaAhorro !== null &&
      metaAGuardar.IdMetaAhorro !== undefined;

    const url = esEdicion
      ? `${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaAGuardar.IdMetaAhorro}`
      : `${API_BASE_URL}${API_ENDPOINTS.ahorros}`;

    const metodo = esEdicion ? "PUT" : "POST";

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      },
      body: JSON.stringify(metaAGuardar)
    })
      .then(() => {

        setModalAgregarAbierto(false);
        setModalEditarAbierto(false);

        obtenerDatos();
      })
      .catch(error => console.error(error));
  };

  const manejarEliminarMeta = () => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaForm.IdMetaAhorro}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Token")}`
      }
    })
      .then(() => {

        setModalEditarAbierto(false);

        obtenerDatos();
      })
      .catch(error => console.error(error));
  };

  // =========================
  // HELPERS
  // =========================

  const calcularTotal = (datos) => {
    return datos.reduce((acum, item) => {
      return acum + Number(item.valor || 0);
    }, 0);
  };

  const obtenerTopCinco = (items) => {
    return [...items]
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  };

  const renderCenterLabel = ({ cx, cy }, total) => (
    <g>
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={13}
        fontWeight="600"
      >
        Total
      </text>

      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#c8b277"
        fontSize={16}
        fontWeight="700"
      >
        ${total.toLocaleString("es-AR")}
      </text>
    </g>
  );

  const EstadoVacio = ({
    titulo,
    mensaje,
    icono = "📊",
    sugerencia
  }) => (
    <div className="tarjeta-general aviso-vacio">
      {titulo && <h3>{titulo}</h3>}

      <div className="contenido-aviso-vacio">
        <div className="icono-placeholder">{icono}</div>

        <p>{mensaje}</p>

        <span className="sugerencia">
          {sugerencia || "Registra movimientos para ver información."}
        </span>
      </div>
    </div>
  );

  const BarraProgreso = ({
    actual,
    objetivo,
    etiqueta
  }) => {

    const porcentaje =
      objetivo > 0
        ? Math.min(100, (actual / objetivo) * 100)
        : 0;

    return (
      <div className="item-progreso-general">

        <div className="info-progreso-general">
          <span
            style={{
              fontWeight: "500",
              color: "#ffffff"
            }}
          >
            {etiqueta}
          </span>

          <span
            style={{
              color: "#c8b277",
              fontWeight: "bold"
            }}
          >
            {porcentaje.toFixed(0)}%
          </span>
        </div>

        <div className="pista-barra-general">
          <div
            className="relleno-barra-general"
            style={{
              width: `${porcentaje}%`
            }}
          />
        </div>

        <div className="texto-monto-general">
          ${actual.toLocaleString("es-AR")} / $
          {objetivo.toLocaleString("es-AR")}
        </div>
      </div>
    );
  };

  // =========================
  // MODALES
  // =========================

  const abrirModalAgregar = () => {
    setMetaForm({
      IdMetaAhorro: null,
      Nombre: "",
      MontoObjetivo: "",
      MontoGuardado: "",
      FechaObjetivo: "",
      FechaInicio: "",
      Divisa: "1"
    });

    setModalAgregarAbierto(true);
  };

  const abrirModalEditar = (meta) => {
    setMetaForm({
      IdMetaAhorro: meta.IdMetaAhorro,
      Nombre: meta.Nombre || "",
      MontoObjetivo: meta.MontoObjetivo || "",
      MontoGuardado: meta.MontoGuardado || "",
      FechaObjetivo: meta.FechaMeta
        ? meta.FechaMeta.split("T")[0]
        : "",
      FechaInicio: meta.FechaInicio
        ? meta.FechaInicio.split("T")[0]
        : "",
      IdDivisa: parseInt(meta.IdDivisa) || 1
    });
    setModalEditarAbierto(true);
  };

  // =========================
  // USER
  // =========================

  const nombre = localStorage.getItem("Nombre") || "Usuario";

  const apellido = localStorage.getItem("Apellido") || "";

  return (
    <div className="contenedor-principal-general">

      <div className="seccion-encabezado-general">

        <div className="titulo-principal-general">

          <h2>
            {mostrarSaludo
              ? `¡Bienvenido, ${nombre} ${apellido}!`
              : "El Control Total de tu Economía"}
          </h2>

          <p>
            Todas las monedas son convertidas automáticamente a ARS.
          </p>

          <small style={{ color: "#c8b277", fontWeight: "500", fontStyle: "italic", fontSize: "1.1rem" }}>
            USD: ${cotizaciones.USD} | EUR: ${cotizaciones.EUR}
          </small>

        </div>

        <div className="botones-functions-comparativas">
          <Link to="/comparativa" className="botonesComparativa">
            Mostrar Balance
          </Link>
        </div>
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