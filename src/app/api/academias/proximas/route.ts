import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fórmula de Haversine — distância em km entre duas coordenadas
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const latStr = req.nextUrl.searchParams.get("lat");
  const lngStr = req.nextUrl.searchParams.get("lng");
  const raioStr = req.nextUrl.searchParams.get("raio"); // km, default 15

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "Parâmetros lat e lng são obrigatórios" },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const raio = raioStr ? parseFloat(raioStr) : 15;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Coordenadas inválidas" },
      { status: 400 }
    );
  }

  // Buscar todas as academias que possuem coordenadas
  const academias = await prisma.academia.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      nome: true,
      endereco: true,
      latitude: true,
      longitude: true,
    },
  });

  // Calcular distância e filtrar pelo raio
  const proximas = academias
    .map((a) => ({
      ...a,
      distanciaKm: haversineKm(lat, lng, a.latitude!, a.longitude!),
    }))
    .filter((a) => a.distanciaKm <= raio)
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, 20)
    .map((a) => ({
      ...a,
      distanciaKm: Math.round(a.distanciaKm * 10) / 10,
    }));

  return NextResponse.json(proximas);
}
