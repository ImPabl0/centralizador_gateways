import express, { Router, Request, Response, NextFunction } from "express";
import {
  validatePixPayment,
  validateBlackCatPayment,
  validatePayEvoPayment,
} from "../middleware/validation";
import PaymentGatewayService from "../services/PaymentGatewayService";
import PayEvoGateway from "../services/gateways/PayEvoGateway";
import BlackCatGateway from "../services/gateways/BlackCatGateway";
import { sseService } from "../services/SSEService";
import {
  PaymentRequest,
  PaymentResponse,
  BlackCatPaymentRequest,
  TransactionRequest,
  getDefaultCustomer,
} from "../types";

const router: Router = express.Router();
const paymentService = new PaymentGatewayService();
const payEvoGateway = new PayEvoGateway();
const blackCatGateway = new BlackCatGateway();

interface PaymentRequestBody extends Request {
  body: PaymentRequest;
}

/**
 * POST /pix
 * Cria uma cobrança PIX através dos gateways configurados
 */
router.post(
  "/",
  validatePixPayment,
  async (
    req: PaymentRequestBody,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paymentData: PaymentRequest = req.body;

      console.log("📥 Nova solicitação PIX recebida:", {
        customer: paymentData.customer?.name || "Cliente Padrão",
        amount: paymentData.amount,
        currency: paymentData.currency,
      });

      const result: PaymentResponse = await paymentService.createPixPayment(
        paymentData
      );

      console.log("✅ PIX criado com sucesso:", {
        id: result.id,
        status: result.status,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("❌ Erro ao criar PIX:", (error as Error).message);
      next(error);
    }
  }
);

/**
 * GET /pix/:id
 * Consulta o status de um pagamento PIX
 */
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "ID inválido",
          message: "O ID do pagamento é obrigatório",
        });
        return;
      }

      console.log("🔍 Consultando status do PIX:", id);

      const result: PaymentResponse | null =
        await paymentService.getPixPaymentStatus(id);

      if (!result) {
        res.status(404).json({
          error: "Pagamento não encontrado",
          message: `PIX com ID ${id} não foi encontrado`,
        });
        return;
      }

      res.json(result);
    } catch (error) {
      console.error("❌ Erro ao consultar PIX:", (error as Error).message);
      next(error);
    }
  }
);

/**
 * POST /pix/payevo
 * Cria uma cobrança PIX especificamente no PayEvo
 */
router.post(
  "/payevo",
  validatePayEvoPayment,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionData = req.body as TransactionRequest;

      console.log("📥 Nova transação PayEvo específica recebida:", {
        customer: transactionData.customer?.name || "Cliente Padrão",
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
      });

      // Converte para o formato interno
      const paymentData = {
        currency: "BRL" as const,
        amount: transactionData.amount,
        items: transactionData.items.map((item) => ({
          title: item.title,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          tangible: false,
        })),
        customer: transactionData.customer || getDefaultCustomer(),
        id: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        expirationDate: new Date(
          Date.now() + transactionData.pix.expiresInDays * 24 * 60 * 60 * 1000
        ),
      };

      const result = await payEvoGateway.createPixPayment(paymentData);

      console.log("✅ PIX PayEvo criado com sucesso:", {
        id: result.gatewayPaymentId,
        qrcode: result.qrcode,
      });

      res.status(201).json({
        qrcode: result.qrcode,
        expirationDate: result.expirationDate.toISOString(),
        id: result.gatewayPaymentId,
        status: "PENDING",
      });
    } catch (error) {
      console.error("❌ Erro ao criar PIX PayEvo:", (error as Error).message);
      next(error);
    }
  }
);

/**
 * POST /pix/blackcat
 * Cria uma cobrança PIX especificamente no BlackCat
 */
router.post(
  "/blackcat",
  validateBlackCatPayment,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionData = req.body as TransactionRequest;

      console.log("📥 Nova transação BlackCat específica recebida:", {
        customer: transactionData.customer?.name || "Cliente Padrão",
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
      });

      // Converte para o formato interno
      const paymentData = {
        currency: "BRL" as const,
        amount: transactionData.amount,
        items: transactionData.items.map((item) => ({
          title: item.title,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          tangible: item.tangible,
        })),
        customer: transactionData.customer || getDefaultCustomer(),
        id: `bc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        expirationDate: new Date(
          Date.now() + transactionData.pix.expiresInDays * 24 * 60 * 60 * 1000
        ),
      };

      const result = await blackCatGateway.createPixPayment(paymentData);

      console.log("✅ PIX BlackCat criado com sucesso:", {
        id: result.gatewayPaymentId,
        qrcode: result.qrcode,
      });

      res.status(201).json({
        qrcode: result.qrcode,
        expirationDate: result.expirationDate.toISOString(),
        id: result.gatewayPaymentId,
        status: "PENDING",
      });
    } catch (error) {
      console.error("❌ Erro ao criar PIX BlackCat:", (error as Error).message);
      next(error);
    }
  }
);

/**
 * GET /pix/payevo/:id
 * Verifica o status de um pagamento PIX especificamente no PayEvo
 */
router.get(
  "/payevo/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "ID inválido",
          message: "O ID do pagamento é obrigatório",
        });
        return;
      }

      console.log("🔍 Consultando status do PIX no PayEvo:", id);

      const result = await payEvoGateway.getPaymentStatus(id);

      console.log("✅ Status PayEvo obtido com sucesso:", {
        id: result.gatewayPaymentId,
        status: result.status,
        gateway: result.gateway,
      });

      res.json(result);
    } catch (error) {
      console.error(
        "❌ Erro ao consultar PIX PayEvo:",
        (error as Error).message
      );
      next(error);
    }
  }
);

/**
 * GET /pix/blackcat/:id
 * Verifica o status de um pagamento PIX especificamente no BlackCat
 */
router.get(
  "/blackcat/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "ID inválido",
          message: "O ID do pagamento é obrigatório",
        });
        return;
      }

      console.log("🔍 Consultando status do PIX no BlackCat:", id);

      const result = await blackCatGateway.getPaymentStatus(id);

      console.log("✅ Status BlackCat obtido com sucesso:", {
        id: result.gatewayPaymentId,
        status: result.status,
        gateway: result.gateway,
      });

      res.json(result);
    } catch (error) {
      console.error(
        "❌ Erro ao consultar PIX BlackCat:",
        (error as Error).message
      );
      next(error);
    }
  }
);

/**
 * GET /pix/sse/payevo/:id
 * Estabelece uma conexão SSE para receber atualizações de status do PayEvo
 */
router.get("/sse/payevo/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      error: "ID inválido",
      message: "O ID do pagamento é obrigatório",
    });
    return;
  }

  // Configura headers para SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Adiciona conexão ao serviço SSE
  const connectionId = sseService.addConnection(id, "payevo", res);

  console.log(`📡 Nova conexão SSE PayEvo estabelecida para pagamento ${id}`);

  // Envia evento inicial
  res.write(
    `data: ${JSON.stringify({
      type: "connection_established",
      paymentId: id,
      gateway: "payevo",
      connectionId,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Limpa a conexão quando o cliente desconecta
  req.on("close", () => {
    console.log(`📡 Conexão SSE PayEvo fechada para pagamento ${id}`);
    sseService.removeConnection(connectionId);
  });
});

/**
 * GET /pix/sse/blackcat/:id
 * Estabelece uma conexão SSE para receber atualizações de status do BlackCat
 */
router.get("/sse/blackcat/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      error: "ID inválido",
      message: "O ID do pagamento é obrigatório",
    });
    return;
  }

  // Configura headers para SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Adiciona conexão ao serviço SSE
  const connectionId = sseService.addConnection(id, "blackcat", res);

  console.log(`📡 Nova conexão SSE BlackCat estabelecida para pagamento ${id}`);

  // Envia evento inicial
  res.write(
    `data: ${JSON.stringify({
      type: "connection_established",
      paymentId: id,
      gateway: "blackcat",
      connectionId,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Limpa a conexão quando o cliente desconecta
  req.on("close", () => {
    console.log(`📡 Conexão SSE BlackCat fechada para pagamento ${id}`);
    sseService.removeConnection(connectionId);
  });
});

/**
 * POST /pix/webhook/payevo
 * Webhook para receber notificações de status do PayEvo
 */
router.post(
  "/webhook/payevo",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔔 Webhook PayEvo recebido");

      // Parse do payload
      const payload = req.body;
      console.log("📄 Payload webhook PayEvo:", payload);

      // Aqui você pode adicionar validação de assinatura se necessário
      // const isValid = validatePayEvoSignature(req.body, req.headers);

      // Extrai informações do pagamento
      const paymentId =
        payload.id || payload.transaction_id || payload.payment_id;
      let status = (payload.status || payload.payment_status) as string;
      if (status.toLowerCase() === "paid") {
        status = "approved";
      }

      if (!paymentId) {
        console.warn("⚠️ Webhook PayEvo sem ID de pagamento");
        res.status(400).json({ error: "Payment ID missing" });
        return;
      }

      // Notifica via SSE
      sseService.notifyPayment(paymentId, "payevo", {
        status,
        ...payload,
      });

      console.log(
        `✅ Webhook PayEvo processado para pagamento ${paymentId} - Status: ${status}`
      );

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Erro ao processar webhook PayEvo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /pix/webhook/blackcat
 * Webhook para receber notificações de status do BlackCat
 */
router.post(
  "/webhook/blackcat",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔔 Webhook BlackCat recebido");

      // Parse do payload
      const payload = req.body;
      console.log("📄 Payload webhook BlackCat:", payload);

      // Aqui você pode adicionar validação de assinatura se necessário
      // const isValid = validateBlackCatSignature(req.body, req.headers);

      // Extrai informações do pagamento
      const paymentId =
        payload.id || payload.transaction_id || payload.payment_id;
      const status = payload.status || payload.payment_status;

      if (!paymentId) {
        console.warn("⚠️ Webhook BlackCat sem ID de pagamento");
        res.status(400).json({ error: "Payment ID missing" });
        return;
      }

      // Notifica via SSE
      sseService.notifyPayment(paymentId, "blackcat", {
        status,
        ...payload,
      });

      console.log(
        `✅ Webhook BlackCat processado para pagamento ${paymentId} - Status: ${status}`
      );

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Erro ao processar webhook BlackCat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /pix/sse/stats
 * Retorna estatísticas das conexões SSE ativas
 */
router.get("/sse/stats", (req: Request, res: Response): void => {
  const stats = sseService.getStats();
  res.json(stats);
});

export default router;
