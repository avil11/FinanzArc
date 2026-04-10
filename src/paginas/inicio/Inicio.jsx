import React from "react";
import "./Inicio.css";

const Inicio = () => {
  return (
    <div className="main-wrapper">
      {/* SECCIÓN HERO */}
      <div className="containerInicio">
        <div className="contenedorBackground">
          <img
            src="/Imagenes/Gemini_Generated_Image_ebcj9lebcj9lebcj.png"
            alt="Hero"
          />
        </div>
        <div className="contenedorLogos">
          <div className="logos">
            <img src="/Imagenes/Logo 1.png" alt="Logo 1" />
            <img src="/Imagenes/Logo 2.png" alt="Logo 2" />
            <img src="/Imagenes/Logo 3.png" alt="Logo 3" />
            <img src="/Imagenes/Logo 4.png" alt="Logo 4" />
          </div>
        </div>
      </div>

      {/* SECCIÓN SOBRE EL PROYECTO / SERVICIOS */}
      <div className="containerServicio">
        <div className="containerProyecto">
          <h1>Sobre el Proyecto</h1>
          <p>
            En FinanzARC buscamos ofrecer soluciones para mejorar la gestión
            financiera para las empresas y personas que estén buscando optimizar
            su economía.
          </p>
          <img src="/Imagenes/ImagenSobreProyecto.png" alt="Sobre el Proyecto" />
        </div>

        <div className="containerTarjetas">
          <div className="containerTarjetas1">
            <div className="container1">
              <img src="/Imagenes/Logo 1.png" alt="Icono 1" />
              <h4>Transforma datos en decisiones.</h4>
              <p>
                Deja atrás el registro pasivo. Nuestra interfaz te permite visualizar flujos de dinero en tiempo real.
              </p>
            </div>
            <div className="container2">
              <img src="/Imagenes/Logo 2.png" alt="Icono 2" />
              <h4>Elimina la ceguera inflacionaria</h4>
              <p>
                Recupera la noción real de tu poder adquisitivo. Convierte tus activos a divisas estables automáticamente.
              </p>
            </div>
          </div>

          <div className="containerTarjetas2">
            <div className="container3">
              <img src="/Imagenes/Logo 3.png" alt="Icono 3" />
              <h4>Respaldo digital inmediato.</h4>
              <p>
                Vincula cada registro financiero con su comprobante digital. Centralizamos tu documentación.
              </p>
            </div>
            <div className="container4">
              <img src="/Imagenes/Logo 4.png" alt="Icono 4" />
              <h4>Frenando la inercia de gasto.</h4>
              <p>
                No solo registras, ahorras. Kaptura te brinda las herramientas para fomentar un ahorro estratégico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Espacios para futuras secciones */}
      <div className="containerSobreNosotros">
        
      </div>
      <div className="containerContactanos"></div>
    </div>
  );
};

export default Inicio;