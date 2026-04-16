import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InicioSesion.css"; 

const InicioSesion = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [PasswordHash, setPasswordHash] = useState("");
  const [error, setError] = useState("");
  
  // Estado para mostrar/ocultar contraseña
  const [mostrarPasswordHash, setMostrarPasswordHash] = useState(false);

  // Si el modal no está marcado como abierto, no renderizamos nada
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // CORRECCIÓN 1: Usar PasswordHash (que es tu variable de estado)
    if (NombreUsuario === "Ramiro" && PasswordHash === "Ramiro123") {
      localStorage.setItem("Token", "SesionIniciada");
      
      onClose(); // Cerramos el modal
      
      // CORRECCIÓN 2: Redirigir y luego recargar si es necesario 
      // (aunque con el estado del Navbar que te pasé antes, el navigate debería bastar)
      navigate("/Principal");
      setTimeout(() => {
          window.location.reload(); 
      }, 100);
      
    } else {
      setError("Credenciales incorrectas.");
    }
  };

  return (
    <div className="capa-modal-login" onClick={onClose}>
      <div className="contenido-modal-login" onClick={(e) => e.stopPropagation()}>
        <button className="boton-cerrar-modal" onClick={onClose}>×</button>
        
        <div className="login-form-container">
          <h2 className="login-titulo">Bienvenido</h2>
          <p className="login-subtitulo">Ingresa a tu cuenta premium</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="login-error-msg">{error}</p>}
            
            <div className="formulario-grupo">
              <label>Nombre de Usuario:</label>
              <input 
                type="text" 
                value={NombreUsuario} 
                onChange={(e) => setNombreUsuario(e.target.value)} 
                placeholder="Ej: Ramiro" 
                required 
              />
            </div>

            <div className="formulario-grupo">
              <label>Contraseña</label>
              <div className="input-con-icono">
                <input 
                  type={mostrarPasswordHash ? "text" : "password"} 
                  value={PasswordHash} 
                  onChange={(e) => setPasswordHash(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  className="btn-ver-password"
                  // CORRECCIÓN 3: Cambiar a mostrarPasswordHash
                  onClick={() => setMostrarPasswordHash(!mostrarPasswordHash)}
                  tabIndex="-1"
                >
                  {mostrarPasswordHash ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button type="submit" className="boton-primario login-btn-full">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InicioSesion;