import React from 'react';
import "./Inicio.css"; // Un solo punto significa "aquí mismo"

const Home = () => {
    return (
        <div>
            <div className='containerInicio'>
                <div className='contenedorBackground'> <img src="/public/Imagenes/Gemini_Generated_Image_ebcj9lebcj9lebcj.png" alt="Not Found" /></div>
                <div className='contenedorLogos'>
                    <div className='logos'>
                        <img src="/public/Imagenes/Logo 1.png" alt="Not Found" />
                        <img src="/public/Imagenes/Logo 2.png" alt="Not Found" />
                        <img src="/public/Imagenes/Logo 3.png" alt="Not Found" />
                        <img src="/public/Imagenes/Logo 4.png" alt="Not Found" />
                    </div>
                </div>
            </div>
            <div className='containerServicio'>
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
            <div className='containerSobreNosotros'>

            </div>
            <div className="ContainerTarjetas">

            </div>
            <div className='containerContactanos'>

            </div>
        </div>
    );
}

export default Home;