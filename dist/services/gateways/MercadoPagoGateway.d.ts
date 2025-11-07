import BaseGateway from './BaseGateway';
import { GatewayConfig, GatewayPaymentData, GatewayPaymentResult } from '../../types';
declare class MercadoPagoGateway extends BaseGateway {
    constructor(config?: GatewayConfig);
    healthCheck(): boolean;
    createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult>;
    getPaymentStatus(paymentId: string): Promise<{
        status: string;
        gateway: string;
        gatewayPaymentId: string;
    }>;
}
export default MercadoPagoGateway;
//# sourceMappingURL=MercadoPagoGateway.d.ts.map