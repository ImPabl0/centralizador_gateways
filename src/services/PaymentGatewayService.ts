import { v4 as uuidv4 } from "uuid";
import PayEvoGateway from "./gateways/PayEvoGateway";
import BlackCatGateway from "./gateways/BlackCatGateway";
import {
  PaymentRequest,
  PaymentResponse,
  StoredPayment,
  PaymentStatus,
} from "../types";
import BaseGateway from "./gateways/BaseGateway";

class PaymentGatewayService {
  private gateways: BaseGateway[];
  private payments: Map<string, StoredPayment>;

  constructor() {
    this.gateways = [new PayEvoGateway(), new BlackCatGateway()];

    // Armazena pagamentos em memória (em produção, usar banco de dados)
    this.payments = new Map<string, StoredPayment>();
  }

  /**
   * Cria um pagamento PIX usando o primeiro gateway disponível
   * @param paymentData - Dados do pagamento
   * @returns Resposta padronizada
   */
  async createPixPayment(
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    const paymentId: string = uuidv4();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30); // Expira em 30 minutos

    console.log("🔄 Tentando criar PIX com gateways disponíveis...");

    for (const gateway of this.gateways) {
      try {
        console.log(`🔌 Tentando gateway: ${gateway.name}`);

        if (!gateway.isAvailable()) {
          console.log(`⚠️ Gateway ${gateway.name} não disponível`);
          continue;
        }

        const result = await gateway.createPixPayment({
          ...paymentData,
          id: paymentId,
          expirationDate,
        });

        // Armazena o pagamento
        this.payments.set(paymentId, {
          id: paymentId,
          gateway: gateway.name,
          originalData: paymentData,
          result,
          createdAt: new Date(),
          status: "PENDING",
        });

        console.log(`✅ PIX criado com sucesso no gateway: ${gateway.name}`);

        return {
          qrcode: result.qrcode,
          expirationDate: expirationDate.toISOString(),
          id: paymentId,
          status: "PENDING",
        };
      } catch (error) {
        console.error(
          `❌ Erro no gateway ${gateway.name}:`,
          (error as Error).message
        );
        continue;
      }
    }

    throw new Error("Nenhum gateway de pagamento está disponível no momento");
  }

  /**
   * Consulta o status de um pagamento
   * @param paymentId - ID do pagamento
   * @returns Status do pagamento ou null se não encontrado
   */
  async getPixPaymentStatus(
    paymentId: string
  ): Promise<PaymentResponse | null> {
    const payment = this.payments.get(paymentId);

    if (!payment) {
      return null;
    }

    // Verifica se o pagamento expirou
    const now = new Date();
    const expirationDate = new Date(
      payment.result.expirationDate ||
        payment.createdAt.getTime() + 30 * 60 * 1000
    );

    if (now > expirationDate && payment.status === "PENDING") {
      payment.status = "EXPIRED";
      this.payments.set(paymentId, payment);
    }

    // Em um cenário real, consultaria o gateway para verificar o status atualizado
    // Por enquanto, simula algumas aprovações aleatórias
    if (payment.status === "PENDING" && Math.random() < 0.1) {
      // 10% de chance de ser aprovado
      payment.status = "APPROVED";
      this.payments.set(paymentId, payment);
    }

    return {
      qrcode: payment.result.qrcode,
      expirationDate: expirationDate.toISOString(),
      id: paymentId,
      status: payment.status,
    };
  }

  /**
   * Lista todos os pagamentos (para debug)
   * @returns Lista de pagamentos
   */
  getAllPayments(): StoredPayment[] {
    return Array.from(this.payments.values());
  }
}

export default PaymentGatewayService;
