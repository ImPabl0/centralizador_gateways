import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GiftCardProps {
  name: string;
  imageSrc: string;
  coinImageSrc: string;
  coinPrice: number;
  originalRealPrice: number;
  currentRealPrice: number;
  onSend: () => void;
}

const GiftCard: React.FC<GiftCardProps> = ({
  name,
  imageSrc,
  onSend,
}) => {
  return (
    <div className={cn(
      "w-full p-4 rounded-lg shadow-lg text-center",
      "bg-black border-2 border-red-500" // Fundo preto e borda vermelha
    )}>
      <div className="flex justify-center mb-4">
        {/* Gift image */}
        <img src={imageSrc} alt={name} className="w-16 h-16 object-contain" />
      </div>
      
      {/* Texto do nome do presente em branco para contraste */}
      <h3 className="text-base font-semibold text-white mb-6">{name}</h3>
      
      <Button
        onClick={onSend}
        className={cn(
          "w-full text-white font-bold py-2 rounded-md inline-flex items-center justify-center",
          "bg-tiktok-pink hover:bg-pink-600 transition-colors", // Usando tiktok-pink
          "h-10 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        Enviar Selo
      </Button>
    </div>
  );
};

export default GiftCard;