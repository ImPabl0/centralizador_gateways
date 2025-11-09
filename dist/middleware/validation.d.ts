import { Request, Response, NextFunction } from "express";
import { PaymentRequest, PayEvoTransactionRequest, BlackCatPaymentRequest } from "../types";
interface PaymentRequestBody extends Request {
    body: PaymentRequest;
}
export declare const validatePixPayment: (req: PaymentRequestBody, res: Response, next: NextFunction) => void;
interface PayEvoRequestBody extends Request {
    body: PayEvoTransactionRequest;
}
export declare const validatePayEvoPayment: (req: PayEvoRequestBody, res: Response, next: NextFunction) => void;
interface BlackCatRequestBody extends Request {
    body: BlackCatPaymentRequest;
}
export declare const validateBlackCatPayment: (req: BlackCatRequestBody, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validation.d.ts.map