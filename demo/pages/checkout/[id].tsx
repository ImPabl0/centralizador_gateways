import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PRODUCTS, formatPrice } from "../../data/products";
import CheckoutForm from "../../components/CheckoutForm";
import Upsell from "../../components/Upsell";

type PaymentResponse = { id: string; status?: string; qrcode?: string };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const product = PRODUCTS.find((p) => p.id === id);

  const [step, setStep] = useState<"form" | "creating" | "waiting" | "done">(
    "form"
  );
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [upsellItems, setUpsellItems] = useState(() => PRODUCTS.slice(0, 3));

  useEffect(() => {
    if (!paymentId || step !== "waiting") return;

    console.log(`🔌 Conectando ao SSE para pagamento: ${paymentId}`);
    const sseUrl = `${API}/pix/sse/blackcat/${paymentId}`;
    const es = new EventSource(sseUrl);

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        console.log("📨 SSE recebido:", payload);

        // O status está em payload.data.status conforme a estrutura do SSE
        if (payload.data && payload.data.status) {
          setStatus(payload.data.status);
          const st = String(payload.data.status).toUpperCase();
          if (
            st.includes("APPROVED") ||
            st.includes("PAID") ||
            st.includes("COMPLETED") ||
            st.includes("SUCCESS") ||
            st.includes("SUCCEEDED")
          ) {
            console.log("✅ Pagamento confirmado via SSE");
            setStep("done");
            es.close();
          }
        }
      } catch (err) {
        console.warn("⚠️ Erro ao parsear SSE:", err);
      }
    };

    es.onerror = (error) => {
      console.warn("❌ SSE erro:", error);
    };

    return () => {
      console.log("🔌 Fechando conexão SSE");
      es.close();
    };
  }, [paymentId, step]);

  async function onPay(customer: any) {
    if (!product) return;

    try {
      // Etapa 1: Criando pagamento
      setStep("creating");
      console.log("💳 Criando pagamento...");

      const body = {
        // product.price já está em centavos
        amount: product.price,
        items: [
          {
            title: product.title,
            unitPrice: product.price,
            quantity: 1,
            tangible: false,
          },
        ],
        paymentMethod: "pix",
        pix: { expiresInDays: 1 },
      };

      const res = await fetch(`${API}/pix/blackcat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      console.log("📥 Resposta do pagamento:", res);
      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      const data: PaymentResponse = await res.json();
      console.log("✅ Pagamento criado:", data);

      // Etapa 2: Definir ID do pagamento e mudar para aguardando
      setPaymentId(data.id);
      // Se o backend retornou um payload QR (string), gerar imagem dataURL
      if (data.qrcode) {
        try {
          const QR = await import("qrcode");
          const url = await QR.toDataURL(data.qrcode);
          setQrDataUrl(url);
          setQrPayload(data.qrcode);
        } catch (err) {
          console.warn("Erro ao gerar QR code:", err);
        }
      }
      setStep("waiting");
      console.log("🔄 Mudando para etapa de aguardo/SSE...");
    } catch (error) {
      console.error("❌ Erro ao criar pagamento:", error);
      alert("Erro ao criar pagamento. Tente novamente.");
      setStep("form");
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>
      {product && (
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{product.title}</div>
              <div className="text-sm text-gray-500">{product.description}</div>
            </div>
            <div className="font-bold">{formatPrice(product.price)}</div>
          </div>
        </div>
      )}

      {step === "form" && (
        <CheckoutForm
          defaultCustomer={{ name: "Cliente Demo" }}
          onSubmit={(c) => onPay(c)}
        />
      )}

      {step === "creating" && (
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <div>Criando pagamento PIX...</div>
          </div>
        </div>
      )}

      {step === "waiting" && (
        <div className="card">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
              <div>Pagamento criado! Conectando ao servidor via SSE...</div>
            </div>
            <div className="text-sm text-gray-500">Payment ID: {paymentId}</div>
            <div className="text-sm">
              Status: {status || "Aguardando confirmação"}
            </div>
            {qrDataUrl && (
              <div className="mt-4 flex flex-col items-center">
                <img src={qrDataUrl} alt="QR Code PIX" className="w-48 h-48" />
                <div className="text-xs text-gray-500 mt-2">
                  Leia o QR code com seu app bancário para pagar
                </div>
                <div className="mt-2 w-full">
                  <label className="block text-xs text-gray-400">
                    Payload do QR (para debug)
                  </label>
                  <textarea
                    readOnly
                    value={qrPayload || ""}
                    className="w-full mt-1 p-2 text-xs border rounded h-24"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() =>
                        navigator.clipboard?.writeText(qrPayload || "")
                      }
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                    >
                      Copiar payload
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold">Pagamento confirmado ✅</h3>
            <div className="text-sm text-gray-600">Obrigado pela compra!</div>
          </div>

          <Upsell
            items={upsellItems}
            onBuy={(p) => alert(`Adicionado ${p.title} (demo)`)}
          />
        </div>
      )}
    </main>
  );
}
