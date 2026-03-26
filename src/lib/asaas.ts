const BASE = process.env.ASAAS_URL || "https://api.asaas.com/v3";

const PLAN_VALUES: Record<string, number> = {
  start: 29.9,
  pro: 49.9,
  elite: 99.9,
};

async function asaasReq<T>(path: string, method: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY!,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { errors?: { description: string }[] })?.errors?.[0]?.description ?? "Erro Asaas";
    throw new Error(msg);
  }
  return data as T;
}

export async function createOrFindAsaasCustomer(
  nome: string,
  sobrenome: string,
  email: string,
  cpf: string
): Promise<string> {
  const cpfLimpo = cpf.replace(/\D/g, "");
  const search = await asaasReq<{ data: { id: string }[] }>(
    `/customers?cpfCnpj=${cpfLimpo}`,
    "GET"
  );
  if (search.data.length > 0) return search.data[0].id;

  const customer = await asaasReq<{ id: string }>("/customers", "POST", {
    name: `${nome} ${sobrenome}`.trim(),
    email,
    cpfCnpj: cpfLimpo,
    notificationDisabled: false,
  });
  return customer.id;
}

export async function createAsaasSubscription(
  customerId: string,
  plano: string
): Promise<string> {
  const value = PLAN_VALUES[plano] ?? 49.9;
  const nextDueDate = new Date().toISOString().split("T")[0];
  const nomePlano = plano.charAt(0).toUpperCase() + plano.slice(1);

  const sub = await asaasReq<{ id: string }>("/subscriptions", "POST", {
    customer: customerId,
    billingType: "UNDEFINED",
    value,
    nextDueDate,
    cycle: "MONTHLY",
    description: `Plano ${nomePlano} - Personal Agora`,
  });
  return sub.id;
}

export async function getSubscriptionPaymentUrl(subscriptionId: string): Promise<string | null> {
  const payments = await asaasReq<{ data: { invoiceUrl?: string }[] }>(
    `/subscriptions/${subscriptionId}/payments`,
    "GET"
  );
  return payments.data[0]?.invoiceUrl ?? null;
}

export interface AsaasSubscription {
  id: string;
  status: string; // ACTIVE | INACTIVE | EXPIRED
  value: number;
  nextDueDate: string;
  cycle: string;
  billingType: string;
  description: string;
  deleted: boolean;
}

export interface AsaasPayment {
  id: string;
  status: string; // PENDING | RECEIVED | CONFIRMED | OVERDUE | REFUNDED | RECEIVED_IN_CASH | CHARGEBACK_REQUESTED | CHARGEBACK_DISPUTE | AWAITING_CHARGEBACK_REVERSAL | DUNNING_REQUESTED | DUNNING_RECEIVED | AWAITING_RISK_ANALYSIS
  value: number;
  dueDate: string;
  paymentDate: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  subscription: string | null;
  billingType: string;
}

export async function getAsaasSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasReq<AsaasSubscription>(`/subscriptions/${subscriptionId}`, "GET");
}

export async function getSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const res = await asaasReq<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments?limit=20`,
    "GET"
  );
  return res.data;
}

export async function cancelAsaasSubscription(subscriptionId: string): Promise<void> {
  await asaasReq<{ deleted: boolean }>(`/subscriptions/${subscriptionId}`, "DELETE");
}

export async function getPaymentCheckoutUrl(
  paymentId: string,
  billingType: "CREDIT_CARD" | "PIX"
): Promise<string | null> {
  // Atualiza o billingType do pagamento avulso e retorna o invoiceUrl
  await asaasReq<object>(`/payments/${paymentId}`, "PUT", { billingType });
  const payment = await asaasReq<AsaasPayment>(`/payments/${paymentId}`, "GET");
  return payment.invoiceUrl ?? null;
}
