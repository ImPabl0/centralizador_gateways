import React, { useState } from "react";
import InputMask from "react-input-mask";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InputMaskProps {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const SendGiftForm = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const pricePerUnit = 18.95;
  const originalPricePerUnit = 53.32;

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(36, prev + 1));
  };

  const handlePayment = () => {
    // Navega para a tela de pagamento PIX passando os dados via state (mais seguro)
    const totalPrice = pricePerUnit * quantity;
    navigate("/pix-payment", {
      state: {
        quantity,
        totalPrice,
        // Adiciona um timestamp para validação adicional se necessário
        timestamp: Date.now(),
      },
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const totalPrice = pricePerUnit * quantity;
  const originalTotalPrice = originalPricePerUnit * quantity;

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto p-6 rounded-lg shadow-lg text-left",
        "bg-black border-2 border-red-500 text-white"
      )}
    >
      <h2 className="text-2xl font-bold text-center mb-6">Enviar Selos</h2>
      <form className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-white">
            Digite seu Nome
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 mt-2"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-white">
            Telefone de contato
          </Label>
          <InputMask mask="(99) 99999-9999">
            {(inputProps: InputMaskProps) => (
              <Input
                {...inputProps}
                id="phone"
                type="tel"
                placeholder="(xx) 99999-9999"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 mt-2"
              />
            )}
          </InputMask>
        </div>

        {/* Seletor de Quantidade */}
        <div>
          <Label className="text-white text-center block">
            Selecione a quantidade de selos
          </Label>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-12 text-center">
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={quantity >= 36}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Display de Preço */}
        <div className="text-center pt-4">
          <p className="text-gray-400 text-lg line-through">
            de {formatCurrency(originalTotalPrice)}
          </p>
          <p className="text-tiktok-pink text-3xl font-bold">
            por {formatCurrency(totalPrice)}
          </p>
        </div>

        <Button
          type="button"
          onClick={handlePayment}
          className={cn(
            "w-full text-white font-bold py-2 rounded-md",
            "bg-tiktok-pink hover:bg-pink-600 transition-colors h-12 text-base",
            "flex items-center justify-center space-x-2"
          )}
        >
          <img
            src="https://img.icons8.com/color/512/pix.png"
            alt="PIX"
            className="h-6 w-6"
          />
          <span>PAGAR VIA PIX</span>
        </Button>
      </form>
    </div>
  );
};

export default SendGiftForm;
