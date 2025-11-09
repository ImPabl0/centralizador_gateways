import GiftCard from "@/components/GiftCard";
import HeroText from "@/components/HeroText";
import Header from "@/components/Header";
import DisclaimerText from "@/components/DisclaimerText";
import BackgroundVideoSwitcher from "@/components/BackgroundVideoSwitcher";
import React, { useState } from "react";
import SendGiftForm from "@/components/SendGiftForm";

const TIKTOK_LOGO_URL = "https://logodownload.org/wp-content/uploads/2019/08/tiktok-logo-9.png";
const GIFT_NAME = "Selo de SuperFã";
const GIFT_IMAGE_URL = "/selo.png";
const COIN_IMAGE_URL = "https://i.ibb.co/FqgD28JT/Gemini-Generated-Image-yccw6uyccw6uyccw-removebg-preview.png";

// URL do GIF de fundo
const BACKGROUND_GIF_URL = "https://lf-tt4b.tiktokcdn.com/obj/i18nblog/tt4b_cms/en-US/tipdilz7wysq-5g2Tozyia76njn3YAQivBX.gif";

// Preços base por unidade (mantidos para props do GiftCard, mesmo que não sejam exibidos)
const ORIGINAL_PRICE_PER_UNIT = 53.58;
const CARD_CURRENT_REAL_PRICE = 13.69;
const CARD_COIN_PRICE = 1000;

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSendGift = () => {
    setShowForm(true);
  };

  const disclaimer = "Este é o torneio oficial do TikTok Creators onde centenas de famosos estão participando do prêmio concurso Tiktoker Revelação 2025, ajude seu streamer favorito enviando selos de superfã. Dia 30/11 sairá o resultado oficial, acompanhem. Regulamentação ANBTEC nº 055471/74";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* 0. GIF de Fundo com Opacidade */}
      <BackgroundVideoSwitcher url={BACKGROUND_GIF_URL} />

      {/* 1. Cabeçalho (Topo) */}
      <Header logoUrl={TIKTOK_LOGO_URL} />
      
      {/* 2. Conteúdo Principal (Centralizado Verticalmente) */}
      <main className="flex flex-grow items-center justify-center relative">
        
        {/* Camada do Conteúdo Principal (Texto e Cartão) - Centralizada */}
        <div className="w-full max-w-6xl relative z-10 flex justify-center p-8 md:p-12">
          
          {/* Contêiner para o Hero Text e Gift Card (Centralizado) */}
          <div className="w-full md:w-1/2 lg:w-2/5 text-center">
            
            {!showForm ? (
              <div className="animate-fade-in">
                <HeroText 
                  title="Envie Selos de SuperFã"
                  subtitle="Alguém muito famoso está por trás dessas lives, quem será?"
                />
                <div className="mt-8 max-w-xs md:max-w-sm mx-auto"> 
                  <GiftCard
                    name={GIFT_NAME}
                    imageSrc={GIFT_IMAGE_URL}
                    coinImageSrc={COIN_IMAGE_URL}
                    originalRealPrice={ORIGINAL_PRICE_PER_UNIT}
                    currentRealPrice={CARD_CURRENT_REAL_PRICE}
                    coinPrice={CARD_COIN_PRICE}
                    onSend={handleSendGift}
                  />
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <SendGiftForm />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* 3. Rodapé (Fundo) */}
      <footer className="p-2 text-center text-xs text-gray-700 border-t border-gray-800 flex flex-col items-center relative z-10">
        <DisclaimerText text={disclaimer} />
        TIKTOK.COM @ TODOS OS DIREITOS RESERVADOS
      </footer>
    </div>
  );
};

export default Index;