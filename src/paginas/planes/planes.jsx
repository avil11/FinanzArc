import React, { useState, useEffect } from "react";
import { initMercadoPago } from '@mercadopago/sdk-react';
import "../Principal/General/general.css";
import "./planes.css"; // <-- Importamos el nuevo CSS

// Inicializa Mercado Pago con tu PUBLIC KEY
initMercadoPago('APP_USR-760a1b53-cf60-4fb8-a6e2-0743b89da718', { locale: 'es-AR' });

const API_BASE_URL = "http://localhost:60496/api";

const PlanesCompra = () => {
  const [planes, setPlanes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargandoPago, setCargandoPago] = useState(false);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  
  const [planForm, setPlanForm] = useState({ id: null, Nombre: "", Precio: "", Detalle: "", IdRol: "" });

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

  // --- GUARDAR O EDITAR PLAN ---
  const guardarPlan = () => {
    const metodo = esEdicion ? "PUT" : "POST";
    const url = esEdicion ? `${API_BASE_URL}/Planes/${planForm.id}` : `${API_BASE_URL}/Planes`;

    const payload = {
        IdPlanes: planForm.id || 0, 
        Nombre: planForm.Nombre || "",
        Precio: parseFloat(planForm.Precio) || 0,
        Detalle: planForm.Detalle || "", 
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
          Detalle: plan.Detalle || plan.Detalles || "", 
          IdRol: plan.IdRol || "" 
      });   
    } else {
      setEsEdicion(false);
      setPlanForm({ id: null, Nombre: "", Precio: "", Detalle: "", IdRol: "" });
    }
    setModalAbierto(true);
  };

  return (
    <div className="contenedor-principal-general">
      <div className="seccion-encabezado-general planes-introduccion">
        <div className="titulo-principal-general planes-encabezado">
          <h2>Planes de Suscripción</h2>
          <p>Centraliza tu gestión financiera con nuestros planes.</p>
        </div>
        {usuario?.IdRol === 4 && (
          <button className="boton-primario planes-boton" onClick={() => abrirModal()}>+ Agregar Nuevo Plan</button>
        )}
      </div>

      {/* CONTENEDOR GRID LIMPIO */}
      <div className="contenedor-planes-grid">
        {planes.map((p) => {
          return (
            <div key={p.IdPlanes} className="tarjeta-plan">
              <div>
                <h3>{p.Nombre || `Plan Nivel ${p.IdRol}`}</h3> 
                <h2>${p.Precio} ARS</h2>
                <p>{p.Detalle || p.Detalles || "Sin descripción disponible."}</p>
              </div>
              
              <button 
                className={`btn-plan ${usuario?.IdRol === 4 ? "btn-plan-editar" : "btn-plan-suscribir"}`} 
                disabled={cargandoPago}
                onClick={() => usuario?.IdRol === 4 ? abrirModal(p) : comprarPlan(p)} 
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
                <label>Detalle</label>
                <textarea 
                  className="textarea-modal"
                  value={planForm.Detalle} 
                  onChange={e => setPlanForm({...planForm, Detalle: e.target.value})} 
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