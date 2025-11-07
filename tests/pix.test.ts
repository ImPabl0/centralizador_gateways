import request from "supertest";
import app from "../src/server";
import { PaymentRequest } from "../src/types";

describe("PIX API", () => {
  describe("POST /pix", () => {
    const validPayment: PaymentRequest = {
      currency: "BRL",
      amount: 10000,
      items: [
        {
          title: "Test Product",
          unitPrice: 10000,
          quantity: 1,
          tangible: false,
        },
      ],
      customer: {
        name: "Fulano de Tal",
        email: "fulano@gmail.com",
        document: {
          number: "00000000000",
          type: "cpf",
        },
      },
    };

    it("deve criar um pagamento PIX válido", async () => {
      const response = await request(app)
        .post("/pix")
        .send(validPayment)
        .expect(201);

      expect(response.body).toHaveProperty("qrcode");
      expect(response.body).toHaveProperty("expirationDate");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status", "PENDING");
    });

    it("deve rejeitar pagamento com dados inválidos", async () => {
      const invalidPayment = { ...validPayment };
      delete (invalidPayment as any).customer;

      const response = await request(app)
        .post("/pix")
        .send(invalidPayment)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("deve rejeitar quando soma dos itens não bate com amount", async () => {
      const invalidPayment: PaymentRequest = {
        ...validPayment,
        amount: 5000, // Diferente do unitPrice * quantity
      };

      const response = await request(app)
        .post("/pix")
        .send(invalidPayment)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Valor inconsistente");
    });
  });

  describe("GET /pix/:id", () => {
    it("deve retornar 404 para pagamento não encontrado", async () => {
      const response = await request(app).get("/pix/inexistente").expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /health", () => {
    it("deve retornar status OK", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
    });
  });
});
