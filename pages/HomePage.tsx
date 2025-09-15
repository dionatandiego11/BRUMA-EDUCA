
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const DocumentAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Bem-vindo ao Sistema de Avaliação</h2>
      <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-12">
        Utilize as ferramentas abaixo para registrar novas avaliações de alunos ou para analisar os dados de desempenho existentes através de gráficos interativos.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link to="/inserir-dados" className="group">
          <Card>
            <DocumentAddIcon />
            <h3 className="text-2xl font-semibold mb-2 text-slate-800">Inserir Dados</h3>
            <p className="text-slate-500 mb-4">
              Clique aqui para registrar as notas e informações das avaliações dos alunos.
            </p>
            <div className="flex items-center justify-center text-primary font-semibold group-hover:underline">
              <span>Começar Inserção</span>
              <ArrowRightIcon />
            </div>
          </Card>
        </Link>
        <Link to="/resultados" className="group">
          <Card>
            <ChartBarIcon />
            <h3 className="text-2xl font-semibold mb-2 text-slate-800">Ver Resultados</h3>
            <p className="text-slate-500 mb-4">
              Acesse os gráficos e relatórios para visualizar o desempenho por escola, série ou aluno.
            </p>
            <div className="flex items-center justify-center text-primary font-semibold group-hover:underline">
               <span>Analisar Desempenho</span>
               <ArrowRightIcon />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
