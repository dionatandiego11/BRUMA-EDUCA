
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';
import { dbService } from './services/dbService';

function App() {
  // Initialize the mock database on app load
  React.useEffect(() => {
    dbService.initialize();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inserir-dados" element={<InsertDataPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
        </Routes>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; 2024 Secretaria de Educação - Versão Protótipo</p>
      </footer>
    </div>
  );
}

export default App;
