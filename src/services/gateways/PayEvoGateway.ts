import BaseGateway from "./BaseGateway";
import {
  GatewayConfig,
  GatewayPaymentData,
  GatewayPaymentResult,
  GatewayPaymentStatus,
  PayEvoTransactionRequest,
  PayEvoTransactionResponse,
  PaymentStatus,
} from "../../types";
import { configDotenv } from "dotenv";

class PayEvoGateway extends BaseGateway {
  private apiKey: string | undefined;

  constructor(config: GatewayConfig = {}) {
    super("PayEvo", {
      apiUrl: "https://apiv2.payevo.com.br/",
      enabled: true,
      ...config,
    });
    configDotenv();
    this.apiKey = process.env.PAYEVO_API_KEY;
  }

  override healthCheck(): boolean {
    // Verifica se tem API key configurada e se a URL da API está definida
    return !!this.apiKey && !!this.config.apiUrl;
  }

  private convertToPayEvoFormat(
    paymentData: GatewayPaymentData
  ): PayEvoTransactionRequest {
    const currentDomain = process.env.CURRENT_DOMAIN || "http://localhost:5000";

    return {
      postbackUrl: `${currentDomain}/pix/webhook/payevo`, // URL do webhook
      items: paymentData.items.map((item) => ({
        title: item.title,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        externalRef: `ITEM_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 8)}`,
      })),
      customer: {
        name: paymentData.customer.name,
        email: paymentData.customer.email,
        phone: paymentData.customer.phone || "11999999999", // PayEvo requires phone - use default if not provided
        document: {
          number: paymentData.customer.document.number,
          type: paymentData.customer.document.type.toUpperCase() as
            | "CPF"
            | "CNPJ",
        },
      },
      paymentMethod: "PIX",
      pix: {
        expiresInDays: 1,
      },
      amount: paymentData.amount,
    };
  }

  private mapPayEvoStatusToStandard(status: string): string {
    const statusMap: { [key: string]: string } = {
      waiting_payment: "PENDING",
      paid: "APPROVED",
      expired: "EXPIRED",
      canceled: "EXPIRED",
      refunded: "EXPIRED",
    };
    return statusMap[status] || "PENDING";
  }

  async createPixPayment(
    paymentData: GatewayPaymentData
  ): Promise<GatewayPaymentResult> {
    console.log(`🔄 ${this.name}: Criando pagamento PIX...`);

    if (!this.apiKey) {
      throw new Error(`${this.name}: API Key não configurada`);
    }

    try {
      const payEvoRequest = this.convertToPayEvoFormat(paymentData);

      console.log(`📤 ${this.name}: Enviando requisição para API...`);

      const response = await fetch(
        `${this.config.apiUrl}functions/v1/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(this.apiKey).toString(
              "base64"
            )}`,
          },
          body: JSON.stringify(payEvoRequest),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`${this.name}: HTTP ${response.status} - ${errorData}`);
      }

      const payEvoResponse =
        (await response.json()) as PayEvoTransactionResponse;

      console.log(
        `✅ ${this.name}: PIX criado com sucesso - ID: ${payEvoResponse.id}`
      );

      return {
        qrcode: payEvoResponse.pix.qrcode,
        gatewayPaymentId: payEvoResponse.id,
        expirationDate: new Date(payEvoResponse.pix.expirationDate),
        gateway: this.name,
      };
    } catch (error) {
      console.error(
        `❌ ${this.name}: Erro ao criar PIX:`,
        (error as Error).message
      );
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<GatewayPaymentStatus> {
    console.log(
      `🔍 ${this.name}: Consultando status do pagamento ${paymentId}`
    );

    if (!this.apiKey) {
      throw new Error(`${this.name}: API Key não configurada`);
    }

    try {
      console.log(`📤 ${this.name}: Consultando API para status...`);

      const response = await fetch(
        `${this.config.apiUrl}functions/v1/transactions/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(this.apiKey).toString(
              "base64"
            )}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`${this.name}: HTTP ${response.status} - ${errorData}`);
      }

      const payEvoResponse =
        (await response.json()) as PayEvoTransactionResponse;
      const status = this.mapPayEvoStatusToStandard(payEvoResponse.status);

      console.log(
        `📄 ${this.name}: Status obtido - ${payEvoResponse.status} -> ${status}`
      );

      return {
        status: status as PaymentStatus,
        gateway: this.name,
        gatewayPaymentId: payEvoResponse.id,
        qrcode: payEvoResponse.pix.qrcode,
      };
    } catch (error) {
      console.error(
        `❌ ${this.name}: Erro ao consultar status:`,
        (error as Error).message
      );
      throw error;
    }
  }
}

export default PayEvoGateway;
