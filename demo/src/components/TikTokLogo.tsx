import React from "react";

interface TikTokLogoProps {
  logoUrl: string;
}

const TikTokLogo: React.FC<TikTokLogoProps> = ({ logoUrl }) => {
  return (
    <div className="flex justify-center p-0">
      <img src={logoUrl} alt="TikTok Logo" className="h-8" />
    </div>
  );
};

export default TikTokLogo;