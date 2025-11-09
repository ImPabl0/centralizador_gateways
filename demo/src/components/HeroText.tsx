import React from "react";
import { cn } from "@/lib/utils";

interface HeroTextProps {
  title: string;
  subtitle: string;
}

const HeroText: React.FC<HeroTextProps> = ({ title, subtitle }) => {
  return (
    <div className="p-4 md:p-0 text-center">
      <h1 className={cn(
        "text-4xl md:text-6xl lg:text-7xl font-black leading-tight", // Usando font-black para maior peso
        "text-white mb-4"
      )}>
        {/* Usando a nova cor tiktok-pink para o destaque */}
        <span className="text-tiktok-pink block">{title}</span>
        {/* Subtítulo em branco, mantendo o peso forte */}
        <span className="block mt-2 text-2xl md:text-3xl font-black">{subtitle}</span>
      </h1>
    </div>
  );
};

export default HeroText;