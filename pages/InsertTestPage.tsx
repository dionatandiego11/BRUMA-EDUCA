import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { dbService } from '../services/dbService';
import { Prova } from '../types';

type Question = {
  code: string;
  answer: 'A' | 'B' | 'C' | 'D';
};

const InsertTestPage: React.FC = () => {
  const [testName, setTestName] = useState('');
  const [discipline, setDiscipline] = useState<'Matemática' | 'Português' | ''>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const disciplines = dbService.getSubjects();

  useEffect(() => {
    if (discipline) {
      setAllSkills(dbService.getQuestionsBySubject(discipline));
      setQuestions([]); // Reset questions when discipline changes
    } else {
      setAllSkills([]);
    }
  }, [discipline]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { code: '', answer: 'A' }]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!testName || !discipline || questions.length === 0) {
      setError('Todos os campos são obrigatórios e a prova deve ter ao menos uma questão.');
      return;
    }

    const hasEmptyFields = questions.some(q => !q.code || !q.answer);
    if (hasEmptyFields) {
      setError('Todas as questões devem ter um código de habilidade e um gabarito.');
      return;
    }

    setIsLoading(true);
    try {
      const newTest: Omit<Prova, 'id'> = {
        name: testName,
        discipline,
        questions,
      };
      await dbService.addTest(newTest);
      setSuccess('Prova inserida com sucesso!');
      // Reset form
      setTestName('');
      setDiscipline('');
      setQuestions([]);
    } catch (err) {
      setError('Ocorreu um erro ao salvar a prova.');
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
          Inserir Nova Prova
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Prova</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Ex: 1a.2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value as 'Matemática' | 'Português')}
              className="w-full border rounded p-2 bg-white"
            >
              <option value="">Selecione a Disciplina</option>
              {disciplines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {discipline && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2 border-t pt-4">Questões</h3>
              {questions.map((q, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 mb-2">
                  <select
                    value={q.code}
                    onChange={(e) => handleQuestionChange(index, 'code', e.target.value)}
                    className="w-full border rounded p-2 bg-white"
                  >
                    <option value="">Selecione a Habilidade</option>
                    {allSkills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <select
                    value={q.answer}
                    onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                    className="border rounded p-2 bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                  <Button type="button" onClick={() => handleRemoveQuestion(index)}>Remover</Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddQuestion}>Adicionar Questão</Button>
            </div>
          )}

          <div className="text-center pt-4">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Prova'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InsertTestPage;
