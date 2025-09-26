import React from 'react';
import { GraduationCap, School, ClipboardList, BarChart3, FileText } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface HomePageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert' | 'results' | 'provoes') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-6 animate-fade-in-up">
            <GraduationCap size={80} className="text-blue-600 drop-shadow-lg" />
            Sistema Educacional Brumadinho
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
            Gerencie escolas, turmas, professores, alunos e avaliações em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="group hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden" onClick={() => onNavigate('admin')}>
            <div className="text-center p-6">
              <div className="relative">
                <School size={48} className="mx-auto text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Painel Administrativo</h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Gerencie escolas, séries, turmas, professores e alunos.
              </p>
              <Button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('admin'); }} 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                Acessar Painel
              </Button>
            </div>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden" onClick={() => onNavigate('provoes')}>
            <div className="text-center p-6">
              <div className="relative">
                <FileText size={48} className="mx-auto text-orange-600 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Provões</h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Crie e gerencie avaliações para múltiplas turmas.
              </p>
              <Button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('provoes'); }} 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                Criar Provões
              </Button>
            </div>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden" onClick={() => onNavigate('insert')}>
            <div className="text-center p-6">
              <div className="relative">
                <ClipboardList size={48} className="mx-auto text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Inserir Resultados</h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Registre as respostas dos alunos nas avaliações.
              </p>
              <Button 
                variant="success"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('insert'); }} 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                Inserir Dados
              </Button>
            </div>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden" onClick={() => onNavigate('results')}>
            <div className="text-center p-6">
              <div className="relative">
                <BarChart3 size={48} className="mx-auto text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Resultados</h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Visualize rankings e análises de desempenho.
              </p>
              <Button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('results'); }} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                Ver Resultados
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Fluxo do Sistema</h3>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-700 font-medium flex-wrap">
              <span className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-full">
                <School size={16} className="text-blue-600" />
                1. Configurar
              </span>
              <span className="text-xl font-bold text-gray-400">→</span>
              <span className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-full">
                <FileText size={16} className="text-orange-600" />
                2. Criar Provões
              </span>
              <span className="text-xl font-bold text-gray-400">→</span>
              <span className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-full">
                <ClipboardList size={16} className="text-green-600" />
                3. Aplicar
              </span>
              <span className="text-xl font-bold text-gray-400">→</span>
              <span className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-full">
                <BarChart3 size={16} className="text-purple-600" />
                4. Analisar
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;