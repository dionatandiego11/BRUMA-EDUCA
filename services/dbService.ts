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
  // To re-seed, clear localStorage by calling: localStorage.removeItem('brumaEducaDB');
  if (db.escolas.length > 0) {
    return;
  }

  // --- 1. Professors ---
  const profDoriedson: Professor = { id: 'prof1', nome: 'Doriedson' };
  const profAlessandra: Professor = { id: 'prof2', nome: 'Alessandra' };
  db.professores.push(profDoriedson, profAlessandra);

  // --- 2. School ---
  const escola: Escola = { id: 'esc1', nome: 'ESCOLA MUNICIPAL "LUCAS MARCIANO DA SILVA"' };
  db.escolas.push(escola);

  // --- 3. Series / Grade ---
  const serie6ano: Serie = { id: 'serie1', nome: '6º ano', escolaId: escola.id };
  db.series.push(serie6ano);

  // --- 4. Turma / Class ---
  const turma1: Turma = {
    id: 'turma1',
    nome: '1',
    serieId: serie6ano.id,
    professorIds: [profDoriedson.id, profAlessandra.id]
  };
  db.turmas.push(turma1);

  // --- 5. Alunos / Students ---
  const studentsData = [
    { matricula: '1496', nome: 'Álvaro Eduardo Menezes Souza' },
    { matricula: '5476', nome: 'Aquiles Braga Oliveira' },
    { matricula: '4929', nome: 'Bruno Deivid De Jesus Ferreira Santos' },
    { matricula: 'N/A', nome: 'Camile Ariane Souza Maia' },
    { matricula: '1393', nome: 'Érika Batista Da Silva' },
    { matricula: '13940', nome: 'Gabrielle Lopes Nogueira' },
    { matricula: '14626', nome: 'Gabrielly Vitoria Cimiano Da Costa' },
    { matricula: '1312', nome: 'Jhennyfer Márcia Rodrigues Silva' },
    { matricula: '15387', nome: 'João Pedro Amorim Pereira' },
    { matricula: '1414', nome: 'Laura Bianca Cruz Jardim' },
    { matricula: '1320', nome: 'Leticia Pires Martins' },
    { matricula: '5578', nome: 'Lourdes Maria Alves Santos' },
    { matricula: '4890', nome: 'Luciano Júnio Ribeiro Melo' },
    { matricula: '17081', nome: 'Milena Lopes De Oliveira' },
    { matricula: '1373', nome: 'Raissa Karolaine Silva Freitas' },
    { matricula: '5475', nome: 'Sophia Emanuelly Silva' },
    { matricula: '1445', nome: 'Sthefany Martins Batista' },
    { matricula: '6133', nome: 'Verônica Gabrielle Silva Oliveira' },
    { matricula: '1274', nome: 'Wryel Celso Esperendeus Parreiras' }
  ];

  const alunos = studentsData.map((data, index) => {
    const aluno: Aluno = { id: `aluno${index + 1}`, nome: data.nome, matricula: data.matricula };
    db.alunos.push(aluno);
    return aluno;
  });

  // --- 6. Matriculas / Enrollments ---
  alunos.forEach((aluno, index) => {
    const matricula: Matricula = { id: `mat${index + 1}`, alunoId: aluno.id, turmaId: turma1.id };
    db.matriculas.push(matricula);
  });

  // --- 7. Provao / Test ---
  const provao: Provao = {
    id: 'provao1',
    nome: 'Avaliação Diagnóstica - 1º Bimestre',
    turmaId: turma1.id,
    data: new Date().toISOString()
  };
  db.provoes.push(provao);

  // --- 8. Questoes e Gabaritos / Questions and Answer Keys ---
  const gabaritoMatematica: Alternativa[] = ['C', 'D', 'D', 'B', 'D', 'B', 'C', 'C', 'C', 'B', 'B', 'A', 'C', 'C', 'C', 'D', 'D', 'A', 'D', 'B'];
  const gabaritoPortugues: Alternativa[] = ['B', 'B', 'C', 'B', 'C', 'D', 'A', 'B', 'B', 'C', 'D', 'A', 'B', 'A', 'C', 'A', 'A', 'D', 'A', 'C'];

  let questaoIdCounter = 1;

  // Matemática
  gabaritoMatematica.forEach((resposta, index) => {
    const questao: Questao = {
      id: `q${questaoIdCounter}`,
      provaoId: provao.id,
      disciplina: 'Matemática',
      descricao: `Questão ${index + 1} de Matemática`,
      habilidade_codigo: `M${String(index + 1).padStart(2, '0')}`
    };
    db.questoes.push(questao);

    const gabarito: Gabarito = {
      id: `gab${questaoIdCounter}`,
      questaoId: questao.id,
      respostaCorreta: resposta
    };
    db.gabaritos.push(gabarito);
    questaoIdCounter++;
  });

  // Língua Portuguesa
  gabaritoPortugues.forEach((resposta, index) => {
    const questao: Questao = {
      id: `q${questaoIdCounter}`,
      provaoId: provao.id,
      disciplina: 'Português',
      descricao: `Questão ${index + 1} de Língua Portuguesa`,
      habilidade_codigo: `P${String(index + 1).padStart(2, '0')}`
    };
    db.questoes.push(questao);

    const gabarito: Gabarito = {
      id: `gab${questaoIdCounter}`,
      questaoId: questao.id,
      respostaCorreta: resposta
    };
    db.gabaritos.push(gabarito);
    questaoIdCounter++;
  });

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
