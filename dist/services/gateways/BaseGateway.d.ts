import { GatewayConfig, GatewayPaymentData, GatewayPaymentResult } from "../../types";
declare abstract class BaseGateway {
    readonly name: string;
    protected config: GatewayConfig;
    private isEnabled;
    constructor(name: string, config?: GatewayConfig);
    isAvailable(): boolean;
    healthCheck(): boolean;
    abstract createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult>;
    abstract getPaymentStatus(paymentId: string): Promise<{
        status: string;
        gateway: string;
        gatewayPaymentId: string;
    }>;
}
export default BaseGateway;
//# sourceMappingURL=BaseGateway.d.ts.map