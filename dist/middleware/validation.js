"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlackCatPayment = exports.validatePayEvoPayment = exports.validatePixPayment = void 0;
const joi_1 = __importDefault(require("joi"));
const validatePixPayment = (req, res, next) => {
    const { error, value } = transactionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        const errorDetails = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
        }));
        res.status(400).json({
            error: "Dados inválidos",
            message: "Os dados enviados não atendem aos requisitos",
            details: errorDetails,
        });
        return;
    }
    const totalItems = value.items.reduce((total, item) => {
        return total + item.unitPrice * item.quantity;
    }, 0);
    if (totalItems !== value.amount) {
        res.status(400).json({
            error: "Valor inconsistente",
            message: `O valor total dos itens (${totalItems}) não corresponde ao amount (${value.amount})`,
        });
        return;
    }
    req.body = value;
    next();
};
exports.validatePixPayment = validatePixPayment;
const transactionSchema = joi_1.default.object({
    items: joi_1.default.array()
        .items(joi_1.default.object({
        title: joi_1.default.string().required(),
        unitPrice: joi_1.default.number().integer().min(1).required(),
        quantity: joi_1.default.number().integer().min(1).required(),
        externalRef: joi_1.default.string().optional(),
    }))
        .min(1)
        .required(),
    customer: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        email: joi_1.default.string().email().required(),
        phone: joi_1.default.string().min(10).max(15).required(),
        document: joi_1.default.object({
            number: joi_1.default.string().min(11).max(14).required(),
            type: joi_1.default.string().valid("CPF", "CNPJ").required(),
        }).required(),
    }).required(),
    pix: joi_1.default.object({
        expiresInDays: joi_1.default.number().integer().min(1).max(30).required(),
    }).required(),
    amount: joi_1.default.number().integer().min(1).required(),
});
const validatePayEvoPayment = (req, res, next) => {
    const { error, value } = transactionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        const errorDetails = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
        }));
        res.status(400).json({
            error: "Dados inválidos",
            message: "Os dados enviados não atendem aos requisitos do PayEvo",
            details: errorDetails,
        });
        return;
    }
    const totalItems = value.items.reduce((total, item) => {
        return total + item.unitPrice * item.quantity;
    }, 0);
    if (totalItems !== value.amount) {
        res.status(400).json({
            error: "Valor inconsistente",
            message: `O valor total dos itens (${totalItems}) não corresponde ao amount (${value.amount})`,
        });
        return;
    }
    req.body = value;
    next();
};
exports.validatePayEvoPayment = validatePayEvoPayment;
const validateBlackCatPayment = (req, res, next) => {
    const { error, value } = transactionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        const errorDetails = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
        }));
        res.status(400).json({
            error: "Dados inválidos",
            message: "Os dados enviados não atendem aos requisitos do BlackCat",
            details: errorDetails,
        });
        return;
    }
    const totalItems = value.items.reduce((total, item) => {
        return total + item.unitPrice * item.quantity;
    }, 0);
    if (totalItems !== value.amount) {
        res.status(400).json({
            error: "Valor inconsistente",
            message: `O valor total dos itens (${totalItems}) não corresponde ao amount (${value.amount})`,
        });
        return;
    }
    req.body = value;
    next();
};
exports.validateBlackCatPayment = validateBlackCatPayment;
//# sourceMappingURL=validation.js.map