
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Select from '../components/Select';
import StudentPerformanceChart from '../components/StudentPerformanceChart';
import { dbService } from '../services/dbService';
import { Score, ChartData } from '../types';
import { Link } from 'react-router-dom';

const ResultsPage: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  
  useEffect(() => {
    const allScores = dbService.getScores();
    setScores(allScores);
    setSchools(['all', ...dbService.getUniqueValues('school')]);
    setGrades(['all', ...dbService.getUniqueValues('grade')]);
  }, []);

  const filteredScores = useMemo(() => {
    return scores.filter(score => 
      (selectedSchool === 'all' || score.school === selectedSchool) &&
      (selectedGrade === 'all' || score.grade === selectedGrade)
    );
  }, [scores, selectedSchool, selectedGrade]);

  const processDataForChart = <T extends keyof Score,>(groupBy: T): ChartData[] => {
    if (filteredScores.length === 0) return [];
  
    const groupedData: { [key: string]: { totalScore: number; count: number } } = {};
  
    filteredScores.forEach(score => {
      const key = String(score[groupBy]);
      if (!groupedData[key]) {
        groupedData[key] = { totalScore: 0, count: 0 };
      }
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

  return (
    <div className="space-y-8">
       <div className="text-left">
        <Link to="/" className="text-primary hover:underline">&larr; Voltar para a Home</Link>
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Filtros de Visualização</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Select id="school-filter" label="Filtrar por Escola" value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
            {schools.map(school => <option key={school} value={school}>{school === 'all' ? 'Todas as Escolas' : school}</option>)}
          </Select>
          <Select id="grade-filter" label="Filtrar por Série" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
            {grades.map(grade => <option key={grade} value={grade}>{grade === 'all' ? 'Todas as Séries' : grade}</option>)}
          </Select>
        </div>
      </Card>
      
      {selectedSchool === 'all' && (
        <Card>
          <StudentPerformanceChart 
            data={chartDataBySchool} 
            title={`Percentual de Acertos por Escola ${selectedGrade !== 'all' ? `(${selectedGrade})` : ''}`} 
          />
        </Card>
      )}

      {selectedGrade === 'all' && (
         <Card>
         <StudentPerformanceChart 
           data={chartDataByGrade} 
           title={`Percentual de Acertos por Série ${selectedSchool !== 'all' ? `(${selectedSchool})` : ''}`}
         />
       </Card>
      )}

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
