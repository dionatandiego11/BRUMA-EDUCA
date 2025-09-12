
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { SchoolClass, Student, Subject, Grade } from '../types';
import { exportDataToCSV } from '../utils/csvExport';
import { DownloadIcon } from '../components/icons/DownloadIcon';

interface ReportsPageProps {
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ classes, students, subjects, grades }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  const dataForCharts = useMemo(() => {
    if (!selectedClassId) return { classAverageData: [], studentPerformanceData: [] };

    const studentsInClass = students.filter(s => s.classId === selectedClassId);
    const studentIdsInClass = studentsInClass.map(s => s.id);
    const gradesForClass = grades.filter(g => studentIdsInClass.includes(g.studentId));

    // 1. Data for Class Average Chart
    const classAverageData = subjects.map(subject => {
      const subjectGrades = gradesForClass.filter(g => g.subjectId === subject.id).map(g => g.grade);
      const average = subjectGrades.length > 0 ? subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length : 0;
      return {
        subject: subject.name,
        'Média da Turma': parseFloat(average.toFixed(2)),
      };
    });

    // 2. Data for Student Performance Radar Chart
    const studentPerformanceData = studentsInClass.map(student => {
      const studentData: { subject: string; [key: string]: string | number } = { subject: student.name };
      let totalGrade = 0;
      let gradedSubjects = 0;
      
      subjects.forEach(subject => {
        const grade = grades.find(g => g.studentId === student.id && g.subjectId === subject.id);
        if (grade) {
          studentData[subject.name] = grade.grade;
          totalGrade += grade.grade;
          gradedSubjects++;
        }
      });
      
      const average = gradedSubjects > 0 ? totalGrade / gradedSubjects : 0;
      studentData.average = parseFloat(average.toFixed(2));
      
      return studentData;
    });

    return { classAverageData, studentPerformanceData };
  }, [selectedClassId, students, subjects, grades]);
  
  const handleExport = () => {
    const dataToExport = grades.map(grade => {
        const student = students.find(s => s.id === grade.studentId);
        const subject = subjects.find(s => s.id === grade.subjectId);
        const s_class = classes.find(c => c.id === student?.classId);
        return {
            Turma: s_class?.name || 'N/A',
            Aluno: student?.name || 'N/A',
            Disciplina: subject?.name || 'N/A',
            Nota: grade.grade,
        };
    });
    exportDataToCSV(dataToExport, 'relatorio_notas');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="flex-1">
            <label htmlFor="class-filter" className="text-sm font-medium text-gray-700">Filtrar por Turma:</label>
            <select
                id="class-filter"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="mt-1 block w-full sm:w-64 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <button 
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition"
        >
            <DownloadIcon className="h-5 w-5" />
            Exportar para CSV
        </button>
      </div>

      {!selectedClassId ? (
         <div className="text-center p-8 bg-white rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl text-gray-600">Por favor, selecione uma turma para visualizar os relatórios.</h3>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Average Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Média de Desempenho da Turma por Disciplina</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataForCharts.classAverageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip wrapperClassName="!bg-white !border-gray-200 !rounded-md !shadow-lg" />
                <Legend />
                <Bar dataKey="Média da Turma" fill="#3b82f6" barSize={30}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Student Performance Comparison Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparativo de Alunos por Disciplina</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={120} data={dataForCharts.studentPerformanceData.flatMap(s => subjects.map(sub => ({
                    subject: sub.name,
                    student: s.subject,
                    grade: s[sub.name] as number || 0,
                })))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]}/>
                    <Tooltip />
                    <Legend />
                    {dataForCharts.studentPerformanceData.map((student, index) => (
                        <Radar key={student.subject} name={student.subject as string} dataKey="grade" stroke={`hsl(${index * 60}, 70%, 50%)`} fill={`hsl(${index * 60}, 70%, 50%)`} fillOpacity={0.1} data={subjects.map(sub => ({ subject: sub.name, student: student.subject, grade: student[sub.name] as number || 0}))} />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
