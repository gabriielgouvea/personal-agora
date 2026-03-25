import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.length < 3) {
    return NextResponse.json([]);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json([]);
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  url.searchParams.set("input", input);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("components", "country:br");
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("types", "(regions)");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json([]);
    }

    const suggestions = data.predictions.map(
      (p: { description: string; place_id: string }) => ({
        description: p.description,
        placeId: p.place_id,
      })
    );

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
