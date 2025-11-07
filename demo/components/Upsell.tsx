import React from "react";
import { Product, formatPrice } from "../data/products";

export default function Upsell({
  items,
  onBuy,
}: {
  items: Product[];
  onBuy: (p: Product) => void;
}) {
  return (
    <div className="card">
      <h4 className="font-semibold mb-3">Quem comprou também olhou</h4>
      <div className="grid grid-cols-3 gap-3">
        {items.map((p) => (
          <div key={p.id} className="p-2 border rounded">
            <div className="text-sm font-medium">{p.title}</div>
            <div className="text-xs text-gray-500">{formatPrice(p.price)}</div>
            <div className="mt-2">
              <button
                onClick={() => onBuy(p)}
                className="px-2 py-1 bg-indigo-600 text-white rounded text-sm"
              >
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
