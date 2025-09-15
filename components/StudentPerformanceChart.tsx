
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';

interface StudentPerformanceChartProps {
  data: ChartData[];
  title: string;
}

const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        <p>Não há dados suficientes para exibir o gráfico.</p>
        <p>Por favor, selecione filtros diferentes ou adicione mais dados de avaliação.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
            formatter={(value) => [`${value}%`, 'Percentual de Acertos']}
          />
          <Legend />
          <Bar dataKey="averageScore" fill="#0284c7" name="Percentual de Acertos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentPerformanceChart;
