import React from "react";
import TikTokLogo from "./TikTokLogo";
import { cn } from "@/lib/utils";
// LoaderCircle removido

interface HeaderProps {
  logoUrl: string;
}

const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  return (
    // Mantendo z-10 para garantir que o cabeçalho fique acima do vídeo de fundo (z-[-10])
    <header className="w-full px-4 py-2 bg-light-gray relative z-10">
      <div className="flex items-center justify-center max-w-6xl mx-auto">
        
        {/* Contêiner da Logo e Texto */}
        <div className="flex items-center space-x-2">
          <TikTokLogo logoUrl={logoUrl} />
          
          {/* Ícone de Carregamento removido aqui */}
          
          {/* Texto 'Creators' estilizado - Adicionando translate-y-[3px] e translate-x-[-1px] */}
          <span className={cn(
            "text-black text-xl", 
            "font-sans",
            "transform translate-y-[3px] translate-x-[-1px]" // Move 3px para baixo e 1px para a esquerda
          )}>
            Creators
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;