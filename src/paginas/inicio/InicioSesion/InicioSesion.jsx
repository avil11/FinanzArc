import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InicioSesion.css"; 

const InicioSesion = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [PasswordHash, setPasswordHash] = useState(""); // Usamos el nombre que espera la API
  const [error, setError] = useState("");
  const [mostrarPasswordHash, setMostrarPasswordHash] = useState(false);
  const [cargando, setCargando] = useState(false); // Para feedback visual

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    iniciarSesion();
  };

  function handleCerrarModal() {
    setError("");
    setNombreUsuario("");
    setPasswordHash("");
    onClose();
  }

  function iniciarSesion() {
    setCargando(true);
    setError("");

    // Ajusta la URL a la que use tu proyecto de Visual Studio (ej: localhost:44332)
    fetch("http://localhost:60496/api/Usuarios/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        NombreUsuario: NombreUsuario,
        PasswordHash: PasswordHash, // Enviamos los nombres exactos de tu objeto Usuario en C#
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Usuario o contraseña incorrectos.");
        }
        if (!response.ok) {
          throw new Error("Error en el servidor. Inténtalo más tarde.");
        }
        return response.json();
      })
      .then((data) => {
        // Guardamos el JWT real que generó tu API en C#
        localStorage.setItem("Token", data.Token);
        localStorage.setItem("Nombre", data.Nombre);
        localStorage.setItem("Apellido", data.Apellido);
        localStorage.setItem("PlanActual", data.PlanActual);

        handleCerrarModal();
        navigate("/Principal");
        
        // Pequeño delay para asegurar que el token se guardó antes de recargar
        setTimeout(() => {
            window.location.reload(); 
        }, 100);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Login Error:", err);
      })
      .finally(() => {
        setCargando(false);
      });
  }

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
                placeholder="Ej: ramiro_dev" 
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
                  onClick={() => setMostrarPasswordHash(!mostrarPasswordHash)}
                  tabIndex="-1"
                >
                  {mostrarPasswordHash ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="boton-primario login-btn-full"
              disabled={cargando}
            >
              {cargando ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InicioSesion;