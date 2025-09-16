
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import { dbService } from './services/dbService';

function App() {
  // The dbService no longer needs client-side initialization
  // React.useEffect(() => {
  //   dbService.initialize();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inserir-dados" element={<InsertDataPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; 2025 Secretaria de Educação Brumadinho - Versão Protótipo</p>
      </footer>
    </div>
  );
}

export default App;
