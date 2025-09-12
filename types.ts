
export interface SchoolClass {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name:string;
  classId: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  grade: number;
}

export type Page = 'data-entry' | 'reports';
