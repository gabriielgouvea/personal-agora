import prisma from "@/lib/prisma";

function csvEscape(value: unknown) {
  const str = value == null ? "" : String(value);
  const mustQuote = /[\r\n",]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

export async function GET() {
  const trainers = await prisma.personalTrainer.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "createdAt",
    "name",
    "whatsapp",
    "email",
    "cref",
    "crefValidity",
    "academies",
    "residentialAvailable",
    "gender",
    "studentGenderPreference",
    "instagram",
    "photoUrl",
    "contactConsent",
  ];

  const rows = trainers.map((t) => [
    t.createdAt.toISOString(),
    t.name,
    t.whatsapp,
    t.email,
    t.cref,
    t.crefValidity.toISOString(),
    t.academies,
    t.residentialAvailable ? "true" : "false",
    t.gender,
    t.studentGenderPreference,
    t.instagram ?? "",
    t.photoUrl ?? "",
    t.contactConsent ? "true" : "false",
  ]);

  const csv = [headers, ...rows]
    .map((line) => line.map(csvEscape).join(","))
    .join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="personal-agora-cadastros.csv"',
      "Cache-Control": "no-store",
    },
  });
}
