const isSandbox = process.env.ASAAS_SANDBOX === "true";
const BASE = isSandbox
  ? "https://sandbox.asaas.com/api/v3"
  : (process.env.ASAAS_URL || "https://api.asaas.com/v3");
const API_KEY = isSandbox
  ? (process.env.ASAAS_SANDBOX_KEY ?? "")
  : (process.env.ASAAS_API_KEY ?? "");

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
      access_token: API_KEY,
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
  plano: string,
  billingType: "PIX" | "CREDIT_CARD" | "UNDEFINED" = "UNDEFINED",
  discountValue?: number
): Promise<string> {
  const baseValue = PLAN_VALUES[plano] ?? 49.9;
  const value = discountValue !== undefined
    ? Math.max(parseFloat((baseValue - discountValue).toFixed(2)), 0)
    : baseValue;
  const nextDueDate = new Date().toISOString().split("T")[0];
  const nomePlano = plano.charAt(0).toUpperCase() + plano.slice(1);

  const sub = await asaasReq<{ id: string }>("/subscriptions", "POST", {
    customer: customerId,
    billingType,
    value,
    nextDueDate,
    cycle: "MONTHLY",
    description: `Plano ${nomePlano} - Personal Agora`,
  });
  return sub.id;
}

export async function updateAsaasSubscriptionValue(subscriptionId: string, value: number): Promise<void> {
  await asaasReq(`/subscriptions/${subscriptionId}`, "POST", { value });
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

export async function createAsaasCharge(
  customerId: string,
  value: number,
  dueDate: string, // YYYY-MM-DD
  description: string,
  externalReference: string,
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED" = "PIX",
  callbackSuccessUrl?: string
): Promise<{ id: string; invoiceUrl: string | null }> {
  const body: Record<string, unknown> = {
    customer: customerId,
    billingType,
    value,
    dueDate,
    description,
    externalReference,
  };
  if (callbackSuccessUrl) {
    body.callback = { successUrl: callbackSuccessUrl, autoRedirect: true };
  }
  const charge = await asaasReq<{ id: string; invoiceUrl?: string | null }>("/payments", "POST", body);
  return { id: charge.id, invoiceUrl: charge.invoiceUrl ?? null };
}

export async function cancelAsaasSubscription(subscriptionId: string): Promise<void> {
  await asaasReq<{ deleted: boolean }>(`/subscriptions/${subscriptionId}`, "DELETE");
}

export interface PixQrCode {
  encodedImage: string; // base64 da imagem do QR Code
  payload: string;      // código Pix Copia e Cola
  expirationDate: string;
}

export async function getPixQrCode(paymentId: string): Promise<PixQrCode> {
  return asaasReq<PixQrCode>(`/payments/${paymentId}/pixQrCode`, "GET");
}

export async function getPaymentStatus(paymentId: string): Promise<{ status: string }> {
  const payment = await asaasReq<AsaasPayment>(`/payments/${paymentId}`, "GET");
  return { status: payment.status };
}

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface CardChargeResult {
  id: string;
  status: string; // CONFIRMED, RECEIVED, PENDING, etc.
  invoiceUrl: string | null;
}

export async function createAsaasCardCharge(
  customerId: string,
  value: number,
  dueDate: string,
  description: string,
  externalReference: string,
  creditCard: CreditCardData,
  creditCardHolderInfo: CreditCardHolderInfo,
): Promise<CardChargeResult> {
  const body: Record<string, unknown> = {
    customer: customerId,
    billingType: "CREDIT_CARD",
    value,
    dueDate,
    description,
    externalReference,
    creditCard,
    creditCardHolderInfo,
  };
  const charge = await asaasReq<{ id: string; status: string; invoiceUrl?: string | null }>(
    "/payments",
    "POST",
    body
  );
  return { id: charge.id, status: charge.status, invoiceUrl: charge.invoiceUrl ?? null };
}

// ── Assinatura recorrente de aula ──

export interface AulaSubscriptionResult {
  subscriptionId: string;
  firstPaymentId: string | null;
  status: string;
}

/**
 * Cria assinatura mensal recorrente para aula.
 * - CREDIT_CARD: auto-cobrado todo mês, cancelado pelo aluno.
 * - PIX: gera cobrança mensal + notificações por e-mail.
 */
export async function createAulaSubscription(
  customerId: string,
  value: number,
  description: string,
  externalReference: string,
  billingType: "PIX" | "CREDIT_CARD",
  creditCard?: CreditCardData,
  creditCardHolderInfo?: CreditCardHolderInfo,
): Promise<AulaSubscriptionResult> {
  const nextDueDate = new Date().toISOString().split("T")[0];

  const body: Record<string, unknown> = {
    customer: customerId,
    billingType,
    value,
    nextDueDate,
    cycle: "MONTHLY",
    description,
    externalReference,
  };

  if (billingType === "CREDIT_CARD" && creditCard && creditCardHolderInfo) {
    body.creditCard = creditCard;
    body.creditCardHolderInfo = creditCardHolderInfo;
  }

  const sub = await asaasReq<{ id: string; status: string }>(
    "/subscriptions",
    "POST",
    body
  );

  // Busca o primeiro pagamento gerado pela assinatura
  let firstPaymentId: string | null = null;
  try {
    const payments = await asaasReq<{ data: { id: string }[] }>(
      `/subscriptions/${sub.id}/payments?limit=1`,
      "GET"
    );
    firstPaymentId = payments.data[0]?.id ?? null;
  } catch { /* ignora */ }

  return {
    subscriptionId: sub.id,
    firstPaymentId,
    status: sub.status,
  };
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
