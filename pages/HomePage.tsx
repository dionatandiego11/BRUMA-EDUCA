
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

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
            <h3 className="text-2xl font-semibold mb-2 text-slate-800">Inserir Dados de Alunos</h3>
            <p className="text-slate-500 mb-4">
              Clique aqui para registrar as respostas das avaliações dos alunos.
            </p>
            <div className="flex items-center justify-center text-primary font-semibold group-hover:underline">
              <span>Lançar Resultados</span>
              <ArrowRightIcon />
            </div>
          </Card>
        </Link>
        <Link to="/resultados" className="group">
          <Card>
            <ChartBarIcon />
            <h3 className="text-2xl font-semibold mb-2 text-slate-800">Ver Resultados</h3>
            <p className="text-slate-500 mb-4">
              Acesse os gráficos e relatórios para visualizar o desempenho geral.
            </p>
            <div className="flex items-center justify-center text-primary font-semibold group-hover:underline">
               <span>Analisar Desempenho</span>
               <ArrowRightIcon />
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-16">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Painel Administrativo</h3>
        <div className="grid md:grid-cols-1 gap-8 max-w-xl mx-auto">
            <Link to="/inserir-prova" className="group">
                <Card>
                    <BookOpenIcon />
                    <h3 className="text-2xl font-semibold mb-2 text-slate-800">Inserir Prova</h3>
                    <p className="text-slate-500 mb-4">
                        Crie e configure novas provas, definindo as questões e seus gabaritos.
                    </p>
                    <div className="flex items-center justify-center text-primary font-semibold group-hover:underline">
                        <span>Criar Nova Prova</span>
                        <ArrowRightIcon />
                    </div>
                </Card>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
