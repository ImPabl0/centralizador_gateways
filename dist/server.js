"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pix_1 = __importDefault(require("./routes/pix"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000", 10);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/pix", pix_1.default);
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "Centralizador de Gateways PIX",
    });
});
app.use(errorHandler_1.default);
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Rota não encontrada",
        message: `A rota ${req.method} ${req.originalUrl} não existe`,
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`💰 PIX endpoint: http://localhost:${PORT}/pix`);
    console.log(`🔷 PayEvo específico: http://localhost:${PORT}/pix/payevo`);
    console.log(`🐱 BlackCat específico: http://localhost:${PORT}/pix/blackcat`);
});
exports.default = app;
//# sourceMappingURL=server.js.map