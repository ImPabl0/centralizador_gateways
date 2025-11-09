import BaseGateway from "./BaseGateway";
import { GatewayConfig, GatewayPaymentData, GatewayPaymentResult, GatewayPaymentStatus } from "../../types";
declare class PayEvoGateway extends BaseGateway {
    private apiKey;
    constructor(config?: GatewayConfig);
    healthCheck(): boolean;
    private convertToPayEvoFormat;
    private mapPayEvoStatusToStandard;
    createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult>;
    getPaymentStatus(paymentId: string): Promise<GatewayPaymentStatus>;
}
export default PayEvoGateway;
//# sourceMappingURL=PayEvoGateway.d.ts.map