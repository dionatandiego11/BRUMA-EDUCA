// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';
import CreateProvaoPage from './pages/CreateProvaoPage';
import Layout from './components/Layout'; // Um novo componente de Layout que será criado

const App: React.FC = () => {
  return (
    <div className="antialiased text-slate-800">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
        <Route path="/provas" element={<Layout><CreateProvaoPage /></Layout>} />
        <Route path="/inserir-dados" element={<Layout><InsertDataPage /></Layout>} />
        <Route path="/resultados" element={<Layout><ResultsPage /></Layout>} />
      </Routes>
    </div>
  );
};

export default App;