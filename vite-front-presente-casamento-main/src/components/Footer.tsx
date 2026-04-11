import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-custom-header py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-3">
          <Heart size={18} className="text-rose-500 mr-2" />
          <span className="text-gray-600">Obrigado por fazer parte do nosso dia especial</span>
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} | Lista de Presentes de Casamento
        </p>
      </div>
    </footer>
  );
};

export default Footer;