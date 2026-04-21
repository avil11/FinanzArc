import React from 'react';
import { useNavigate} from 'react-router-dom';
import './Perfil.css';
import { useEffect, useState } from 'react';


function Perfil() {
    const [Email, setEmail] = useState("");
    const [Telefono, setTelefono] = useState("");
    const [NombreUsuario, setNombreUsuario] = useState("");
    const API_BASE_URL = "http://localhost:60496";
    const API_ENDPOINTS = {
        usuarios: "/api/Usuarios"
    };
    const navigate = useNavigate();
    const [userData, setUserData] = React.useState({});
    function cerrarSesion() {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    }
    const obtenerDatos = () => {
    const token = localStorage.getItem("Token");
    if (!token) return;

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al validar sesión");
        return response.json();
      })
      .then((data) => { 

        setUserData(data);
        localStorage.setItem("Nombre", data.Nombre);
        localStorage.setItem("Apellido", data.Apellido);
        localStorage.setItem("PlanActual", data.PlanActual);
        setEmail(data.Email);
        setTelefono(data.Telefono);
        setNombreUsuario(data.NombreUsuario);
      })
      .catch((error) => console.error("Error identificando usuario:", error));
  };
    let nombre = localStorage.getItem("Nombre");
    let apellido = localStorage.getItem("Apellido");
    let planActual = localStorage.getItem("PlanActual");
    let primerletranombre = nombre ? nombre.charAt(0).toUpperCase() : "";
    let primerletraapellido = apellido ? apellido.charAt(0).toUpperCase() : "";
    useEffect(() => {
        obtenerDatos();
    }, []);
    return (
        <div className="perfil-pagina-contenedor-general" >
            <div className="perfil-pagina-contenedor">
                <div className="perfil-tarjeta-premium">
                    {/* Encabezado del Perfil */}
                    <div className="perfil-header">
                        <div className="perfil-avatar">
                            <span className="avatar-inicial">{primerletranombre}</span>
                            <span className="avatar-inicial">{primerletraapellido}</span>
                        </div>
                        <h1 className="perfil-nombre">{nombre} {apellido}</h1>
                        <p className="perfil-status">Miembro Gold</p>
                    </div>

                    {/* Información del Usuario */}
                    <div className="perfil-info-lista">
                        <div className="info-item">
                            <label>Nombre</label>
                            <span>{nombre}</span>
                        </div>
                        <div className="info-item">
                            <label>Apellido</label>
                            <span>{apellido}</span>
                        </div>
                        <div className="info-item">
                            <label>Email</label>
                            <span>{Email}</span>
                        </div>
                        <div className="info-item">
                            <label>Telefono</label>
                            <span>{Telefono}</span>
                        </div>
                        <div className="info-item">
                            <label>Nombre de Usuario</label>
                            <span>{NombreUsuario}</span>
                        </div>
                        <div className="info-item">
                            <label>Plan actual</label>
                            <span className="badge-dorado">Miembro Gold</span>
                        </div>
                    </div>

                    <div className="perfil-acciones">
                        <button onClick={cerrarSesion} className="BotonLogout">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;