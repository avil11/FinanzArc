import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../NavBar/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  // Estado para controlar el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const revisarLogin = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const handleLoginClick = () => {
    // Cerramos el menú al hacer clic
    setIsMobileMenuOpen(false);
    if (revisarLogin()) {
      navigate("/dashboard");
    } else {
      navigate("/registro");
    }
  };

  // Función para alternar el menú y evitar scroll cuando está abierto
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden"; // Evita que el fondo haga scroll
    } else {
      document.body.style.overflow = "auto";
    }
  };

  // Función para cerrar el menú al hacer clic en un link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <header className="navbar-container">
      <nav className="nav-content">
        {/* Logo */}
        <div className="logo-section">
          <p className="logo-text">FinanzARC</p>
        </div>

        {/* --- MENÚ DE ESCRITORIO --- */}
        {/* Menú Central (Píldora) */}
        <div className="menu-pill desktop-menu">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <Link to="/servicios" className="nav-link">
            Servicios
          </Link>
          <Link to="/propuesta" className="nav-link">
            Propuesta
          </Link>
          <Link to="/contacto" className="nav-link">
            Contactanos
          </Link>
        </div>

        {/* Sección Acceso con estilo Píldora */}
        <div className="auth-section desktop-menu">
          <div className="auth-pill">
            <button onClick={handleLoginClick} className="login-button">
              {revisarLogin() ? "Ir al Dashboard" : "Iniciar Sesión"}
            </button>
          </div>
        </div>

        {/* --- ICONO HAMBURGUESA (Solo Móvil) --- */}
          <div
            className={`hamburger-icon ${isMobileMenuOpen ? "open" : ""}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

        {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
        <div
          className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}
        >
          <div className="mobile-menu-content">
            <Link to="/" className="mobile-link" onClick={closeMobileMenu}>
              Inicio
            </Link>
            <Link
              to="/servicios"
              className="mobile-link"
              onClick={closeMobileMenu}
            >
              Servicios
            </Link>
            <Link
              to="/propuesta"
              className="mobile-link"
              onClick={closeMobileMenu}
            >
              Propuesta
            </Link>
            <Link
              to="/contacto"
              className="mobile-link"
              onClick={closeMobileMenu}
            >
              Contactanos
            </Link>

            <button onClick={handleLoginClick} className="mobile-login-button">
              {revisarLogin() ? "Ir al Dashboard" : "Iniciar Sesión"}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
