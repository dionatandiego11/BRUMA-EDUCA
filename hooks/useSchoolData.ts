
import { useState, useEffect, useCallback } from 'react';
import type { SchoolClass, Student, Subject, Grade } from '../types';
import { fetchClasses, fetchStudents, fetchSubjects, fetchGrades, saveGrade } from '../services/api';

export const useSchoolData = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesData, studentsData, subjectsData, gradesData] = await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchSubjects(),
        fetchGrades(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
      setSubjects(subjectsData);
      setGrades(gradesData);
    } catch (err) {
      setError('Falha ao carregar os dados da escola.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addGrade = useCallback(async (newGradeData: Omit<Grade, 'id'>) => {
    try {
      const savedGrade = await saveGrade(newGradeData);
      setGrades(prevGrades => {
          const existingIndex = prevGrades.findIndex(g => g.studentId === savedGrade.studentId && g.subjectId === savedGrade.subjectId);
          if (existingIndex !== -1) {
              const updatedGrades = [...prevGrades];
              updatedGrades[existingIndex] = savedGrade;
              return updatedGrades;
          }
          return [...prevGrades, savedGrade];
      });
    } catch (err) {
      setError('Falha ao salvar a nota.');
      console.error(err);
      throw err; // Re-throw to be caught in the component
    }
  }, []);

  return { classes, students, subjects, grades, loading, error, addGrade, refreshData: loadData };
};
