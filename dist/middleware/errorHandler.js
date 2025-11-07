"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (error, req, res, next) => {
    console.error("🔥 Erro capturado pelo middleware:", {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
    });
    if (error.name === "ValidationError") {
        res.status(400).json({
            error: "Erro de validação",
            message: error.message,
        });
        return;
    }
    if (error.name === "PaymentGatewayError") {
        res.status(502).json({
            error: "Erro no gateway de pagamento",
            message: error.message,
        });
        return;
    }
    if (error.code === "ECONNABORTED" || error.name === "TimeoutError") {
        res.status(504).json({
            error: "Timeout",
            message: "O gateway de pagamento demorou muito para responder",
        });
        return;
    }
    res.status(500).json({
        error: "Erro interno do servidor",
        message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        ...(process.env.NODE_ENV === "development" && {
            details: error.message,
            stack: error.stack,
        }),
    });
    if (next)
        next();
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map