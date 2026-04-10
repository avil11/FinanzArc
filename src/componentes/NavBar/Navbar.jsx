import { Link, useNavigate } from "react-router-dom";
import "../NavBar/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const revisarLogin = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const handleLoginClick = () => {
    if (revisarLogin()) {
      navigate("/dashboard");
    } else {
      navigate("/registro");
    }
  };

  return (
    <header className="navbar-container">
      <nav className="nav-content">
        {/* Logo */}
        <div className="logo-section">
          <p className="logo-text">FinanzARC</p>
          
        </div>

        {/* Menú Central (Píldora) */}
        <div className="menu-pill">
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
        <div className="auth-section">
          <div className="auth-pill">
            <button onClick={handleLoginClick} className="login-button">
              {revisarLogin() ? "Ir al Dashboard" : "Iniciar Sesión"}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
