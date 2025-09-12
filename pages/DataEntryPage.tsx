
import React, { useState, useMemo, useEffect } from 'react';
import type { SchoolClass, Student, Subject, Grade } from '../types';

interface DataEntryPageProps {
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  addGrade: (newGrade: Omit<Grade, 'id'>) => Promise<void>;
}

const DataEntryPage: React.FC<DataEntryPageProps> = ({ classes, students, subjects, grades, addGrade }) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const studentsInClass = useMemo(() => {
    return students.filter(s => s.classId === selectedClass);
  }, [selectedClass, students]);
  
  useEffect(() => {
    setSelectedStudent('');
  }, [selectedClass]);
  
  useEffect(() => {
    if (selectedStudent && selectedSubject) {
        const existingGrade = grades.find(g => g.studentId === selectedStudent && g.subjectId === selectedSubject);
        if (existingGrade) {
            setGrade(String(existingGrade.grade));
        } else {
            setGrade('');
        }
    } else {
        setGrade('');
    }
  }, [selectedStudent, selectedSubject, grades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudent || !selectedSubject || grade === '') {
      setFeedback({ type: 'error', message: 'Por favor, preencha todos os campos.' });
      return;
    }
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
      setFeedback({ type: 'error', message: 'A nota deve ser um número entre 0 e 10.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await addGrade({
        studentId: selectedStudent,
        subjectId: selectedSubject,
        grade: numericGrade,
      });
      setFeedback({ type: 'success', message: 'Nota salva com sucesso!' });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Ocorreu um erro ao salvar a nota.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
       <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Lançamento de Notas</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selection */}
          <div>
            <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
            <select id="class-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition">
              <option value="">Selecione uma turma</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Student Selection */}
          {selectedClass && (
            <div>
              <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
              <select id="student-select" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" disabled={!selectedClass}>
                <option value="">Selecione um aluno</option>
                {studentsInClass.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Subject and Grade */}
          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                <select id="subject-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" disabled={!selectedStudent}>
                  <option value="">Selecione uma disciplina</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="grade-input" className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <input id="grade-input" type="number" step="0.1" min="0" max="10" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Ex: 8.5" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" disabled={!selectedSubject} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-gray-400" disabled={isSubmitting || !selectedStudent || !selectedSubject}>
              {isSubmitting ? 'Salvando...' : 'Salvar Nota'}
            </button>
          </div>
          
          {feedback && (
            <div className={`mt-4 p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DataEntryPage;
