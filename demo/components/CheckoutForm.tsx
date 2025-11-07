import React, { useState } from "react";

export type Customer = {
  name: string;
  email: string;
  phone?: string;
};

export default function CheckoutForm({
  onSubmit,
  defaultCustomer,
}: {
  onSubmit: (c: Customer) => void;
  defaultCustomer?: Partial<Customer>;
}) {
  const [name, setName] = useState(defaultCustomer?.name || "");
  const [email, setEmail] = useState(defaultCustomer?.email || "");
  const [phone, setPhone] = useState(defaultCustomer?.phone || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name || "Cliente Demo",
          email: email || "demo@ex.com",
          phone,
        });
      }}
      className="card space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
          placeholder="Nome do cliente"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
          placeholder="email@exemplo.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Telefone (opcional)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
          placeholder="(11) 9xxxx-xxxx"
        />
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Pagar
        </button>
      </div>
    </form>
  );
}
