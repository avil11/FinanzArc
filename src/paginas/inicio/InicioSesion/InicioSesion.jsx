import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InicioSesion.css"; 

const InicioSesion = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // NUEVO: Estado para mostrar/ocultar contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Si el modal no está marcado como abierto, no renderizamos nada
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tu lógica de validación
    if (nombreUsuario === "admin@test.com" && password === "123456") {
      localStorage.setItem("Token", "SesionIniciada");
      onClose(); // Cerramos el modal
      navigate("/Principal");
      window.location.reload(); 
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
                value={nombreUsuario} 
                onChange={(e) => setNombreUsuario(e.target.value)} 
                placeholder="AgustinGarcia_2002" 
                required 
              />
            </div>

            <div className="formulario-grupo">
              <label>Contraseña</label>
              <div className="input-con-icono">
                <input 
                  type={mostrarPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  className="btn-ver-password"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  tabIndex="-1" // Evita seleccionarlo con Tabulador
                >
                  {mostrarPassword ? "Ocultar" : "Ver"}
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