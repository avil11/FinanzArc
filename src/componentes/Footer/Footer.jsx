import React from "react";
import "./Footer.css"; // Ruta simplificada (asumiendo que está en la misma carpeta)
import { Link } from "react-router-dom";

const Footer = () => {
  const equipo = [
    { nombre: "Nombre 1", rol: "Full Stack Developer", link: "https://linkedin.com/in/tu-perfil" },
    { nombre: "Nombre 2", rol: "Frontend Developer", link: "#" },
    { nombre: "Nombre 3", rol: "Backend Developer", link: "#" },
    { nombre: "Nombre 4", rol: "UI/UX Designer", link: "#" },
  ];

  return (
    <div className="layou-display">
      <footer className="footer-principal">
        <div className="footer-contenido">
          
          {/* Izquierda: Branding */}
          <div className="footer-col-marca">
            <div className="Titulo">
              <h4>FinanzARC</h4>
            </div>
            <p className="descripcion-footer">
              Gestión financiera de precisión para transformar tu futuro económico.
            </p>
          </div>

          {/* Centro: El Equipo (LinkedIn) */}
          <div className="footer-col-equipo">
            <h4>Nuestro Equipo</h4>
            <div className="grid-equipo">
              {equipo.map((persona, index) => (
                <a 
                  key={index} 
                  href={persona.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="tarjeta-miembro"
                >
                  <div className="avatar-placeholder"></div>
                  <div className="info-miembro">
                    <h5>{persona.nombre}</h5>
                    <p>{persona.rol}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Derecha: Navegación/Links corregidos */}
          <div className="footer-col-links">
            <h4>Navegación</h4>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/inicio">Inicio</Link>
              <Link to="/servicios">Servicios</Link>
              <Link to="/propuesta">Propuesta</Link>
            </nav>
          </div>

        </div>
        
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} FinanzARC - Tesis de Desarrollo Web</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;