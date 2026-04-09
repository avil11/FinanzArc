import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../estilos/Navbar.css";

const Navbar = () => { // aca lo que hice fue crear un estado para saber si el usuario esta registrado o no, y dependiendo de eso mostrar 
// una barra de navegacion u otra, ademas de usar useEffect para actualizar el estado cada vez que se renderiza el componente
  const navigate = useNavigate();
  const [Registrado, setRegistrado] = useState(false);

  useEffect(() => {
  setRegistrado(!!localStorage.getItem("Token"));
}, [setRegistrado]); // Dependency array vacío - se ejecuta solo al montar

  function logear() {
    localStorage.setItem("Token", "123456789");
    setRegistrado(true);
    navigate("/Principal");
  }

  return (
    <>
    <nav>
      <div className='ContenedorNavbar' style={{ display: Registrado ? 'flex' : 'none' }}> 
        <div className='Titulo'>FinanzARC</div>
        <div className='Links'>
          <Link to="/Principal" className='Boton'>General</Link>
          <Link to="/Ingreso" className='Boton'>Ingreso</Link>
          <Link to="/Gasto" className='Boton'>Gasto</Link>
          <Link to="/Ahorro" className='Boton'>Ahorro</Link>
          <Link to="/Perfil" className='Boton'>Perfil</Link>
        </div>
      </div>
    </nav>
    <nav className='ContenedorNavbar' style={{ display: Registrado ? 'none' : 'flex' }}> 
      <div className='Titulo'>FinanzARC</div>
      <div className='Links'>
        <Link to="/" className='Boton'>Inicio</Link>
        <Link to="/servicios" className='Boton'>Servicios</Link>
        <Link to="/sobre-nosotros" className='Boton'>Sobre Nosotros</Link>
        <Link to="/contacto" className='Boton'>Contactanos</Link>
        <button onClick={() => logear()} className='BotonLogin'>Iniciar Sesion</button>
      </div>
    </nav>
</>
  );
};

export default Navbar;