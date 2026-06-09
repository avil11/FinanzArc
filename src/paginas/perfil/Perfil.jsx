import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';

function Perfil() {
    const navigate = useNavigate();
    const API_BASE_URL = "http://localhost:60496";

    const [userData, setUserData] = useState({});
    const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem("FotoPerfil") || null);

    const nombreLocal = localStorage.getItem("Nombre") || "";
    const apellidoLocal = localStorage.getItem("Apellido") || "";
    
    const primerletranombre = nombreLocal.charAt(0).toUpperCase();
    const primerletraapellido = apellidoLocal.charAt(0).toUpperCase();

    const obtenerDatos = () => {
        const token = localStorage.getItem("Token");
        if (!token) return;

        fetch(`${API_BASE_URL}/api/Usuarios/ByToken`, {
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
            })
            .catch((error) => console.error("Error identificando usuario:", error));
    };

    useEffect(() => {
        obtenerDatos();
    }, []);

    const obtenerNombrePlan = (rol) => {
    switch (rol) {
        case 1: return "Plan Esencial";
        case 2: return "Plan Gold";
        case 3: return "Plan Platino";
        case 4: return "Plan Developer";
        default: return "Cargando plan...";
    }
};

    const cerrarSesion = () => {

        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("La imagen es muy pesada. Por favor, elegí una menor a 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setFotoPerfil(base64String);
            try {
                localStorage.setItem("FotoPerfil", base64String);
            } catch (error) {
                console.error("Error guardando imagen en localStorage", error);
                alert("No se pudo guardar la imagen localmente. Memoria llena.");
            }
        };
        reader.readAsDataURL(file);

    };

    return (
        <div className="perfil-pagina-contenedor-general">
            <div className="perfil-pagina-contenedor">
                <div className="perfil-tarjeta-premium">

                    <div className="perfil-header">
                        <div className="perfil-avatar">
                            {fotoPerfil ? (
                                <img src={fotoPerfil} alt="Perfil" className="avatar-imagen-cargada" />
                            ) : (
                                <>
                                    <span className="avatar-inicial">{userData.Nombre ? userData.Nombre.charAt(0).toUpperCase() : primerletranombre}</span>
                                    <span className="avatar-inicial">{userData.Apellido ? userData.Apellido.charAt(0).toUpperCase() : primerletraapellido}</span>
                                </>
                            )}
                            <label className="capa-subir-foto">
                                <span>✎</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <h1 className="perfil-nombre">{userData.Nombre || nombreLocal} {userData.Apellido || apellidoLocal}</h1>
                        <p className="perfil-email-header">{userData.Email || "Cargando..."}</p>
                    </div>
                    <div className="perfil-info-lista">
                        <div className="info-item">
                            <label>Nombre</label>
                            <span>{userData.Nombre}</span>
                        </div>
                        <div className="info-item">
                            <label>Apellido</label>
                            <span>{userData.Apellido}</span>
                        </div>
                        <div className="info-item">
                            <label>Teléfono</label>
                            <span>{userData.Telefono}</span>
                        </div>
                        <div className="info-item">
                            <label>Nombre de Usuario</label>
                            <span>{userData.NombreUsuario}</span>
                        </div>
                        <div className="info-item item-destacado">
                            <label>Plan actual</label>
                            <span className="badge-dorado">{obtenerNombrePlan(userData.IdRol)}</span>
                        </div>
                    </div>
                    <div className="perfil-acciones">
                        <button className="btn boton-ver-planes" onClick={() => navigate("/planes")}>
                            Mejorar Plan
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