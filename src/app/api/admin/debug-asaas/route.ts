import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ASAAS_API_KEY ?? "";
  const url = process.env.ASAAS_URL ?? "https://api.asaas.com/v3";

  // Info sobre a chave sem expô-la por completo
  const keyInfo = {
    length: key.length,
    startsWidth: key.slice(0, 10),
    endsWidth: key.slice(-6),
    hasQuotes: key.startsWith('"') || key.startsWith("'"),
    hasNewline: key.includes("\n") || key.includes("\r"),
    hasSpace: key.includes(" "),
  };

  // Testa uma chamada real ao Asaas
  let asaasResult: unknown = null;
  try {
    const res = await fetch(`${url}/customers?limit=1`, {
      headers: {
        "Content-Type": "application/json",
        access_token: key,
      },
    });
    const body = await res.json().catch(() => ({}));
    asaasResult = { status: res.status, body };
  } catch (e) {
    asaasResult = { error: String(e) };
  }

  return NextResponse.json({ keyInfo, asaasResult });
}
