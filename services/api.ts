
import type { SchoolClass, Student, Subject, Grade } from '../types';

// --- MOCK DATABASE ---
const mockClasses: SchoolClass[] = [
  { id: 'c1', name: 'Turma 101' },
  { id: 'c2', name: 'Turma 202' },
  { id: 'c3', name: 'Turma 303' },
];

const mockStudents: Student[] = [
  { id: 's1', name: 'Ana Silva', classId: 'c1' },
  { id: 's2', name: 'Bruno Costa', classId: 'c1' },
  { id: 's3', name: 'Carla Dias', classId: 'c1' },
  { id: 's4', name: 'Daniel Alves', classId: 'c2' },
  { id: 's5', name: 'Eduarda Lima', classId: 'c2' },
  { id: 's6', name: 'Felipe Souza', classId: 'c3' },
];

const mockSubjects: Subject[] = [
  { id: 'sub1', name: 'Matemática' },
  { id: 'sub2', name: 'Português' },
  { id: 'sub3', name: 'Ciências' },
  { id: 'sub4', name: 'História' },
];

let mockGrades: Grade[] = [
  { id: 'g1', studentId: 's1', subjectId: 'sub1', grade: 8.5 },
  { id: 'g2', studentId: 's1', subjectId: 'sub2', grade: 9.0 },
  { id: 'g3', studentId: 's1', subjectId: 'sub3', grade: 7.0 },
  { id: 'g4', studentId: 's2', subjectId: 'sub1', grade: 6.5 },
  { id: 'g5', studentId: 's2', subjectId: 'sub2', grade: 7.5 },
  { id: 'g6', studentId: 's2', subjectId: 'sub3', grade: 8.0 },
  { id: 'g7', studentId: 's3', subjectId: 'sub1', grade: 9.5 },
  { id: 'g8', studentId: 's3', subjectId: 'sub2', grade: 9.2 },
  { id: 'g9', studentId: 's4', subjectId: 'sub1', grade: 5.0 },
  { id: 'g10', studentId: 's4', subjectId: 'sub4', grade: 6.0 },
  { id: 'g11', studentId: 's5', subjectId: 'sub1', grade: 10.0 },
  { id: 'g12', studentId: 's5', subjectId: 'sub4', grade: 9.5 },
];
// --- END MOCK DATABASE ---

const simulateNetworkDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 500));
};

export const fetchClasses = (): Promise<SchoolClass[]> => {
  return simulateNetworkDelay(mockClasses);
};

export const fetchStudents = (): Promise<Student[]> => {
  return simulateNetworkDelay(mockStudents);
};

export const fetchSubjects = (): Promise<Subject[]> => {
  return simulateNetworkDelay(mockSubjects);
};

export const fetchGrades = (): Promise<Grade[]> => {
  return simulateNetworkDelay(mockGrades);
};

export const saveGrade = (newGrade: Omit<Grade, 'id'>): Promise<Grade> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check for existing grade for the same student and subject
      const existingGradeIndex = mockGrades.findIndex(
        g => g.studentId === newGrade.studentId && g.subjectId === newGrade.subjectId
      );

      const gradeWithId: Grade = { ...newGrade, id: `g${Date.now()}` };

      if (existingGradeIndex !== -1) {
        // Update existing grade
        mockGrades[existingGradeIndex] = { ...mockGrades[existingGradeIndex], grade: newGrade.grade };
         resolve(mockGrades[existingGradeIndex]);
      } else {
        // Add new grade
        mockGrades.push(gradeWithId);
        resolve(gradeWithId);
      }
    }, 500);
  });
};
