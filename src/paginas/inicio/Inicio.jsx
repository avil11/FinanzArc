import React from "react";
import "./Inicio.css";
import CarrouselPropuesta from "../../componentes/Carrousel/carrouselPropuesta-";

const Inicio = () => {
  return (
    <div className="main-wrapper">
      {/* SECCIÓN HERO */}
      
      

      

      {/* SECCIÓN SOBRE EL PROYECTO / SERVICIOS */}
      <div className="containerServicio">
        <div className="containerProyecto">
          <h1>Sobre el Proyecto</h1>
          <p>
            En FinanzARC buscamos ofrecer soluciones para mejorar la gestión
            financiera para las empresas y personas que estén buscando optimizar
            su economía.
          </p>
          <img
            src="/Imagenes/ImagenSobreProyecto.png"
            alt="Sobre el Proyecto"
          />
        </div>

        <div className="containerTarjetas">
          <div className="containerTarjetas1">
            <div className="container1">
              <img src="/Imagenes/Logo 1.png" alt="Icono 1" />
              <h4>Transforma datos en decisiones.</h4>
              <p>
                Deja atrás el registro pasivo. Nuestra interfaz te permite
                visualizar flujos de dinero en tiempo real.
              </p>
            </div>
            <div className="container2">
              <img src="/Imagenes/Logo 2.png" alt="Icono 2" />
              <h4>Elimina la ceguera inflacionaria</h4>
              <p>
                Recupera la noción real de tu poder adquisitivo. Convierte tus
                activos a divisas estables automáticamente.
              </p>
            </div>
          </div>

          <div className="containerTarjetas2">
            <div className="container3">
              <img src="/Imagenes/Logo 3.png" alt="Icono 3" />
              <h4>Respaldo digital inmediato.</h4>
              <p>
                Vincula cada registro financiero con su comprobante digital.
                Centralizamos tu documentación.
              </p>
            </div>
            <div className="container4">
              <img src="/Imagenes/Logo 4.png" alt="Icono 4" />
              <h4>Frenando la inercia de gasto.</h4>
              <p>
                No solo registras, ahorras. Kaptura te brinda las herramientas
                para fomentar un ahorro estratégico.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="containerPropuesta">
        <div className="containerPropuestaIzquierda">
          <div className="introduccion">
            <h1>Toma el control absoluto de tu patrimonio</h1>
            <p>Nuestra plataforma te ofrece una vista panorámica inmediata y nítida de tu situación financiera, transformando datos complejos en perspectivas visuales inteligentes para una gestión patrimonial de precisión.</p>
          </div>
          <div className="items">
            <div className="item1">
              <h2>01</h2>
              <p>Di adiós al desorden administrativo. Vinculamos cada registro con su comprobante digital para una trazabilidad perfecta en gestiones legales e impositivas.</p>
            </div>
            <div className="item2">
              <h2>02</h2>
              <p>Recupera la noción real de tu poder adquisitivo. Nuestra conversión automática a divisas estables elimina la "ceguera inflacionaria".</p>
            </div>
            <div className="item3">
              <h2>03</h2>
              <p>Detecta fugas de dinero mediante comparativas históricas. Pasamos del registro pasivo al análisis activo para optimizar tu economía.</p>
            </div>
            <div className="item4">
              <h2>04</h2>
              <p>Obtén una visión rápida, clara y completa de tu situación y oportunidades financieras. Un control absoluto basado en evidencia.</p>
            </div>
          </div>
        </div>
        <div className="containerPropuestaDerecha">
          <img src="/Imagenes/ImagenSobrePatrimonio.png" alt="" />
        </div>
      </div>
      {/* BLOQUE 2: El nuevo componente de Carrusel */}
    <div className="propuesta-solo-movil">
        <CarrouselPropuesta />
    </div>

    </div>
  );
};

export default Inicio;
