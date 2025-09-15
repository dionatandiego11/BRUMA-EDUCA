
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
