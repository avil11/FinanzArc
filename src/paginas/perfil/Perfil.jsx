import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';
import { useEffect, useState } from 'react';


function Perfil() {
    const [Email, setEmail] = useState("");
    const [Telefono, setTelefono] = useState("");
    const [NombreUsuario, setNombreUsuario] = useState("");
    const [IdRol, setIdRol] = useState(null); // <-- Nuevo estado para el rol
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
                // localStorage.setItem("PlanActual", data.PlanActual); // Esto ya no es tan necesario si usas el IdRol

                setEmail(data.Email);
                setTelefono(data.Telefono);
                setNombreUsuario(data.NombreUsuario);
                setIdRol(data.IdRol); // <-- Guardamos el IdRol aquí
            })
            .catch((error) => console.error("Error identificando usuario:", error));
    };
    let nombre = localStorage.getItem("Nombre");
    let apellido = localStorage.getItem("Apellido");
    let planActual = localStorage.getItem("PlanActual");
    let primerletranombre = nombre ? nombre.charAt(0).toUpperCase() : "";
    let primerletraapellido = apellido ? apellido.charAt(0).toUpperCase() : "";
    const obtenerNombrePlan = (rol) => {
        switch (rol) {
            case 1: return "Plan Esencial";
            case 2: return "Plan Gold";
            case 3: return "Plan Platino";
            case 4: return "Administrador";
            default: return "Cargando plan...";
        }
    };
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
                        <div className="info-item">
                            <label>Plan actual</label>
                            <span className="badge-dorado">{obtenerNombrePlan(IdRol)}</span>
                        </div>

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

                        </div>
                        {/* ... los demás info-item arriba (Nombre, Apellido, Email, etc) ... */}

                        <div className="info-item">
                            <label>Nombre de Usuario</label>
                            <span>{NombreUsuario}</span>
                        </div>

                        {/* Simplemente dejamos el div sin la condición para que aparezca siempre */}
                        <div className="info-item">
                            <label>Plan actual</label>
                            <span className="badge-dorado" style={{ color: "#c8b277", fontWeight: "bold" }}>
                                {obtenerNombrePlan(IdRol)}
                            </span>
                        </div>
                    </div>

                    <div className="perfil-acciones">
                        <button className="btn boton-primario" onClick={() => navigate("/planes")}>
                            Ver Planes
                        </button>

                        <button className="btn BotonLogout" onClick={cerrarSesion}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;