import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';

const Principal = () => {
    const navigate = useNavigate();
    const userName = "Pepe Ramirez";
    const saludar = "¡Bienvenido de nuevo, ";
    const sacarsaludo = saludar + userName + "!";
    
    const [showGreeting, setShowGreeting] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowGreeting(false);
        }, 3000); // El saludo desaparece después de 3 segundos
        return () => clearTimeout(timer);
    }, []);

    // Datos para el gráfico de torta
    const data = [
        { name: 'Categoría A', value: 400 },
        { name: 'Categoría B', value: 300 },
        { name: 'Categoría C', value: 200 },
        { name: 'Categoría D', value: 100 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
        <div >
            {showGreeting && <h2 style={{color: 'var(--accent-gold)'}}>{sacarsaludo}</h2>}


            
            <p style={{margin: '25px 0', lineHeight: '1.6'}}>Estamos encantados de tenerte con nosotros en FinanzARC. Explora nuestras herramientas y recursos para maximizar tu patrimonio.</p>
            
            <PieChart width={400} height={400}>
                <Pie
                    data={data}
                    cx={200}
                    cy={200}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </div>
    </div>


)

}

export default Principal;