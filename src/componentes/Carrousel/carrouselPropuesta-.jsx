import React from "react";
// Importamos Swiper y sus módulos
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Estilos obligatorios de Swiper
import "swiper/css";
import "swiper/css/pagination";

// Tu hoja de estilos
import "./CarrouselPropuesta.css";

const CarrouselPropuesta = () => {
  const itemsPropuesta = [
    {
      logo: "/Imagenes/LogoDesordenAdmin.webp", 
      title: "Desorden administrativo",
      texto: "Centralizá todos tus registros financieros vinculándolos a sus comprobantes digitales.",
      tilde: "✓ Trazabilidad completa y orden automático",
    },
    {
      logo: "/Imagenes/LogoIncertidumbreValor.webp",
      title: "Incertidumbre de valor",
      texto: "Convertí tus movimientos a divisas estables y entendé tu poder adquisitivo real.",
      tilde: "✓ Elimina el impacto de la inflacion",
    },
    {
      logo: "/Imagenes/LogoInerciaGasto.webp",
      title: "Inercia de gasto",
      texto: "Detectá fugas de dinero con comparativas históricas y análisis inteligente.",
      tilde: "✓ Pasa del registro al control activo",
    },
    {
      logo: "/Imagenes/LogoAnalisisInteligente.webp",
      title: "Análisis Inteligente",
      texto: "Transformá tus registros en información accionable mediantecomparativas históricas y detección de patrones.",
      tilde: "✓ Toma decisiones basadas en datos",
    },
  ];

  return (
    <section className="contenedor-carrusel-movil">
      <div className="introduccion-carrusel">
        <h1>Toma el control absoluto de tu patrimonio</h1>
        <p>
          Nuestra plataforma te ofrece una vista panorámica inmediata y nítida
          de tu situación financiera, transformando datos complejos en
          perspectivas visuales inteligentes para una gestión patrimonial de
          precisión.
        </p>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        breakpoints={{
          // CELULAR
          0: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          // TABLET
          720: {
            slidesPerView: 2.3,
            spaceBetween: 30,
          },
        }}
        className="swiper-propuesta"
      >
        {itemsPropuesta.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="tarjeta-propuesta">
              
              {/* Contenedor del Logo */}
              <div className="logo-container">
                <img 
                  src={item.logo} 
                  alt={item.title} 
                  className="logo-img" 
                  style={{ 
                    width: '110px', 
                    height: '110px', 
                    maxWidth: '150px', 
                    objectFit: 'contain' 
                  }}
                />
              </div>
              
              <h2>{item.title}</h2>
              <p>{item.texto}</p>
              
              {/* Texto de beneficio (tilde) */}
              <span className="tilde-texto">{item.tilde}</span>
              
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CarrouselPropuesta;