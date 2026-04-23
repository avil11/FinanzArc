import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const equipo = [
    {
      nombre: "Agustin",
      rol: "Full Stack Developer",
      link: "https://www.linkedin.com/in/agustin-garcia-2a7478328/",
      foto: "",
      texturaFondo: "/Imagenes/agustin.webp",
    },
    {
      nombre: "Ramiro",
      rol: "Frontend Developer",
      link: "https://www.linkedin.com/",
      foto: "",
      texturaFondo: "/Imagenes/textura2.webp",
    },
    {
      nombre: "Cristian",
      rol: "Backend Developer",
      link: "https://www.linkedin.com/in/",
      foto: "",
      texturaFondo: "/Imagenes/textura3.webp",
    },
    {
      nombre: "Mateo",
      rol: "UI/UX Designer",
      link: "https://www.linkedin.com/in/",
      foto: "",
      texturaFondo: "/Imagenes/textura4.webp",
    },
  ];

  return (
    <div className="layou-display" id="contacto">
      <footer className="footer-principal">
        <div className="footer-contenido">
          {/* Izquierda: Branding */}
          <div className="footer-col-marca">
            <div className="Titulo">
              <h4>FinanzARC</h4>
            </div>
            <p className="descripcion-footer">
              Gestión financiera de precisión para transformar tu futuro
              económico.
            </p>
          </div>

         {/* Centro: El Equipo */}
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
                  
                  {/* --- AVATAR (IMAGEN CIRCULAR COMPLETA) --- */}
                  <div 
                    className="avatar-placeholder"
                    style={{ backgroundImage: `url('${persona.texturaFondo}')` }}
                  ></div>

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
            <nav style={{ display: "flex", flexDirection: "column" }}>
              <Link to="/inicio">Inicio</Link>
              <Link to="/servicios">Servicios</Link>
              <Link to="/propuesta">Propuesta</Link>
            </nav>
          </div>
        </div>

        <div className="footer-copyright">
          <p>
            &copy; {new Date().getFullYear()} FinanzARC - Tesis de Desarrollo
            Web
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
