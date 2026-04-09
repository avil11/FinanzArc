import { Link, useNavigate } from "react-router-dom";
import "../NavBar/Navbar.css";
const Navbar = () => {
  const navigate = useNavigate();

  function revisarLogin() {
    const token = localStorage.getItem("token");
    return !!token; // Devuelve true si el token existe, false si no
  }
  function handleLoginClick() {
    if (revisarLogin()) {
      navigate("/dashboard"); // Redirige al dashboard si el usuario ya ha iniciado sesión
    } else {
      navigate("/registro"); // Redirige a la página de registro si no ha iniciado sesión
    }
  }
  return (
    <nav className="layout-container">
      <div>
        <div className="Titulo">
          <p>FinanzARC</p>
        </div>
        <div className="BotonesNav">
          <Link to="/" className="BotonInicio">Inicio</Link>
          <Link to="/servicios" className="BotonServicios">Servicios</Link>
          <Link to="/sobre-nosotros" className="BotonSobreNosotros">Sobre Nosotros</Link>
          <Link to="/contacto" className="BotonContacto"> Contactanos</Link>
        </div>
        <div className="BotonInicio">
          <button onClick={() => navigate("/registro")} className="BotonLogin">
            Iniciar Sesion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
