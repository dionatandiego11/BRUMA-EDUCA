// src/pages/InsertDataPage.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';
import Card from '../components/Card';
import Select from '../components/Select';
import Notification from '../components/Notification';

const InsertDataPage: React.FC = () => {
  const queryClient = useQueryClient();

  // --- UI State ---
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: Alternativa | null }>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  // --- Queries ---
  const { data: escolas = [] } = useQuery({ queryKey: ['escolas'], queryFn: dbService.getEscolas });

  const { data: series = [] } = useQuery({
    queryKey: ['series', selectedEscola],
    queryFn: () => dbService.getSeriesByEscola(selectedEscola),
    enabled: !!selectedEscola,
  });

  const { data: turmas = [] } = useQuery({
    queryKey: ['turmas', selectedSerie],
    queryFn: () => dbService.getTurmasBySerie(selectedSerie),
    enabled: !!selectedSerie,
  });

  const { data: turmaData } = useQuery({
    queryKey: ['turmaData', selectedTurma],
    queryFn: async () => {
      if (!selectedTurma) return null;
      const [alunos, provoes] = await Promise.all([
        dbService.getAlunosByTurma(selectedTurma),
        dbService.getProvoesByTurma(selectedTurma),
      ]);
      return { alunos, provoes };
    },
    enabled: !!selectedTurma,
  });
  const alunos = turmaData?.alunos || [];
  const provoes = turmaData?.provoes || [];

  const { data: questoes = [] } = useQuery({
    queryKey: ['questoes', selectedProvao],
    queryFn: () => dbService.getQuestoesByProvao(selectedProvao),
    enabled: !!selectedProvao,
  });

  const { data: respostasSalvas } = useQuery({
    queryKey: ['respostas', selectedAluno, selectedProvao],
    queryFn: async () => {
      if (!selectedAluno || !selectedProvao) return {};
      const questoesProvao = await dbService.getQuestoesByProvao(selectedProvao);
      const respostasExistentes: { [key: string]: Alternativa | null } = {};
      await Promise.all(questoesProvao.map(async (questao) => {
        const score = await dbService.getScoreByAlunoQuestao(selectedAluno, questao.id);
        respostasExistentes[questao.id] = score ? score.resposta : null;
      }));
      return respostasExistentes;
    },
    enabled: !!selectedAluno && !!selectedProvao,
  });

  // --- Effect to sync local state with fetched data ---
  useEffect(() => {
    if (respostasSalvas) {
      setRespostas(respostasSalvas);
    }
  }, [respostasSalvas]);

  // --- Mutation ---
  const saveRespostaMutation = useMutation({
    mutationFn: dbService.addScore,
    onSuccess: (data, variables) => {
      // Atualiza o cache da query de respostas para evitar um refetch
      queryClient.setQueryData(['respostas', variables.alunoId, variables.questaoId], variables.resposta);
      showNotification('Resposta salva!', 'success');
    },
    onError: (err: any, variables) => {
      showNotification('Erro ao salvar.', 'error');
      // Reverte o estado otimista em caso de erro
      setRespostas(prev => ({ ...prev, [variables.questaoId]: respostasSalvas?.[variables.questaoId] || null }));
    },
  });

  // --- Handlers ---
  const handleRespostaChange = (questaoId: string, valor: Alternativa) => {
    if (!selectedAluno) {
      showNotification('Selecione um aluno.', 'error');
      return;
    }
    // Atualização otimista da UI
    setRespostas(prev => ({ ...prev, [questaoId]: valor }));
    saveRespostaMutation.mutate({ alunoId: selectedAluno, questaoId, resposta: valor });
  };
  
  const alternativas: Alternativa[] = ['A', 'B', 'C', 'D', 'E'];

  return (
    <>
      <Notification notification={notification} onClear={() => setNotification(null)} />
      <Card>
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Inserir Resultados do Aluno</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}>
              <option value="">Selecione a Escola</option>
              {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </Select>
            <Select value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
              <option value="">Selecione a Série</option>
              {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
            <Select value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
              <option value="">Selecione a Turma</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
            <Select value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} disabled={!selectedTurma}>
              <option value="">Selecione o Provão</option>
              {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </div>
          <Select value={selectedAluno} onChange={e => setSelectedAluno(e.target.value)} disabled={!selectedTurma}>
            <option value="">Selecione o Aluno</option>
            {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>)}
          </Select>
        </div>
        {selectedAluno && selectedProvao && questoes.length > 0 && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Questões do Provão</h3>
            <div className="space-y-4">
              {questoes.map((q, index) => (
                <div key={q.id} className="p-4 rounded-lg bg-gray-50 border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="mb-2 sm:mb-0">
                      <span className="font-semibold text-gray-900">Questão {index + 1}</span>
                      <p className="text-sm text-gray-600">{q.disciplina} - {q.habilidade_codigo}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alternativas.map(alt => (
                        <button
                          key={alt} type="button" onClick={() => handleRespostaChange(q.id, alt)}
                          className={`w-10 h-10 rounded-full text-sm font-bold transition-transform transform-gpu duration-150 ${respostas[q.id] === alt ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          disabled={saveRespostaMutation.isPending}
                        >{alt}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default InsertDataPage;