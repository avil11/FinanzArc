import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './componentes/Navbar';
import Home from './paginas/Inicio';
import Registro from './paginas/Registro';
import Exito from './paginas/Exito';
import Principal from './paginas/Principal';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/exito" element={<Exito />} />
        <Route path="/dashboard" element={<div style={{padding: '50px'}}><h1>Bienvenido a tu Panel</h1></div>} />
        <Route path="/principal" element={<Principal />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;