import {
  GatewayConfig,
  GatewayPaymentData,
  GatewayPaymentResult,
  PaymentRequest,
} from "../../types";

/**
 * Classe base para todos os gateways de pagamento PIX
 */
abstract class BaseGateway {
  public readonly name: string;
  protected config: GatewayConfig;
  private isEnabled: boolean;

  constructor(name: string, config: GatewayConfig = {}) {
    this.name = name;
    this.config = config;
    this.isEnabled = config.enabled !== false;
  }

  /**
   * Verifica se o gateway está disponível
   * @returns true se disponível
   */
  isAvailable(): boolean {
    return this.isEnabled && this.healthCheck();
  }

  /**
   * Verifica a saúde do gateway
   * @returns true se saudável
   */
  healthCheck(): boolean {
    // Implementação básica - pode ser sobrescrita
    return true;
  }

  /**
   * Cria um pagamento PIX
   * @param paymentData - Dados do pagamento
   * @returns Resultado do pagamento
   */
  abstract createPixPayment(
    paymentData: GatewayPaymentData
  ): Promise<GatewayPaymentResult>;

  /**
   * Consulta o status de um pagamento
   * @param paymentId - ID do pagamento
   * @returns Status do pagamento
   */
  abstract getPaymentStatus(
    paymentId: string
  ): Promise<{ status: string; gateway: string; gatewayPaymentId: string }>;
}

export default BaseGateway;
