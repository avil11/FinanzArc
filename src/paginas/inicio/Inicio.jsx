import React from "react";
import "./Inicio.css"; // Un solo punto significa "aquí mismo"

const Inicio = () => {
  return (
    <div>
      <div className="containerInicio">
        <div className="contenedorBackground">
          {" "}
          <img
            src="/public/Imagenes/Gemini_Generated_Image_ebcj9lebcj9lebcj.png"
            alt="Not Found"
          />
        </div>
        <div className="contenedorLogos">
          <h1>RAMI PUTO</h1>
          <div className="logos">
            <img src="/Imagenes/Logo 1.png" alt="Not Found" />
            <img src="/Imagenes/Logo 2.png" alt="Not Found" />
            <img src="/Imagenes/Logo 3.png" alt="Not Found" />
            <img src="/Imagenes/Logo 4.png" alt="Not Found" />
          </div>
        </div>
      </div>
      <div className="containerServicio">
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div>
          <div>
            <div></div>
            <div></div>
          </div>
          <div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div className="containerSobreNosotros"></div>
      <div className="ContainerTarjetas"></div>
      <div className="containerContactanos"></div>
    </div>
  );

  function Inicio() {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Puto el que leeee</h1>
        <p>Comiste Gordita</p>
      </div>
    );
  }
};
export default Inicio;
