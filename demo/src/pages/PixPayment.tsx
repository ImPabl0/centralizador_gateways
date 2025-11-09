import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PixQRCode from "@/components/PixQRCode";

const PixPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Validação de segurança: verifica se os dados foram passados corretamente
  useEffect(() => {
    if (
      !location.state ||
      !location.state.totalPrice ||
      !location.state.quantity
    ) {
      // Se não tem os dados necessários, redireciona para a página inicial
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  // Obtém os dados passados pela navegação
  const { quantity = 1, totalPrice = 18.95, timestamp } = location.state || {};

  // Validação adicional: verifica se o timestamp não é muito antigo (opcional)
  // Previne uso de links antigos ou manipulação
  if (timestamp && Date.now() - timestamp > 300000) {
    // 5 minutos
    navigate("/", { replace: true });
    return null;
  }

  // Valor do pagamento vem do formulário
  const pixValue = totalPrice;

  const handleClose = () => {
    // Volta para a página inicial
    navigate("/");
  };

  return (
    <PixQRCode pixValue={pixValue} quantity={quantity} onClose={handleClose} />
  );
};

export default PixPayment;
