import React, { useState, useEffect } from "react";
import { initMercadoPago } from '@mercadopago/sdk-react';
import "../Principal/General/general.css";

// Inicializa Mercado Pago con tu PUBLIC KEY
initMercadoPago('APP_USR-760a1b53-cf60-4fb8-a6e2-0743b89da718', { locale: 'es-AR' });

const API_BASE_URL = "http://localhost:60496/api";

const PlanesCompra = () => {
  const [planes, setPlanes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargandoPago, setCargandoPago] = useState(false); // Para mostrar estado de carga al comprar
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  
  const [planForm, setPlanForm] = useState({ id: null, Nombre: "", Precio: "", Detalles: "", IdRol: "" });

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

  // --- LÓGICA DE MERCADO PAGO ---
  const comprarPlan = async (plan) => {
    setCargandoPago(true);
    try {
      // Llamamos al endpoint de tu backend que crea la preferencia
      const respuesta = await fetch(`${API_BASE_URL}/MercadoPago/crear-preferencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("Token")}` 
        },
        body: JSON.stringify({
          NombrePlan: plan.Nombre || `Plan Nivel ${plan.IdRol}`,
          Precio: parseFloat(plan.Precio)
        })
      });

      if (!respuesta.ok) throw new Error("Error al comunicarse con Mercado Pago");

      const data = await respuesta.json();
      
      // Redirigimos al usuario a la URL de pago de Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar el pago. Intenta de nuevo.");
    } finally {
      setCargandoPago(false);
    }
  };
  // -------------------------------

  const guardarPlan = () => {
    const metodo = esEdicion ? "PUT" : "POST";
    const url = esEdicion ? `${API_BASE_URL}/Planes/${planForm.id}` : `${API_BASE_URL}/Planes`;

    const payload = {
        IdPlanes: planForm.id || 0, 
        Nombre: planForm.Nombre || "",
        Precio: parseFloat(planForm.Precio) || 0,
        Detalles: planForm.Detalles || "",
        IdRol: parseInt(planForm.IdRol) || 0
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
        alert(esEdicion ? "Plan actualizado correctamente." : "Plan agregado correctamente.");
        cargarDatos();
        setModalAbierto(false);
      } else { 
        alert("Error en la operación. Asegúrate de que el modelo del backend coincida."); 
      }
    })
    .catch(err => console.error("Error de red al guardar:", err));
  };

  const abrirModal = (plan = null) => {
    if (plan) {
      setEsEdicion(true);
      setPlanForm({ 
          id: plan.IdPlanes, 
          Nombre: plan.Nombre || "",
          Precio: plan.Precio || "", 
          Detalles: plan.Detalles || "", 
          IdRol: plan.IdRol || "" 
      });   
    } else {
      setEsEdicion(false);
      setPlanForm({ id: null, Nombre: "", Precio: "", Detalles: "", IdRol: "" });
    }
    setModalAbierto(true);
  };

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general">
        <div className="titulo-principal-general">
          <h2>Planes de Suscripción</h2>
          <p>Centraliza tu gestión financiera con nuestros planes.</p>
        </div>
        {usuario?.IdRol === 4 && (
          <button className="boton-primario" onClick={() => abrirModal()}>+ Agregar Nuevo Plan</button>
        )}
      </div>

      <div 
        className="panel-graficos-general" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "20px", 
          maxWidth: "600px", 
          margin: "30px auto" 
        }}
      >
        {planes.map((p) => {
          return (
            <div key={p.IdPlanes} className="tarjeta-general">
              <h3>{p.Nombre || `Plan Nivel ${p.IdRol}`}</h3> 
              <h2 style={{ color: "#c8b277", fontSize: "2.5rem", margin: "20px 0" }}>${p.Precio}</h2>
              <p style={{ color: "#888", marginBottom: "30px" }}>{p.Detalles}</p>
              <button 
                className={usuario?.IdRol === 4 ? "boton-secundario" : "boton-primario"} 
                disabled={cargandoPago}
                onClick={() => usuario?.IdRol === 4 ? abrirModal(p) : comprarPlan(p)} 
                style={{ width: "100%", opacity: cargandoPago ? 0.6 : 1 }}
              >
                {usuario?.IdRol === 4 ? "Editar Plan" : (cargandoPago ? "Cargando pago..." : "Suscribirse")}
              </button>
            </div>
          )
        })}
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
                  onChange={e => setPlanForm({...planForm, Nombre: e.target.value})} 
                  placeholder="Ej: Plan Premium..."
                />
              </div>
              <div className="formulario-grupo">
                <label>Precio</label>
                <input 
                  type="number" 
                  value={planForm.Precio} 
                  onChange={e => setPlanForm({...planForm, Precio: e.target.value})} 
                />
              </div>
              <div className="formulario-grupo">
                <label>Detalles</label>
                <textarea 
                  value={planForm.Detalles} 
                  onChange={e => setPlanForm({...planForm, Detalles: e.target.value})} 
                  style={{ background: "#1e1e1f", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px", width: "100%", minHeight: "80px" }} 
                />
              </div>
              <div className="formulario-grupo">
                <label>Id Rol requerido</label>
                <input 
                  type="number" 
                  value={planForm.IdRol} 
                  onChange={e => setPlanForm({...planForm, IdRol: e.target.value})} 
                />
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