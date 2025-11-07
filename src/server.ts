import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import pixRoutes from "./routes/pix";
import errorHandler from "./middleware/errorHandler";
import { sseService } from "./services/SSEService";
import { configDotenv } from "dotenv";

// Carrega variáveis de ambiente
configDotenv();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Desabilita CSP para permitir SSE
  })
);
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use("/public", express.static(path.join(__dirname, "../public")));

// Routes
app.use("/pix", pixRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Centralizador de Gateways PIX",
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
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
  console.log(
    `🔔 Webhook BlackCat: http://localhost:${PORT}/pix/webhook/blackcat`
  );
  console.log(`📊 SSE Stats: http://localhost:${PORT}/pix/sse/stats`);
  console.log(`🧪 Test Page: http://localhost:${PORT}/public/sse-test.html`);
  console.log(
    `🌐 Current Domain: ${
      process.env.CURRENT_DOMAIN || "http://localhost:5000"
    }`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM recebido, fazendo shutdown graceful...");
  sseService.cleanup();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT recebido, fazendo shutdown graceful...");
  sseService.cleanup();
  process.exit(0);
});

export default app;
