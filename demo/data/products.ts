export type Product = {
  id: string;
  title: string;
  description?: string;
  price: number; // Preço em centavos
};

// Preços em centavos (29.99 → 2999)
const FIXED_PRICES = [1, 4550, 1590, 7800, 3250, 6780, 2130, 8990, 1275, 5540];

export const PRODUCTS: Product[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `prod_${i + 1}`,
  title: `Produto ${i + 1}`,
  description: `Descrição breve do produto ${i + 1}`,
  price: FIXED_PRICES[i],
}));

// Função para converter centavos para reais formatados
export const formatPrice = (priceInCents: number): string => {
  const reais = Math.floor(priceInCents / 100);
  const centavos = priceInCents % 100;
  return `R$ ${reais},${centavos.toString().padStart(2, "0")}`;
};
