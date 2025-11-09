"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("../middleware/validation");
const PaymentGatewayService_1 = __importDefault(require("../services/PaymentGatewayService"));
const PayEvoGateway_1 = __importDefault(require("../services/gateways/PayEvoGateway"));
const BlackCatGateway_1 = __importDefault(require("../services/gateways/BlackCatGateway"));
const SSEService_1 = require("../services/SSEService");
const types_1 = require("../types");
const router = express_1.default.Router();
const paymentService = new PaymentGatewayService_1.default();
const payEvoGateway = new PayEvoGateway_1.default();
const blackCatGateway = new BlackCatGateway_1.default();
router.post("/", validation_1.validatePixPayment, async (req, res, next) => {
    try {
        const paymentData = req.body;
        console.log("📥 Nova solicitação PIX recebida:", {
            customer: paymentData.customer?.name || "Cliente Padrão",
            amount: paymentData.amount,
            currency: paymentData.currency,
        });
        const result = await paymentService.createPixPayment(paymentData);
        console.log("✅ PIX criado com sucesso:", {
            id: result.id,
            status: result.status,
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("❌ Erro ao criar PIX:", error.message);
        next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                error: "ID inválido",
                message: "O ID do pagamento é obrigatório",
            });
            return;
        }
        console.log("🔍 Consultando status do PIX:", id);
        const result = await paymentService.getPixPaymentStatus(id);
        if (!result) {
            res.status(404).json({
                error: "Pagamento não encontrado",
                message: `PIX com ID ${id} não foi encontrado`,
            });
            return;
        }
        res.json(result);
    }
    catch (error) {
        console.error("❌ Erro ao consultar PIX:", error.message);
        next(error);
    }
});
router.post("/payevo", validation_1.validatePayEvoPayment, async (req, res, next) => {
    try {
        const transactionData = req.body;
        console.log("📥 Nova transação PayEvo específica recebida:", {
            customer: transactionData.customer?.name || "Cliente Padrão",
            amount: transactionData.amount,
            paymentMethod: transactionData.paymentMethod,
        });
        const paymentData = {
            currency: "BRL",
            amount: transactionData.amount,
            items: transactionData.items.map((item) => ({
                title: item.title,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                tangible: false,
            })),
            customer: transactionData.customer || (0, types_1.getDefaultCustomer)(),
            id: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            expirationDate: new Date(Date.now() + transactionData.pix.expiresInDays * 24 * 60 * 60 * 1000),
        };
        const result = await payEvoGateway.createPixPayment(paymentData);
        console.log("✅ PIX PayEvo criado com sucesso:", {
            id: result.gatewayPaymentId,
            qrcode: result.qrcode,
        });
        res.status(201).json({
            qrcode: result.qrcode,
            expirationDate: result.expirationDate.toISOString(),
            id: result.gatewayPaymentId,
            status: "PENDING",
        });
    }
    catch (error) {
        console.error("❌ Erro ao criar PIX PayEvo:", error.message);
        next(error);
    }
});
router.post("/blackcat", validation_1.validateBlackCatPayment, async (req, res, next) => {
    try {
        const transactionData = req.body;
        console.log("📥 Nova transação BlackCat específica recebida:", {
            customer: transactionData.customer?.name || "Cliente Padrão",
            amount: transactionData.amount,
            paymentMethod: transactionData.paymentMethod,
        });
        const paymentData = {
            currency: "BRL",
            amount: transactionData.amount,
            items: transactionData.items.map((item) => ({
                title: item.title,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                tangible: item.tangible,
            })),
            customer: transactionData.customer || (0, types_1.getDefaultCustomer)(),
            id: `bc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            expirationDate: new Date(Date.now() + transactionData.pix.expiresInDays * 24 * 60 * 60 * 1000),
        };
        const result = await blackCatGateway.createPixPayment(paymentData);
        console.log("✅ PIX BlackCat criado com sucesso:", {
            id: result.gatewayPaymentId,
            qrcode: result.qrcode,
        });
        res.status(201).json({
            qrcode: result.qrcode,
            expirationDate: result.expirationDate.toISOString(),
            id: result.gatewayPaymentId,
            status: "PENDING",
        });
    }
    catch (error) {
        console.error("❌ Erro ao criar PIX BlackCat:", error.message);
        next(error);
    }
});
router.get("/payevo/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                error: "ID inválido",
                message: "O ID do pagamento é obrigatório",
            });
            return;
        }
        console.log("🔍 Consultando status do PIX no PayEvo:", id);
        const result = await payEvoGateway.getPaymentStatus(id);
        console.log("✅ Status PayEvo obtido com sucesso:", {
            id: result.gatewayPaymentId,
            status: result.status,
            gateway: result.gateway,
        });
        res.json(result);
    }
    catch (error) {
        console.error("❌ Erro ao consultar PIX PayEvo:", error.message);
        next(error);
    }
});
router.get("/blackcat/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                error: "ID inválido",
                message: "O ID do pagamento é obrigatório",
            });
            return;
        }
        console.log("🔍 Consultando status do PIX no BlackCat:", id);
        const result = await blackCatGateway.getPaymentStatus(id);
        console.log("✅ Status BlackCat obtido com sucesso:", {
            id: result.gatewayPaymentId,
            status: result.status,
            gateway: result.gateway,
        });
        res.json(result);
    }
    catch (error) {
        console.error("❌ Erro ao consultar PIX BlackCat:", error.message);
        next(error);
    }
});
router.get("/sse/payevo/:id", (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            error: "ID inválido",
            message: "O ID do pagamento é obrigatório",
        });
        return;
    }
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
    });
    const connectionId = SSEService_1.sseService.addConnection(id, "payevo", res);
    console.log(`📡 Nova conexão SSE PayEvo estabelecida para pagamento ${id}`);
    res.write(`data: ${JSON.stringify({
        type: "connection_established",
        paymentId: id,
        gateway: "payevo",
        connectionId,
        timestamp: new Date().toISOString(),
    })}\n\n`);
    req.on("close", () => {
        console.log(`📡 Conexão SSE PayEvo fechada para pagamento ${id}`);
        SSEService_1.sseService.removeConnection(connectionId);
    });
});
router.get("/sse/blackcat/:id", (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            error: "ID inválido",
            message: "O ID do pagamento é obrigatório",
        });
        return;
    }
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
    });
    const connectionId = SSEService_1.sseService.addConnection(id, "blackcat", res);
    console.log(`📡 Nova conexão SSE BlackCat estabelecida para pagamento ${id}`);
    res.write(`data: ${JSON.stringify({
        type: "connection_established",
        paymentId: id,
        gateway: "blackcat",
        connectionId,
        timestamp: new Date().toISOString(),
    })}\n\n`);
    req.on("close", () => {
        console.log(`📡 Conexão SSE BlackCat fechada para pagamento ${id}`);
        SSEService_1.sseService.removeConnection(connectionId);
    });
});
router.post("/webhook/payevo", express_1.default.raw({ type: "application/json" }), async (req, res) => {
    try {
        console.log("🔔 Webhook PayEvo recebido");
        const payload = req.body.data;
        console.log("📄 Payload webhook PayEvo:", payload);
        const paymentId = payload.id || payload.transaction_id || payload.payment_id;
        let status = (payload.status || payload.payment_status);
        if (status.toLowerCase() === "paid") {
            status = "approved";
        }
        if (!paymentId) {
            console.warn("⚠️ Webhook PayEvo sem ID de pagamento");
            res.status(400).json({ error: "Payment ID missing" });
            return;
        }
        SSEService_1.sseService.notifyPayment(paymentId, "payevo", {
            status,
            ...payload,
        });
        console.log(`✅ Webhook PayEvo processado para pagamento ${paymentId} - Status: ${status}`);
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error("❌ Erro ao processar webhook PayEvo:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/webhook/blackcat", express_1.default.raw({ type: "application/json" }), async (req, res) => {
    try {
        console.log("🔔 Webhook BlackCat recebido");
        const payload = req.body;
        console.log("📄 Payload webhook BlackCat:", payload);
        const paymentId = payload.id || payload.transaction_id || payload.payment_id;
        const status = payload.status || payload.payment_status;
        if (!paymentId) {
            console.warn("⚠️ Webhook BlackCat sem ID de pagamento");
            res.status(400).json({ error: "Payment ID missing" });
            return;
        }
        SSEService_1.sseService.notifyPayment(paymentId, "blackcat", {
            status,
            ...payload,
        });
        console.log(`✅ Webhook BlackCat processado para pagamento ${paymentId} - Status: ${status}`);
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error("❌ Erro ao processar webhook BlackCat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/sse/stats", (req, res) => {
    const stats = SSEService_1.sseService.getStats();
    res.json(stats);
});
exports.default = router;
//# sourceMappingURL=pix.js.map