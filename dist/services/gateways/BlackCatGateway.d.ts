import BaseGateway from "./BaseGateway";
import { GatewayConfig, GatewayPaymentData, GatewayPaymentResult } from "../../types";
declare class BlackCatGateway extends BaseGateway {
    private publicKey;
    private secretKey;
    constructor(config?: GatewayConfig);
    healthCheck(): boolean;
    private getAuthHeader;
    private convertToBlackCatFormat;
    private mapBlackCatStatusToStandard;
    createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult>;
    getPaymentStatus(paymentId: string): Promise<{
        status: string;
        gateway: string;
        gatewayPaymentId: string;
    }>;
}
export default BlackCatGateway;
//# sourceMappingURL=BlackCatGateway.d.ts.map