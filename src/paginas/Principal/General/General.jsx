import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';
import './General.css';

const GastoIngreso = () => {
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

    // Datos para gastos
    const expensesData = [
        { name: 'Alimentación', value: 450 },
        { name: 'Transporte', value: 280 },
        { name: 'Entretenimiento', value: 150 },
        { name: 'Otros', value: 120 },
    ];

    // Datos para ingresos
    const incomeData = [
        { name: 'Salario', value: 2000 },
        { name: 'Freelance', value: 600 },
        { name: 'Inversiones', value: 400 },
    ];

    // Datos para ahorros
    const savingsGoals = [
        { label: 'Fondo de Emergencia', current: 3500, target: 5000 },
        { label: 'Vacaciones', current: 1200, target: 2000 },
        { label: 'Educación', current: 2800, target: 4000 },
    ];

    const totalCurrent = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
    const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const ProgressBar = ({ current, target, label }) => {
        const percentage = Math.min(100, (current / target) * 100);

        return (
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                    <span style={{ fontSize: '12px', color: '#666' }}>{percentage.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#2a2a2a', borderRadius: '999px', overflow: 'hidden', height: '18px' }}>
                    <div
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: 'var(--accent-gold)',
                            height: '100%',
                            transition: 'width 0.5s ease',
                        }}
                    />
                </div>
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>${current} / ${target}</p>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            {showGreeting && <h2 style={{ color: 'var(--accent-gold)' }}>{sacarsaludo}</h2>}
            <p style={{ margin: '25px 0', lineHeight: '1.6', textAlign: 'center' }}>Estamos encantados de tenerte con nosotros en FinanzARC. Explora nuestras herramientas y recursos para maximizar tu patrimonio.</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '800px', marginBottom: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>Gastos</h3>
                    <PieChart width={300} height={300}>
                        <Pie
                            data={expensesData}
                            cx={150}
                            cy={150}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {expensesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3>Ingresos</h3>
                    <PieChart width={300} height={300}>
                        <Pie
                            data={incomeData}
                            cx={150}
                            cy={150}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {incomeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </div>
            </div>
            
            <div style={{ width: '100%', maxWidth: '640px', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Ahorros</h3>
                <ProgressBar current={totalCurrent} target={totalTarget} label="Progreso Total de Ahorros" />
                {savingsGoals.map((goal, index) => (
                    <ProgressBar key={index} current={goal.current} target={goal.target} label={goal.label} />
                ))}
            </div>
        </div>
    );
};

export default GastoIngreso;

