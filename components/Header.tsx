
import React from 'react';
import { Link } from 'react-router-dom';

const GraduationCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 011.056 0l4 2a1 1 0 001.056 0l4-2a.999.999 0 011.056 0l2.606-1.302a1 1 0 000-1.84l-7-3zM3.25 9.344L10 12.5l6.75-3.156L10 6.188 3.25 9.344z" />
      <path d="M5 10.5a1 1 0 00-1 1v3a1 1 0 001 1h10a1 1 0 001-1v-3a1 1 0 00-1-1h-1.75a.75.75 0 00-.75.75V13h-1.5v-1.75a.75.75 0 00-.75-.75H9.5V13H8v-1.75a.75.75 0 00-.75-.75H5.5V13H4v-1.75a.75.75 0 00-.75-.75H1.5a1 1 0 00-1 1v3a1 1 0 001 1h.25a.75.75 0 00.75-.75V13.5h1.5v1.25a.75.75 0 00.75.75h9.5a.75.75 0 00.75-.75V13.5h1.5v1.25a.75.75 0 00.75.75h.25a1 1 0 001-1v-3a1 1 0 00-1-1H5z" />
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-primary shadow-md">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <GraduationCapIcon />
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Sistema de Avaliação de Desempenho
          </h1>
        </Link>
        <div className="space-x-4 text-white font-medium">
          <Link to="/" className="hover:text-sky-200 transition-colors">Home</Link>
          <Link to="/inserir-dados" className="hover:text-sky-200 transition-colors">Inserir Dados</Link>
          <Link to="/resultados" className="hover:text-sky-200 transition-colors">Resultados</Link>
          <Link to="/admin" className="bg-sky-700 hover:bg-sky-800 transition-colors rounded-md px-3 py-2">Admin</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
