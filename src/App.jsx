import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './componentes/Navbar';
import Home from './paginas/inicio/Inicio';
import Registro from './paginas/inicio/InicioSesion/InicioSesion';
import Principal from './paginas/Principal/General/General';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<div style={{padding: '50px'}}><h1>Bienvenido a tu Panel</h1></div>} />
        <Route path="/principal" element={<Principal />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;