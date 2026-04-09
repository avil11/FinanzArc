import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{color: 'var(--accent-gold)', marginBottom: '30px', textAlign: 'center'}}>Crear Cuenta</h2>
        <div style={styles.grid}>
          {[
            {label: 'Nombre', placeholder: 'Pepe'},
            {label: 'Apellido', placeholder: 'Ramirez'},
            {label: 'Gmail', placeholder: 'prueba123@gmail.com'},
            {label: 'Telefono', placeholder: '3516 231 123'},
            {label: 'Nombre de Usuario', placeholder: 'ArcPatrimonio'},
            {label: 'Contraseña', placeholder: '••••••••', type: 'password'}
          ].map((field, idx) => (
            <div key={idx} style={styles.inputGroup}>
              <label style={styles.label}>{field.label}:</label>
              <input type={field.type || 'text'} style={styles.input} placeholder={field.placeholder} />
            </div>
          ))}
        </div>
        <div style={styles.actions}>
          <button onClick={() => navigate('/')} style={styles.cancelBtn}>Cancelar</button>
          <button onClick={() => navigate('/exito')} style={styles.goldBtn}>Crear Cuenta</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '15px', border: '1px solid var(--steel-gray)', width: '100%', maxWidth: '700px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: 'var(--accent-gold)', fontSize: '13px' },
  input: { padding: '12px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--steel-gray)', color: 'white', borderRadius: '5px' },
  actions: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '20px' },
  cancelBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer' },
  goldBtn: { backgroundColor: 'var(--accent-gold)', color: 'var(--bg-dark)', padding: '12px 30px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Registro;