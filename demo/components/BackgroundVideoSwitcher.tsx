import React from "react";
import { cn } from "../lib/utils";

interface BackgroundVideoSwitcherProps {
  url: string;
}

const BackgroundVideoSwitcher: React.FC<BackgroundVideoSwitcherProps> = ({
  url,
}) => {
  if (!url) {
    return null;
  }

  const opacityClasses = "opacity-40 md:opacity-20";

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-black",
        "pointer-events-none z-[-10]"
      )}
    >
      <img
        src={url}
        alt="Background animation"
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          opacityClasses
        )}
      />
    </div>
  );
};

export default BackgroundVideoSwitcher;
