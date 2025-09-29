// src/pages/ResultsPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Trophy, FileText } from 'lucide-react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Provao, Questao, Alternativa, Aluno } from '../types';
import Card from '../components/Card';
import Select from '../components/Select';
import Notification from '../components/Notification';

interface AlunoResult {
  aluno: Aluno;
  totalQuestoes: number;
  acertos: number;
  percentual: number;
  detalhes: {
    questao: Questao;
    respostaAluno: Alternativa | null;
    gabarito: Alternativa;
    acertou: boolean;
  }[];
}

const ResultsPage: React.FC = () => {
  // --- UI State ---
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'error' } | null>(null);

  // --- Queries for dropdowns ---
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
  const { data: provoes = [] } = useQuery({
    queryKey: ['provoes', selectedTurma],
    queryFn: () => dbService.getProvoesByTurma(selectedTurma),
    enabled: !!selectedTurma,
  });

  // --- Main Query for calculating results ---
  const { data: resultados = [], isLoading, error } = useQuery<AlunoResult[], Error>({
    queryKey: ['resultados', selectedTurma, selectedProvao],
    queryFn: async () => {
      if (!selectedTurma || !selectedProvao) return [];

      const { alunos, questoes, scores, gabaritos } = await dbService.getDadosResultados(selectedTurma, selectedProvao);

      if (questoes.length === 0) throw new Error('Este provão não possui questões.');
      if (gabaritos.size === 0) throw new Error('Gabaritos não definidos para este provão.');
      if (alunos.length === 0) throw new Error('Nenhum aluno encontrado na turma.');

      const scoresPorAluno = new Map<string, Map<string, Alternativa>>();
      scores.forEach(score => {
        if (!scoresPorAluno.has(score.aluno_id)) scoresPorAluno.set(score.aluno_id, new Map());
        scoresPorAluno.get(score.aluno_id)!.set(score.questao_id, score.resposta);
      });

      const resultadosCalculados: AlunoResult[] = alunos.map(aluno => {
        const scoresAluno = scoresPorAluno.get(aluno.id) || new Map();
        let acertos = 0;
        const detalhes: AlunoResult['detalhes'] = [];

        questoes.forEach(questao => {
          const gabarito = gabaritos.get(questao.id);
          if (!gabarito) return;

          const respostaAluno = scoresAluno.get(questao.id) || null;
          const acertou = respostaAluno === gabarito;
          if (acertou) acertos++;
          detalhes.push({ questao, respostaAluno, gabarito, acertou });
        });
        
        const totalQuestoesComGabarito = detalhes.length;
        const percentual = totalQuestoesComGabarito > 0 ? (acertos / totalQuestoesComGabarito) * 100 : 0;
        return { aluno, totalQuestoes: totalQuestoesComGabarito, acertos, percentual, detalhes };
      });

      return resultadosCalculados.sort((a, b) => b.percentual - a.percentual);
    },
    enabled: !!selectedTurma && !!selectedProvao,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    onError: (err) => {
        setNotification({ message: err.message, type: 'error' });
        setTimeout(() => setNotification(null), 5000);
    }
  });

  const getPercentualColor = (p: number) => p >= 80 ? 'text-green-600 bg-green-100' : p >= 60 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
  const getClassificacao = (i: number) => {
    if (i === 0) return { icon: <Trophy className="text-yellow-500" size={20} />, color: 'bg-yellow-50 border-yellow-200' };
    if (i === 1) return { icon: <Trophy className="text-gray-400" size={20} />, color: 'bg-gray-50 border-gray-200' };
    if (i === 2) return { icon: <Trophy className="text-orange-500" size={20} />, color: 'bg-orange-50 border-orange-200' };
    return { icon: null, color: 'bg-white border-gray-200' };
  };

  return (
    <>
      <Notification notification={notification as any} onClear={() => setNotification(null)} />
      <div className="flex items-center justify-center mb-8 -mt-8">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3"><BarChart3 size={40} /> Resultados do Provão</h1>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="text-blue-600" size={24} /> Selecionar para Análise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}><option value="">Selecione Escola</option>{escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</Select>
          <Select value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}><option value="">Selecione Série</option>{series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</Select>
          <Select value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}><option value="">Selecione Turma</option>{turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</Select>
          <Select value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} disabled={!selectedTurma}><option value="">Selecione Provão</option>{provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select>
        </div>
      </Card>

      {isLoading && <Card><p className="text-center py-8">Carregando resultados...</p></Card>}

      {!isLoading && error && !notification && (
        <Card><p className="text-center py-8 text-red-600">Ocorreu um erro ao carregar os resultados.</p></Card>
      )}

      {!isLoading && !error && resultados.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users className="text-green-600" size={24} /> Ranking dos Alunos ({resultados.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {resultados.map((r, i) => {
                const { icon, color } = getClassificacao(i);
                return (
                  <div key={r.aluno.id} className={`p-4 rounded-lg border-2 ${color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="w-6">{icon}</div><div><div className="font-medium text-gray-900">{i + 1}º - {r.aluno.nome}</div></div></div>
                      <div className="text-right"><div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPercentualColor(r.percentual)}`}>{r.percentual.toFixed(1)}%</div><div className="text-sm text-gray-600 mt-1">{r.acertos}/{r.totalQuestoes} acertos</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="text-purple-600" size={24} /> Detalhes por Questão</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {resultados[0].detalhes.map((d, i) => {
                const acertos = resultados.reduce((acc, r) => acc + (r.detalhes.find(det => det.questao.id === d.questao.id)?.acertou ? 1 : 0), 0);
                const total = resultados.length;
                const pAcerto = total > 0 ? (acertos / total) * 100 : 0;
                return (
                  <div key={d.questao.id} className="p-4 bg-gray-50 rounded-lg border">
                     <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 flex-wrap"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Questão {i + 1}</span><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{d.questao.disciplina}</span></div><span className="text-sm font-medium text-gray-700">Gabarito: {d.gabarito}</span></div>
                     <div className="text-xs text-gray-600 mb-2">Habilidade: {d.questao.habilidade_codigo}</div>
                     <div className="flex items-center justify-between"><div className="text-sm text-gray-700">{acertos}/{total} alunos acertaram</div><div className={`px-2 py-1 rounded text-xs font-medium ${getPercentualColor(pAcerto)}`}>{pAcerto.toFixed(1)}% de acerto</div></div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {!isLoading && !error && selectedProvao && resultados.length === 0 && (
          <Card><div className="text-center py-8"><Users size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500">Nenhum resultado encontrado para a seleção.</p></div></Card>
      )}
    </>
  );
};

export default ResultsPage;