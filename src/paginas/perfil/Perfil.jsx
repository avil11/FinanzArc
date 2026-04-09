import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Perfil.css';

function Perfil () {
const Navigate = useNavigate();

function cerrarSesion() {
    localStorage.removeItem("Token");
    Navigate("/");
    window.location.reload(); // Recarga la página para actualizar el estado de autenticación
}



    return (
        <div style={{padding: '50px'}}>
            <h1>Perfil</h1>


            <button onClick={() => cerrarSesion()} className='BotonLogout'>Cerrar Sesión</button>
        </div>
    );
}
export default Perfil;