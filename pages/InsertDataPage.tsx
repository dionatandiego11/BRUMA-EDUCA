import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

// Mock de dados para simulação
const mockData = {
  escolas: {
    'Escola Modelo A': {
      series: {
        '5º Ano': {
          alunos: ['João da Silva', 'Maria Oliveira'],
          professores: ['Prof. Carlos', 'Prof. Ana'],
        },
        '6º Ano': {
          alunos: ['Pedro Souza', 'Fernanda Lima'],
          professores: ['Prof. João', 'Prof. Marta'],
        },
      },
    },
    'Escola Modelo B': {
      series: {
        '7º Ano': {
          alunos: ['Lucas Almeida', 'Juliana Costa'],
          professores: ['Prof. Roberto'],
        },
      },
    },
  },
  disciplinas: {
    Matemática: ['Q1', 'Q2', 'Q3'],
    Português: ['Q4', 'Q5'],
    Ciências: ['Q6', 'Q7'],
  },
};

const InsertDataPage: React.FC = () => {
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [student, setStudent] = useState('');
  const [teacher, setTeacher] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!school || !grade || !student || !teacher || !discipline || !question) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      dbService.addScore({
        school,
        grade,
        student,
        teacher,
        discipline,
        question,
        correct,
      });
      setSuccess('Dados inseridos com sucesso!');
      // Reset
      setSchool('');
      setGrade('');
      setStudent('');
      setTeacher('');
      setDiscipline('');
      setQuestion('');
      setCorrect(false);
    } catch (err) {
      setError('Ocorreu um erro ao salvar os dados.');
      console.error(err);
    }
  };

  // Helpers para popular os selects
  const series = school ? Object.keys(mockData.escolas[school]?.series || {}) : [];
  const alunos = grade ? mockData.escolas[school]?.series[grade]?.alunos || [] : [];
  const professores = grade ? mockData.escolas[school]?.series[grade]?.professores || [] : [];
  const questoes = discipline ? mockData.disciplinas[discipline] || [] : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-left mb-8">
        <Link to="/" className="text-primary hover:underline">&larr; Voltar para a Home</Link>
      </div>
      <Card>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          Inserir Resultado da Questão
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Escola */}
          <div>
            <label className="block text-sm font-medium mb-1">Escola</label>
            <select
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setGrade('');
                setStudent('');
                setTeacher('');
              }}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione a Escola</option>
              {Object.keys(mockData.escolas).map((esc) => (
                <option key={esc} value={esc}>{esc}</option>
              ))}
            </select>
          </div>

          {/* Série */}
          <div>
            <label className="block text-sm font-medium mb-1">Série/Ano</label>
            <select
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setStudent('');
                setTeacher('');
              }}
              disabled={!school}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione a Série</option>
              {series.map((serie) => (
                <option key={serie} value={serie}>{serie}</option>
              ))}
            </select>
          </div>

          {/* Aluno */}
          <div>
            <label className="block text-sm font-medium mb-1">Aluno(a)</label>
            <select
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              disabled={!grade}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione o Aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno} value={aluno}>{aluno}</option>
              ))}
            </select>
          </div>

          {/* Professor */}
          <div>
            <label className="block text-sm font-medium mb-1">Professor(a)</label>
            <select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              disabled={!grade}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione o Professor</option>
              {professores.map((prof) => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>

          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium mb-1">Disciplina</label>
            <select
              value={discipline}
              onChange={(e) => {
                setDiscipline(e.target.value);
                setQuestion('');
              }}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione a Disciplina</option>
              {Object.keys(mockData.disciplinas).map((disc) => (
                <option key={disc} value={disc}>{disc}</option>
              ))}
            </select>
          </div>

          {/* Questão */}
          <div>
            <label className="block text-sm font-medium mb-1">Código da Questão</label>
            <select
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!discipline}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione a Questão</option>
              {questoes.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Resposta correta */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={correct}
              onChange={(e) => setCorrect(e.target.checked)}
            />
            <label>Resposta Correta</label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}

          <div className="flex justify-end">
            <Button type="submit">Salvar Dados</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InsertDataPage;
