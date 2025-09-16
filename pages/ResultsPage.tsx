import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Select from '../components/Select';
import StudentPerformanceChart from '../components/StudentPerformanceChart';
import { dbService } from '../services/dbService';
import { ChartData } from '../types';

const ResultsPage: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresData, schoolsData, gradesData] = await Promise.all([
          dbService.getScores(),
          dbService.getSchools(),
          dbService.getAllGrades(),
        ]);
        setScores(scoresData);
        setSchools([{ id: 'all', name: 'Todas as Escolas' }, ...schoolsData]);
        setGrades([{ id: 'all', name: 'Todas as Séries' }, ...gradesData]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch results data.');
      }
    };
    fetchData();
  }, []);

  const filteredScores = useMemo(() => {
    return scores.filter(score => 
      (selectedSchool === 'all' || score.school === selectedSchool) &&
      (selectedGrade === 'all' || score.grade === selectedGrade)
    );
  }, [scores, selectedSchool, selectedGrade]);

  const processDataForChart = (groupBy: string): ChartData[] => {
    if (filteredScores.length === 0) return [];
  
    const groupedData: { [key: string]: { totalScore: number; count: number } } = {};
  
    filteredScores.forEach(score => {
      const key = score[groupBy];
      if (!key) return;

      if (!groupedData[key]) {
        groupedData[key] = { totalScore: 0, count: 0 };
      }
      // Assuming score is a number between 0 and 1 (average)
      groupedData[key].totalScore += score.score;
      groupedData[key].count += 1;
    });
  
    return Object.entries(groupedData)
      .map(([name, data]) => ({
        name,
        averageScore: parseFloat(((data.totalScore / data.count) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  };

  const chartDataBySchool = processDataForChart('school');
  const chartDataByGrade = processDataForChart('grade');
  const chartDataByStudent = processDataForChart('student');

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
       <div className="text-left">
        <Link to="/" className="text-primary hover:underline">&larr; Voltar para a Home</Link>
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Filtros de Visualização</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Select id="school-filter" label="Filtrar por Escola" value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
            {schools.map(school => <option key={school.id} value={school.name}>{school.name}</option>)}
          </Select>
          <Select id="grade-filter" label="Filtrar por Série" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
            {grades.map(grade => <option key={grade.id} value={grade.name}>{grade.name}</option>)}
          </Select>
        </div>
      </Card>
      
      <Card>
        <StudentPerformanceChart
          data={chartDataBySchool}
          title={`Percentual de Acertos por Escola ${selectedGrade !== 'all' ? `(${selectedGrade})` : ''}`}
        />
      </Card>

      <Card>
        <StudentPerformanceChart
          data={chartDataByGrade}
          title={`Percentual de Acertos por Série ${selectedSchool !== 'all' ? `(${selectedSchool})` : ''}`}
        />
      </Card>

      <Card>
        <StudentPerformanceChart 
          data={chartDataByStudent} 
          title={`Percentual de Acertos por Aluno`}
        />
      </Card>
    </div>
  );
};

export default ResultsPage;
