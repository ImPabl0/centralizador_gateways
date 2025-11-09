import React from "react";
import { cn } from "@/lib/utils";

interface PurchaseNotificationProps {
  username: string;
  quantity: number;
  giftName: string;
  giftImageSrc: string;
}

const PurchaseNotification: React.FC<PurchaseNotificationProps> = ({
  username,
  quantity,
  giftName,
  giftImageSrc,
}) => {
  return (
    <div className={cn(
      "flex items-center space-x-3 p-2 rounded-lg",
      "bg-white dark:bg-gray-800 shadow-lg border border-green-500/50"
    )}>
      <img src={giftImageSrc} alt={giftName} className="h-6 w-6 object-contain flex-shrink-0" />
      <div className="text-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {username}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Acabou de enviar <span className="font-bold text-green-600">{quantity}x {giftName}</span>!
        </p>
      </div>
    </div>
  );
};

export default PurchaseNotification;