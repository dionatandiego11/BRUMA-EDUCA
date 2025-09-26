import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  X,
  Hash,
  CheckCircle,
  AlertCircle,
  School,
  Users,
  BookOpen,
  Edit3,
  Trash2,
  Save
} from 'lucide-react';
import dbService from '../services/dbService';
import type { 
  Escola, 
  Serie, 
  Turma, 
  Provao, 
  Questao, 
  Disciplina, 
  Alternativa 
} from '../types';

interface ProvaoPageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert' | 'results' | 'provoes') => void;
}

interface TurmaCompleta extends Turma {
  serie: Serie & {
    escola: Escola;
  };
}

const ProvaoPage: React.FC<ProvaoPageProps> = ({ onNavigate }) => {
  // Estados principais
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [todasTurmas, setTodasTurmas] = useState<TurmaCompleta[]>([]);
  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [gabaritos, setGabaritos] = useState<Map<string, Alternativa>>(new Map());

  // Estados de filtros
  const [escolaFilter, setEscolaFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState('');
  const [turmaFilter, setTurmaFilter] = useState('');

  // Estados de seleção
  const [selectedProvao, setSelectedProvao] = useState('');
  
  // Estados de formulário
  const [isCreatingProvao, setIsCreatingProvao] = useState(false);
  const [isEditingProvao, setIsEditingProvao] = useState(false);
  const [newProvaoName, setNewProvaoName] = useState('');
  const [newProvaoDesc, setNewProvaoDesc] = useState('');
  const [selectedTurmasForProvao, setSelectedTurmasForProvao] = useState<string[]>([]);

  // Estados de questões
  const [newQuestaoHab, setNewQuestaoHab] = useState('');
  const [newQuestaoDisciplina, setNewQuestaoDisciplina] = useState<Disciplina>('Português');

  // Estados de notificação
  const [notification, setNotification] = useState<{ 
    message: string; 
    type: 'success' | 'error' 
  } | null>(null);

  // Helper para notificações
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [escolasData, todasTurmasData] = await Promise.all([
          dbService.getEscolas(),
          dbService.getTodasTurmasCompletas()
        ]);
        
        setEscolas(escolasData);
        setTodasTurmas(todasTurmasData);
        
        // Carrega todos os provões
        const provoesData = await dbService.getTodosProvoes();
        setProvoes(provoesData);
      } catch (error) {
        showNotification('Erro ao carregar dados iniciais.', 'error');
      }
    };
    loadInitialData();
  }, [showNotification]);

  // Carrega questões quando provão muda
  useEffect(() => {
    const fetchQuestoes = async () => {
      if (selectedProvao) {
        try {
          const questoesDoProvao = await dbService.getQuestoesByProvao(selectedProvao);
          setQuestoes(questoesDoProvao);
          const loadedGabaritos = new Map<string, Alternativa>();
          for (const q of questoesDoProvao) {
            const gabarito = await dbService.getGabaritoByQuestao(q.id);
            if (gabarito) {
              loadedGabaritos.set(q.id, gabarito.resposta_correta);
            }
          }
          setGabaritos(loadedGabaritos);
        } catch (error) {
          showNotification('Erro ao carregar questões.', 'error');
        }
      } else {
        setQuestoes([]);
        setGabaritos(new Map());
      }
    };
    fetchQuestoes();
  }, [selectedProvao, showNotification]);

  // Turmas filtradas
  const turmasFiltradas = useMemo(() => {
    return todasTurmas.filter(turma => {
      const matchEscola = !escolaFilter || turma.serie.escola.id === escolaFilter;
      const matchSerie = !serieFilter || turma.serie.id === serieFilter;
      const matchTurma = !turmaFilter || turma.id === turmaFilter;
      return matchEscola && matchSerie && matchTurma;
    });
  }, [todasTurmas, escolaFilter, serieFilter, turmaFilter]);

  // Séries filtradas por escola
  const seriesFiltradas = useMemo(() => {
    if (!escolaFilter) return [];
    return [...new Set(
      todasTurmas
        .filter(t => t.serie.escola.id === escolaFilter)
        .map(t => t.serie)
    )];
  }, [todasTurmas, escolaFilter]);

  // Turmas filtradas por série
  const turmasFiltradasPorSerie = useMemo(() => {
    if (!serieFilter) return [];
    return todasTurmas.filter(t => t.serie.id === serieFilter);
  }, [todasTurmas, serieFilter]);

  // Handlers
  const handleCreateProvao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvaoName.trim() || selectedTurmasForProvao.length === 0) {
      showNotification('Preencha o nome e selecione ao menos uma turma.', 'error');
      return;
    }

    try {
      const provao = await dbService.createProvaoMultiTurma({
        nome: newProvaoName.trim(),
        descricao: newProvaoDesc.trim(),
        turmaIds: selectedTurmasForProvao
      });

      setNewProvaoName('');
      setNewProvaoDesc('');
      setSelectedTurmasForProvao([]);
      setIsCreatingProvao(false);
      
      // Recarrega os provões
      const provoesData = await dbService.getTodosProvoes();
      setProvoes(provoesData);
      
      showNotification('Provão criado com sucesso!');
    } catch (error: any) {
      showNotification(error.message || 'Erro ao criar provão.', 'error');
    }
  };

  const handleAddQuestao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestaoHab.trim() && selectedProvao) {
      try {
        await dbService.addQuestao({
          provaoId: selectedProvao,
          disciplina: newQuestaoDisciplina,
          habilidade_codigo: newQuestaoHab.trim(),
        });
        setNewQuestaoHab('');
        setQuestoes(await dbService.getQuestoesByProvao(selectedProvao));
        showNotification('Questão adicionada com sucesso!');
      } catch (error) {
        showNotification('Erro ao adicionar questão.', 'error');
      }
    }
  };

  const handleSetGabarito = async (questaoId: string, resposta: Alternativa) => {
    try {
      await dbService.addGabarito({ questaoId, respostaCorreta: resposta });
      const newGabaritos = new Map(gabaritos);
      newGabaritos.set(questaoId, resposta);
      setGabaritos(newGabaritos);
      showNotification('Gabarito salvo com sucesso!');
    } catch (error) {
      showNotification('Erro ao salvar gabarito.', 'error');
    }
  };

  const toggleTurmaSelection = (turmaId: string) => {
    setSelectedTurmasForProvao(prev => 
      prev.includes(turmaId) 
        ? prev.filter(id => id !== turmaId)
        : [...prev, turmaId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            className="flex items-center gap-2 bg-white text-blue-600 hover:text-blue-800 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar para Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 justify-center">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-2xl">
                <FileText size={40} className="text-white" />
              </div>
              Gerenciar Provões
            </h1>
            <p className="text-gray-600 mt-2">Crie e gerencie avaliações para múltiplas turmas</p>
          </div>
          
          <div className="w-32"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Criação e Filtros */}
          <div className="space-y-6">
            {/* Criar Novo Provão */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <Plus size={20} className="text-green-600" />
                  </div>
                  Criar Novo Provão
                </h2>
                <button
                  onClick={() => setIsCreatingProvao(!isCreatingProvao)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {isCreatingProvao ? 'Cancelar' : 'Novo Provão'}
                </button>
              </div>

              {isCreatingProvao && (
                <form onSubmit={handleCreateProvao} className="space-y-4">
                  <input
                    value={newProvaoName}
                    onChange={(e) => setNewProvaoName(e.target.value)}
                    placeholder="Nome do provão"
                    className="w-full p-3 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  />
                  <textarea
                    value={newProvaoDesc}
                    onChange={(e) => setNewProvaoDesc(e.target.value)}
                    placeholder="Descrição (opcional)"
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  />
                  
                  {/* Filtros para seleção de turmas */}
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={escolaFilter}
                      onChange={(e) => {
                        setEscolaFilter(e.target.value);
                        setSerieFilter('');
                        setTurmaFilter('');
                      }}
                      className="p-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-sm"
                    >
                      <option value="">Filtrar por escola</option>
                      {escolas.map(e => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                    
                    <select
                      value={serieFilter}
                      onChange={(e) => {
                        setSerieFilter(e.target.value);
                        setTurmaFilter('');
                      }}
                      disabled={!escolaFilter}
                      className="p-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-sm disabled:bg-gray-100"
                    >
                      <option value="">Filtrar por série</option>
                      {seriesFiltradas.map(s => (
                        <option key={s.id} value={s.id}>{s.nome}</option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setEscolaFilter('');
                        setSerieFilter('');
                        setTurmaFilter('');
                      }}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-sm transition-colors"
                    >
                      Limpar
                    </button>
                  </div>

                  {/* Seleção de Turmas */}
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Users size={16} className="text-blue-600" />
                      Selecionar Turmas ({selectedTurmasForProvao.length} selecionadas)
                    </h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {turmasFiltradas.length > 0 ? (
                        turmasFiltradas.map(turma => (
                          <label key={turma.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTurmasForProvao.includes(turma.id)}
                              onChange={() => toggleTurmaSelection(turma.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className="font-medium">{turma.nome}</span>
                              <div className="text-sm text-gray-600">
                                {turma.serie.nome} - {turma.serie.escola.nome}
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          {todasTurmas.length === 0 
                            ? 'Nenhuma turma cadastrada' 
                            : 'Use os filtros para encontrar turmas'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Criar Provão
                  </button>
                </form>
              )}
            </div>

            {/* Lista de Provões */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <FileText size={20} className="text-blue-600" />
                </div>
                Provões Criados
              </h2>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {provoes.length > 0 ? (
                  provoes.map(provao => (
                    <div 
                      key={provao.id} 
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedProvao === provao.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProvao(selectedProvao === provao.id ? '' : provao.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{provao.nome}</h3>
                          {provao.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{provao.descricao}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <FileText size={12} />
                              {questoes.filter(q => q.provao_id === provao.id).length} questões
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum provão criado ainda
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Questões e Gabarito */}
          <div className="space-y-6">
            {!selectedProvao ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Selecione um Provão
                </h3>
                <p className="text-gray-500">
                  Escolha um provão na lista ao lado para adicionar questões e configurar gabaritos.
                </p>
              </div>
            ) : (
              <>
                {/* Adicionar Questão */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-purple-500">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="bg-purple-100 p-1 rounded-lg">
                      <Plus size={16} className="text-purple-600" />
                    </div>
                    Adicionar Questão
                  </h3>
                  <form onSubmit={handleAddQuestao} className="space-y-4">
                    <input
                      value={newQuestaoHab}
                      onChange={(e) => setNewQuestaoHab(e.target.value)}
                      placeholder="Código da habilidade (ex: EF15LP03)"
                      className="w-full p-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    />
                    <select
                      value={newQuestaoDisciplina}
                      onChange={(e) => setNewQuestaoDisciplina(e.target.value as Disciplina)}
                      className="w-full p-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    >
                      <option value="Português">📚 Português</option>
                      <option value="Matemática">🧮 Matemática</option>
                    </select>
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Adicionar Questão
                    </button>
                  </form>
                </div>

                {/* Questões e Gabarito */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="bg-orange-100 p-1 rounded-lg">
                        <FileText size={16} className="text-orange-600" />
                      </div>
                      Questões e Gabarito
                    </h3>
                    {questoes.length > 0 && (
                      <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium">
                        {questoes.length} questões
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-[36rem] overflow-y-auto space-y-4 pr-2">
                    {questoes.length > 0 ? (
                      questoes.map((q, index) => (
                        <div key={q.id} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl shadow-sm border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                                  Questão {index + 1}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  q.disciplina === 'Português' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {q.disciplina === 'Português' ? '📚' : '🧮'} {q.disciplina}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Hash size={12} />
                                Habilidade: <span className="font-mono font-medium">{q.habilidade_codigo}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 mt-4">
                            {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => (
                              <button
                                key={alt}
                                onClick={() => handleSetGabarito(q.id, alt)}
                                className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                                  gabaritos.get(q.id) === alt 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                              >
                                <span className="font-bold">{alt}</span>
                                {gabaritos.get(q.id) === alt && (
                                  <CheckCircle size={12} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg mb-1">Nenhuma questão adicionada ainda</p>
                        <p className="text-sm text-gray-400">Adicione questões usando o formulário acima.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvaoPage;