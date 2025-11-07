import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  code?: string;
}

const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("🔥 Erro capturado pelo middleware:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });

  // Erro de validação customizado
  if (error.name === "ValidationError") {
    res.status(400).json({
      error: "Erro de validação",
      message: error.message,
    });
    return;
  }

  // Erro de gateway de pagamento
  if (error.name === "PaymentGatewayError") {
    res.status(502).json({
      error: "Erro no gateway de pagamento",
      message: error.message,
    });
    return;
  }

  // Erro de timeout
  if (error.code === "ECONNABORTED" || error.name === "TimeoutError") {
    res.status(504).json({
      error: "Timeout",
      message: "O gateway de pagamento demorou muito para responder",
    });
    return;
  }

  // Erro genérico
  res.status(500).json({
    error: "Erro interno do servidor",
    message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    ...(process.env.NODE_ENV === "development" && {
      details: error.message,
      stack: error.stack,
    }),
  });

  // Para satisfazer TypeScript - next nunca é chamado aqui
  if (next) next();
};

export default errorHandler;
