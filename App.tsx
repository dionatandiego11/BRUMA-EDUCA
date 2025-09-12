
import React, { useState } from 'react';
import Header from './components/Header';
import DataEntryPage from './pages/DataEntryPage';
import ReportsPage from './pages/ReportsPage';
import { useSchoolData } from './hooks/useSchoolData';
import type { Page } from './types';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('reports');
  const { 
    classes, 
    students, 
    subjects, 
    grades, 
    addGrade, 
    loading, 
    error 
  } = useSchoolData();

  const renderPage = () => {
    switch (currentPage) {
      case 'data-entry':
        return <DataEntryPage 
                  classes={classes} 
                  students={students} 
                  subjects={subjects} 
                  addGrade={addGrade} 
                  grades={grades}
                />;
      case 'reports':
        return <ReportsPage 
                  classes={classes} 
                  students={students} 
                  subjects={subjects} 
                  grades={grades} 
                />;
      default:
        return <ReportsPage 
                  classes={classes} 
                  students={students} 
                  subjects={subjects} 
                  grades={grades} 
                />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="p-4 sm:p-6 md:p-8">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}
        {!loading && !error && renderPage()}
      </main>
    </div>
  );
};

export default App;
