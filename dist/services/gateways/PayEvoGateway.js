"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGateway_1 = __importDefault(require("./BaseGateway"));
const dotenv_1 = require("dotenv");
class PayEvoGateway extends BaseGateway_1.default {
    constructor(config = {}) {
        super("PayEvo", {
            apiUrl: "https://apiv2.payevo.com.br/",
            enabled: true,
            ...config,
        });
        (0, dotenv_1.configDotenv)();
        this.apiKey = process.env.PAYEVO_API_KEY;
    }
    healthCheck() {
        return !!this.apiKey && !!this.config.apiUrl;
    }
    convertToPayEvoFormat(paymentData) {
        const currentDomain = process.env.CURRENT_DOMAIN || "http://localhost:5000";
        return {
            postbackUrl: `${currentDomain}/pix/webhook/payevo`,
            items: paymentData.items.map((item) => ({
                title: item.title,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                externalRef: `ITEM_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 8)}`,
            })),
            customer: {
                name: paymentData.customer.name,
                email: paymentData.customer.email,
                phone: paymentData.customer.phone || "11999999999",
                document: {
                    number: paymentData.customer.document.number,
                    type: paymentData.customer.document.type.toUpperCase(),
                },
            },
            paymentMethod: "PIX",
            pix: {
                expiresInDays: 1,
            },
            amount: paymentData.amount,
        };
    }
    mapPayEvoStatusToStandard(status) {
        const statusMap = {
            waiting_payment: "PENDING",
            paid: "APPROVED",
            expired: "EXPIRED",
            canceled: "EXPIRED",
            refunded: "EXPIRED",
        };
        return statusMap[status] || "PENDING";
    }
    async createPixPayment(paymentData) {
        console.log(`🔄 ${this.name}: Criando pagamento PIX...`);
        if (!this.apiKey) {
            throw new Error(`${this.name}: API Key não configurada`);
        }
        try {
            const payEvoRequest = this.convertToPayEvoFormat(paymentData);
            console.log(`📤 ${this.name}: Enviando requisição para API...`);
            const response = await fetch(`${this.config.apiUrl}functions/v1/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(this.apiKey).toString("base64")}`,
                },
                body: JSON.stringify(payEvoRequest),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`${this.name}: HTTP ${response.status} - ${errorData}`);
            }
            const payEvoResponse = (await response.json());
            console.log(`✅ ${this.name}: PIX criado com sucesso - ID: ${payEvoResponse.id}`);
            return {
                qrcode: payEvoResponse.pix.qrcode,
                gatewayPaymentId: payEvoResponse.id,
                expirationDate: new Date(payEvoResponse.pix.expirationDate),
                gateway: this.name,
            };
        }
        catch (error) {
            console.error(`❌ ${this.name}: Erro ao criar PIX:`, error.message);
            throw error;
        }
    }
    async getPaymentStatus(paymentId) {
        console.log(`🔍 ${this.name}: Consultando status do pagamento ${paymentId}`);
        if (!this.apiKey) {
            throw new Error(`${this.name}: API Key não configurada`);
        }
        try {
            console.log(`📤 ${this.name}: Consultando API para status...`);
            const response = await fetch(`${this.config.apiUrl}functions/v1/transactions/${paymentId}`, {
                method: "GET",
                headers: {
                    Authorization: `Basic ${Buffer.from(this.apiKey).toString("base64")}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`${this.name}: HTTP ${response.status} - ${errorData}`);
            }
            const payEvoResponse = (await response.json());
            const status = this.mapPayEvoStatusToStandard(payEvoResponse.status);
            console.log(`📄 ${this.name}: Status obtido - ${payEvoResponse.status} -> ${status}`);
            return {
                status: status,
                gateway: this.name,
                gatewayPaymentId: payEvoResponse.id,
                qrcode: payEvoResponse.pix.qrcode,
            };
        }
        catch (error) {
            console.error(`❌ ${this.name}: Erro ao consultar status:`, error.message);
            throw error;
        }
    }
}
exports.default = PayEvoGateway;
//# sourceMappingURL=PayEvoGateway.js.map