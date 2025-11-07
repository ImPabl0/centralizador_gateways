import React from "react";
import { Product, formatPrice } from "../data/products";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
        📦
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-sm text-gray-500">{product.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{formatPrice(product.price)}</div>
        <Link
          href={`/checkout/${product.id}`}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Comprar
        </Link>
      </div>
    </div>
  );
}
