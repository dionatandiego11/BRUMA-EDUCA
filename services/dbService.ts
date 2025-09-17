import {
  Score,
  Escola,
  Serie,
  Turma,
  Professor,
  Aluno,
  Matricula,
  Provao,
  Questao,
  Gabarito,
  Disciplina,
  Alternativa,
} from '../types';

const DB_KEY = 'brumaEducaDB';

interface BrumaEducaDB {
  escolas: Escola[];
  series: Serie[];
  turmas: Turma[];
  professores: Professor[];
  alunos: Aluno[];
  matriculas: Matricula[];
  provoes: Provao[];
  questoes: Questao[];
  gabaritos: Gabarito[];
  scores: Score[];
}

const getDB = (): BrumaEducaDB => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {
      escolas: [],
      series: [],
      turmas: [],
      professores: [],
      alunos: [],
      matriculas: [],
      provoes: [],
      questoes: [],
      gabaritos: [],
      scores: [],
    };
  } catch (error) {
    console.error("Failed to retrieve DB from localStorage", error);
    return {
      escolas: [],
      series: [],
      turmas: [],
      professores: [],
      alunos: [],
      matriculas: [],
      provoes: [],
      questoes: [],
      gabaritos: [],
      scores: [],
    };
  }
};

const saveDB = (db: BrumaEducaDB): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Failed to save DB to localStorage", error);
  }
};

const initialize = (): void => {
  const db = getDB();
  // Check if DB is already initialized
  if (db.escolas.length > 0) {
    return;
  }

  // Seed data
  const prof1: Professor = { id: 'prof1', nome: 'Doriedson' };
  const prof2: Professor = { id: 'prof2', nome: 'Victor' };
  const prof3: Professor = { id: 'prof3', nome: 'Taynara' };
  db.professores.push(prof1, prof2, prof3);

  const escola1: Escola = { id: 'esc1', nome: 'E.M. Lucas Marciano Da Silva' };
  db.escolas.push(escola1);

  const serie1: Serie = { id: 'serie1', nome: '8º Ano', escolaId: 'esc1' };
  const serie2: Serie = { id: 'serie2', nome: '6º Ano', escolaId: 'esc1' };
  db.series.push(serie1, serie2);

  const turma1: Turma = { id: 'turma1', nome: 'Turma 1', serieId: 'serie1', professorIds: ['prof1', 'prof2'] };
  const turma2: Turma = { id: 'turma2', nome: 'Turma 2', serieId: 'serie1', professorIds: ['prof3', 'prof2'] };
  db.turmas.push(turma1, turma2);

  const aluno1: Aluno = { id: 'aluno1', nome: 'Aleph Zapata Pereira Alvarenga' };
  const aluno2: Aluno = { id: 'aluno2', nome: 'Beatriz Martins' };
  const aluno3: Aluno = { id: 'aluno3', nome: 'Ana Beatriz Damasceno De Jesus' };
  db.alunos.push(aluno1, aluno2, aluno3);

  db.matriculas.push({ id: 'mat1', alunoId: 'aluno1', turmaId: 'turma1' });
  db.matriculas.push({ id: 'mat2', alunoId: 'aluno2', turmaId: 'turma1' });
  db.matriculas.push({ id: 'mat3', alunoId: 'aluno3', turmaId: 'turma2' });

  saveDB(db);
};

// --- Generic Add Item ---
const addItem = <T extends { id: string }>(db: BrumaEducaDB, table: keyof BrumaEducaDB, item: Omit<T, 'id'>): T => {
  const newItem = { ...item, id: new Date().getTime().toString() } as T;
  (db[table] as T[]).push(newItem);
  saveDB(db);
  return newItem;
};


// --- Service Functions ---

// Getters
const getEscolas = (): Escola[] => getDB().escolas;
const getSeriesByEscola = (escolaId: string): Serie[] => getDB().series.filter(s => s.escolaId === escolaId);
const getProvoesByTurma = (turmaId: string): Provao[] => getDB().provoes.filter(p => p.turmaId === turmaId);
const getQuestoesByProvao = (provaoId: string): Questao[] => getDB().questoes.filter(q => q.provaoId === provaoId);
const getGabaritoByQuestao = (questaoId: string): Gabarito | undefined => getDB().gabaritos.find(g => g.questaoId === questaoId);
const getTurmasBySerie = (serieId: string): Turma[] => getDB().turmas.filter(t => t.serieId === serieId);
const getAlunosByTurma = (turmaId: string): Aluno[] => {
  const db = getDB();
  const matriculas = db.matriculas.filter(m => m.turmaId === turmaId);
  const alunoIds = matriculas.map(m => m.alunoId);
  return db.alunos.filter(a => alunoIds.includes(a.id));
};
const getProfessores = (): Professor[] => getDB().professores;
const getProfessoresByTurma = (turmaId: string): Professor[] => {
    const db = getDB();
    const turma = db.turmas.find(t => t.id === turmaId);
    if (!turma) return [];
    return db.professores.filter(p => turma.professorIds.includes(p.id));
}
const getAlunos = (): Aluno[] => getDB().alunos;

// Adders
const addEscola = (item: Omit<Escola, 'id'>) => addItem<Escola>(getDB(), 'escolas', item);
const addSerie = (item: Omit<Serie, 'id'>) => addItem<Serie>(getDB(), 'series', item);
const addTurma = (item: Omit<Turma, 'id'>) => addItem<Turma>(getDB(), 'turmas', item);
const addProfessor = (item: Omit<Professor, 'id'>) => addItem<Professor>(getDB(), 'professores', item);
const addAluno = (item: Omit<Aluno, 'id'>) => addItem<Aluno>(getDB(), 'alunos', item);
const addMatricula = (item: Omit<Matricula, 'id'>) => addItem<Matricula>(getDB(), 'matriculas', item);
const addProvao = (item: Omit<Provao, 'id'>) => addItem<Provao>(getDB(), 'provoes', item);
const addQuestao = (item: Omit<Questao, 'id'>) => addItem<Questao>(getDB(), 'questoes', item);
const addGabarito = (item: Omit<Gabarito, 'id'>) => addItem<Gabarito>(getDB(), 'gabaritos', item);

const updateTurma = (turmaId: string, updates: Partial<Turma>): Turma | undefined => {
  const db = getDB();
  const index = db.turmas.findIndex(t => t.id === turmaId);
  if (index > -1) {
    db.turmas[index] = { ...db.turmas[index], ...updates };
    saveDB(db);
    return db.turmas[index];
  }
  return undefined;
};

// --- Compatibility Functions ---
const getScores = (): Score[] => getDB().scores;
const addScore = (data: Omit<Score, 'id' | 'date'>): Score => {
  const db = getDB();
  const newScore: Score = {
    ...data,
    id: new Date().getTime().toString(),
    date: new Date().toISOString(),
  };
  db.scores.push(newScore);
  saveDB(db);
  return newScore;
};


export const dbService = {
  initialize,
  // New getters
  getEscolas,
  getSeriesByEscola,
  getTurmasBySerie,
  getProvoesByTurma,
  getQuestoesByProvao,
  getGabaritoByQuestao,
  getAlunosByTurma,
  getProfessores,
  getProfessoresByTurma,
  getAlunos,
  // New adders
  addEscola,
  addSerie,
  addTurma,
  addProfessor,
  addAluno,
  addMatricula,
  addProvao,
  addQuestao,
  addGabarito,
  updateTurma,
  // Compatibility
  getScores,
  addScore,
};
