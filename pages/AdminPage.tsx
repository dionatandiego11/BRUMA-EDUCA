import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, School, Users, BookOpen, UserCheck, GraduationCap, FileText, Save, Plus, X } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Escola, Serie, Turma, Professor, Aluno, Provao, Questao, Gabarito, Disciplina, Alternativa } from '../types';

// Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ''
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
  />
);

const Select = ({
  value,
  onChange,
  children,
  disabled = false,
  className = ''
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </select>
);

// Main component
const AdminPage: React.FC = () => {
  // --- Estados para os dados do DB ---
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  // --- Estados para os formulários de cadastro ---
  const [newEscola, setNewEscola] = useState('');
  const [newSerie, setNewSerie] = useState('');
  const [newTurma, setNewTurma] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newAluno, setNewAluno] = useState('');

  // --- Estados para a seleção em cascata ---
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');

  // --- Estados para os dados derivados da seleção ---
  const [seriesOfSelectedEscola, setSeriesOfSelectedEscola] = useState<Serie[]>([]);
  const [turmasOfSelectedSerie, setTurmasOfSelectedSerie] = useState<Turma[]>([]);
  const [alunosNaTurma, setAlunosNaTurma] = useState<Aluno[]>([]);
  const [professoresNaTurma, setProfessoresNaTurma] = useState<Professor[]>([]);

  // --- Estados para os formulários de associação ---
  const [alunoParaMatricular, setAlunoParaMatricular] = useState('');
  const [professorParaAssociar, setProfessorParaAssociar] = useState('');

  // --- Estados para o Provão ---
  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [selectedProvao, setSelectedProvao] = useState('');
  const [newProvaoName, setNewProvaoName] = useState('');
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [newQuestaoDesc, setNewQuestaoDesc] = useState('');
  const [newQuestaoHab, setNewQuestaoHab] = useState('');
  const [newQuestaoDisciplina, setNewQuestaoDisciplina] = useState<Disciplina>('Português');
  const [gabaritos, setGabaritos] = useState<Map<string, Alternativa>>(new Map());

  // --- Estados para feedback ---
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // --- Carregar dados iniciais e reativos ---
  useEffect(() => {
    setEscolas(dbService.getEscolas());
    setProfessores(dbService.getProfessores());
    setAlunos(dbService.getAlunos());
  }, []);

  useEffect(() => {
    if (selectedEscola) {
      setSeriesOfSelectedEscola(dbService.getSeriesByEscola(selectedEscola));
    } else {
      setSeriesOfSelectedEscola([]);
    }
    setSelectedSerie('');
    setSelectedTurma('');
  }, [selectedEscola]);

  useEffect(() => {
    if (selectedSerie) {
      setTurmasOfSelectedSerie(dbService.getTurmasBySerie(selectedSerie));
    } else {
      setTurmasOfSelectedSerie([]);
    }
    setSelectedTurma('');
  }, [selectedSerie]);

  useEffect(() => {
    if (selectedTurma) {
      setAlunosNaTurma(dbService.getAlunosByTurma(selectedTurma));
      setProfessoresNaTurma(dbService.getProfessoresByTurma(selectedTurma));
      setProvoes(dbService.getProvoesByTurma(selectedTurma));
    } else {
      setAlunosNaTurma([]);
      setProfessoresNaTurma([]);
      setProvoes([]);
    }
    setSelectedProvao('');
  }, [selectedTurma]);
  
  useEffect(() => {
    if (selectedProvao) {
      const questoesDoProvao = dbService.getQuestoesByProvao(selectedProvao);
      setQuestoes(questoesDoProvao);
      const loadedGabaritos = new Map<string, Alternativa>();
      questoesDoProvao.forEach(q => {
        const gabarito = dbService.getGabaritoByQuestao(q.id);
        if (gabarito) {
          loadedGabaritos.set(q.id, gabarito.respostaCorreta);
        }
      });
      setGabaritos(loadedGabaritos);
    } else {
      setQuestoes([]);
      setGabaritos(new Map());
    }
  }, [selectedProvao]);

  // --- Listas de disponíveis (memoizadas para performance) ---
  const alunosDisponiveis = useMemo(() => {
    const idsAlunosNaTurma = new Set(alunosNaTurma.map(a => a.id));
    return alunos.filter(a => !idsAlunosNaTurma.has(a.id));
  }, [alunos, alunosNaTurma]);

  const professoresDisponiveis = useMemo(() => {
    const idsProfessoresNaTurma = new Set(professoresNaTurma.map(p => p.id));
    return professores.filter(p => !idsProfessoresNaTurma.has(p.id));
  }, [professores, professoresNaTurma]);

  // --- Handlers para adição ---
  const handleAddEscola = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEscola.trim()) {
      dbService.addEscola({ nome: newEscola.trim() });
      setNewEscola('');
      setEscolas(dbService.getEscolas());
      showNotification('Escola adicionada com sucesso!');
    }
  };

  const handleAddSerie = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSerie.trim() && selectedEscola) {
      dbService.addSerie({ nome: newSerie.trim(), escolaId: selectedEscola });
      setNewSerie('');
      setSeriesOfSelectedEscola(dbService.getSeriesByEscola(selectedEscola));
      showNotification('Série adicionada com sucesso!');
    }
  };

  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTurma.trim() && selectedSerie) {
      dbService.addTurma({ nome: newTurma.trim(), serieId: selectedSerie, professorIds: [] });
      setNewTurma('');
      setTurmasOfSelectedSerie(dbService.getTurmasBySerie(selectedSerie));
      showNotification('Turma adicionada com sucesso!');
    }
  };

  const handleAddProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessor.trim()) {
      dbService.addProfessor({ nome: newProfessor.trim() });
      setNewProfessor('');
      setProfessores(dbService.getProfessores());
      showNotification('Professor adicionado com sucesso!');
    }
  };

  const handleAddAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAluno.trim()) {
      dbService.addAluno({ nome: newAluno.trim() });
      setNewAluno('');
      setAlunos(dbService.getAlunos());
      showNotification('Aluno adicionado com sucesso!');
    }
  };

  const handleMatricularAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (alunoParaMatricular && selectedTurma) {
      dbService.addMatricula({ alunoId: alunoParaMatricular, turmaId: selectedTurma });
      setAlunosNaTurma(dbService.getAlunosByTurma(selectedTurma));
      setAlunoParaMatricular('');
      showNotification('Aluno matriculado com sucesso!');
    }
  };

  const handleAssociarProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (professorParaAssociar && selectedTurma) {
      const turma = turmasOfSelectedSerie.find(t => t.id === selectedTurma);
      if (turma) {
        const updatedProfessorIds = [...turma.professorIds, professorParaAssociar];
        dbService.updateTurma(selectedTurma, { professorIds: updatedProfessorIds });
        setProfessoresNaTurma(dbService.getProfessoresByTurma(selectedTurma));
        setProfessorParaAssociar('');
        showNotification('Professor associado com sucesso!');
      }
    }
  };

  // --- Handlers do Provão ---
  const handleAddProvao = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProvaoName.trim() && selectedTurma) {
      dbService.addProvao({ nome: newProvaoName.trim(), turmaId: selectedTurma, data: new Date().toISOString() });
      setNewProvaoName('');
      setProvoes(dbService.getProvoesByTurma(selectedTurma));
      showNotification('Provão criado com sucesso!');
    }
  };

  const handleAddQuestao = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestaoDesc.trim() && newQuestaoHab.trim() && selectedProvao) {
      dbService.addQuestao({
        provaoId: selectedProvao,
        disciplina: newQuestaoDisciplina,
        descricao: newQuestaoDesc.trim(),
        habilidade_codigo: newQuestaoHab.trim(),
      });
      setNewQuestaoDesc('');
      setNewQuestaoHab('');
      setQuestoes(dbService.getQuestoesByProvao(selectedProvao));
      showNotification('Questão adicionada com sucesso!');
    }
  };

  const handleSetGabarito = (questaoId: string, resposta: Alternativa) => {
    dbService.addGabarito({ questaoId, respostaCorreta: resposta });
    const newGabaritos = new Map(gabaritos);
    newGabaritos.set(questaoId, resposta);
    setGabaritos(newGabaritos);
    showNotification('Gabarito salvo com sucesso!', 'success');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={20} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft size={20} />
            Voltar para a Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <GraduationCap size={40} />
            Painel Administrativo
          </h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Coluna de Gerenciamento de Estrutura */}
          <div className="space-y-6">
            {/* Gerenciar Escolas */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <School className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Gerenciar Escolas</h2>
              </div>
              <form onSubmit={handleAddEscola} className="flex gap-2 mb-4">
                <Input
                  value={newEscola}
                  onChange={(e) => setNewEscola(e.target.value)}
                  placeholder="Nome da nova escola"
                />
                <Button type="submit">
                  <Plus size={16} />
                </Button>
              </form>
              <Select
                value={selectedEscola}
                onChange={(e) => setSelectedEscola(e.target.value)}
              >
                <option value="">Selecione uma escola</option>
                {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </Select>
            </Card>

            {/* Gerenciar Séries/Anos */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold">Gerenciar Séries/Anos</h2>
              </div>
              <form onSubmit={handleAddSerie} className="flex gap-2 mb-4">
                <Input
                  value={newSerie}
                  onChange={(e) => setNewSerie(e.target.value)}
                  placeholder="Nome da nova série"
                  disabled={!selectedEscola}
                />
                <Button type="submit" disabled={!selectedEscola}>
                  <Plus size={16} />
                </Button>
              </form>
              <Select
                value={selectedSerie}
                onChange={(e) => setSelectedSerie(e.target.value)}
                disabled={!selectedEscola}
              >
                <option value="">Selecione uma série</option>
                {seriesOfSelectedEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
            </Card>

            {/* Gerenciar Turmas */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-purple-600" size={24} />
                <h2 className="text-xl font-semibold">Gerenciar Turmas</h2>
              </div>
              <form onSubmit={handleAddTurma} className="flex gap-2 mb-4">
                <Input
                  value={newTurma}
                  onChange={(e) => setNewTurma(e.target.value)}
                  placeholder="Nome da nova turma"
                  disabled={!selectedSerie}
                />
                <Button type="submit" disabled={!selectedSerie}>
                  <Plus size={16} />
                </Button>
              </form>
              <Select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                disabled={!selectedSerie}
              >
                <option value="">Selecione uma turma</option>
                {turmasOfSelectedSerie.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Select>
            </Card>
          </div>

          {/* Coluna de Gerenciamento de Pessoas */}
          <div className="space-y-6">
            {/* Gerenciar Professores */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Gerenciar Professores</h2>
              </div>
              <form onSubmit={handleAddProfessor} className="flex gap-2 mb-4">
                <Input
                  value={newProfessor}
                  onChange={(e) => setNewProfessor(e.target.value)}
                  placeholder="Nome do novo professor"
                />
                <Button type="submit">
                  <Plus size={16} />
                </Button>
              </form>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {professores.length > 0 ? (
                  professores.map(p => (
                    <div key={p.id} className="py-1 text-sm">{p.nome}</div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum professor cadastrado</p>
                )}
              </div>
            </Card>

            {/* Gerenciar Alunos */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold">Gerenciar Alunos</h2>
              </div>
              <form onSubmit={handleAddAluno} className="flex gap-2 mb-4">
                <Input
                  value={newAluno}
                  onChange={(e) => setNewAluno(e.target.value)}
                  placeholder="Nome do novo aluno"
                />
                <Button type="submit">
                  <Plus size={16} />
                </Button>
              </form>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {alunos.length > 0 ? (
                  alunos.map(a => (
                    <div key={a.id} className="py-1 text-sm">{a.nome}</div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum aluno cadastrado</p>
                )}
              </div>
            </Card>

            {/* Gerenciar Turma Selecionada */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Gerenciar Turma Selecionada</h2>
              {!selectedTurma ? (
                <p className="text-sm text-gray-500">Selecione uma turma para ver os detalhes.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users size={18} />
                      Alunos na Turma ({alunosNaTurma.length})
                    </h3>
                    <div className="max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 mb-2">
                      {alunosNaTurma.length > 0 ? (
                        alunosNaTurma.map(a => (
                          <div key={a.id} className="py-1 text-sm">{a.nome}</div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum aluno matriculado</p>
                      )}
                    </div>
                    <form onSubmit={handleMatricularAluno} className="flex gap-2">
                      <Select
                        value={alunoParaMatricular}
                        onChange={e => setAlunoParaMatricular(e.target.value)}
                      >
                        <option value="">Matricular aluno...</option>
                        {alunosDisponiveis.map(a => (
                          <option key={a.id} value={a.id}>{a.nome}</option>
                        ))}
                      </Select>
                      <Button type="submit" variant="success" disabled={!alunoParaMatricular}>
                        Matricular
                      </Button>
                    </form>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <UserCheck size={18} />
                      Professores na Turma ({professoresNaTurma.length})
                    </h3>
                    <div className="max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 mb-2">
                      {professoresNaTurma.length > 0 ? (
                        professoresNaTurma.map(p => (
                          <div key={p.id} className="py-1 text-sm">{p.nome}</div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum professor associado</p>
                      )}
                    </div>
                    <form onSubmit={handleAssociarProfessor} className="flex gap-2">
                      <Select
                        value={professorParaAssociar}
                        onChange={e => setProfessorParaAssociar(e.target.value)}
                      >
                        <option value="">Associar professor...</option>
                        {professoresDisponiveis.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </Select>
                      <Button type="submit" variant="success" disabled={!professorParaAssociar}>
                        Associar
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Seção do Provão */}
        <Card className="mt-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="text-orange-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Gerenciar Provão</h2>
          </div>
          
          {!selectedTurma ? (
            <p className="text-center text-gray-500 py-8">
              Selecione uma turma acima para gerenciar o provão.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado esquerdo - Criação e seleção */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Criar Novo Provão</h3>
                  <form onSubmit={handleAddProvao} className="flex gap-2">
                    <Input
                      value={newProvaoName}
                      onChange={e => setNewProvaoName(e.target.value)}
                      placeholder="Nome do novo provão"
                    />
                    <Button type="submit" variant="success">
                      Criar Provão
                    </Button>
                  </form>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Selecionar Provão</h3>
                  <Select
                    value={selectedProvao}
                    onChange={e => setSelectedProvao(e.target.value)}
                  >
                    <option value="">Selecione um provão</option>
                    {provoes.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </Select>
                </div>

                {selectedProvao && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Adicionar Questão</h3>
                    <form onSubmit={handleAddQuestao} className="space-y-3">
                      <Input
                        value={newQuestaoDesc}
                        onChange={e => setNewQuestaoDesc(e.target.value)}
                        placeholder="Descrição da questão"
                      />
                      <Input
                        value={newQuestaoHab}
                        onChange={e => setNewQuestaoHab(e.target.value)}
                        placeholder="Código da habilidade (ex: EF15LP03)"
                      />
                      <Select
                        value={newQuestaoDisciplina}
                        onChange={e => setNewQuestaoDisciplina(e.target.value as Disciplina)}
                      >
                        <option value="Português">📚 Português</option>
                        <option value="Matemática">🔢 Matemática</option>
                      </Select>
                      <Button type="submit" className="w-full">
                        <Plus size={16} className="mr-2" />
                        Adicionar Questão
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Lado direito - Questões e Gabarito */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Questões e Gabarito</h3>
                  {questoes.length > 0 && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {questoes.length} questões
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                  {questoes.length > 0 ? (
                    questoes.map((q, index) => (
                      <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                Questão {index + 1}
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {q.disciplina}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mb-1">{q.descricao}</p>
                            <p className="text-xs text-gray-600">Habilidade: {q.habilidade_codigo}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-3">
                          {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => (
                            <Button
                              key={alt}
                              size="sm"
                              variant={gabaritos.get(q.id) === alt ? 'success' : 'secondary'}
                              onClick={() => handleSetGabarito(q.id, alt)}
                              className="flex-1"
                            >
                              {alt}
                              {gabaritos.get(q.id) === alt && (
                                <Save size={12} className="ml-1" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">Nenhuma questão adicionada ainda.</p>
                      <p className="text-sm text-gray-400">Selecione um provão e adicione questões.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Footer com informações */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sistema de Gerenciamento Educacional - Provão</p>
          <p className="mt-1">Estrutura: Escola → Série → Turma → Alunos/Professores → Provão</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
