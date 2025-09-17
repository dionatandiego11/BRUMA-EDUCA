export interface Score {
  id: string;
  school: string;
  grade: string;
  student: string;
  teacher: string;
  subject: string;
  questionCode: string;
  score: number; // 1 for correct, 0 for incorrect
  date: string;
}

export interface ChartData {
  name: string;
  averageScore: number;
}

// --- Novas Estruturas de Dados ---

export interface Escola {
  id: string;
  nome: string;
}

export interface Serie {
  id: string;
  nome: string;
  escolaId: string;
}

export interface Turma {
  id: string;
  nome: string;
  serieId: string;
  professorIds: string[];
}

export interface Professor {
  id: string;
  nome: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
}

export interface Matricula {
  id: string;
  alunoId: string;
  turmaId: string;
}

export type Disciplina = 'Português' | 'Matemática';

export interface Provao {
  id: string;
  nome: string;
  turmaId: string;
  data: string;
}

export interface Questao {
  id: string;
  provaoId: string;
  disciplina: Disciplina;
  descricao: string;
  habilidade_codigo: string;
}

export type Alternativa = 'A' | 'B' | 'C' | 'D';

export interface Gabarito {
  id: string;
  questaoId: string;
  respostaCorreta: Alternativa;
}
