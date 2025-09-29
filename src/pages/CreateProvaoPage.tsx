// src/pages/CreateProvaoPage.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FilePlus2, Trash2, Plus, Save, ChevronDown, ChevronRight } from 'lucide-react';
import type { Provao, Questao, Disciplina, Alternativa, Escola, Serie, Turma } from '../types';
import dbService from '../services/dbService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Notification from '../components/Notification';

const CreateProvaoPage: React.FC = () => {
  const queryClient = useQueryClient();

  // --- UI State ---
  const [selectedProvaoId, setSelectedProvaoId] = useState<string | null>(null);
  const [newProvaoName, setNewProvaoName] = useState('');
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<Set<string>>(new Set());
  const [newQuestao, setNewQuestao] = useState({ habilidade_codigo: '', disciplina: 'Português' as Disciplina });
  const [gabaritos, setGabaritos] = useState<Map<string, Alternativa>>(new Map());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Queries ---
  const { data: provoes = [] } = useQuery({
    queryKey: ['provoes'],
    queryFn: dbService.getProvoes,
  });

  const { data: escolas = [] } = useQuery({
    queryKey: ['escolas'],
    queryFn: dbService.getEscolas,
  });

  const { data: provaoDetails } = useQuery({
    queryKey: ['provao', selectedProvaoId],
    queryFn: async () => {
      if (!selectedProvaoId) return null;
      const [questoesData, turmaIdsData] = await Promise.all([
        dbService.getQuestoesByProvao(selectedProvaoId),
        dbService.getTurmaIdsByProvao(selectedProvaoId)
      ]);
      const loadedGabaritos = new Map<string, Alternativa>();
      for (const q of questoesData) {
        const gabarito = await dbService.getGabaritoByQuestao(q.id);
        if (gabarito) loadedGabaritos.set(q.id, gabarito.resposta_correta);
      }
      return { questoes: questoesData, turmaIds: turmaIdsData, gabaritos: loadedGabaritos };
    },
    enabled: !!selectedProvaoId,
  });
  const questoes = provaoDetails?.questoes || [];
  const selectedProvao = provoes.find(p => p.id === selectedProvaoId) || null;

  // --- Effects to sync UI state with query data ---
  useEffect(() => {
    if (selectedProvao) {
      setNewProvaoName(selectedProvao.nome);
    } else {
      setNewProvaoName('');
    }
  }, [selectedProvao]);

  useEffect(() => {
    if (provaoDetails) {
      setSelectedTurmaIds(new Set(provaoDetails.turmaIds));
      setGabaritos(provaoDetails.gabaritos);
    } else {
      setSelectedTurmaIds(new Set());
      setGabaritos(new Map());
    }
  }, [provaoDetails]);

  // --- Mutations ---
  const mutationOptions = (queryKeyToInvalidate: string[]) => ({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      showNotification('Operação bem-sucedida!');
    },
    onError: (err: any) => showNotification(err.message, 'error'),
  });

  const saveProvaoMutation = useMutation({
    mutationFn: (data: { nome: string, turmaIds: string[] }) => {
      if (selectedProvaoId) {
        return dbService.updateProvao(selectedProvaoId, data);
      }
      return dbService.addProvao(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['provoes'] });
      if (!selectedProvaoId) {
        setSelectedProvaoId(data.id); // Select new provao after creation
      }
      showNotification('Provão salvo!');
    },
    onError: (err: any) => showNotification(err.message, 'error'),
  });

  const addQuestaoMutation = useMutation({
    mutationFn: dbService.addQuestao,
    ...mutationOptions(['provao', selectedProvaoId]),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['provao', selectedProvaoId] });
        showNotification('Questão adicionada!');
        setNewQuestao({ habilidade_codigo: '', disciplina: 'Português' });
    }
  });

  const deleteQuestaoMutation = useMutation({
    mutationFn: dbService.deleteQuestao,
    ...mutationOptions(['provao', selectedProvaoId]),
  });

  const setGabaritoMutation = useMutation({
    mutationFn: dbService.addGabarito,
    onSuccess: (data, variables) => {
      setGabaritos(prev => new Map(prev.set(variables.questaoId, variables.respostaCorreta)));
      showNotification('Gabarito salvo.');
    },
    onError: (err: any) => showNotification(err.message, 'error'),
  });

  // --- Handlers ---
  const handleSaveProvao = () => {
    if (!newProvaoName.trim()) {
      showNotification('O nome do provão é obrigatório', 'error');
      return;
    }
    saveProvaoMutation.mutate({ nome: newProvaoName, turmaIds: Array.from(selectedTurmaIds) });
  };

  const handleAddQuestao = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestao.habilidade_codigo.trim() && selectedProvaoId) {
      addQuestaoMutation.mutate({
        provaoId: selectedProvaoId,
        disciplina: newQuestao.disciplina,
        habilidade_codigo: newQuestao.habilidade_codigo.trim(),
        ordem: questoes.length + 1,
      });
    }
  };

  const handleDeleteQuestao = (questaoId: string) => {
    if (window.confirm('Tem certeza?')) {
        deleteQuestaoMutation.mutate(questaoId);
    }
  }

  // --- Nested Component for Selection ---
  const TurmaSelector = () => {
    const [expandedEscolas, setExpandedEscolas] = useState<Set<string>>(new Set());
    const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

    const { data: series } = useQuery({
      queryKey: ['series', Array.from(expandedEscolas)],
      queryFn: async () => {
        const seriesData: Record<string, Serie[]> = {};
        for (const escolaId of expandedEscolas) {
          seriesData[escolaId] = await dbService.getSeriesByEscola(escolaId);
        }
        return seriesData;
      },
      enabled: expandedEscolas.size > 0,
    });

    const { data: turmas } = useQuery({
        queryKey: ['turmas', Array.from(expandedSeries)],
        queryFn: async () => {
          const turmasData: Record<string, Turma[]> = {};
          for (const serieId of expandedSeries) {
            turmasData[serieId] = await dbService.getTurmasBySerie(serieId);
          }
          return turmasData;
        },
        enabled: expandedSeries.size > 0,
      });

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-lg bg-gray-50">
        {escolas.map(escola => (
          <div key={escola.id}>
            <button onClick={() => setExpandedEscolas(s => new Set(s).has(escola.id) ? (s.delete(escola.id), s) : s.add(escola.id))} className="w-full text-left flex items-center gap-2 font-semibold">
              {expandedEscolas.has(escola.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>} {escola.nome}
            </button>
            {expandedEscolas.has(escola.id) && (series?.[escola.id] || []).map(serie => (
              <div key={serie.id} className="pl-6 space-y-1 mt-1">
                <button onClick={() => setExpandedSeries(s => new Set(s).has(serie.id) ? (s.delete(serie.id), s) : s.add(serie.id))} className="w-full text-left flex items-center gap-2 font-medium text-sm">
                  {expandedSeries.has(serie.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} {serie.nome}
                </button>
                {expandedSeries.has(serie.id) && (turmas?.[serie.id] || []).map(turma => (
                  <div key={turma.id} className="pl-6 mt-1 space-y-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedTurmaIds.has(turma.id)} onChange={() => setSelectedTurmaIds(s => { const newSet = new Set(s); newSet.has(turma.id) ? newSet.delete(turma.id) : newSet.add(turma.id); return newSet; })} className="rounded"/>
                      {turma.nome}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Notification notification={notification} onClear={() => setNotification(null)} />
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">1. Definições do Provão</h2>
            <div className="space-y-4">
              <Select value={selectedProvaoId || ''} onChange={e => setSelectedProvaoId(e.target.value)}>
                <option value="">-- Criar Novo Provão --</option>
                {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
              <Input placeholder="Nome do Provão" value={newProvaoName} onChange={e => setNewProvaoName(e.target.value)} />
              <div>
                <label className="font-semibold block mb-2">Associar Turmas ({selectedTurmaIds.size})</label>
                <TurmaSelector />
              </div>
              <Button onClick={handleSaveProvao} className="w-full" disabled={saveProvaoMutation.isPending}>
                <Save size={16} className="mr-2"/>
                {saveProvaoMutation.isPending ? 'Salvando...' : (selectedProvaoId ? 'Atualizar Provão' : 'Salvar e Editar Questões')}
              </Button>
            </div>
          </div>

          <div className={!selectedProvaoId ? 'opacity-50' : ''}>
            <h2 className="text-xl font-bold mb-4">2. Gerenciar Questões</h2>
            {!selectedProvaoId ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500 bg-gray-100 rounded-lg p-4">
                <p>Salve ou selecione um provão para adicionar questões.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleAddQuestao} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                  <Input placeholder="Código da Habilidade (ex: EF15LP03)" value={newQuestao.habilidade_codigo} onChange={e => setNewQuestao({...newQuestao, habilidade_codigo: e.target.value})} />
                  <Select value={newQuestao.disciplina} onChange={e => setNewQuestao({...newQuestao, disciplina: e.target.value as Disciplina})}>
                    <option value="Português">Português</option>
                    <option value="Matemática">Matemática</option>
                  </Select>
                  <Button type="submit" className="w-full" disabled={addQuestaoMutation.isPending}><Plus size={16} className="mr-2"/>Adicionar Questão</Button>
                </form>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {questoes.map((q, index) => (
                    <div key={q.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold">Questão {index + 1}: {q.habilidade_codigo}</p>
                        <button onClick={() => handleDeleteQuestao(q.id)} className="text-red-500 hover:text-red-700" disabled={deleteQuestaoMutation.isPending}><Trash2 size={16}/></button>
                      </div>
                      <p className="text-sm text-gray-600">{q.disciplina}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-medium">Gabarito:</span>
                        {(['A', 'B', 'C', 'D', 'E'] as Alternativa[]).map(alt => (
                          <button key={alt} onClick={() => setGabaritoMutation.mutate({ questaoId: q.id, respostaCorreta: alt })} className={`w-7 h-7 text-xs rounded-full font-bold ${gabaritos.get(q.id) === alt ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} disabled={setGabaritoMutation.isPending}>{alt}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default CreateProvaoPage;