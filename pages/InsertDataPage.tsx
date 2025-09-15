import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card'; // Supondo que você tenha estes componentes
import Button from '../components/Button'; // Supondo que você tenha estes componentes
import { dbService } from '../services/dbService'; // Supondo que o serviço exista

// --- ESTRUTURA DE DADOS MELHORADA ---
// Em um app real, estes dados viriam de uma API (ex: fetch('/api/data'))
// Esta estrutura é baseada nos arquivos CSV que você forneceu.
const schoolData = {
  escolas: {
    'E.M. Lucas Marciano Da Silva': {
      series: {
        '8º Ano': {
          turmas: {
            'Turma 1': {
              alunos: ['Aleph Zapata Pereira Alvarenga', 'Beatriz Martins', 'Carlos Eduardo'],
              professores: { 'Doriedson': 'Matemática', 'Victor': 'Português' },
            },
            'Turma 2': {
              alunos: ['Ana Beatriz Damasceno De Jesus', 'Daniela Faria', 'Eduardo Costa'],
              professores: { 'Taynara': 'Matemática', 'Victor': 'Português' },
            },
          },
        },
        '6º Ano': {
            turmas: {
              'Turma 1': {
                alunos: ['Gabriel Pereira', 'Helena Souza', 'Igor Andrade'],
                professores: { 'Doriedson': 'Matemática', 'Alessandra': 'Português' },
              },
            },
        }
      },
    },
  },
  habilidades: {
    'Matemática': ['EF07MA01A', 'EF07MA03', 'EF07MA40MG', 'EF05MA14', 'EF05MA15'],
    'Português': ['EF69LP42', 'EF05LP07', 'EF35LP26', 'EF69LP54', 'EF08LP13'],
  },
};

// --- COMPONENTES REUTILIZÁVEIS ---

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
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
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

// --- PÁGINA PRINCIPAL ---

const InsertDataPage: React.FC = () => {
  // Estados para os seletores do formulário
  const [escola, setEscola] = useState('');
  const [serie, setSerie] = useState('');
  const [turma, setTurma] = useState('');
  const [aluno, setAluno] = useState('');
  const [professor, setProfessor] = useState('');
  const [disciplina, setDisciplina] = useState('');

  // Estado para as respostas das questões
  const [respostas, setRespostas] = useState<{ [key: string]: boolean | null }>({});

  // Estados para feedback ao usuário
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Limpa as mensagens de feedback após 3 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // --- LÓGICA PARA POPULAR OS SELECTS DINAMICAMENTE ---
  const escolas = Object.keys(schoolData.escolas);
  const series = escola ? Object.keys(schoolData.escolas[escola]?.series || {}) : [];
  const turmas = serie ? Object.keys(schoolData.escolas[escola]?.series[serie]?.turmas || {}) : [];
  const alunos = turma ? schoolData.escolas[escola]?.series[serie]?.turmas[turma]?.alunos || [] : [];
  const professores = turma ? Object.keys(schoolData.escolas[escola]?.series[serie]?.turmas[turma]?.professores || {}) : [];
  const questoes = disciplina ? schoolData.habilidades[disciplina] || [] : [];

  // --- FUNÇÕES DE CALLBACK OTIMIZADAS ---
  const resetFields = useCallback((level: 'escola' | 'serie' | 'turma') => {
    if (level === 'escola') setSerie('');
    if (level === 'escola' || level === 'serie') setTurma('');
    if (level === 'escola' || level === 'serie' || level === 'turma') {
      setAluno('');
      setProfessor('');
      setDisciplina('');
      setRespostas({});
    }
  }, []);

  const handleProfessorChange = (prof: string) => {
    setProfessor(prof);
    if (prof && turma && serie && escola) {
      const disc = schoolData.escolas[escola].series[serie].turmas[turma].professores[prof];
      setDisciplina(disc);
    } else {
      setDisciplina('');
    }
    setRespostas({});
  };

  const handleRespostaChange = useCallback((questao: string, valor: boolean) => {
    setRespostas((prev) => ({ ...prev, [questao]: valor }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!escola || !serie || !turma || !aluno || !professor || !disciplina) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    
    const respostasMarcadas = Object.values(respostas).filter(r => r !== null);
    if (respostasMarcadas.length !== questoes.length) {
      setError('Todas as questões devem ser marcadas como "Certo" ou "Errado".');
      return;
    }

    setIsLoading(true);
    try {
      const dadosParaSalvar = questoes.map((questao) => ({
        escola,
        serie,
        turma,
        aluno,
        professor,
        disciplina,
        questao,
        acertou: respostas[questao] ?? false,
      }));

      // Simula uma chamada de API e salva cada registro
      await Promise.all(dadosParaSalvar.map(dado => dbService.addScore(dado)));
      
      setSuccess('Dados inseridos com sucesso!');
      
      // Resetar o formulário
      setEscola('');
      resetFields('escola');

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
          Inserir Resultado das Questões
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Escola" value={escola} onChange={(v) => { setEscola(v); resetFields('escola'); }} options={escolas} placeholder="Selecione a Escola" />
            <SelectField label="Série/Ano" value={serie} onChange={(v) => { setSerie(v); resetFields('serie'); }} options={series} placeholder="Selecione a Série" disabled={!escola} />
            <SelectField label="Turma" value={turma} onChange={(v) => { setTurma(v); resetFields('turma'); }} options={turmas} placeholder="Selecione a Turma" disabled={!serie} />
            <SelectField label="Professor(a)" value={professor} onChange={handleProfessorChange} options={professores} placeholder="Selecione o Professor" disabled={!turma} />
            <SelectField label="Aluno(a)" value={aluno} onChange={setAluno} options={alunos} placeholder="Selecione o Aluno" disabled={!turma} />
            
            {/* Campo de disciplina é preenchido automaticamente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
              <input type="text" value={disciplina} readOnly disabled className="w-full border rounded p-2 bg-gray-100" />
            </div>
          </div>
          
          {/* Seção de Questões */}
          {disciplina && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 border-t pt-4 mt-4">Habilidades (Questões)</label>
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

          {/* Mensagens de Feedback e Botão de Envio */}
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