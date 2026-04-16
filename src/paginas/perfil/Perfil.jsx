import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';

function Perfil() {
    const navigate = useNavigate();

    function cerrarSesion() {
        localStorage.removeItem("Token");
        navigate("/");
        window.location.reload();
    }

    return (
        <div className="perfil-pagina-contenedor-general" >
            <div className="perfil-pagina-contenedor">
                <div className="perfil-tarjeta-premium">
                    {/* Encabezado del Perfil */}
                    <div className="perfil-header">
                        <div className="perfil-avatar">
                            <span className="avatar-inicial">A</span>
                            <span className="avatar-inicial">G</span>
                        </div>
                        <h1 className="perfil-nombre">Agustín García</h1>
                        <p className="perfil-status">Miembro Gold</p>
                    </div>

                    {/* Información del Usuario */}
                    <div className="perfil-info-lista">
                        <div className="info-item">
                            <label>Nombre</label>
                            <span>Agustin</span>
                        </div>
                        <div className="info-item">
                            <label>Apellido</label>
                            <span>Garcia</span>
                        </div>
                        <div className="info-item">
                            <label>Email</label>
                            <span>garciaagustin579@gmail.com</span>
                        </div>
                        <div className="info-item">
                            <label>Telefono</label>
                            <span>+54 3516184200</span>
                        </div>
                        <div className="info-item">
                            <label>Nombre de Usuario</label>
                            <span>Guatate</span>
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