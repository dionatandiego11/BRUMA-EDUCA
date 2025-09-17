import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { dbService } from '../services/dbService';
import { Escola, Serie, Turma, Professor, Aluno, Matricula, Provao, Questao, Gabarito, Disciplina } from '../types';

const AdminPage: React.FC = () => {
  // --- Estados para os dados do DB ---
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
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

  // --- Carregar dados iniciais ---
  useEffect(() => {
    reloadData();
  }, []);

  const reloadData = () => {
    setEscolas(dbService.getEscolas());
    setProfessores(dbService.getProfessores());
    setAlunos(dbService.getAlunos());
  };

  // --- Lógica da cascata ---
  const seriesOfSelectedEscola = useMemo(() => {
    return selectedEscola ? dbService.getSeriesByEscola(selectedEscola) : [];
  }, [selectedEscola]);

  const turmasOfSelectedSerie = useMemo(() => {
    return selectedSerie ? dbService.getTurmasBySerie(selectedSerie) : [];
  }, [selectedSerie]);

  const alunosNaTurma = useMemo(() => {
    return selectedTurma ? dbService.getAlunosByTurma(selectedTurma) : [];
  }, [selectedTurma]);

  const professoresNaTurma = useMemo(() => {
    return selectedTurma ? dbService.getProfessoresByTurma(selectedTurma) : [];
  }, [selectedTurma]);

  const alunosDisponiveis = useMemo(() => {
    const todosAlunos = dbService.getAlunos();
    const idsAlunosNaTurma = new Set(alunosNaTurma.map(a => a.id));
    return todosAlunos.filter(a => !idsAlunosNaTurma.has(a.id));
  }, [alunosNaTurma]);

  const professoresDisponiveis = useMemo(() => {
    const todosProfessores = dbService.getProfessores();
    const idsProfessoresNaTurma = new Set(professoresNaTurma.map(p => p.id));
    return todosProfessores.filter(p => !idsProfessoresNaTurma.has(p.id));
  }, [professoresNaTurma]);


  // --- Handlers para adição ---
  const handleAddEscola = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEscola.trim()) {
      dbService.addEscola({ nome: newEscola });
      setNewEscola('');
      reloadData();
    }
  };

  const handleAddSerie = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSerie.trim() && selectedEscola) {
      dbService.addSerie({ nome: newSerie, escolaId: selectedEscola });
      setNewSerie('');
      reloadData();
      // Forçar a atualização da lista de séries
      setSelectedEscola(selectedEscola);
    }
  };

  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTurma.trim() && selectedSerie) {
      // Por enquanto, não vamos associar professores aqui
      dbService.addTurma({ nome: newTurma, serieId: selectedSerie, professorIds: [] });
      setNewTurma('');
      reloadData();
      // Forçar a atualização da lista de turmas
      setSelectedSerie(selectedSerie);
    }
  };

  const handleAddProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessor.trim()) {
      dbService.addProfessor({ nome: newProfessor });
      setNewProfessor('');
      reloadData();
    }
  };

  const handleAddAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAluno.trim()) {
      dbService.addAluno({ nome: newAluno });
      setNewAluno('');
      reloadData();
    }
  };

  const handleMatricularAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (alunoParaMatricular && selectedTurma) {
      dbService.addMatricula({ alunoId: alunoParaMatricular, turmaId: selectedTurma });
      setAlunoParaMatricular('');
      // Forçar re-render para atualizar a lista de alunos na turma
      setSelectedTurma(selectedTurma);
    }
  };

  const handleAssociarProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (professorParaAssociar && selectedTurma) {
      const turma = dbService.getTurmasBySerie(selectedSerie).find(t => t.id === selectedTurma);
      if (turma) {
        const updatedProfessorIds = [...turma.professorIds, professorParaAssociar];
        dbService.updateTurma(selectedTurma, { professorIds: updatedProfessorIds });
        setProfessorParaAssociar('');
        // Forçar re-render
        setSelectedTurma(selectedTurma);
      }
    }
  };

  // --- Handlers do Provão ---
  const handleAddProvao = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProvaoName.trim() && selectedTurma) {
      dbService.addProvao({ nome: newProvaoName, turmaId: selectedTurma, data: new Date().toISOString() });
      setNewProvaoName('');
      setProvoes(dbService.getProvoesByTurma(selectedTurma));
    }
  };

  const handleAddQuestao = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestaoDesc.trim() && newQuestaoHab.trim() && selectedProvao) {
      dbService.addQuestao({
        provaoId: selectedProvao,
        disciplina: newQuestaoDisciplina,
        descricao: newQuestaoDesc,
        habilidade_codigo: newQuestaoHab,
      });
      setNewQuestaoDesc('');
      setNewQuestaoHab('');
      setQuestoes(dbService.getQuestoesByProvao(selectedProvao));
    }
  };

  const handleSetGabarito = (questaoId: string, resposta: Alternativa) => {
    dbService.addGabarito({ questaoId, respostaCorreta: resposta });
    // Atualizar estado local para refletir a mudança
    const newGabaritos = new Map(gabaritos);
    newGabaritos.set(questaoId, resposta);
    setGabaritos(newGabaritos);
  };

  useEffect(() => {
    if (selectedTurma) {
      setProvoes(dbService.getProvoesByTurma(selectedTurma));
      setSelectedProvao('');
    }
  }, [selectedTurma]);

  useEffect(() => {
    if (selectedProvao) {
      setQuestoes(dbService.getQuestoesByProvao(selectedProvao));
      // Carregar gabaritos existentes
      const loadedGabaritos = new Map<string, Alternativa>();
      const questoesDoProvao = dbService.getQuestoesByProvao(selectedProvao);
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

  return (
    <div className="max-w-4xl mx-auto p-4">
        <div className="text-left mb-8">
            <Link to="/" className="text-blue-600 hover:underline">&larr; Voltar para a Home</Link>
        </div>
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">Página Administrativa</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna de Gerenciamento de Entidades */}
            <div className="space-y-6">
                {/* Gerenciar Escolas */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Escolas</h2>
                    <form onSubmit={handleAddEscola} className="flex gap-2">
                        <Input value={newEscola} onChange={(e) => setNewEscola(e.target.value)} placeholder="Nome da nova escola" />
                        <Button type="submit">Adicionar</Button>
                    </form>
                    <Select value={selectedEscola} onChange={(e) => { setSelectedEscola(e.target.value); setSelectedSerie(''); setSelectedTurma(''); }} className="mt-4">
                        <option value="">Selecione uma escola</option>
                        {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </Select>
                </Card>

                {/* Gerenciar Séries/Anos */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Séries/Anos</h2>
                    <form onSubmit={handleAddSerie} className="flex gap-2">
                        <Input value={newSerie} onChange={(e) => setNewSerie(e.target.value)} placeholder="Nome da nova série" disabled={!selectedEscola} />
                        <Button type="submit" disabled={!selectedEscola}>Adicionar</Button>
                    </form>
                     <Select value={selectedSerie} onChange={(e) => { setSelectedSerie(e.target.value); setSelectedTurma(''); }} className="mt-4" disabled={!selectedEscola}>
                        <option value="">Selecione uma série</option>
                        {seriesOfSelectedEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </Select>
                </Card>

                {/* Gerenciar Turmas */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Turmas</h2>
                    <form onSubmit={handleAddTurma} className="flex gap-2">
                        <Input value={newTurma} onChange={(e) => setNewTurma(e.target.value)} placeholder="Nome da nova turma" disabled={!selectedSerie} />
                        <Button type="submit" disabled={!selectedSerie}>Adicionar</Button>
                    </form>
                    <Select value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)} className="mt-4" disabled={!selectedSerie}>
                        <option value="">Selecione uma turma</option>
                        {turmasOfSelectedSerie.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </Select>
                </Card>
            </div>

            {/* Coluna de Gerenciamento de Pessoas e Matrículas */}
            <div className="space-y-6">
                {/* Gerenciar Professores */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Professores</h2>
                    <form onSubmit={handleAddProfessor} className="flex gap-2">
                        <Input value={newProfessor} onChange={(e) => setNewProfessor(e.target.value)} placeholder="Nome do novo professor" />
                        <Button type="submit">Adicionar</Button>
                    </form>
                    <div className="mt-4 max-h-32 overflow-y-auto border p-2 rounded">
                        {professores.map(p => <div key={p.id}>{p.nome}</div>)}
                    </div>
                </Card>

                {/* Gerenciar Alunos */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Alunos</h2>
                    <form onSubmit={handleAddAluno} className="flex gap-2">
                        <Input value={newAluno} onChange={(e) => setNewAluno(e.target.value)} placeholder="Nome do novo aluno" />
                        <Button type="submit">Adicionar</Button>
                    </form>
                     <div className="mt-4 max-h-32 overflow-y-auto border p-2 rounded">
                        {alunos.map(a => <div key={a.id}>{a.nome}</div>)}
                    </div>
                </Card>

                {/* Gerenciar Matrículas e Professores da Turma */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Turma Selecionada</h2>
                    {!selectedTurma ? <p className="text-sm text-gray-500">Selecione uma turma para ver os detalhes.</p> : (
                        <div>
                            <h3 className="font-semibold">Alunos na Turma</h3>
                            <div className="mt-2 max-h-28 overflow-y-auto border p-2 rounded">
                                {alunosNaTurma.map(a => <div key={a.id}>{a.nome}</div>)}
                            </div>
                            <form onSubmit={handleMatricularAluno} className="flex gap-2 mt-2">
                                <Select value={alunoParaMatricular} onChange={e => setAlunoParaMatricular(e.target.value)}>
                                    <option value="">Matricular aluno...</option>
                                    {alunosDisponiveis.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                                </Select>
                                <Button type="submit">Matricular</Button>
                            </form>

                            <h3 className="font-semibold mt-4">Professores na Turma</h3>
                             <div className="mt-2 max-h-28 overflow-y-auto border p-2 rounded">
                                {professoresNaTurma.map(p => <div key={p.id}>{p.nome}</div>)}
                            </div>
                            <form onSubmit={handleAssociarProfessor} className="flex gap-2 mt-2">
                                <Select value={professorParaAssociar} onChange={e => setProfessorParaAssociar(e.target.value)}>
                                    <option value="">Associar professor...</option>
                                    {professoresDisponiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                </Select>
                                <Button type="submit">Associar</Button>
                            </form>
                        </div>
                    )}
                </Card>
            </div>
        </div>

        {/* Seção do Provão */}
        <div className="mt-8">
            <Card>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Gerenciar Provão</h2>
                {!selectedTurma ? <p className="text-sm text-gray-500 text-center">Selecione uma turma para gerenciar o provão.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <form onSubmit={handleAddProvao} className="flex gap-2">
                                <Input value={newProvaoName} onChange={e => setNewProvaoName(e.target.value)} placeholder="Nome do novo provão" />
                                <Button type="submit">Criar Provão</Button>
                            </form>
                            <Select value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} className="mt-4">
                                <option value="">Selecione um provão</option>
                                {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </Select>

                            {selectedProvao && (
                                <div className="mt-4 border-t pt-4">
                                    <h3 className="font-semibold mb-2">Adicionar Questão</h3>
                                    <form onSubmit={handleAddQuestao} className="space-y-2">
                                        <Input value={newQuestaoDesc} onChange={e => setNewQuestaoDesc(e.target.value)} placeholder="Descrição da questão" />
                                        <Input value={newQuestaoHab} onChange={e => setNewQuestaoHab(e.target.value)} placeholder="Código da habilidade" />
                                        <Select value={newQuestaoDisciplina} onChange={e => setNewQuestaoDisciplina(e.target.value as Disciplina)}>
                                            <option value="Português">Português</option>
                                            <option value="Matemática">Matemática</option>
                                        </Select>
                                        <Button type="submit">Adicionar Questão</Button>
                                    </form>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold">Questões e Gabarito</h3>
                            <div className="mt-2 max-h-80 overflow-y-auto border p-2 rounded space-y-2">
                                {questoes.length > 0 ? questoes.map(q => (
                                    <div key={q.id} className="p-2 bg-gray-50 rounded">
                                        <p>{q.descricao} ({q.habilidade_codigo}) - <strong>{q.disciplina}</strong></p>
                                        <div className="flex gap-2 mt-1">
                                            {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => (
                                                <Button
                                                    key={alt}
                                                    onClick={() => handleSetGabarito(q.id, alt)}
                                                    className={gabaritos.get(q.id) === alt ? 'bg-green-500' : ''}
                                                >
                                                    {alt}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-500">Nenhuma questão adicionada.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
};

export default AdminPage;
