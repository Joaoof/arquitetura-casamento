import React from 'react';

// Insira a URL da sua imagem aqui. 
// Usar uma constante fora do componente evita recriação em re-renderizações.
const FOOTER_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/250px-Heart_coraz%C3%B3n.svg.png"; 

const Footer: React.FC = () => {
  return (
    <>
      {/* Para uma animação de carregamento (fade-in-up), adicione as seguintes regras no seu arquivo global.css ou config do Tailwind:
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      */}
      
      {/* Aumento do padding vertical, borda sutil e um gradiente de fundo suave */}
      <footer className="bg-custom-header py-8 mt-12 border-t border-gray-100 bg-gradient-to-b from-rose-50 to-white">
        <div className="container mx-auto px-4 text-center">
          
          {/* Adicionando a classe de animação para carregar */}
          <div className="flex items-center justify-center mb-5 animate-fadeInUp">
            <img 
              src={FOOTER_IMAGE_URL} 
              alt="Decoração de Casamento" 
              className="h-14 w-auto mr-5 object-contain hover:scale-110 transition-transform duration-300" 
            />
            
            <span className="text-gray-700 font-poppins text-xl font-medium tracking-tight">
              Agradecemos de coração a sua presença!
            </span>
          </div>
          
          {/* Divisor ligeiramente maior e centralizado */}
          <div className="w-20 h-px bg-rose-200 mx-auto my-5"></div>
          
          <p className="text-gray-500 text-sm font-opensans tracking-wide opacity-80 mt-4 md:mt-0">
  © {new Date().getFullYear()} | Lista de Presentes de Casamento
  <span className="hidden sm:inline mx-2 opacity-50">|</span>
  <br className="sm:hidden" /> {/* Quebra de linha apenas no celular para não espremer o texto */}
  <span className="text-xs">
    Desenvolvido por{' '}
    <a 
      href="https://joaoof.com.br" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="font-medium hover:text-rose-400 transition-colors duration-300 underline decoration-transparent hover:decoration-rose-400 underline-offset-4"
    >
      Joaoof
    </a>
  </span>
</p>
          
        </div>
      </footer>
    </>
  );
};

export default Footer;