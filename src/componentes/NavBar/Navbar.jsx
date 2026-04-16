import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../NavBar/Navbar.css";
// 1. NUEVO: Importamos el componente del modal (Asegúrate de poner la ruta correcta hacia tu archivo)
import InicioSesion from "../../paginas/inicio/InicioSesion/InicioSesion"; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 2. NUEVO: Estado para abrir/cerrar el modal desde el Navbar
  const [modalAbierto, setModalAbierto] = useState(false);

  // Usamos un estado para el login para que React re-renderice al cambiar
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("Token"));

  // Sincronizar el estado de login (útil si el token cambia sin recargar la página)
  useEffect(() => {
    const checkToken = () => {
      setIsLoggedIn(!!localStorage.getItem("Token"));
    };
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const handleLoginClick = () => {
    closeMobileMenu();
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      // 3. MODIFICADO: En lugar de navegar a "/registro", encendemos el modal
      setModalAbierto(true);
    }
  };

  const handleLogout = () => {
    // Nota extra: Cambié "token" por "Token" para que coincida exactamente con tu useEffect
    localStorage.removeItem("Token"); 
    setIsLoggedIn(false);
    closeMobileMenu();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : "auto";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <header className="navbar-container">
      <nav className="nav-content">
        {/* Logo */}
        <div className="logo-section">
          <p className="logo-text" onClick={() => navigate("/")} style={{cursor: 'pointer'}}>
            FinanzARC
          </p>
        </div>

        {/* --- MENÚ DE ESCRITORIO --- */}
        <div className="menu-pill desktop-menu">
          {isLoggedIn ? (
            <>
              <Link to="/Principal" className="nav-link">Principal</Link>
              <Link to="/ingreso" className="nav-link">Ingreso</Link>
              <Link to="/ahorro" className="nav-link">Ahorro</Link>
              <Link to="/gasto" className="nav-link">Gasto</Link>
              <Link to="/perfil" className="nav-link">Perfil</Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Inicio</Link>
              <Link to="/servicios" className="nav-link">Servicios</Link>
              <Link to="/propuesta" className="nav-link">Propuesta</Link>
              <Link to="/contacto" className="nav-link">Contactanos</Link>
            </>
          )}
        </div>

        {/* Sección Acceso */}
        <div className="auth-section desktop-menu">
          <div className="">
            {isLoggedIn ? (
              <button   style={{display: 'none'}}>
                Cerrar Sesión
              </button>
            ) : (
              <button onClick={handleLoginClick} className="login-button">
                Ingreso
              </button>
            )}
          </div>
        </div>

        {/* --- ICONO HAMBURGUESA --- */}
        <div
          className={`hamburger-icon ${isMobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-content">
            {isLoggedIn ? (
              <>
                <Link to="/principal" className="mobile-link" onClick={closeMobileMenu}>Principal</Link>
                <Link to="/ingreso" className="mobile-link" onClick={closeMobileMenu}>Ingresos</Link>
                <Link to="/ahorro" className="mobile-link" onClick={closeMobileMenu}>Ahorros</Link>
                <Link to="/gasto" className="mobile-link" onClick={closeMobileMenu}>Gastos</Link>
                <Link to="/perfil" className="mobile-link" onClick={closeMobileMenu}>Mi Perfil</Link>
                <button onClick={handleLogout} className="mobile-login-button logout-variant">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="mobile-link" onClick={closeMobileMenu}>Inicio</Link>
                <Link to="/servicios" className="mobile-link" onClick={closeMobileMenu}>Servicios</Link>
                <Link to="/propuesta" className="mobile-link" onClick={closeMobileMenu}>Propuesta</Link>
                <Link to="/contacto" className="mobile-link" onClick={closeMobileMenu}>Contactanos</Link>
                <button onClick={handleLoginClick} className="mobile-login-button">
                  Ingreso
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 4. NUEVO: Aquí inyectamos tu modal. Está "escondido" hasta que isOpen sea true */}
      <InicioSesion 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
      />
      
    </header>
  );
};

export default Navbar;