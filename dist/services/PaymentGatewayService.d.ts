import { PaymentRequest, PaymentResponse, StoredPayment } from "../types";
declare class PaymentGatewayService {
    private gateways;
    private payments;
    constructor();
    createPixPayment(paymentData: PaymentRequest): Promise<PaymentResponse>;
    getPixPaymentStatus(paymentId: string): Promise<PaymentResponse | null>;
    getAllPayments(): StoredPayment[];
}
export default PaymentGatewayService;
//# sourceMappingURL=PaymentGatewayService.d.ts.map