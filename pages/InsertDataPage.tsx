import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import { dbService } from '../services/dbService';

// This is still hardcoded for now, but could be moved to the database in the future.
const habilidades = {
    'Matemática': ['EF07MA01A', 'EF07MA03', 'EF07MA40MG', 'EF05MA14', 'EF05MA15'],
    'Português': ['EF69LP42', 'EF05LP07', 'EF35LP26', 'EF69LP54', 'EF08LP13'],
};

const InsertDataPage: React.FC = () => {
  // Data from API
  const [schools, setSchools] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Form state
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Question state
  const [respostas, setRespostas] = useState<{ [key: string]: boolean | null }>({});
  const questoes = selectedSubject ? habilidades[selectedSubject] || [] : [];

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    dbService.getSchools().then(setSchools);
    dbService.getTeachers().then(setTeachers);
    dbService.getSubjects().then(setSubjects);
  }, []);

  // Chain fetches based on selection
  useEffect(() => {
    if (selectedSchool) {
      dbService.getGradesBySchool(Number(selectedSchool)).then(setGrades);
    } else {
      setGrades([]);
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedGrade) {
      dbService.getClassesByGrade(Number(selectedGrade)).then(setClasses);
    } else {
      setClasses([]);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedClass) {
      dbService.getStudentsByClass(Number(selectedClass)).then(setStudents);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Form reset logic
  const handleSchoolChange = (id: string) => {
    setSelectedSchool(id);
    setSelectedGrade('');
    setSelectedClass('');
    setSelectedStudent('');
  };

  const handleGradeChange = (id: string) => {
    setSelectedGrade(id);
    setSelectedClass('');
    setSelectedStudent('');
  };

  const handleClassChange = (id: string) => {
    setSelectedClass(id);
    setSelectedStudent('');
  };

  const handleRespostaChange = useCallback((questao: string, valor: boolean) => {
    setRespostas((prev) => ({ ...prev, [questao]: valor }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSchool || !selectedGrade || !selectedClass || !selectedStudent || !selectedTeacher || !selectedSubject) {
      setError('Todos os campos de seleção são obrigatórios.');
      return;
    }
    
    if (questoes.length > 0 && Object.values(respostas).filter(r => r !== null).length !== questoes.length) {
      setError('Todas as questões devem ser marcadas como "Certo" ou "Errado".');
      return;
    }

    setIsLoading(true);
    try {
      const scoreData = {
        student_id: Number(selectedStudent),
        teacher_id: Number(selectedTeacher),
        subject_id: Number(selectedSubject),
        question_code: 'N/A', // Simplified for now, as questions are not in DB
        score: 0, // This logic needs to be adapted
      };

      // In a real scenario, we'd loop through `questoes` and save each one
      // For now, let's save a single score representing the whole evaluation
      const totalScore = questoes.reduce((acc, q) => acc + (respostas[q] ? 1 : 0), 0);
      scoreData.score = totalScore / (questoes.length || 1); // as an average
      scoreData.question_code = `${selectedSubject} Evaluation`;

      await dbService.addScore(scoreData);
      
      setSuccess('Dados inseridos com sucesso!');
      
      // Reset form
      setSelectedSchool('');
      setSelectedGrade('');
      setSelectedClass('');
      setSelectedStudent('');
      setSelectedTeacher('');
      setSelectedSubject('');
      setRespostas({});

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-left mb-8">
        <Link to="/" className="text-primary hover:underline">&larr; Voltar para a Home</Link>
      </div>
      <Card>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          Inserir Resultado das Avaliações
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select label="Escola" value={selectedSchool} onChange={e => handleSchoolChange(e.target.value)}>
              <option value="">Selecione a Escola</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Série/Ano" value={selectedGrade} onChange={e => handleGradeChange(e.target.value)} disabled={!selectedSchool}>
              <option value="">Selecione a Série</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
            <Select label="Turma" value={selectedClass} onChange={e => handleClassChange(e.target.value)} disabled={!selectedGrade}>
              <option value="">Selecione a Turma</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Aluno(a)" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} disabled={!selectedClass}>
              <option value="">Selecione o Aluno</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Professor(a)" value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}>
              <option value="">Selecione o Professor</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Select label="Disciplina" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="">Selecione a Disciplina</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          
          {selectedSubject && (
            <div className="border-t pt-4 mt-4">
              <h3 className="block text-lg font-medium text-gray-700 mb-2">Habilidades (Questões)</h3>
              {questoes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma habilidade encontrada para esta disciplina.</p>
              ) : (
                <div className="space-y-3">
                  {questoes.map((q) => (
                    <div key={q} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <span className="font-mono text-sm">{q}</span>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input type="radio" name={q} checked={respostas[q] === true} onChange={() => handleRespostaChange(q, true)} />
                          <span>Certo</span>
                        </label>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input type="radio" name={q} checked={respostas[q] === false} onChange={() => handleRespostaChange(q, false)} />
                          <span>Errado</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-center pt-4">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InsertDataPage;