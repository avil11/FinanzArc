import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Sacamos Link de acá
import PhoneInputPkg from "react-phone-input-2";
const PhoneInput = PhoneInputPkg.default ? PhoneInputPkg.default : PhoneInputPkg;

import "react-phone-input-2/lib/style.css";
import "./CrearCuenta.css";

// IMPORTANTE: Asegurate de que la ruta de importación coincida con la ubicación de tu archivo
import InicioSesion from "../inicio/InicioSesion/InicioSesion"; 

const CrearCuenta = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    nombreUsuario: "",
    password: "",
    confirmarPassword: ""
  });
  
  // NUEVO ESTADO: Controla si el modal de login está abierto o cerrado
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, telefono: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmarPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const inicialApellido = formData.apellido.trim().charAt(0).toUpperCase();

    // Lógica de URL única para almacenamiento en servidor
    const sufijoUnico = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const urlCarpetaGenerada = `${formData.nombre.trim()}${inicialApellido}_${sufijoUnico}`;

    const usuarioParaRegistrar = {
      Nombre: formData.nombre,
      Apellido: formData.apellido,
      Email: formData.email,
      Telefono: formData.telefono,
      NombreUsuario: formData.nombreUsuario,
      PasswordHash: formData.password,
      UrlCarpeta: urlCarpetaGenerada,
      FechaAlta: new Date().toISOString(),
      Activo: true,
      IdRol: 1 // Rol inicial: Usuario Esencial
    };

    try {
      const response = await fetch("http://localhost:60496/api/Usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioParaRegistrar)
      });

      if (response.ok) {
        const data = await response.json();

        // Guardamos los datos de sesión básicos
        localStorage.setItem("Token", data.Token);
        localStorage.setItem("Nombre", formData.nombre);
        localStorage.setItem("Apellido", formData.apellido);
        localStorage.setItem("Usuario", data.NombreUsuario);
        
        // Asignamos el plan inicial por defecto (Plan Esencial)
        localStorage.setItem("PlanActual", "Plan Esencial");

        alert(`¡Bienvenido a FinanzARC, ${formData.nombre}!`);

        navigate("/principal");

        setTimeout(() => {
          window.location.reload();
        }, 100);

      } else {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        alert("Hubo un problema al registrar el usuario.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h2>Crea tu <span className="gold-text">Cuenta</span></h2>
          <p>Únete a la gestión financiera inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="input-box">
              <label>Nombre</label>
              <input type="text" name="nombre" placeholder="Agustin" onChange={handleChange} required />
            </div>
            <div className="input-box">
              <label>Apellido</label>
              <input type="text" name="apellido" placeholder="Garcia" onChange={handleChange} required />
            </div>
          </div>

          <div className="input-box">
            <label>Correo Electrónico</label>
            <input type="email" name="email" placeholder="nombre@ejemplo.com" onChange={handleChange} required />
          </div>

          <div className="input-box">
            <label>Teléfono Móvil (Latinoamérica)</label>
            <PhoneInput
              country={"ar"}
              onlyCountries={["ar", "bo", "br", "cl", "co", "cr", "ec", "sv", "gt", "hn", "mx", "ni", "pa", "py", "pe", "pr", "uy", "ve"]}
              value={formData.telefono}
              onChange={handlePhoneChange}
              inputProps={{ name: "telefono", required: true }}
              containerClass="phone-container-custom"
              inputClass="phone-input-custom"
              buttonClass="phone-button-custom"
              dropdownClass="phone-dropdown-custom"
            />
          </div>

          <div className="input-box">
            <label>Nombre de Usuario</label>
            <input type="text" name="nombreUsuario" placeholder="agusting_dev" onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="input-box">
              <label>Contraseña</label>
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
            </div>
            <div className="input-box">
              <label>Confirmar</label>
              <input type="password" name="confirmarPassword" placeholder="••••••••" onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-gold-register">Registrarme</button>
        </form>

        <p className="footer-text">
          ¿Ya tienes cuenta?{" "}
          {/* CAMBIO ACÁ: Reemplazamos el Link por un botón que abre el modal */}
          <button 
            type="button" 
            className="gold-link" 
            onClick={() => setModalLoginAbierto(true)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              font: 'inherit',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Inicia Sesión
          </button>
        </p>
      </div>

      {/* RENDERIZAMOS EL MODAL FUERA DE LA TARJETA */}
      <InicioSesion 
        isOpen={modalLoginAbierto} 
        onClose={() => setModalLoginAbierto(false)} 
      />
    </div>
  );
};

export default CrearCuenta;