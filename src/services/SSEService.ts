import { Response } from "express";

interface SSEConnection {
  id: string;
  res: Response;
  paymentId: string;
  gateway: string;
  timestamp: number;
}

class SSEService {
  private connections: Map<string, SSEConnection[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpa conexões mortas a cada 30 segundos
    this.cleanupInterval = setInterval(() => {
      this.cleanupDeadConnections();
    }, 30000);
  }

  /**
   * Adiciona uma nova conexão SSE
   */
  addConnection(paymentId: string, gateway: string, res: Response): string {
    const connectionId = `${gateway}_${paymentId}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const connection: SSEConnection = {
      id: connectionId,
      res,
      paymentId,
      gateway,
      timestamp: Date.now(),
    };

    const key = `${gateway}_${paymentId}`;

    if (!this.connections.has(key)) {
      this.connections.set(key, []);
    }

    this.connections.get(key)!.push(connection);

    console.log(
      `📡 Nova connexão SSE adicionada: ${connectionId} para pagamento ${paymentId} (${gateway})`
    );
    console.log(`📊 Total de conexões ativas: ${this.getTotalConnections()}`);

    return connectionId;
  }

  /**
   * Remove uma conexão específica
   */
  removeConnection(connectionId: string): void {
    for (const [key, connections] of this.connections.entries()) {
      const index = connections.findIndex((conn) => conn.id === connectionId);
      if (index !== -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.connections.delete(key);
        }
        console.log(`📡 Conexão SSE removida: ${connectionId}`);
        console.log(
          `📊 Total de conexões ativas: ${this.getTotalConnections()}`
        );
        break;
      }
    }
  }

  /**
   * Notifica todas as conexões de um pagamento específico
   */
  notifyPayment(paymentId: string, gateway: string, data: any): void {
    const key = `${gateway}_${paymentId}`;
    const connections = this.connections.get(key);

    if (!connections || connections.length === 0) {
      console.log(
        `📡 Nenhuma conexão SSE encontrada para ${gateway}_${paymentId}`
      );
      return;
    }

    const message = JSON.stringify({
      type: "payment_status_update",
      paymentId,
      gateway,
      data,
      timestamp: new Date().toISOString(),
    });

    const deadConnections: string[] = [];

    connections.forEach((connection) => {
      try {
        connection.res.write(`data: ${message}\n\n`);
        console.log(
          `📡 Notificação SSE enviada para ${connection.id}: ${gateway}_${paymentId}`
        );
      } catch (error) {
        console.error(`❌ Erro ao enviar SSE para ${connection.id}:`, error);
        deadConnections.push(connection.id);
      }
    });

    // Remove conexões mortas
    deadConnections.forEach((id) => this.removeConnection(id));
  }

  /**
   * Notifica todas as conexões de um gateway específico
   */
  notifyGateway(gateway: string, data: any): void {
    const message = JSON.stringify({
      type: "gateway_notification",
      gateway,
      data,
      timestamp: new Date().toISOString(),
    });

    const deadConnections: string[] = [];

    for (const [key, connections] of this.connections.entries()) {
      if (key.startsWith(`${gateway}_`)) {
        connections.forEach((connection) => {
          try {
            connection.res.write(`data: ${message}\n\n`);
            console.log(
              `📡 Notificação gateway SSE enviada para ${connection.id}`
            );
          } catch (error) {
            console.error(
              `❌ Erro ao enviar SSE gateway para ${connection.id}:`,
              error
            );
            deadConnections.push(connection.id);
          }
        });
      }
    }

    // Remove conexões mortas
    deadConnections.forEach((id) => this.removeConnection(id));
  }

  /**
   * Limpa conexões mortas ou muito antigas
   */
  private cleanupDeadConnections(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutos
    const deadConnections: string[] = [];

    for (const [key, connections] of this.connections.entries()) {
      connections.forEach((connection) => {
        // Verifica se a conexão é muito antiga
        if (now - connection.timestamp > maxAge) {
          deadConnections.push(connection.id);
          return;
        }

        // Testa se a conexão ainda está viva
        try {
          connection.res.write(": heartbeat\n\n");
        } catch (error) {
          deadConnections.push(connection.id);
        }
      });
    }

    if (deadConnections.length > 0) {
      console.log(`🧹 Limpando ${deadConnections.length} conexões SSE mortas`);
      deadConnections.forEach((id) => this.removeConnection(id));
    }
  }

  /**
   * Retorna o total de conexões ativas
   */
  private getTotalConnections(): number {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.length;
    }
    return total;
  }

  /**
   * Obtém estatísticas das conexões
   */
  getStats(): {
    totalConnections: number;
    connectionsByGateway: Record<string, number>;
    connectionsByPayment: Record<string, number>;
  } {
    const stats = {
      totalConnections: 0,
      connectionsByGateway: {} as Record<string, number>,
      connectionsByPayment: {} as Record<string, number>,
    };

    for (const [key, connections] of this.connections.entries()) {
      const [gateway, paymentId] = key.split("_");

      stats.totalConnections += connections.length;

      if (gateway) {
        if (!stats.connectionsByGateway[gateway]) {
          stats.connectionsByGateway[gateway] = 0;
        }
        stats.connectionsByGateway[gateway] += connections.length;
      }

      stats.connectionsByPayment[key] = connections.length;
    }

    return stats;
  }

  /**
   * Limpa todas as conexões (útil para shutdown)
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    for (const connections of this.connections.values()) {
      connections.forEach((connection) => {
        try {
          connection.res.end();
        } catch (error) {
          // Ignora erros ao fechar conexões
        }
      });
    }

    this.connections.clear();
    console.log("🧹 Todas as conexões SSE foram limpas");
  }
}

// Singleton para gerenciar conexões SSE globalmente
export const sseService = new SSEService();
export default SSEService;
