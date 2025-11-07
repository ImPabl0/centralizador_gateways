import { Request, Response, NextFunction } from "express";
interface CustomError extends Error {
    code?: string;
}
declare const errorHandler: (error: CustomError, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map