import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PhoneInputPkg from "react-phone-input-2";
const PhoneInput = PhoneInputPkg.default ? PhoneInputPkg.default : PhoneInputPkg;

import "react-phone-input-2/lib/style.css";
import "./CrearCuenta.css";

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
    const urlCarpetaGenerada = `${formData.nombre.trim()}${inicialApellido}`;

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
      Token: "" 
    };

    try {
      const response = await fetch("http://localhost:60496/api/Usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioParaRegistrar)
      });

      if (response.ok) {
        // 1. Obtenemos los datos que devuelve tu controlador C# (Token, NombreUsuario, etc.)
        const data = await response.json(); 

        // 2. Guardamos la sesión en el localStorage para que la App sepa que estamos logueados
        localStorage.setItem("Token", data.Token);
        localStorage.setItem("Nombre", formData.nombre);
        localStorage.setItem("Apellido", formData.apellido);
        localStorage.setItem("Usuario", data.NombreUsuario);

        alert(`¡Bienvenido a FinanzARC, ${formData.nombre}!`);

        // 3. Redirigimos directamente al dashboard principal
        navigate("/principal");

        // 4. Recarga pequeña para actualizar el estado del Navbar/App
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
          ¿Ya tienes cuenta? <Link to="/inicio-sesion" className="gold-link">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default CrearCuenta;