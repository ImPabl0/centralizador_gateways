"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGateway_1 = __importDefault(require("./BaseGateway"));
class PagarmeGateway extends BaseGateway_1.default {
    constructor(config = {}) {
        super('Pagar.me', {
            apiUrl: 'https://api.pagar.me',
            enabled: true,
            ...config
        });
    }
    healthCheck() {
        return Math.random() > 0.15;
    }
    async createPixPayment(paymentData) {
        console.log(`🔄 ${this.name}: Criando pagamento PIX...`);
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 800));
        if (Math.random() < 0.08) {
            throw new Error(`${this.name}: Timeout na conexão`);
        }
        const qrcode = this.generateMockPixCode(paymentData);
        console.log(`✅ ${this.name}: PIX criado com sucesso`);
        return {
            qrcode,
            gatewayPaymentId: 'pgr_' + Date.now(),
            expirationDate: paymentData.expirationDate,
            gateway: this.name
        };
    }
    async getPaymentStatus(paymentId) {
        console.log(`🔍 ${this.name}: Consultando status do pagamento ${paymentId}`);
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 400));
        const statuses = ['PENDING', 'APPROVED', 'EXPIRED'];
        const weights = [0.65, 0.25, 0.1];
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
            gatewayPaymentId: 'pgr_' + paymentId
        };
    }
}
exports.default = PagarmeGateway;
//# sourceMappingURL=PagarmeGateway.js.map