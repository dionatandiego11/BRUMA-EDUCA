
export interface Prova {
  id: string;
  name: string;
  discipline: 'Matemática' | 'Português';
  questions: {
    code: string;
    answer: 'A' | 'B' | 'C' | 'D';
  }[];
}

export interface Score {
  id:string;
  school: string;
  grade: string;
  student: string;
  teacher: string;
  subject: string;
  questionCode: string;
  answer: string; // 'A', 'B', 'C', or 'D'
  testId: string;
  date: string;
}

export interface ChartData {
  name: string;
  averageScore: number;
}
