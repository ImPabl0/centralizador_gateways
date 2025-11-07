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
const router = express_1.default.Router();
const paymentService = new PaymentGatewayService_1.default();
const payEvoGateway = new PayEvoGateway_1.default();
const blackCatGateway = new BlackCatGateway_1.default();
router.post("/", validation_1.validatePixPayment, async (req, res, next) => {
    try {
        const paymentData = req.body;
        console.log("📥 Nova solicitação PIX recebida:", {
            customer: paymentData.customer.name,
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
            customer: transactionData.customer.name,
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
            customer: {
                name: transactionData.customer.name,
                email: transactionData.customer.email,
                document: {
                    number: transactionData.customer.document.number,
                    type: transactionData.customer.document.type.toLowerCase(),
                },
            },
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
            customer: transactionData.customer.name,
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
            customer: {
                name: transactionData.customer.name,
                email: transactionData.customer.email,
                document: {
                    number: transactionData.customer.document.number,
                    type: transactionData.customer.document.type,
                },
            },
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
exports.default = router;
//# sourceMappingURL=pix.js.map