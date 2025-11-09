import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/button";
import { cn } from "../lib/utils";
import { Copy, Check, Loader2 } from "lucide-react";
import BackgroundVideoSwitcher from "../components/BackgroundVideoSwitcher";
import { QRCodeSVG } from "qrcode.react";

interface PixQRCodeProps {
  pixValue: number;
  quantity?: number;
  onClose?: () => void;
}

interface PixResponse {
  qrCode: string;
  qrcode: string;
  id: string;
}
const BACKGROUND_GIF_URL =
  "https://lf-tt4b.tiktokcdn.com/obj/i18nblog/tt4b_cms/en-US/tipdilz7wysq-5g2Tozyia76njn3YAQivBX.gif";

const PixQRCode: React.FC<PixQRCodeProps> = ({
  pixValue,
  quantity = 1,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentApproved, setPaymentApproved] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  useEffect(() => {
    const createPixPayment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Converte o valor para centavos
        const amountInCents = Math.round(pixValue * 100);

        const payload = {
          amount: amountInCents,
          items: [
            {
              title: "Selo de SuperFã",
              unitPrice: Math.round((pixValue / quantity) * 100),
              quantity: quantity,
              tangible: false,
              externalRef: `Selo${Date.now()}`,
            },
          ],
          pix: {
            expiresInDays: 1,
          },
          paymentMethod: "PIX",
        };

        const response = await fetch(
          "https://oferta.segurocheckout.online/api/pix/payevo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        setPixData(data);
      } catch (err) {
        console.error("Erro ao criar pagamento PIX:", err);
        setError("Erro ao gerar código PIX. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    createPixPayment();
  }, [pixValue, quantity]);

  // useEffect para conectar ao SSE e monitorar status do pagamento
  useEffect(() => {
    if (!pixData?.id || paymentApproved) return;

    console.log(`🔌 Conectando ao SSE para pagamento: ${pixData.id}`);
    const sseUrl = `https://oferta.segurocheckout.online/api/pix/sse/payevo/${pixData.id}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("📨 SSE recebido:", payload);

        // Verifica se é uma atualização de status de pagamento
        if (
          payload.type === "payment_status_update" &&
          payload.data &&
          payload.data.status
        ) {
          setPaymentStatus(payload.data.status);

          const status = String(payload.data.status).toUpperCase();
          if (
            status === "APPROVED" ||
            status.includes("PAID") ||
            status.includes("SUCCESS")
          ) {
            console.log("✅ Pagamento aprovado via SSE");
            setPaymentApproved(true);
            eventSource.close();
          }
        }
      } catch (err) {
        console.warn("⚠️ Erro ao parsear SSE:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.warn("❌ SSE erro:", error);
    };

    return () => {
      console.log("🔌 Fechando conexão SSE");
      eventSource.close();
    };
  }, [pixData?.id, paymentApproved]);

  const retryCreatePixPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentApproved(false);
      setPaymentStatus(null);

      // Converte o valor para centavos
      const amountInCents = Math.round(pixValue * 100);

      const payload = {
        amount: amountInCents,
        items: [
          {
            title: "Selo de SuperFã",
            unitPrice: Math.round((pixValue / quantity) * 100),
            quantity: quantity,
            tangible: false,
            externalRef: `Selo${Date.now()}`,
          },
        ],
        pix: {
          expiresInDays: 1,
        },
        paymentMethod: "PIX",
      };

      const response = await fetch(
        "https://oferta.segurocheckout.online/api/pix/payevo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      setPixData(data);
    } catch (err) {
      console.error("Erro ao criar pagamento PIX:", err);
      setError("Erro ao gerar código PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (pixData?.qrcode) {
      try {
        await navigator.clipboard.writeText(pixData.qrcode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Erro ao copiar código PIX:", err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden ">
      {/* GIF de Fundo com Opacidade */}
      <BackgroundVideoSwitcher url={BACKGROUND_GIF_URL} />

      {/* Conteúdo Principal */}
      <main className="flex flex-grow items-center justify-center relative">
        <div className="w-full max-w-md mx-auto p-6 relative z-10">
          {/* Card do QR Code */}
          <div
            className={cn(
              "w-full p-6 rounded-lg shadow-lg text-center",
              "bg-black/20 backdrop-blur-xl border-2 border-red-500/50 text-white shadow-2xl"
            )}
          >
            {/* Título */}
            <h2 className="text-2xl font-bold text-white mb-4">
              {paymentApproved ? "Pagamento Aprovado! ✅" : "Pagamento PIX"}
            </h2>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-tiktok-pink mb-4" />
                <p className="text-gray-300">Gerando código PIX...</p>
              </div>
            )}

            {error && (
              <div className="py-8">
                <p className="text-red-400 mb-4">❌ {error}</p>
                <Button
                  onClick={retryCreatePixPayment}
                  className="bg-tiktok-pink hover:bg-pink-600 text-white"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}

            {pixData && !loading && !error && (
              <>
                {paymentApproved ? (
                  /* Mensagem de Sucesso */
                  <div className="py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-green-400 mb-4">
                      Pagamento Aprovado!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Seu pagamento PIX foi processado com sucesso.
                    </p>
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                      <p className="text-green-300 text-sm">
                        ✅ Transação confirmada
                        <br />
                      </p>
                    </div>
                  </div>
                ) : (
                  /* QR Code */
                  <div className="bg-white p-4 rounded-lg mb-6 mx-auto inline-block">
                    {pixData.qrcode ? (
                      <QRCodeSVG
                        value={pixData.qrcode}
                        size={192}
                        level="M"
                        includeMargin={false}
                        className="mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-48 mx-auto flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                {!paymentApproved && (
                  <>
                    {/* Status do Pagamento */}
                    {paymentStatus && (
                      <div className="mb-4">
                        <p className="text-blue-400 text-sm">
                          Status: {paymentStatus}
                        </p>
                      </div>
                    )}

                    {/* Mensagem de Expiração */}
                    <div className="mb-6">
                      <p className="text-yellow-400 text-lg font-semibold">
                        ⏰ Expira amanhã
                      </p>
                    </div>
                  </>
                )}

                {/* Valor */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-1">Valor a pagar:</p>
                  <p className="text-tiktok-pink text-3xl font-bold">
                    {formatCurrency(pixValue)}
                  </p>
                </div>

                {!paymentApproved && (
                  <>
                    {/* Instruções */}
                    <div className="mb-6 text-left">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        • Abra o app do seu banco
                        <br />
                        • Escolha a opção PIX
                        <br />
                        • Escaneie o QR Code ou copie o código
                        <br />• Confirme o pagamento
                      </p>
                    </div>

                    {/* Botão de Copiar Código PIX */}
                    <Button
                      onClick={handleCopyPixCode}
                      className={cn(
                        "w-full text-white font-bold py-3 rounded-md inline-flex items-center justify-center mb-4",
                        "bg-tiktok-pink hover:bg-pink-600 transition-colors",
                        "h-12 px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Código Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Código PIX
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Botão de Fechar/Voltar */}
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className={cn(
                  "w-full text-white font-bold py-2 rounded-md",
                  "bg-transparent border-gray-600 hover:bg-gray-800 transition-colors"
                )}
              >
                Voltar
              </Button>
            )}
          </div>

          {/* Aviso de Segurança */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              🔒 Pagamento 100% seguro via PIX
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente principal da página que captura o parâmetro pixValue da URL
function Home() {
  const router = useRouter();
  let { valor } = router.query;

  // Se não há valor na URL, mostra uma mensagem informativa

  // Converte o valor para número
  let valorNumber = parseFloat(valor as string);

  // Valida se é um número válido
  if (!valor || isNaN(valorNumber) || valorNumber <= 0) {
    valorNumber = 18.95;
  }

  return <PixQRCode pixValue={valorNumber} />;
}

export default Home;
