import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { dbService } from '../services/dbService';
import { Prova } from '../types';

// --- COMPONENTES REUTILIZÁVEIS ---

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[] | string[];
  placeholder: string;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, placeholder, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full border rounded p-2 bg-white disabled:bg-gray-100 transition-colors"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        typeof opt === 'string' ?
        <option key={opt} value={opt}>{opt}</option> :
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);


const InsertDataPage: React.FC = () => {
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [student, setStudent] = useState('');
  const [teacher, setTeacher] = useState('');
  const [testId, setTestId] = useState('');

  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tests, setTests] = useState<Prova[]>([]);
  const [selectedTest, setSelectedTest] = useState<Prova | null>(null);

  useEffect(() => {
    setTests(dbService.getTests());
  }, []);

  const schools = dbService.getSchools();
  const grades = school ? dbService.getGradesBySchool(school) : [];
  const students = school && grade ? dbService.getStudentsByGradeAndSchool(school, grade) : [];
  const teachers = school && grade ? dbService.getTeachersByGradeAndSchool(school, grade) : [];

  const handleTestChange = (id: string) => {
    setTestId(id);
    const test = tests.find(t => t.id === id) || null;
    setSelectedTest(test);
    setRespostas({});
  };

  const handleRespostaChange = (questao: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [questao]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!school || !grade || !student || !teacher || !testId) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!selectedTest) {
        setError('Prova selecionada não encontrada.');
        return;
    }

    const respostasMarcadas = Object.keys(respostas);
    if (respostasMarcadas.length !== selectedTest.questions.length) {
      setError('Todas as questões devem ser respondidas.');
      return;
    }

    setIsLoading(true);
    try {
      const dadosParaSalvar = selectedTest.questions.map((q) => ({
        school,
        grade,
        student,
        teacher,
        testId,
        subject: selectedTest.discipline,
        questionCode: q.code,
        answer: respostas[q.code],
      }));

      await Promise.all(dadosParaSalvar.map(dado => dbService.addScore(dado)));
      
      setSuccess('Dados inseridos com sucesso!');
      
      // Reset form
      setSchool('');
      setGrade('');
      setStudent('');
      setTeacher('');
      setTestId('');
      setSelectedTest(null);
      setRespostas({});

    } catch (err) {
      setError('Ocorreu um erro ao salvar os dados.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-left mb-8">
        <Link to="/" className="text-blue-600 hover:underline">&larr; Voltar para a Home</Link>
      </div>
      <Card>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          Inserir Resultado das Provas
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Escola" value={school} onChange={setSchool} options={schools} placeholder="Selecione a Escola" />
            <SelectField label="Série/Ano" value={grade} onChange={setGrade} options={grades} placeholder="Selecione a Série" disabled={!school} />
            <SelectField label="Aluno(a)" value={student} onChange={setStudent} options={students} placeholder="Selecione o Aluno" disabled={!grade} />
            <SelectField label="Professor(a)" value={teacher} onChange={setTeacher} options={teachers} placeholder="Selecione o Professor" disabled={!grade} />
          </div>
          
          <SelectField
            label="Prova"
            value={testId}
            onChange={handleTestChange}
            options={tests.map(t => ({ value: t.id, label: `${t.name} - ${t.discipline}` }))}
            placeholder="Selecione a Prova"
            disabled={!grade}
          />

          {selectedTest && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2 border-t pt-4">Habilidades (Questões)</h3>
              <div className="space-y-3">
                {selectedTest.questions.map((q) => (
                  <div key={q.code} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                    <span className="font-mono text-sm">{q.code}</span>
                    <div className="flex items-center space-x-3">
                        {['A', 'B', 'C', 'D'].map(option => (
                            <label key={option} className="flex items-center space-x-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name={q.code}
                                    value={option}
                                    checked={respostas[q.code] === option}
                                    onChange={() => handleRespostaChange(q.code, option)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Dados'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InsertDataPage;