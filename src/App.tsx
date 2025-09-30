// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Instale: npm i react-router-dom @types/react-router-dom

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';
import CreateProvaoPage from './pages/CreateProvaoPage';

export type Page = 'home' | 'admin' | 'insert' | 'results' | 'createProvao';

// Componente para proteger rotas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Conteúdo principal da aplicação
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage onNavigate={setCurrentPage} />;
      case 'insert':
        return <InsertDataPage onNavigate={setCurrentPage} />;
      case 'results':
        return <ResultsPage onNavigate={setCurrentPage} />;
      case 'createProvao':
        return <CreateProvaoPage onNavigate={setCurrentPage} />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rota protegida principal */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="antialiased text-slate-800">{renderPage()}</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

// App com AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
