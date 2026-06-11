import React, { useState, useEffect, memo } from "react";
import "../Principal/General/general.css";
import { toast } from "react-toastify";
import "./planes.css";

const API_BASE_URL = "http://localhost:60496/api";

// ------------------------------------------------------------------
// NUEVO COMPONENTE: Procesador de detalles optimizado con React.memo
// ------------------------------------------------------------------
const DetallesLista = memo(({ texto }) => {
  // 1. Evitar errores si viene null, undefined o vacío
  if (!texto || typeof texto !== "string" || texto.trim() === "") {
    return <p className="detalle-vacio">Sin descripción disponible.</p>;
  }

  // 2. Separar por líneas y limpiar espacios en blanco, omitiendo líneas vacías
  const lineas = texto.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  if (lineas.length === 0) {
    return <p className="detalle-vacio">Sin descripción disponible.</p>;
  }

  // 3. Renderizar la lista evaluando el primer carácter de cada línea
  return (
    <ul className="lista-detalles">
      {lineas.map((linea, index) => {
        if (linea.startsWith("+")) {
          return (
            <li key={index} className="detalle-incluido">
              ✅ {linea.substring(1).trim()}
            </li>
          );
        } else if (linea.startsWith("-")) {
          return (
            <li key={index} className="detalle-excluido">
              ❌ {linea.substring(1).trim()}
            </li>
          );
        } else {
          return (
            <li key={index} className="detalle-normal">
              {linea}
            </li>
          );
        }
      })}
    </ul>
  );
});
// ------------------------------------------------------------------

const PlanesCompra = () => {
  const [planes, setPlanes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [planForm, setPlanForm] = useState({ id: 0, Nombre: "", Precio: "", Detalle: "", IdRol: "", IdTipoSuscripcion: 1 });
  const [TipoSuscripcion, setTipoSuscripcion] = useState(1);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const token = localStorage.getItem("Token");
    fetch(`${API_BASE_URL}/Usuarios/ByToken`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(err => console.error("Error cargando usuario:", err));

    fetch(`${API_BASE_URL}/Planes`)
      .then(res => res.json())
      .then(data => setPlanes(data))
      .catch(err => console.error("Error cargando planes:", err));
  };

  const comprarPlan = async (plan) => {
    setCargandoPago(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/MercadoPago/crear-preferencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("Token")}`
        },
        body: JSON.stringify({
          NombrePlan: plan.Nombre || `Plan Nivel ${plan.IdRol}`,
          Precio: parseFloat(plan.Precio),
          IdTipoSuscripcion: TipoSuscripcion
        })
      });

      if (!respuesta.ok) throw new Error("Error al comunicarse con Mercado Pago");

      const data = await respuesta.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al procesar el pago. Intenta nuevamente.");
    } finally {
      setCargandoPago(false);
    }
  };

  const guardarPlan = () => {
    const metodo = esEdicion ? "PUT" : "POST";
    const url = esEdicion ? `${API_BASE_URL}/Planes/${planForm.id}` : `${API_BASE_URL}/Planes`;

    const payload = {
      IdPlan: planForm.id || 0,
      Nombre: planForm.Nombre || "",
      Precio: parseFloat(planForm.Precio) || 0,
      Detalle: planForm.Detalle || "",
      IdRol: parseInt(planForm.IdRol) || 0,
      IdTipoSuscripcion: parseInt(planForm.IdTipoSuscripcion) || 1
    };

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("Token")}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          toast.success(
            esEdicion
              ? "Plan actualizado correctamente."
              : "Plan agregado correctamente."
          );
          cargarDatos();
          setModalAbierto(false);
        } else {
          toast.error(
            "Error en la operación. Verifica los datos enviados al backend."
          );
        }
      })
      .catch(err => console.error("Error de red al guardar:", err));
  };

  const abrirModal = (plan = null) => {
    if (plan) {
      setEsEdicion(true);
      setPlanForm({
        id: plan.IdPlan,
        Nombre: plan.Nombre || "",
        Precio: plan.Precio || "",
        Detalle: plan.Detalle || plan.Detalles || "",
        IdRol: plan.IdRol || "",
        IdTipoSuscripcion: plan.IdTipoSuscripcion || 1
      });
    } else {
      setEsEdicion(false);
      setPlanForm({ id: null, Nombre: "", Precio: "", Detalle: "", IdRol: "", IdTipoSuscripcion: 1 });
    }
    setModalAbierto(true);
  };

  // Filtrado optimizado antes de renderizar
  const planesFiltrados = planes.filter(
    plan => Number(plan.IdTipoSuscripcion) === Number(TipoSuscripcion)
  );

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general planes-introduccion">
        <div className="titulo-principal-general planes-encabezado">
          <h2>Planes de Suscripción</h2>
          <p>Centraliza tu gestión financiera con nuestros planes.</p>
          
          {/* Nuevo selector visual de suscripción */}
          <div className="selector-suscripcion">
            <button
              className={`boton-secundario-plan ${TipoSuscripcion === 1 ? "activo" : ""}`}
              onClick={() => setTipoSuscripcion(1)}
              style={TipoSuscripcion === 1 ? { backgroundColor: "#c8b277", color: "#000", borderColor: "#c8b277" } : {}}
            >
              Mensual
            </button>

            <button
              className={`boton-secundario-plan ${TipoSuscripcion === 2 ? "activo" : ""}`}
              onClick={() => setTipoSuscripcion(2)}
              style={TipoSuscripcion === 2 ? { backgroundColor: "#c8b277", color: "#000", borderColor: "#c8b277" } : {}}
            >
              Anual
            </button>
          </div>
        </div>

        {usuario?.IdRol === 4 && (
          <button className="boton-primario planes-boton" onClick={() => abrirModal()}>+ Agregar Nuevo Plan</button>
        )}
      </div>

      <div className="contenedor-planes-grid">
        {planesFiltrados.map((p) => (
          <div key={p.IdPlan} className="tarjeta-plan">
            
            {/* Badge indicativo de tipo de suscripción */}
            <span className="badge-suscripcion" style={{ 
                display: "inline-block", 
                backgroundColor: "#c8b277", 
                color: "#000", 
                padding: "4px 8px", 
                borderRadius: "4px", 
                fontSize: "0.8rem", 
                fontWeight: "bold", 
                marginBottom: "10px" 
            }}>
              {Number(p.IdTipoSuscripcion) === 1 ? "Mensual" : "Anual"}
            </span>

            <div>
              <h3>{p.Nombre || `Plan Nivel ${p.IdRol}`}</h3>
              <h2>${p.Precio} ARS</h2>

              <DetallesLista texto={p.Detalle || p.Detalles} />
            </div>

            <button
              className={`btn-plan ${usuario?.IdRol === 4 ? "btn-plan-editar" : "btn-plan-suscribir"}`}
              disabled={cargandoPago}
              onClick={() => usuario?.IdRol === 4 ? abrirModal(p) : comprarPlan(p)}
            >
              {usuario?.IdRol === 4 ? "Editar Plan" : (cargandoPago ? "Cargando pago..." : "Suscribirse")}
            </button>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="capa-modal">
          <div className="contenido-modal">
            <h3>{esEdicion ? "Editar Plan" : "Registrar Nuevo Plan"}</h3>
            <div className="formulario-cuerpo">
              <div className="formulario-grupo">
                <label>Nombre del Plan</label>
                <input
                  type="text"
                  value={planForm.Nombre}
                  onChange={e => setPlanForm({ ...planForm, Nombre: e.target.value })}
                  placeholder="Ej: Plan Premium..."
                />
              </div>
              <div className="formulario-grupo">
                <label>Precio</label>
                <input
                  type="number"
                  value={planForm.Precio}
                  onChange={e => setPlanForm({ ...planForm, Precio: e.target.value })}
                />
              </div>
              <div className="formulario-grupo">
                <label>Detalle</label>
                <textarea
                  className="textarea-modal"
                  value={planForm.Detalle}
                  onChange={e => setPlanForm({ ...planForm, Detalle: e.target.value })}
                  placeholder="+ Característica incluida&#10;- Característica no incluida"
                />
              </div>
              <div className="formulario-grupo">
                <label>Id Rol requerido</label>
                <input
                  type="number"
                  value={planForm.IdRol}
                  onChange={e => setPlanForm({ ...planForm, IdRol: e.target.value })}
                />
              </div>
              <div className="formulario-grupo">
                <label>Tipo de Suscripción (1=Mensual, 2=Anual)</label>
                <select
                  value={planForm.IdTipoSuscripcion}
                  onChange={e => setPlanForm({ ...planForm, IdTipoSuscripcion: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#1e1e1f", color: "#fff", border: "1px solid #333" }}
                >
                  <option value={1}>Mensual</option>
                  <option value={2}>Anual</option>
                </select>
              </div>
            </div>
            <div className="formulario-acciones">
              <button className="boton-secundario" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="boton-primario" onClick={guardarPlan}>{esEdicion ? "Actualizar" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesCompra;