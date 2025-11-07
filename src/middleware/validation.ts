import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import {
  PaymentRequest,
  ValidationError,
  PayEvoTransactionRequest,
  BlackCatPaymentRequest,
} from "../types";

interface PaymentRequestBody extends Request {
  body: PaymentRequest;
}

export const validatePixPayment = (
  req: PaymentRequestBody,
  res: Response,
  next: NextFunction
): void => {
  const { error, value } = transactionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorDetails: ValidationError[] = error.details.map((detail) => ({
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

  // Validação adicional: soma dos itens deve corresponder ao amount
  const totalItems = (value as PaymentRequest).items.reduce(
    (total: number, item) => {
      return total + item.unitPrice * item.quantity;
    },
    0
  );

  if (totalItems !== (value as PaymentRequest).amount) {
    res.status(400).json({
      error: "Valor inconsistente",
      message: `O valor total dos itens (${totalItems}) não corresponde ao amount (${
        (value as PaymentRequest).amount
      })`,
    });
    return;
  }

  req.body = value as PaymentRequest;
  next();
};

// PayEvo validation schema
const transactionSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        unitPrice: Joi.number().integer().min(1).required(),
        quantity: Joi.number().integer().min(1).required(),
        externalRef: Joi.string().optional(),
      })
    )
    .min(1)
    .required(),
  customer: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    document: Joi.object({
      number: Joi.string().min(11).max(14).required(),
      type: Joi.string().valid("CPF", "CNPJ").required(),
    }).required(),
  }).required(),
  pix: Joi.object({
    expiresInDays: Joi.number().integer().min(1).max(30).required(),
  }).required(),
  amount: Joi.number().integer().min(1).required(),
});

interface PayEvoRequestBody extends Request {
  body: PayEvoTransactionRequest;
}

export const validatePayEvoPayment = (
  req: PayEvoRequestBody,
  res: Response,
  next: NextFunction
): void => {
  const { error, value } = transactionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorDetails: ValidationError[] = error.details.map((detail) => ({
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

  // Validação adicional: soma dos itens deve corresponder ao amount
  const totalItems = (value as PayEvoTransactionRequest).items.reduce(
    (total: number, item) => {
      return total + item.unitPrice * item.quantity;
    },
    0
  );

  if (totalItems !== (value as PayEvoTransactionRequest).amount) {
    res.status(400).json({
      error: "Valor inconsistente",
      message: `O valor total dos itens (${totalItems}) não corresponde ao amount (${
        (value as PayEvoTransactionRequest).amount
      })`,
    });
    return;
  }

  req.body = value as PayEvoTransactionRequest;
  next();
};

interface BlackCatRequestBody extends Request {
  body: BlackCatPaymentRequest;
}

export const validateBlackCatPayment = (
  req: BlackCatRequestBody,
  res: Response,
  next: NextFunction
): void => {
  const { error, value } = transactionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorDetails: ValidationError[] = error.details.map((detail) => ({
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

  // Validação adicional: soma dos itens deve corresponder ao amount
  const totalItems = (value as BlackCatPaymentRequest).items.reduce(
    (total: number, item) => {
      return total + item.unitPrice * item.quantity;
    },
    0
  );

  if (totalItems !== (value as BlackCatPaymentRequest).amount) {
    res.status(400).json({
      error: "Valor inconsistente",
      message: `O valor total dos itens (${totalItems}) não corresponde ao amount (${
        (value as BlackCatPaymentRequest).amount
      })`,
    });
    return;
  }

  req.body = value as BlackCatPaymentRequest;
  next();
};
