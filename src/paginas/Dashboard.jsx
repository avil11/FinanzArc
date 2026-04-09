const Dashboard = () => {
  return (
    <div style={{ padding: '40px', backgroundColor: 'var(--light-gray)', minHeight: '90vh' }}>
      <h2 style={{ color: 'var(--primary-navy)', borderBottom: '2px solid var(--accent-gold)', display: 'inline-block', paddingBottom: '10px' }}>
        Panel de Control
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginTop: '30px' }}>
        {/* Card de Balance */}
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--secondary-blue)', fontSize: '14px', textTransform: 'uppercase' }}>Balance Total</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success-green)', margin: '10px 0' }}>$ 1,250,000.00</p>
          <span style={{ fontSize: '12px', color: '#666' }}>+ 12.5% este mes</span>
        </div>

        {/* Card de Gastos */}
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--secondary-blue)', fontSize: '14px', textTransform: 'uppercase' }}>Inversiones</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-navy)', margin: '10px 0' }}>$ 450,000.00</p>
          <button style={{ background: 'none', border: '1px solid var(--accent-gold)', color: 'var(--primary-navy)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  padding: '25px', 
  backgroundColor: 'var(--white)', 
  borderRadius: '12px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  borderLeft: '5px solid var(--accent-gold)'
};

export default Dashboard;