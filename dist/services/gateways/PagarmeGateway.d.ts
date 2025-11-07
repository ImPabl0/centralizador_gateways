import BaseGateway from './BaseGateway';
import { GatewayConfig, GatewayPaymentData, GatewayPaymentResult } from '../../types';
declare class PagarmeGateway extends BaseGateway {
    constructor(config?: GatewayConfig);
    healthCheck(): boolean;
    createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult>;
    getPaymentStatus(paymentId: string): Promise<{
        status: string;
        gateway: string;
        gatewayPaymentId: string;
    }>;
}
export default PagarmeGateway;
//# sourceMappingURL=PagarmeGateway.d.ts.map