import { supabase } from './supabaseClient'
import type {
  Escola, Serie, Turma, Professor, Aluno, Matricula,
  Provao, Questao, Gabarito, Score, TurmaProfessor,
  CreateEscolaDTO, CreateSerieDTO,
  EstatisticasAluno, EstatisticasTurma, Disciplina, Alternativa
} from '../types'

class DatabaseService {

  // ------------------ ESCOLAS ------------------
  async getEscolas(): Promise<Escola[]> {
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar escolas:', error)
      throw new Error(`Falha ao buscar escolas: ${error.message}`)
    }
    
    return data || []
  }

  async createEscola(dto: CreateEscolaDTO): Promise<Escola> {
    const { data, error } = await supabase
      .from('escolas')
      .insert(dto)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe uma escola com este nome')
      }
      console.error('Erro ao criar escola:', error)
      throw new Error(`Falha ao criar escola: ${error.message}`)
    }
    
    return data
  }

  // ------------------ SÉRIES ------------------
  async getSeriesByEscola(escolaId: string): Promise<Serie[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('escola_id', escolaId)
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar séries:', error)
      throw new Error(`Falha ao buscar séries: ${error.message}`)
    }
    
    return data || []
  }

  async createSerie(dto: CreateSerieDTO): Promise<Serie> {
    const { data, error } = await supabase
      .from('series')
      .insert({
        nome: dto.nome,
        escola_id: dto.escolaId
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Escola não encontrada')
      }
      console.error('Erro ao criar série:', error)
      throw new Error(`Falha ao criar série: ${error.message}`)
    }
    
    return data
  }

  // ------------------ TURMAS ------------------
  async getTurmasBySerie(serieId: string): Promise<Turma[]> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('serie_id', serieId)
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar turmas:', error)
      throw new Error(`Falha ao buscar turmas: ${error.message}`)
    }
    
    return data || []
  }

  async addTurma(dto: { nome: string; serieId: string; professorIds: string[] }): Promise<Turma> {
    const { data, error } = await supabase
      .from('turmas')
      .insert({
        nome: dto.nome,
        serie_id: dto.serieId
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Série não encontrada')
      }
      console.error('Erro ao criar turma:', error)
      throw new Error(`Falha ao criar turma: ${error.message}`)
    }
    
    if (dto.professorIds && dto.professorIds.length > 0) {
      await Promise.all(
        dto.professorIds.map(professorId => 
          this.associateProfessorToTurma({ professorId, turmaId: data.id })
        )
      );
    }
    
    return data
  }

  // ------------------ PROFESSORES ------------------
  async getProfessores(): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar professores:', error)
      throw new Error(`Falha ao buscar professores: ${error.message}`)
    }
    
    return data || []
  }

  async getProfessoresByTurma(turmaId: string): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .select('professor:professores(*)')
      .eq('turma_id', turmaId);

    if (error) throw new Error(`Falha ao buscar professores: ${error.message}`);
    return data?.map((item: any) => item.professor) || [];
  }

  async addProfessor(dto: { nome: string }): Promise<Professor> {
    const { data, error } = await supabase
      .from('professores')
      .insert({ nome: dto.nome })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar professor:', error)
      throw new Error(`Falha ao criar professor: ${error.message}`)
    }
    
    return data
  }

  async associateProfessorToTurma(dto: { professorId: string; turmaId: string }): Promise<TurmaProfessor> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .insert({
        professor_id: dto.professorId,
        turma_id: dto.turmaId
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Este professor já está associado a esta turma')
      }
      if (error.code === '23503') {
        throw new Error('Professor ou turma não encontrados')
      }
      console.error('Erro ao associar professor:', error)
      throw new Error(`Falha ao associar professor: ${error.message}`)
    }
    
    return data
  }

  async desassociateProfessorFromTurma(dto: { professorId: string; turmaId: string }): Promise<void> {
    const { error } = await supabase
      .from('turmas_professores')
      .delete()
      .eq('professor_id', dto.professorId)
      .eq('turma_id', dto.turmaId)
    
    if (error) {
      console.error('Erro ao desassociar professor:', error)
      throw new Error(`Falha ao desassociar professor: ${error.message}`)
    }
  }

  // ------------------ ALUNOS ------------------
  async getAlunos(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar alunos:', error)
      throw new Error(`Falha ao buscar alunos: ${error.message}`)
    }
    
    return data || []
  }
  
  async getAlunosByTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('aluno:alunos(*)')
      .eq('turma_id', turmaId)
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar alunos da turma:', error);
      throw new Error(`Falha ao buscar alunos da turma: ${error.message}`);
    }

    return (data?.map(m => m.aluno) as unknown as Aluno[]) ?? [];
  }

  async addAluno(dto: { nome: string; matricula: string }): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .insert({
        nome: dto.nome,
        matricula: dto.matricula
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe um aluno com esta matrícula')
      }
      console.error('Erro ao criar aluno:', error)
      throw new Error(`Falha ao criar aluno: ${error.message}`)
    }
    
    return data
  }

  async addMatricula(dto: { alunoId: string; turmaId: string }): Promise<Matricula> {
    const { data, error } = await supabase
      .from('matriculas')
      .insert({
        aluno_id: dto.alunoId,
        turma_id: dto.turmaId
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Este aluno já está matriculado nesta turma')
      }
      if (error.code === '23503') {
        throw new Error('Aluno ou turma não encontrados')
      }
      console.error('Erro ao matricular aluno:', error)
      throw new Error(`Falha ao matricular aluno: ${error.message}`)
    }
    
    return data
  }

  async removeMatricula(dto: { alunoId: string; turmaId: string }): Promise<void> {
    const { error } = await supabase
      .from('matriculas')
      .delete()
      .eq('aluno_id', dto.alunoId)
      .eq('turma_id', dto.turmaId)
    
    if (error) {
      console.error('Erro ao desmatricular aluno:', error)
      throw new Error(`Falha ao desmatricular aluno: ${error.message}`)
    }
  }

  // ------------------ PROVÕES (LEGADO - MONO-TURMA) ------------------
  async getProvoesByTurma(turmaId: string): Promise<Provao[]> {
    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar provões:', error)
      throw new Error(`Falha ao buscar provões: ${error.message}`)
    }
    
    return data || []
  }

  async addProvao(dto: { nome: string; turmaId: string }): Promise<Provao> {
    const { data, error } = await supabase
      .from('provoes')
      .insert({
        nome: dto.nome,
        turma_id: dto.turmaId
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Turma não encontrada')
      }
      console.error('Erro ao criar provão:', error)
      throw new Error(`Falha ao criar provão: ${error.message}`)
    }
    
    return data
  }

  // ------------------ PROVÕES MULTI-TURMA ------------------

  /**
   * Busca todas as turmas com informações completas (série e escola)
   */
  async getTodasTurmasCompletas(): Promise<Array<Turma & { 
    serie: Serie & { escola: Escola } 
  }>> {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        serie:series(
          *,
          escola:escolas(*)
        )
      `)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar turmas completas:', error);
      throw new Error(`Falha ao buscar turmas completas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca todos os provões (não mais limitado por turma)
   */
  async getTodosProvoes(): Promise<Provao[]> {
    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar provões:', error);
      throw new Error(`Falha ao buscar provões: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Cria um provão associado a múltiplas turmas
   */
  async createProvaoMultiTurma(dto: {
    nome: string;
    descricao?: string;
    turmaIds: string[];
  }): Promise<Provao> {
    try {
      // Primeiro cria o provão
      const { data: provao, error: provaoError } = await supabase
        .from('provoes')
        .insert({
          nome: dto.nome,
          descricao: dto.descricao || null
        })
        .select()
        .single();

      if (provaoError) {
        console.error('Erro ao criar provão:', provaoError);
        throw new Error(`Falha ao criar provão: ${provaoError.message}`);
      }

      // Depois associa às turmas
      if (dto.turmaIds.length > 0) {
        const associacoes = dto.turmaIds.map(turmaId => ({
          provao_id: provao.id,
          turma_id: turmaId
        }));

        const { error: associacaoError } = await supabase
          .from('provoes_turmas')
          .insert(associacoes);

        if (associacaoError) {
          // Se falhar, remove o provão criado
          await supabase.from('provoes').delete().eq('id', provao.id);
          console.error('Erro ao associar turmas:', associacaoError);
          throw new Error(`Falha ao associar turmas: ${associacaoError.message}`);
        }
      }

      return provao;
    } catch (error: any) {
      console.error('Erro em createProvaoMultiTurma:', error);
      throw error;
    }
  }

  /**
   * Busca turmas associadas a um provão
   */
  async getTurmasByProvao(provaoId: string): Promise<Array<Turma & { 
    serie: Serie & { escola: Escola } 
  }>> {
    const { data, error } = await supabase
      .from('provoes_turmas')
      .select(`
        turma:turmas(
          *,
          serie:series(
            *,
            escola:escolas(*)
          )
        )
      `)
      .eq('provao_id', provaoId);

    if (error) {
      console.error('Erro ao buscar turmas do provão:', error);
      throw new Error(`Falha ao buscar turmas do provão: ${error.message}`);
    }

    return data?.map((item: any) => item.turma) || [];
  }

  /**
   * Busca provões de uma turma específica
   */
  async getProvoesByTurmaNew(turmaId: string): Promise<Provao[]> {
    const { data, error } = await supabase
      .from('provoes_turmas')
      .select(`
        provao:provoes(*)
      `)
      .eq('turma_id', turmaId);

    if (error) {
      console.error('Erro ao buscar provões da turma:', error);
      throw new Error(`Falha ao buscar provões da turma: ${error.message}`);
    }

    return data?.map((item: any) => item.provao) || [];
  }

  /**
   * Remove associação de uma turma com um provão
   */
  async removeProvaoTurma(provaoId: string, turmaId: string): Promise<void> {
    const { error } = await supabase
      .from('provoes_turmas')
      .delete()
      .eq('provao_id', provaoId)
      .eq('turma_id', turmaId);

    if (error) {
      console.error('Erro ao remover associação provão-turma:', error);
      throw new Error(`Falha ao remover associação: ${error.message}`);
    }
  }

  /**
   * Adiciona uma turma a um provão existente
   */
  async addTurmaToProvao(provaoId: string, turmaId: string): Promise<void> {
    const { error } = await supabase
      .from('provoes_turmas')
      .insert({
        provao_id: provaoId,
        turma_id: turmaId
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Esta turma já está associada a este provão');
      }
      console.error('Erro ao associar turma ao provão:', error);
      throw new Error(`Falha ao associar turma: ${error.message}`);
    }
  }

  /**
   * Atualiza informações do provão
   */
  async updateProvao(provaoId: string, updates: {
    nome?: string;
    descricao?: string;
  }): Promise<Provao> {
    const { data, error } = await supabase
      .from('provoes')
      .update(updates)
      .eq('id', provaoId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar provão:', error);
      throw new Error(`Falha ao atualizar provão: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta um provão e todas suas associações
   */
  async deleteProvao(provaoId: string): Promise<void> {
    const { error } = await supabase
      .from('provoes')
      .delete()
      .eq('id', provaoId);

    if (error) {
      console.error('Erro ao deletar provão:', error);
      throw new Error(`Falha ao deletar provão: ${error.message}`);
    }
  }
  
  // ------------------ QUESTÕES ------------------
  async getQuestoesByProvao(provaoId: string): Promise<Questao[]> {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('provao_id', provaoId)
      .order('ordem');

    if (error) throw new Error(`Falha ao buscar questões: ${error.message}`);
    return data || [];
  }

  async addQuestao(dto: { 
    provaoId: string; 
    disciplina: Disciplina; 
    habilidade_codigo: string 
  }): Promise<Questao> {
    const { data, error } = await supabase
      .from('questoes')
      .insert({
        provao_id: dto.provaoId,
        disciplina: dto.disciplina,
        habilidade_codigo: dto.habilidade_codigo
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Provão não encontrado')
      }
      console.error('Erro ao criar questão:', error)
      throw new Error(`Falha ao criar questão: ${error.message}`)
    }
    
    return data
  }
  
  async updateQuestao(questaoId: string, dto: { 
    habilidade_codigo: string; 
    disciplina: Disciplina 
  }): Promise<Questao> {
    const { data, error } = await supabase
      .from('questoes')
      .update({
        habilidade_codigo: dto.habilidade_codigo,
        disciplina: dto.disciplina
      })
      .eq('id', questaoId)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Questão não encontrada')
      }
      console.error('Erro ao atualizar questão:', error)
      throw new Error(`Falha ao atualizar questão: ${error.message}`)
    }
    
    return data
  }

  async deleteQuestao(questaoId: string): Promise<void> {
    const { error: gabaritoError } = await supabase
      .from('gabaritos')
      .delete()
      .eq('questao_id', questaoId)
    
    if (gabaritoError && gabaritoError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Erro ao remover gabarito:', gabaritoError)
      throw new Error(`Falha ao remover gabarito: ${gabaritoError.message}`)
    }

    const { error: scoresError } = await supabase
      .from('scores')
      .delete()
      .eq('questao_id', questaoId)
    
    if (scoresError && scoresError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Erro ao remover scores:', scoresError)
      throw new Error(`Falha ao remover scores: ${scoresError.message}`)
    }

    const { error: questaoError } = await supabase
      .from('questoes')
      .delete()
      .eq('id', questaoId)
    
    if (questaoError) {
      console.error('Erro ao excluir questão:', questaoError)
      throw new Error(`Falha ao excluir questão: ${questaoError.message}`)
    }
  }

  async reorderQuestoes(questaoIds: string[]): Promise<void> {
    const updates = questaoIds.map((id, index) => ({
      id,
      ordem: index + 1
    }))

    const { error } = await supabase
      .from('questoes')
      .upsert(updates, { onConflict: 'id' })
    
    if (error) {
      console.error('Erro ao reordenar questões:', error)
      throw new Error(`Falha ao reordenar questões: ${error.message}`)
    }
  }

  // ------------------ GABARITOS ------------------
  async getGabaritoByQuestao(questaoId: string): Promise<Gabarito | null> {
    const { data, error } = await supabase
      .from('gabaritos')
      .select('*')
      .eq('questao_id', questaoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Falha ao buscar gabarito: ${error.message}`);
    }
    return data;
  }

  async addGabarito(dto: { questaoId: string; respostaCorreta: Alternativa }): Promise<Gabarito> {
    const { data, error } = await supabase
      .from('gabaritos')
      .upsert({
        questao_id: dto.questaoId,
        resposta_correta: dto.respostaCorreta
      }, { onConflict: 'questao_id' })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao salvar gabarito:', error)
      throw new Error(`Falha ao salvar gabarito: ${error.message}`)
    }
    
    return data
  }

  // ------------------ SCORES ------------------
  async addScore(dto: { alunoId: string; questaoId: string; resposta: Alternativa }): Promise<Score> {
    const { data, error } = await supabase
      .from('scores')
      .upsert({
        aluno_id: dto.alunoId,
        questao_id: dto.questaoId,
        resposta: dto.resposta
      }, { onConflict: 'aluno_id,questao_id' })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao salvar resposta:', error)
      throw new Error(`Falha ao salvar resposta: ${error.message}`)
    }
    
    return data
  }

  async getScoreByAlunoQuestao(alunoId: string, questaoId: string): Promise<Score | null> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('questao_id', questaoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar score:', error);
      throw new Error(`Falha ao buscar resposta: ${error.message}`);
    }
    
    return data;
  }

  // ------------------ MÉTODOS OTIMIZADOS E ATUALIZADOS PARA RESULTS ------------------

  async getScoresByTurmaAndProvao(turmaId: string, provaoId: string): Promise<any[]> {
    try {
      const { data: matriculas, error: errorMatriculas } = await supabase
        .from('matriculas')
        .select('aluno_id')
        .eq('turma_id', turmaId)
        .eq('ativo', true);

      if (errorMatriculas) {
        throw new Error(`Falha ao buscar matrículas: ${errorMatriculas.message}`);
      }

      const alunoIds = matriculas?.map(m => m.aluno_id) || [];
      if (alunoIds.length === 0) return [];

      const { data: questaoIdsData, error: errorQuestoes } = await supabase
        .from('questoes')
        .select('id')
        .eq('provao_id', provaoId);

      if (errorQuestoes) {
        throw new Error(`Falha ao buscar questões: ${errorQuestoes.message}`);
      }

      const questaoIds = questaoIdsData?.map(q => q.id) || [];
      if (questaoIds.length === 0) return [];

      const { data: scores, error: errorScores } = await supabase
        .from('scores')
        .select(`*, aluno:alunos(*), questao:questoes(*)`)
        .in('aluno_id', alunoIds)
        .in('questao_id', questaoIds);

      if (errorScores) {
        console.error('Erro ao buscar scores em lote:', errorScores);
        throw new Error(`Falha ao buscar scores: ${errorScores.message}`);
      }

      return scores || [];
    } catch (error) {
      console.error('Erro em getScoresByTurmaAndProvao:', error);
      throw error;
    }
  }

  async getGabaritosByProvao(provaoId: string): Promise<Map<string, Alternativa>> {
    try {
      const { data: questaoIdsData, error: errorQuestoes } = await supabase
        .from('questoes')
        .select('id')
        .eq('provao_id', provaoId);

      if (errorQuestoes) {
        throw new Error(`Falha ao buscar questões: ${errorQuestoes.message}`);
      }

      const questaoIds = questaoIdsData?.map(q => q.id) || [];
      if (questaoIds.length === 0) return new Map();

      const { data: gabaritos, error: errorGabaritos } = await supabase
        .from('gabaritos')
        .select(`resposta_correta, questao_id`)
        .in('questao_id', questaoIds);

      if (errorGabaritos) {
        console.error('Erro ao buscar gabaritos em lote:', errorGabaritos);
        throw new Error(`Falha ao buscar gabaritos: ${errorGabaritos.message}`);
      }

      const gabaritosMap = new Map<string, Alternativa>();
      gabaritos?.forEach(item => {
        gabaritosMap.set(item.questao_id, item.resposta_correta);
      });

      return gabaritosMap;
    } catch (error) {
      console.error('Erro em getGabaritosByProvao:', error);
      throw error;
    }
  }
  
  /**
   * Versão atualizada para buscar scores considerando múltiplas turmas do provão
   */
  async getScoresByProvaoNew(provaoId: string): Promise<any[]> {
    try {
      const { data: turmasProvao, error: turmasError } = await supabase
        .from('provoes_turmas')
        .select('turma_id')
        .eq('provao_id', provaoId);

      if (turmasError) {
        throw new Error(`Falha ao buscar turmas do provão: ${turmasError.message}`);
      }

      const turmaIds = turmasProvao?.map(tp => tp.turma_id) || [];
      if (turmaIds.length === 0) return [];

      const { data: matriculas, error: matriculasError } = await supabase
        .from('matriculas')
        .select('aluno_id')
        .in('turma_id', turmaIds)
        .eq('ativo', true);

      if (matriculasError) {
        throw new Error(`Falha ao buscar matrículas: ${matriculasError.message}`);
      }

      const alunoIds = matriculas?.map(m => m.aluno_id) || [];
      if (alunoIds.length === 0) return [];

      const { data: questaoIdsData, error: questoesError } = await supabase
        .from('questoes')
        .select('id')
        .eq('provao_id', provaoId);

      if (questoesError) {
        throw new Error(`Falha ao buscar questões: ${questoesError.message}`);
      }

      const questaoIds = questaoIdsData?.map(q => q.id) || [];
      if (questaoIds.length === 0) return [];

      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select(`*, aluno:alunos(*), questao:questoes(*)`)
        .in('aluno_id', alunoIds)
        .in('questao_id', questaoIds);

      if (scoresError) {
        console.error('Erro ao buscar scores do provão:', scoresError);
        throw new Error(`Falha ao buscar scores: ${scoresError.message}`);
      }

      return scores || [];
    } catch (error) {
      console.error('Erro em getScoresByProvaoNew:', error);
      throw error;
    }
  }

  async getDadosResultados(turmaId: string, provaoId: string): Promise<{
    alunos: Aluno[];
    questoes: Questao[];
    scores: any[];
    gabaritos: Map<string, Alternativa>;
  }> {
    try {
      console.time('getDadosResultados');
      
      const [alunos, questoes, scores, gabaritos] = await Promise.all([
        this.getAlunosByTurma(turmaId),
        this.getQuestoesByProvao(provaoId),
        this.getScoresByTurmaAndProvao(turmaId, provaoId),
        this.getGabaritosByProvao(provaoId)
      ]);

      console.timeEnd('getDadosResultados');
      
      console.log('Dados consolidados carregados:', {
        alunos: alunos.length,
        questões: questoes.length,
        scores: scores.length,
        gabaritos: gabaritos.size
      });

      return { alunos, questoes, scores, gabaritos };
    } catch (error) {
      console.error('Erro em getDadosResultados:', error);
      throw error;
    }
  }
  
  /**
   * Busca dados consolidados para resultados do provão multi-turma
   */
  async getDadosResultadosProvao(provaoId: string): Promise<{
    provao: Provao;
    turmas: Array<Turma & { serie: Serie & { escola: Escola } }>;
    alunos: Aluno[];
    questoes: Questao[];
    scores: any[];
    gabaritos: Map<string, Alternativa>;
  }> {
    try {
      console.time('getDadosResultadosProvao');
      
      const { data: provao, error: provaoError } = await supabase
        .from('provoes')
        .select('*')
        .eq('id', provaoId)
        .single();

      if (provaoError || !provao) {
        throw new Error('Provão não encontrado');
      }

      const [turmas, questoes, scores, gabaritos] = await Promise.all([
        this.getTurmasByProvao(provaoId),
        this.getQuestoesByProvao(provaoId),
        this.getScoresByProvaoNew(provaoId),
        this.getGabaritosByProvao(provaoId)
      ]);

      const turmaIds = turmas.map(t => t.id);
      const alunosPromises = turmaIds.map(turmaId => this.getAlunosByTurma(turmaId));
      const alunosPorTurma = await Promise.all(alunosPromises);
      
      const alunosMap = new Map<string, Aluno>();
      alunosPorTurma.flat().forEach(aluno => {
        alunosMap.set(aluno.id, aluno);
      });
      const alunos = Array.from(alunosMap.values());

      console.timeEnd('getDadosResultadosProvao');
      
      console.log('Dados consolidados do provão carregados:', {
        provao: provao.nome,
        turmas: turmas.length,
        alunos: alunos.length,
        questões: questoes.length,
        scores: scores.length,
        gabaritos: gabaritos.size
      });

      return { provao, turmas, alunos, questoes, scores, gabaritos };
    } catch (error) {
      console.error('Erro em getDadosResultadosProvao:', error);
      throw error;
    }
  }


  // ------------------ MÉTODOS PARA ESTATÍSTICAS ------------------

  async getEstatisticasQuestao(questaoId: string): Promise<{
    questao: Questao;
    total_respostas: number;
    respostas_corretas: number;
    percentual_acerto: number;
    distribuicao_respostas: Record<Alternativa, number>;
  }> {
    const { data: questao, error: questaoError } = await supabase
      .from('questoes')
      .select('*, gabarito:gabaritos(*)')
      .eq('id', questaoId)
      .single()
    
    if (questaoError) {
      throw new Error(`Falha ao buscar questão: ${questaoError.message}`)
    }

    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('resposta')
      .eq('questao_id', questaoId)
    
    if (scoresError) {
      throw new Error(`Falha ao buscar respostas: ${scoresError.message}`)
    }

    const gabarito = (questao as any).gabarito?.[0] as Gabarito | undefined;
    
    const total_respostas = scores?.length || 0;
    let respostas_corretas = 0;
    const distribuicao_respostas: Record<Alternativa, number> = {
      'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0
    };

    scores?.forEach(score => {
      if (score.resposta) {
        distribuicao_respostas[score.resposta as Alternativa]++;
        if (gabarito && score.resposta === gabarito.resposta_correta) {
          respostas_corretas++;
        }
      }
    });

    const percentual_acerto = total_respostas > 0 ? (respostas_corretas / total_respostas) * 100 : 0;

    return {
      questao: questao as Questao,
      total_respostas,
      respostas_corretas,
      percentual_acerto,
      distribuicao_respostas,
    };
  }

  async getEstatisticasAluno(alunoId: string, provaoId?: string): Promise<EstatisticasAluno> {
    const { data: aluno, error: alunoError } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', alunoId)
      .single()
      
    if (alunoError || !aluno) {
        console.error('Erro ao buscar aluno para estatísticas:', alunoError);
        throw new Error('Aluno não encontrado');
    }
      
    let scoreQuery = supabase
      .from('scores')
      .select(`
        *,
        questao:questoes(
          *,
          gabarito:gabaritos(resposta_correta)
        )
      `)
      .eq('aluno_id', alunoId)
      
    if (provaoId) {
      const { data: questoesProvao, error: questoesError } = await supabase.from('questoes').select('id').eq('provao_id', provaoId);
      if (questoesError) throw new Error('Falha ao buscar questões do provão');

      const questaoIds = questoesProvao.map(q => q.id);
      scoreQuery = scoreQuery.in('questao_id', questaoIds);
    }
      
    const { data: scores, error: scoresError } = await scoreQuery;
      
    if (scoresError) {
        console.error('Erro ao buscar scores do aluno:', scoresError);
        throw new Error('Falha ao buscar scores do aluno');
    }

    if (!scores || scores.length === 0) {
      return {
        aluno,
        total_questoes: 0,
        questoes_corretas: 0,
        percentual_acerto: 0,
        por_disciplina: []
      }
    }
      
    const estatisticasPorDisciplina = new Map<string, { total: number; corretas: number }>()
    let totalCorretas = 0
      
    scores.forEach(score => {
      const questao = score.questao as Questao & { gabarito: Gabarito[] };
      const gabarito = questao?.gabarito?.[0]
      const disciplina = questao?.disciplina || 'Sem disciplina'
        
      if (!estatisticasPorDisciplina.has(disciplina)) {
        estatisticasPorDisciplina.set(disciplina, { total: 0, corretas: 0 })
      }
        
      const stats = estatisticasPorDisciplina.get(disciplina)!;
      stats.total++;
        
      if (gabarito && score.resposta === gabarito.resposta_correta) {
        stats.corretas++;
        totalCorretas++;
      }
    });
      
    const porDisciplina = Array.from(estatisticasPorDisciplina.entries()).map(([disciplina, stats]) => ({
      disciplina: disciplina as Disciplina,
      total: stats.total,
      corretas: stats.corretas,
      percentual: (stats.corretas / stats.total) * 100
    }));
      
    return {
      aluno,
      total_questoes: scores.length,
      questoes_corretas: totalCorretas,
      percentual_acerto: (totalCorretas / scores.length) * 100,
      por_disciplina: porDisciplina
    }
  }

  async getEstatisticasTurma(turmaId: string, provaoId?: string): Promise<EstatisticasTurma> {
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('*, serie:series(*, escola:escolas(*)), matriculas(aluno:alunos(*))')
      .eq('id', turmaId)
      .single();
  
    if (turmaError || !turma) {
      console.error('Erro ao buscar turma para estatísticas:', turmaError);
      throw new Error('Turma não encontrada');
    }
  
    const alunos = (turma.matriculas as any[]).map((m: any) => m.aluno).filter(Boolean);
    const alunoIds = alunos.map((a: Aluno) => a.id);
  
    const emptyStats = {
      turma: turma as any,
      total_alunos: alunos.length,
      media_geral: 0,
      por_provao: []
    };
  
    if (alunoIds.length === 0) {
      return emptyStats;
    }
  
    let scoresQuery = supabase
      .from('scores')
      .select('*, questao:questoes(*, gabarito:gabaritos(*))')
      .in('aluno_id', alunoIds);
      
    if (provaoId) {
        const { data: questoesProvao, error: questoesError } = await supabase.from('questoes').select('id').eq('provao_id', provaoId);
        if (questoesError) throw new Error('Falha ao buscar questões do provão para estatísticas da turma');
        const questaoIds = questoesProvao.map(q => q.id);
        scoresQuery = scoresQuery.in('questao_id', questaoIds);
    }
  
    const { data: allScores, error: scoresError } = await scoresQuery;
  
    if (scoresError) {
      console.error('Erro ao buscar scores da turma:', scoresError);
      throw new Error('Falha ao buscar scores da turma');
    }
    if (!allScores || allScores.length === 0) return emptyStats;
  
    const statsPorAluno = new Map<string, { corretas: number; total: number }>();

    allScores.forEach((score: any) => {
        const questao = score.questao;
        const gabarito = questao?.gabarito?.[0];
        const alunoId = score.aluno_id;

        if (!statsPorAluno.has(alunoId)) statsPorAluno.set(alunoId, { corretas: 0, total: 0 });

        const alunoStats = statsPorAluno.get(alunoId)!;
        alunoStats.total++;

        if (gabarito && score.resposta === gabarito.resposta_correta) {
            alunoStats.corretas++;
        }
    });

    const alunosComStats = Array.from(statsPorAluno.entries())
      .filter(([_, stats]) => stats.total > 0)
      .map(([_, stats]) => (stats.corretas / stats.total) * 100);

    const mediaGeral = alunosComStats.length > 0
      ? alunosComStats.reduce((acc, curr) => acc + curr, 0) / alunosComStats.length
      : 0;
  
    return {
      turma: turma as any,
      total_alunos: alunos.length,
      media_geral: mediaGeral,
      por_provao: [] // Implementar se necessário
    };
  }
}

// Exporta uma instância única do serviço (Singleton)
export const dbService = new DatabaseService()
export default dbService
