"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGateway_1 = __importDefault(require("./BaseGateway"));
class MercadoPagoGateway extends BaseGateway_1.default {
    constructor(config = {}) {
        super('MercadoPago', {
            apiUrl: 'https://api.mercadopago.com',
            enabled: true,
            ...config
        });
    }
    healthCheck() {
        return Math.random() > 0.1;
    }
    async createPixPayment(paymentData) {
        console.log(`🔄 ${this.name}: Criando pagamento PIX...`);
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        if (Math.random() < 0.05) {
            throw new Error(`${this.name}: Erro interno do gateway`);
        }
        const qrcode = this.generateMockPixCode(paymentData);
        console.log(`✅ ${this.name}: PIX criado com sucesso`);
        return {
            qrcode,
            gatewayPaymentId: 'mp_' + Date.now(),
            expirationDate: paymentData.expirationDate,
            gateway: this.name
        };
    }
    async getPaymentStatus(paymentId) {
        console.log(`🔍 ${this.name}: Consultando status do pagamento ${paymentId}`);
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        const statuses = ['PENDING', 'APPROVED', 'EXPIRED'];
        const weights = [0.7, 0.2, 0.1];
        let random = Math.random();
        let status = 'PENDING';
        for (let i = 0; i < weights.length; i++) {
            const weight = weights[i];
            const statusOption = statuses[i];
            if (weight && statusOption && random < weight) {
                status = statusOption;
                break;
            }
            if (weight) {
                random -= weight;
            }
        }
        return {
            status,
            gateway: this.name,
            gatewayPaymentId: 'mp_' + paymentId
        };
    }
}
exports.default = MercadoPagoGateway;
//# sourceMappingURL=MercadoPagoGateway.js.map