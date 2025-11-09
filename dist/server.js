"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const pix_1 = __importDefault(require("./routes/pix"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const SSEService_1 = require("./services/SSEService");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000", 10);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
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
    console.log(`📡 SSE PayEvo: http://localhost:${PORT}/pix/sse/payevo/:id`);
    console.log(`📡 SSE BlackCat: http://localhost:${PORT}/pix/sse/blackcat/:id`);
    console.log(`🔔 Webhook PayEvo: http://localhost:${PORT}/pix/webhook/payevo`);
    console.log(`🔔 Webhook BlackCat: http://localhost:${PORT}/pix/webhook/blackcat`);
    console.log(`📊 SSE Stats: http://localhost:${PORT}/pix/sse/stats`);
    console.log(`🧪 Test Page: http://localhost:${PORT}/public/sse-test.html`);
    console.log(`🌐 Current Domain: ${process.env.CURRENT_DOMAIN || "http://localhost:5000"}`);
});
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM recebido, fazendo shutdown graceful...");
    SSEService_1.sseService.cleanup();
    process.exit(0);
});
process.on("SIGINT", () => {
    console.log("🛑 SIGINT recebido, fazendo shutdown graceful...");
    SSEService_1.sseService.cleanup();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=server.js.map