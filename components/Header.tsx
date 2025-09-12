
import React from 'react';
import type { Page } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const navItemClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out";
  const activeClasses = "bg-blue-600 text-white";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-800";

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-5.247-8.991l10.494 0M4.753 12h14.494" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800 ml-3">Sistema Escolar</h1>
          </div>
          <nav className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentPage('data-entry')}
              className={`${navItemClasses} ${currentPage === 'data-entry' ? activeClasses : inactiveClasses}`}
            >
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Lançar Notas
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`${navItemClasses} ${currentPage === 'reports' ? activeClasses : inactiveClasses}`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Relatórios
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
