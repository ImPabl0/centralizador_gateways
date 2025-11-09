"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGateway_1 = __importDefault(require("./BaseGateway"));
const dotenv_1 = require("dotenv");
class BlackCatGateway extends BaseGateway_1.default {
    constructor(config = {}) {
        super("BlackCat", {
            apiUrl: "https://api.blackcatpagamentos.com/",
            enabled: true,
            ...config,
        });
        (0, dotenv_1.configDotenv)();
        this.publicKey = process.env.BLACKCAT_PUBLIC_KEY;
        this.secretKey = process.env.BLACKCAT_SECRET_KEY;
    }
    healthCheck() {
        return !!(this.publicKey && this.secretKey);
    }
    getAuthHeader() {
        if (!this.publicKey || !this.secretKey) {
            throw new Error("Chaves de autenticação BlackCat não configuradas");
        }
        return {
            Authorization: `Basic ${Buffer.from(`${this.publicKey}:${this.secretKey}`).toString("base64")}`,
        };
    }
    convertToBlackCatFormat(paymentData) {
        const currentDomain = process.env.CURRENT_DOMAIN || "http://localhost:5000";
        return {
            postbackUrl: `${currentDomain}/pix/webhook/blackcat`,
            amount: paymentData.amount,
            currency: "BRL",
            paymentMethod: "pix",
            pix: {
                expiresInDays: 1,
            },
            items: paymentData.items.map((item) => ({
                title: item.title,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                tangible: item.tangible || false,
                externalRef: `ITEM_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 8)}`,
            })),
            customer: {
                name: paymentData.customer.name,
                email: paymentData.customer.email,
                document: {
                    number: paymentData.customer.document.number,
                    type: paymentData.customer.document.type.toLocaleLowerCase(),
                },
            },
        };
    }
    mapBlackCatStatusToStandard(status) {
        const statusMap = {
            pending: "PENDING",
            paid: "APPROVED",
            refunded: "EXPIRED",
            refused: "EXPIRED",
        };
        return statusMap[status] || "PENDING";
    }
    async createPixPayment(paymentData) {
        console.log(`🔄 ${this.name}: Criando pagamento PIX...`);
        try {
            const authHeader = this.getAuthHeader();
            const blackCatRequest = this.convertToBlackCatFormat(paymentData);
            console.log(`📤 ${this.name}: Enviando requisição para API...`);
            const response = await fetch(`${this.config.apiUrl}v1/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...authHeader,
                },
                body: JSON.stringify(blackCatRequest),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${this.name}: Erro HTTP ${response.status} - ${errorText}`);
            }
            const blackCatResponse = (await response.json());
            console.log(`✅ ${this.name}: PIX criado com sucesso - ID: ${blackCatResponse.id}`);
            return {
                qrcode: blackCatResponse.pix.qrcode,
                gatewayPaymentId: blackCatResponse.id.toString(),
                expirationDate: new Date(blackCatResponse.pix.expirationDate),
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
        try {
            const authHeader = this.getAuthHeader();
            console.log(`📤 ${this.name}: Consultando API para pagamento ${paymentId}...`);
            const response = await fetch(`${this.config.apiUrl}v1/transactions/${paymentId}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    ...authHeader,
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`${this.name}: Pagamento não encontrado`);
                }
                const errorText = await response.text();
                throw new Error(`${this.name}: Erro HTTP ${response.status} - ${errorText}`);
            }
            const blackCatResponse = (await response.json());
            const status = this.mapBlackCatStatusToStandard(blackCatResponse.status);
            console.log(`✅ ${this.name}: Status consultado - ${blackCatResponse.status} -> ${status}`);
            return {
                status: status,
                gateway: this.name,
                gatewayPaymentId: blackCatResponse.id.toString(),
                qrcode: blackCatResponse.pix.qrcode,
            };
        }
        catch (error) {
            console.error(`❌ ${this.name}: Erro ao consultar status:`, error.message);
            throw error;
        }
    }
}
exports.default = BlackCatGateway;
//# sourceMappingURL=BlackCatGateway.js.map