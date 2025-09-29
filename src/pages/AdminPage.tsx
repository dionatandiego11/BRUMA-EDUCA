// src/pages/AdminPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { School, Users, BookOpen, UserCheck, GraduationCap, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Professor, Aluno } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Notification from '../components/Notification'; // Um novo componente de notificação

const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State para os formulários e seleções da UI
  const [newEscola, setNewEscola] = useState({ nome: '', codigo_inep: '', localizacao: '' });
  const [newSerie, setNewSerie] = useState('');
  const [newTurma, setNewTurma] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newAluno, setNewAluno] = useState({ nome: '', matricula: '' });
  
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  
  const [alunoParaMatricular, setAlunoParaMatricular] = useState('');
  const [professorParaAssociar, setProfessorParaAssociar] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // --- Queries ---
  const { data: escolas = [], isLoading: isLoadingEscolas } = useQuery({
    queryKey: ['escolas'],
    queryFn: dbService.getEscolas,
  });

  const { data: professores = [], isLoading: isLoadingProfessores } = useQuery({
    queryKey: ['professores'],
    queryFn: dbService.getProfessores,
  });

  const { data: alunos = [], isLoading: isLoadingAlunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: dbService.getAlunos,
  });

  const { data: seriesOfSelectedEscola = [] } = useQuery({
    queryKey: ['series', selectedEscola],
    queryFn: () => dbService.getSeriesByEscola(selectedEscola),
    enabled: !!selectedEscola, // Apenas executa se selectedEscola não for nulo
  });

  const { data: turmasOfSelectedSerie = [] } = useQuery({
    queryKey: ['turmas', selectedSerie],
    queryFn: () => dbService.getTurmasBySerie(selectedSerie),
    enabled: !!selectedSerie,
  });

  const { data: turmaDetails } = useQuery({
    queryKey: ['turmaDetails', selectedTurma],
    queryFn: async () => {
      const [alunosData, professoresData] = await Promise.all([
        dbService.getAlunosByTurma(selectedTurma),
        dbService.getProfessoresByTurma(selectedTurma),
      ]);
      return { alunos: alunosData, professores: professoresData };
    },
    enabled: !!selectedTurma,
  });
  const alunosNaTurma = turmaDetails?.alunos || [];
  const professoresNaTurma = turmaDetails?.professores || [];

  // --- Mutações ---
  const createMutation = <T,>(
    mutationFn: (data: T) => Promise<any>,
    queryKeyToInvalidate: string[]
  ) => {
    return useMutation({
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        showNotification('Operação realizada com sucesso!');
      },
      onError: (err: any) => {
        showNotification(err.message || 'Ocorreu um erro.', 'error');
      }
    });
  };

  const addEscolaMutation = createMutation(dbService.createEscola, ['escolas']);
  const addSerieMutation = createMutation(dbService.createSerie, ['series', selectedEscola]);
  const addTurmaMutation = createMutation(dbService.addTurma, ['turmas', selectedSerie]);
  const addProfessorMutation = createMutation(dbService.addProfessor, ['professores']);
  const addAlunoMutation = createMutation(dbService.addAluno, ['alunos']);
  const addMatriculaMutation = createMutation(dbService.addMatricula, ['turmaDetails', selectedTurma]);
  const removeMatriculaMutation = createMutation(dbService.removeMatricula, ['turmaDetails', selectedTurma]);
  const associateProfessorMutation = createMutation(dbService.associateProfessorToTurma, ['turmaDetails', selectedTurma]);
  const desassociateProfessorMutation = createMutation(dbService.desassociateProfessorFromTurma, ['turmaDetails', selectedTurma]);

  // --- Handlers ---
  const handleAddEscola = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEscola.nome.trim() && newEscola.codigo_inep.trim() && newEscola.localizacao) {
      addEscolaMutation.mutate(
        { ...newEscola, localizacao: newEscola.localizacao as "Urbano" | "Rural" },
        { onSuccess: () => setNewEscola({ nome: '', codigo_inep: '', localizacao: '' }) }
      );
    }
  };

  const handleAddSerie = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSerie.trim() && selectedEscola) {
      addSerieMutation.mutate(
        { nome: newSerie.trim(), escolaId: selectedEscola },
        { onSuccess: () => setNewSerie('') }
      );
    }
  };

  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTurma.trim() && selectedSerie) {
        addTurmaMutation.mutate(
            { nome: newTurma.trim(), serieId: selectedSerie, professorIds: [] },
            { onSuccess: () => setNewTurma('') }
        );
    }
  };

  const handleAddProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessor.trim()) {
        addProfessorMutation.mutate(
            { nome: newProfessor.trim() },
            { onSuccess: () => setNewProfessor('') }
        );
    }
  };

  const handleAddAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAluno.nome.trim() && newAluno.matricula.trim()) {
        addAlunoMutation.mutate(
            { ...newAluno },
            { onSuccess: () => setNewAluno({ nome: '', matricula: '' }) }
        );
    }
  };

  const handleMatricularAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (alunoParaMatricular && selectedTurma) {
      addMatriculaMutation.mutate(
        { alunoId: alunoParaMatricular, turmaId: selectedTurma },
        { onSuccess: () => setAlunoParaMatricular('') }
      );
    }
  };

  const handleDesmatricularAluno = (alunoId: string) => {
    if (selectedTurma && confirm('Tem certeza?')) {
      removeMatriculaMutation.mutate({ alunoId, turmaId: selectedTurma });
    }
  };

  const handleAssociarProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (professorParaAssociar && selectedTurma) {
      associateProfessorMutation.mutate(
        { professorId: professorParaAssociar, turmaId: selectedTurma },
        { onSuccess: () => setProfessorParaAssociar('') }
      );
    }
  };

  const handleDesassociarProfessor = (professorId: string) => {
    if (selectedTurma && confirm('Tem certeza?')) {
      desassociateProfessorMutation.mutate({ professorId, turmaId: selectedTurma });
    }
  };

  // --- Memos para listas filtradas ---
  const alunosDisponiveis = useMemo(() => {
    const idsAlunosNaTurma = new Set(alunosNaTurma.map(a => a.id));
    return alunos.filter(a => !idsAlunosNaTurma.has(a.id));
  }, [alunos, alunosNaTurma]);

  const professoresDisponiveis = useMemo(() => {
    const idsProfessoresNaTurma = new Set(professoresNaTurma.map(p => p.id));
    return professores.filter(p => !idsProfessoresNaTurma.has(p.id));
  }, [professores, professoresNaTurma]);

  return (
    <>
      <Notification notification={notification} onClear={() => setNotification(null)} />
      <div className="flex items-center justify-center mb-8 -mt-8">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <GraduationCap size={40} className="text-blue-600"/> Painel Administrativo
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Coluna de Gerenciamento de Estrutura */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><School className="text-blue-600"/>Gerenciar Escolas</h2>
            <form onSubmit={handleAddEscola} className="space-y-3 mb-4">
              <Input value={newEscola.nome} onChange={(e) => setNewEscola({...newEscola, nome: e.target.value})} placeholder="Nome da nova escola" />
              <div className="grid grid-cols-2 gap-3">
                <Input value={newEscola.codigo_inep} onChange={(e) => setNewEscola({...newEscola, codigo_inep: e.target.value})} placeholder="Código INEP" />
                <Select value={newEscola.localizacao} onChange={(e) => setNewEscola({...newEscola, localizacao: e.target.value})}>
                  <option value="">Localização</option>
                  <option value="Urbano">Urbano</option>
                  <option value="Rural">Rural</option>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={addEscolaMutation.isPending}>
                {addEscolaMutation.isPending ? 'Adicionando...' : <><Plus size={16} className="mr-2"/>Adicionar Escola</>}
              </Button>
            </form>
            <Select value={selectedEscola} onChange={(e) => setSelectedEscola(e.target.value)}>
              <option value="">Selecione uma escola</option>
              {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="text-green-600"/>Gerenciar Séries/Anos</h2>
            <form onSubmit={handleAddSerie} className="flex gap-3 mb-4">
              <Input value={newSerie} onChange={(e) => setNewSerie(e.target.value)} placeholder="Nome da nova série" disabled={!selectedEscola} />
              <Button type="submit" disabled={!selectedEscola || addSerieMutation.isPending}><Plus size={16}/></Button>
            </form>
            <Select value={selectedSerie} onChange={(e) => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
              <option value="">Selecione uma série</option>
              {seriesOfSelectedEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="text-purple-600"/>Gerenciar Turmas</h2>
            <form onSubmit={handleAddTurma} className="flex gap-3 mb-4">
              <Input value={newTurma} onChange={(e) => setNewTurma(e.target.value)} placeholder="Nome da nova turma" disabled={!selectedSerie} />
              <Button type="submit" disabled={!selectedSerie || addTurmaMutation.isPending}><Plus size={16}/></Button>
            </form>
            <Select value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
              <option value="">Selecione uma turma</option>
              {turmasOfSelectedSerie.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </Card>
        </div>

        {/* Coluna de Gerenciamento de Pessoas e Turma */}
        <div className="space-y-6">
           <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><UserCheck className="text-indigo-600"/>Gerenciar Professores</h2>
            <form onSubmit={handleAddProfessor} className="flex gap-3 mb-4">
              <Input value={newProfessor} onChange={(e) => setNewProfessor(e.target.value)} placeholder="Nome do novo professor" />
              <Button type="submit" disabled={addProfessorMutation.isPending}><Plus size={16}/></Button>
            </form>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {professores.map(p => <div key={p.id} className="py-1 text-sm">{p.nome}</div>)}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="text-teal-600"/>Gerenciar Alunos</h2>
            <form onSubmit={handleAddAluno} className="space-y-3 mb-4">
              <Input value={newAluno.nome} onChange={(e) => setNewAluno({...newAluno, nome: e.target.value})} placeholder="Nome do novo aluno" />
              <Input value={newAluno.matricula} onChange={(e) => setNewAluno({...newAluno, matricula: e.target.value})} placeholder="Matrícula" />
              <Button type="submit" className="w-full" disabled={addAlunoMutation.isPending}>
                {addAlunoMutation.isPending ? 'Adicionando...' : <><Plus size={16} className="mr-2"/>Adicionar Aluno</>}
              </Button>
            </form>
             <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {alunos.map(a => <div key={a.id} className="py-1 text-sm">{a.nome} ({a.matricula})</div>)}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gerenciar Turma Selecionada</h2>
            {!selectedTurma ? (
              <p className="text-center text-gray-500">Selecione uma turma para ver os detalhes.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Alunos na Turma ({alunosNaTurma.length})</h3>
                  <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-2">
                     {alunosNaTurma.map(a => (
                       <div key={a.id} className="flex justify-between items-center py-1 text-sm">
                         <span>{a.nome}</span>
                         <button onClick={() => handleDesmatricularAluno(a.id)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                       </div>
                     ))}
                  </div>
                  <form onSubmit={handleMatricularAluno} className="flex gap-2">
                    <Select value={alunoParaMatricular} onChange={e => setAlunoParaMatricular(e.target.value)}>
                      <option value="">Matricular aluno...</option>
                      {alunosDisponiveis.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                    </Select>
                    <Button type="submit" variant="success" size="sm" disabled={!alunoParaMatricular || addMatriculaMutation.isPending}>Matricular</Button>
                  </form>
                </div>
                 <div>
                  <h3 className="font-semibold mb-2">Professores na Turma ({professoresNaTurma.length})</h3>
                  <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-2">
                     {professoresNaTurma.map(p => (
                       <div key={p.id} className="flex justify-between items-center py-1 text-sm">
                         <span>{p.nome}</span>
                         <button onClick={() => handleDesassociarProfessor(p.id)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                       </div>
                     ))}
                  </div>
                  <form onSubmit={handleAssociarProfessor} className="flex gap-2">
                    <Select value={professorParaAssociar} onChange={e => setProfessorParaAssociar(e.target.value)}>
                      <option value="">Associar professor...</option>
                      {professoresDisponiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </Select>
                    <Button type="submit" variant="success" size="sm" disabled={!professorParaAssociar || associateProfessorMutation.isPending}>Associar</Button>
                  </form>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

export default AdminPage;