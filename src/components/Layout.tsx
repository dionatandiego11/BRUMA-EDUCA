// src/components/Layout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 transition-all"
          >
            <ArrowLeft size={20} /> Voltar para Home
          </button>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;