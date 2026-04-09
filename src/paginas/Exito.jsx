import { useNavigate } from 'react-router-dom';

const Exito = () => {
  const navigate = useNavigate();
  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
      <div style={{backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '20px', textAlign: 'center', maxWidth: '500px', border: '1px solid var(--accent-gold)'}}>
        <h2 style={{color: 'var(--accent-gold)'}}>¡Cuenta Creada Correctamente!</h2>
        <p style={{margin: '25px 0', lineHeight: '1.6'}}>Felicidades, tu cuenta de FinanzARC ha sido registrada exitosamente. Ahora puedes acceder a todas nuestras herramientas premium.</p>
        <button onClick={() => navigate('/dashboard')} style={{backgroundColor: 'var(--accent-gold)', padding: '12px 30px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer'}}>
          Ir a Panel
        </button>
      </div>
    </div>
  );
};

export default Exito;