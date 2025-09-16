const BASE_URL = 'http://localhost:3000/api';

// Helper function for handling API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `API request failed with status ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

// --- Generic API Functions ---

async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  return handleResponse<T>(response);
}

async function post<T>(endpoint:string, body: object): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

// --- Data-specific Functions ---

// Schools
const getSchools = () => get<any[]>('/schools');
const addSchool = (name: string) => post<any>('/schools', { name });

// Grades
const getAllGrades = () => get<any[]>('/grades/all');
const getGradesBySchool = (schoolId: number) => get<any[]>(`/grades?school_id=${schoolId}`);
const addGrade = (name: string, schoolId: number) => post<any>('/grades', { name, school_id: schoolId });

// Classes
const getAllClasses = () => get<any[]>('/classes/all');
const getClassesByGrade = (gradeId: number) => get<any[]>(`/classes?grade_id=${gradeId}`);
const addClass = (name: string, gradeId: number) => post<any>('/classes', { name, grade_id: gradeId });

// Students
const getStudentsByClass = (classId: number) => get<any[]>(`/students?class_id=${classId}`);
const addStudent = (name: string, classId: number) => post<any>('/students', { name, class_id: classId });

// Teachers
const getTeachers = () => get<any[]>('/teachers');
const addTeacher = (name: string) => post<any>('/teachers', { name });

// Subjects
const getSubjects = () => get<any[]>('/subjects');
const addSubject = (name: string) => post<any>('/subjects', { name });

// Scores
const getScores = () => get<any[]>('/scores');
const addScore = (scoreData: object) => post<any>('/scores', scoreData);


export const dbService = {
  getSchools,
  addSchool,
  getAllGrades,
  getGradesBySchool,
  addGrade,
  getClassesByGrade,
  getAllClasses,
  addClass,
  getStudentsByClass,
  addStudent,
  getTeachers,
  addTeacher,
  getSubjects,
  addSubject,
  getScores,
  addScore,
};
