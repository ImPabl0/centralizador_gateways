"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGateway_1 = __importDefault(require("./BaseGateway"));
class AsaasGateway extends BaseGateway_1.default {
    constructor(config = {}) {
        super('Asaas', {
            apiUrl: 'https://www.asaas.com/api',
            enabled: true,
            ...config
        });
    }
    healthCheck() {
        return Math.random() > 0.12;
    }
    async createPixPayment(paymentData) {
        console.log(`🔄 ${this.name}: Criando pagamento PIX...`);
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 700));
        if (Math.random() < 0.06) {
            throw new Error(`${this.name}: Erro de autenticação`);
        }
        const qrcode = this.generateMockPixCode(paymentData);
        console.log(`✅ ${this.name}: PIX criado com sucesso`);
        return {
            qrcode,
            gatewayPaymentId: 'asaas_' + Date.now(),
            expirationDate: paymentData.expirationDate,
            gateway: this.name
        };
    }
    async getPaymentStatus(paymentId) {
        console.log(`🔍 ${this.name}: Consultando status do pagamento ${paymentId}`);
        await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 350));
        const statuses = ['PENDING', 'APPROVED', 'EXPIRED'];
        const weights = [0.68, 0.22, 0.1];
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
            gatewayPaymentId: 'asaas_' + paymentId
        };
    }
}
exports.default = AsaasGateway;
//# sourceMappingURL=AsaasGateway.js.map