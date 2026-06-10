import React, { useState, useEffect, useMemo } from "react";
import "../General/general.css";
import "./Archivos.css";

const API_BASE_URL = "http://localhost:60496/api";
const SERVER_HOST = "http://localhost:60496";

const Archivos = () => {
  // Estado de colecciones documentales mapeadas
  const [documentosIngreso, setDocumentosIngreso] = useState([]);
  const [documentosGasto, setDocumentosGasto] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // Estados operacionales del flujo asíncrono
  const [cargando, setCargando] = useState(true);
  const [errorVista, setErrorVista] = useState(null);
  const [sesionExpirada, setSesionExpirada] = useState(false);

  // Estado del formulario de carga reactiva
  const [modalAbierto, setModalAbierto] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [tipoSubida, setTipoSubida] = useState("ingreso");
  const [idTransaccion, setIdTransaccion] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  // Estados de filtrado documental
  const [panelActivo, setPanelActivo] = useState("ambos");
  const [mesFiltro, setMesFiltro] = useState("");
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear().toString());

  // Función de filtrado definida antes de los useMemo para evitar ReferenceError
  const filtrarDocumentos = (lista) => {
    return lista.filter((doc) => {
      const fecha = new Date(doc.FechaCarga);
      const coincideMes = mesFiltro === "" || (fecha.getMonth() + 1).toString() === mesFiltro;
      const coincideAnio = anioFiltro === "" || fecha.getFullYear().toString() === anioFiltro;
      return coincideMes && coincideAnio;
    });
  };

  const ingresosFiltrados = useMemo(() => filtrarDocumentos(documentosIngreso), [documentosIngreso, mesFiltro, anioFiltro]);
  const gastosFiltrados = useMemo(() => filtrarDocumentos(documentosGasto), [documentosGasto, mesFiltro, anioFiltro]);

  useEffect(() => {
    inicializarComponente();
  }, []);

  const forzarCierreSesion = (mensaje) => {
    localStorage.removeItem("Token");
    setErrorVista(mensaje);
    setSesionExpirada(true);
    setCargando(false);
  };

  const inicializarComponente = async () => {
    try {
      setCargando(true);
      setErrorVista(null);
      setSesionExpirada(false);

      const token = localStorage.getItem("Token");
      if (!token) {
        forzarCierreSesion("Su sesión ha expirado o no es válida. Por favor, vuelva a ingresar al sistema.");
        return;
      }

      const resUsuario = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resUsuario.status === 401) {
        forzarCierreSesion("Sesión expirada. Por favor vuelva a iniciar sesión.");
        return;
      }
      if (!resUsuario.ok) throw new Error("No se pudo verificar el perfil del usuario.");

      const datosUsuario = await resUsuario.json();
      setUsuario(datosUsuario);

      const [resIngresos, resGastos] = await Promise.all([
        fetch(`${API_BASE_URL}/DocumentoIngreso/Listar`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/DocumentoGasto/Listar`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (resIngresos.status === 401 || resGastos.status === 401) {
        forzarCierreSesion("Sesión expirada. Por favor vuelva a iniciar sesión.");
        return;
      }

      if (!resIngresos.ok || !resGastos.ok) {
        throw new Error("Error en el servidor al recuperar los catálogos documentales.");
      }

      const dataIngresos = await resIngresos.json();
      const dataGastos = await resGastos.json();

      setDocumentosIngreso(dataIngresos);
      setDocumentosGasto(dataGastos);
    } catch (err) {
      console.error("Error en inicializarComponente:", err);
      setErrorVista(err.message || "Ocurrió un error inesperado de red.");
    } finally {
      setCargando(false);
    }
  };

  const ejecutarSubidaArchivo = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      alert("Por favor, seleccione un archivo válido.");
      return;
    }

    setSubiendo(true);
    const token = localStorage.getItem("Token");
    if (!token) {
      forzarCierreSesion("Sesión inválida. Vuelva a iniciar sesión.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivoSeleccionado);

    let urlUpload = "";
    if (tipoSubida === "ingreso") {
      formData.append("idIngreso", idTransaccion);
      urlUpload = `${API_BASE_URL}/DocumentoIngreso/Upload`;
    } else {
      formData.append("idGasto", idTransaccion);
      urlUpload = `${API_BASE_URL}/DocumentoGasto/Upload`;
    }

    try {
      const respuesta = await fetch(urlUpload, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (respuesta.status === 401) {
        forzarCierreSesion("Sesión expirada. Por favor vuelva a iniciar sesión.");
        return;
      }

      if (!respuesta.ok) {
        const msgErr = await respuesta.text();
        throw new Error(msgErr || "Error al intentar subir el archivo.");
      }

      alert("Documento vinculado exitosamente.");
      setModalAbierto(false);
      setArchivoSeleccionado(null);
      setIdTransaccion("");
      await inicializarComponente();
    } catch (error) {
      console.error(error);
      alert(`Error en la operación: ${error.message}`);
    } finally {
      setSubiendo(false);
    }
  };

  const abrirModalCarga = (tipo) => {
    setTipoSubida(tipo);
    setIdTransaccion("");
    setArchivoSeleccionado(null);
    setModalAbierto(true);
  };

  const esImagen = (extension) => {
    return [".jpg", ".jpeg", ".png", ".gif"].includes(extension.toLowerCase());
  };

  if (cargando) {
    return (
      <div className="contenedor-principal-general archivos-cargando">
        <div className="spinner-arquitectonico"></div>
        <p>Validando credenciales y cargando repositorio documental seguro...</p>
      </div>
    );
  }

  if (errorVista) {
    return (
      <div className="contenedor-principal-general archivos-error-panel">
        <div className="alerta-error-mensaje">
          <h4>{sesionExpirada ? "Autenticación Requerida" : "Fallo de Comunicación"}</h4>
          <p>{errorVista}</p>
          {sesionExpirada ? (
            <button className="boton-primario" onClick={() => window.location.reload()}>
              Ir al Inicio de Sesión
            </button>
          ) : (
            <button className="boton-primario" onClick={inicializarComponente}>
              Reintentar Operación
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general">
        <div className="titulo-principal-general">
          <h2>Repositorio de Comprobantes Digitales</h2>
          <p>Gestión completa de documentación financiera para el usuario: <strong>{usuario?.Email || usuario?.Nombre}</strong></p>
        </div>

        {/* Sección de Filtros integrada */}
        <div className="contenedor-filtros-documental">
          <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
            <option value="">Todos los meses</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es-ES', { month: 'long' })}</option>
            ))}
          </select>
          <select value={anioFiltro} onChange={(e) => setAnioFiltro(e.target.value)}>
            {[2024, 2025, 2026].map(anio => <option key={anio} value={anio}>{anio}</option>)}
          </select>
        </div>

        <div className="acciones-cabecera-archivos">
          {panelActivo !== "ambos" && (
            <button className="boton-secundario" onClick={() => setPanelActivo("ambos")}>
              ← Ver Ambos Paneles
            </button>
          )}
          <button className="boton-primario" onClick={() => abrirModalCarga("ingreso")}>
            + Cargar Nuevo Comprobante
          </button>
        </div>
      </div>

      <div className="contenedor-paneles-dinamicos">
        
        {/* PANEL DE COMPROBANTES DE INGRESO */}
        <div 
          className={`panel-documental-base panel-ingresos-estilo 
            ${panelActivo === "ingreso" ? "panel-estado-maximizando" : ""} 
            ${panelActivo === "gasto" ? "panel-estado-minimizando" : ""}`}
        >
          <div className="encabezado-tarjeta-modulo" onClick={() => setPanelActivo(panelActivo === "ingreso" ? "ambos" : "ingreso")}>
            <h3>Documentos de Ingresos</h3>
            <span className="indicador-interactivo">{panelActivo === "ingreso" ? "🗎 Vista Expandida" : "⛶ Ampliar Panel"}</span>
          </div>

          <div className="cuerpo-interno-documental">
            {ingresosFiltrados.length === 0 ? (
              <div className="estado-vacio-documentos">
                <p>No posee archivos de ingresos cargados en este período.</p>
              </div>
            ) : (
              <div className="grilla-tarjetas-archivos">
                {ingresosFiltrados.map((doc) => (
                  <div key={doc.IdDocumentoIngreso} className="tarjeta-archivo-item">
                    <div className="contenedor-vista-previa">
                      {esImagen(doc.ExtensionArchivo) ? (
                        <img src={`${SERVER_HOST}${doc.RutaArchivo}`} alt={doc.NombreArchivoOriginal} className="imagen-preview-render" />
                      ) : (
                        <div className="icono-documento-generico">
                          <span>{doc.ExtensionArchivo.replace(".", "").toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="detalles-archivo-item">
                      <h4 title={doc.NombreArchivoOriginal}>{doc.NombreArchivoOriginal}</h4>
                      <p><strong>Fecha:</strong> {new Date(doc.FechaCarga).toLocaleDateString()}</p>
                      <p><strong>ID Ref:</strong> {doc.IdIngreso ? `Ingreso #${doc.IdIngreso}` : "Sin asignación"}</p>
                    </div>
                    <div className="acciones-archivo-item">
                      <a href={`${SERVER_HOST}${doc.RutaArchivo}`} target="_blank" rel="noopener noreferrer" className="enlace-descarga-archivo-btn">
                        Ver / Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DE COMPROBANTES DE GASTO */}
        <div 
          className={`panel-documental-base panel-gastos-estilo 
            ${panelActivo === "gasto" ? "panel-estado-maximizando" : ""} 
            ${panelActivo === "ingreso" ? "panel-estado-minimizando" : ""}`}
        >
          <div className="encabezado-tarjeta-modulo" onClick={() => setPanelActivo(panelActivo === "gasto" ? "ambos" : "gasto")}>
            <h3>Documentos de Gastos</h3>
            <span className="indicador-interactivo">{panelActivo === "gasto" ? "🗎 Vista Expandida" : "⛶ Ampliar Panel"}</span>
          </div>

          <div className="cuerpo-interno-documental">
            {gastosFiltrados.length === 0 ? (
              <div className="estado-vacio-documentos">
                <p>No posee archivos de gastos cargados en este período.</p>
              </div>
            ) : (
              <div className="grilla-tarjetas-archivos">
                {gastosFiltrados.map((doc) => (
                  <div key={doc.IdDocumentoGasto} className="tarjeta-archivo-item">
                    <div className="contenedor-vista-previa">
                      {esImagen(doc.ExtensionArchivo) ? (
                        <img src={`${SERVER_HOST}${doc.RutaArchivo}`} alt={doc.NombreArchivoOriginal} className="imagen-preview-render" />
                      ) : (
                        <div className="icono-documento-generico">
                          <span>{doc.ExtensionArchivo.replace(".", "").toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="detalles-archivo-item">
                      <h4 title={doc.NombreArchivoOriginal}>{doc.NombreArchivoOriginal}</h4>
                      <p><strong>Fecha:</strong> {new Date(doc.FechaCarga).toLocaleDateString()}</p>
                      <p><strong>ID Ref:</strong> {doc.IdGasto ? `Gasto #${doc.IdGasto}` : "Sin asignación"}</p>
                    </div>
                    <div className="acciones-archivo-item">
                      <a href={`${SERVER_HOST}${doc.RutaArchivo}`} target="_blank" rel="noopener noreferrer" className="enlace-descarga-archivo-btn">
                        Ver / Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORMULARIO MODAL INTERNO */}
      {modalAbierto && (
        <div className="capa-modal-documentos">
          <div className="contenido-modal-documentos">
            <h3>Cargar Comprobante Financiero</h3>
            <form onSubmit={ejecutarSubidaArchivo}>
              <div className="formulario-grupo">
                <label>Tipo de Comprobante</label>
                <select 
                  value={tipoSubida} 
                  onChange={(e) => setTipoSubida(e.target.value)}
                  disabled={subiendo}
                >
                  <option value="ingreso">Asociar a un Flujo de Ingreso</option>
                  <option value="gasto">Asociar a un Flujo de Gasto</option>
                </select>
              </div>
              <div className="formulario-grupo">
                <label>ID de la Transacción en FinanZARC</label>
                <input 
                  type="number" 
                  value={idTransaccion} 
                  onChange={(e) => setIdTransaccion(e.target.value)} 
                  placeholder="Ej: 1045"
                  disabled={subiendo}
                />
              </div>
              <div className="formulario-grupo">
                <label>Archivo de Respaldo (Imágenes o PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.gif"
                  onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                  required
                  disabled={subiendo}
                />
              </div>
              <div className="formulario-acciones">
                <button type="button" className="boton-secundario" onClick={() => setModalAbierto(false)} disabled={subiendo}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario" disabled={subiendo}>
                  {subiendo ? "Transfiriendo datos..." : "Subir Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archivos;