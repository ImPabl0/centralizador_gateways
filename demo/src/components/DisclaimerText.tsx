import React from "react";
import { cn } from "@/lib/utils";

interface DisclaimerTextProps {
  text: string;
}

const DisclaimerText: React.FC<DisclaimerTextProps> = ({ text }) => {
  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto px-4 pb-4",
      "text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
    )}>
      {text}
    </div>
  );
};

export default DisclaimerText;