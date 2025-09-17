
import { Score, Prova } from '../types';

const DB_KEY = 'studentScoresDB';
const TESTS_DB_KEY = 'provasDB';

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
            questions: ['P01-Interpretação', 'P02-Gramática', 'P03-Ortografia', 'EF69LP42', 'EF05LP07', 'EF35LP26', 'EF69LP54', 'EF08LP13'],
        },
        {
            name: 'Matemática',
            questions: ['M01-Adição', 'M02-Subtração', 'M03-Geometria', 'EF07MA01A', 'EF07MA03', 'EF07MA40MG', 'EF05MA14', 'EF05MA15'],
        },
    ],
};


const getScores = (): Score[] => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve scores from localStorage", error);
    return [];
  }
};

const saveScores = (scores: Score[]): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error("Failed to save scores to localStorage", error);
  }
};

const getTests = (): Prova[] => {
    try {
      const data = localStorage.getItem(TESTS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to retrieve tests from localStorage", error);
      return [];
    }
  };

  const saveTests = (tests: Prova[]): void => {
    try {
      localStorage.setItem(TESTS_DB_KEY, JSON.stringify(tests));
    } catch (error) {
      console.error("Failed to save tests to localStorage", error);
    }
  };

  const addTest = (data: Omit<Prova, 'id'>): Prova => {
    const tests = getTests();
    const newTest: Prova = {
      ...data,
      id: new Date().getTime().toString(),
    };
    const updatedTests = [...tests, newTest];
    saveTests(updatedTests);
    return newTest;
  };

const initialize = (): void => {
  const scores = getScores();
  if (scores.length === 0) {
    // Add some mock data if the DB is empty
    const mockData: Score[] = [
      { id: '1', school: 'Escola Modelo A', grade: '5º Ano', student: 'João Silva', teacher: 'Prof. Ana Ribeiro', subject: 'Matemática', questionCode: 'M01-Adição', answer: 'A', testId: '1', date: new Date().toISOString() },
      { id: '2', school: 'Escola Modelo A', grade: '5º Ano', student: 'João Silva', teacher: 'Prof. Ana Ribeiro', subject: 'Matemática', questionCode: 'M02-Subtração', answer: 'C', testId: '1', date: new Date().toISOString() },
      { id: '3', school: 'Escola Modelo A', grade: '5º Ano', student: 'Maria Souza', teacher: 'Prof. Ana Ribeiro', subject: 'Português', questionCode: 'P01-Interpretação', answer: 'B', testId: '2', date: new Date().toISOString() },
    ];
    saveScores(mockData);
  }

  const tests = getTests();
  if (tests.length === 0) {
      const mockTests: Prova[] = [
          {
              id: '1',
              name: 'Matemática 5º Ano - 1º Bimestre',
              discipline: 'Matemática',
              questions: [
                  { code: 'M01-Adição', answer: 'A'},
                  { code: 'M02-Subtração', answer: 'B'}
              ]
          },
          {
            id: '2',
            name: 'Português 5º Ano - 1º Bimestre',
            discipline: 'Português',
            questions: [
                { code: 'P01-Interpretação', answer: 'B'},
                { code: 'P02-Gramática', answer: 'D'}
            ]
        }
      ];
      saveTests(mockTests);
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

const getUniqueValues = (key: keyof Score): (string | number)[] => {
    const scores = getScores();
    const values = scores.map(score => score[key]);
    return [...new Set(values)]
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

const getSubjects = () => systemData.subjects.map(s => s.name) as ('Matemática' | 'Português')[];

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
  getTests,
  addTest
};
