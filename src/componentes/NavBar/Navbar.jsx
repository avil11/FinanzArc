import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../NavBar/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
      navigate("/registro");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
          <div className="auth-pill">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="login-button logout-variant">
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
                <Link to="/Principal" className="mobile-link" onClick={closeMobileMenu}>Principal</Link>
                <Link to="/ahorro" className="mobile-link" onClick={closeMobileMenu}>Ahorro</Link>
                <Link to="/gasto" className="mobile-link" onClick={closeMobileMenu}>Gasto</Link>
                <Link to="/perfil" className="mobile-link" onClick={closeMobileMenu}>Perfil</Link>
                <button onClick={handleLogout} className="mobile-login-button logout-variant">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="mobile-link" onClick={closeMobileMenu}>Inicio</Link>
                <Link to="/servicios" className="mobile-link" onClick={closeMobileMenu}>Servicios</Link>
                <Link to="/contacto" className="mobile-link" onClick={closeMobileMenu}>Contactanos</Link>
                <button onClick={handleLoginClick} className="mobile-login-button">
                  Ingreso
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;