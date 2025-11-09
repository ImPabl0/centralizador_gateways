"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const PayEvoGateway_1 = __importDefault(require("./gateways/PayEvoGateway"));
const BlackCatGateway_1 = __importDefault(require("./gateways/BlackCatGateway"));
const types_1 = require("../types");
class PaymentGatewayService {
    constructor() {
        this.gateways = [new PayEvoGateway_1.default(), new BlackCatGateway_1.default()];
        this.payments = new Map();
    }
    async createPixPayment(paymentData) {
        const paymentId = (0, uuid_1.v4)();
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 30);
        console.log("🔄 Tentando criar PIX com gateways disponíveis...");
        for (const gateway of this.gateways) {
            try {
                console.log(`🔌 Tentando gateway: ${gateway.name}`);
                if (!gateway.isAvailable()) {
                    console.log(`⚠️ Gateway ${gateway.name} não disponível`);
                    continue;
                }
                const result = await gateway.createPixPayment({
                    ...paymentData,
                    customer: paymentData.customer || (0, types_1.getDefaultCustomer)(),
                    id: paymentId,
                    expirationDate,
                });
                this.payments.set(paymentId, {
                    id: paymentId,
                    gateway: gateway.name,
                    originalData: paymentData,
                    result,
                    createdAt: new Date(),
                    status: "PENDING",
                });
                console.log(`✅ PIX criado com sucesso no gateway: ${gateway.name}`);
                return {
                    qrcode: result.qrcode,
                    expirationDate: expirationDate.toISOString(),
                    id: paymentId,
                    status: "PENDING",
                };
            }
            catch (error) {
                console.error(`❌ Erro no gateway ${gateway.name}:`, error.message);
                continue;
            }
        }
        throw new Error("Nenhum gateway de pagamento está disponível no momento");
    }
    async getPixPaymentStatus(paymentId) {
        const payment = this.payments.get(paymentId);
        if (!payment) {
            return null;
        }
        const now = new Date();
        const expirationDate = new Date(payment.result.expirationDate ||
            payment.createdAt.getTime() + 30 * 60 * 1000);
        if (now > expirationDate && payment.status === "PENDING") {
            payment.status = "EXPIRED";
            this.payments.set(paymentId, payment);
        }
        if (payment.status === "PENDING" && Math.random() < 0.1) {
            payment.status = "APPROVED";
            this.payments.set(paymentId, payment);
        }
        return {
            qrcode: payment.result.qrcode,
            expirationDate: expirationDate.toISOString(),
            id: paymentId,
            status: payment.status,
        };
    }
    getAllPayments() {
        return Array.from(this.payments.values());
    }
}
exports.default = PaymentGatewayService;
//# sourceMappingURL=PaymentGatewayService.js.map