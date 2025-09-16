
import { Score } from '../types';

const DB_KEY = 'studentScoresDB';

// This service simulates a SQLite database using localStorage for prototyping purposes.
// In a real application, this would be replaced with actual API calls to a backend.

const systemData = {
    schools: [
        {
            name: 'Escola Modelo A',
            grades: [
                {
                    name: '5º Ano',
                    students: ['João Silva', 'Maria Souza'],
                    teachers: ['Prof. Ana Ribeiro'],
                },
                {
                    name: '6º Ano',
                    students: ['Ana Costa'],
                    teachers: ['Prof. Carlos Lima'],
                },
            ],
        },
        {
            name: 'Escola Modelo B',
            grades: [
                {
                    name: '5º Ano',
                    students: ['Carlos Pereira'],
                    teachers: ['Prof. Beatriz Santos'],
                },
                {
                    name: '6º Ano',
                    students: ['Pedro Martins'],
                    teachers: ['Prof. Daniel Alves'],
                },
            ],
        },
        {
            name: 'Escola Inovadora C',
            grades: [
                {
                    name: '5º Ano',
                    students: ['Luisa Andrade'],
                    teachers: ['Prof. Eliana Fernandes'],
                },
            ],
        },
    ],
    subjects: [
        {
            name: 'Português',
            questions: ['P01-Interpretação', 'P02-Gramática', 'P03-Ortografia'],
        },
        {
            name: 'Matemática',
            questions: ['M01-Adição', 'M02-Subtração', 'M03-Geometria'],
        },
    ],
};


const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getScores = (): Score[] => {
  if (!isBrowser) return [];
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve scores from localStorage", error);
    return [];
  }
};

const saveScores = (scores: Score[]): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error("Failed to save scores to localStorage", error);
  }
};

const initialize = (): void => {
  const scores = getScores();
  if (scores.length === 0) {
    // Add some mock data if the DB is empty
    const mockData: Score[] = [
      { id: '1', school: 'Escola Modelo A', grade: '5º Ano', student: 'João Silva', teacher: 'Prof. Ana Ribeiro', subject: 'Matemática', questionCode: 'M01-Adição', score: 1, date: new Date().toISOString() },
      { id: '2', school: 'Escola Modelo A', grade: '5º Ano', student: 'João Silva', teacher: 'Prof. Ana Ribeiro', subject: 'Matemática', questionCode: 'M02-Subtração', score: 0, date: new Date().toISOString() },
      { id: '3', school: 'Escola Modelo A', grade: '5º Ano', student: 'Maria Souza', teacher: 'Prof. Ana Ribeiro', subject: 'Português', questionCode: 'P01-Interpretação', score: 1, date: new Date().toISOString() },
      { id: '4', school: 'Escola Modelo B', grade: '6º Ano', student: 'Pedro Martins', teacher: 'Prof. Daniel Alves', subject: 'Matemática', questionCode: 'M03-Geometria', score: 1, date: new Date().toISOString() },
      { id: '5', school: 'Escola Inovadora C', grade: '5º Ano', student: 'Luisa Andrade', teacher: 'Prof. Eliana Fernandes', subject: 'Português', questionCode: 'P02-Gramática', score: 0, date: new Date().toISOString() },
      { id: '6', school: 'Escola Inovadora C', grade: '5º Ano', student: 'Luisa Andrade', teacher: 'Prof. Eliana Fernandes', subject: 'Português', questionCode: 'P03-Ortografia', score: 1, date: new Date().toISOString() },
    ];
    saveScores(mockData);
  }
};

const addScore = (data: Omit<Score, 'id' | 'date'>): Score => {
  const scores = getScores();
  const newScore: Score = {
    ...data,
    id: new Date().getTime().toString(),
    date: new Date().toISOString(),
  };
  const updatedScores = [...scores, newScore];
  saveScores(updatedScores);
  return newScore;
};

const getUniqueValues = (key: keyof Score): string[] => {
    const scores = getScores();
    const values = scores.map(score => score[key]);
    return [...new Set(values)] as string[];
};

const getSchools = () => systemData.schools.map(s => s.name);

const getGradesBySchool = (schoolName: string) => {
    const school = systemData.schools.find(s => s.name === schoolName);
    return school ? school.grades.map(g => g.name) : [];
};

const getStudentsByGradeAndSchool = (schoolName: string, gradeName: string) => {
    const school = systemData.schools.find(s => s.name === schoolName);
    const grade = school?.grades.find(g => g.name === gradeName);
    return grade ? grade.students : [];
};

const getTeachersByGradeAndSchool = (schoolName: string, gradeName: string) => {
    const school = systemData.schools.find(s => s.name === schoolName);
    const grade = school?.grades.find(g => g.name === gradeName);
    return grade ? grade.teachers : [];
};

const getSubjects = () => systemData.subjects.map(s => s.name);

const getQuestionsBySubject = (subjectName: string) => {
    const subject = systemData.subjects.find(s => s.name === subjectName);
    return subject ? subject.questions : [];
};

export const dbService = {
  initialize,
  getScores,
  addScore,
  getUniqueValues,
  getSchools,
  getGradesBySchool,
  getStudentsByGradeAndSchool,
  getTeachersByGradeAndSchool,
  getSubjects,
  getQuestionsBySubject,
};
