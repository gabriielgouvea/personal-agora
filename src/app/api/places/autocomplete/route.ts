import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.length < 3) {
    return NextResponse.json([]);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", input);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("limit", "7");
  url.searchParams.set("accept-language", "pt-BR");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PersonalAgora/1.0 (personal-agora)",
      },
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    const seen = new Set<string>();
    const suggestions = data
      .map((item: { display_name: string; place_id: number }) => ({
        description: item.display_name,
        placeId: String(item.place_id),
      }))
      .filter(({ description }) => {
        if (seen.has(description)) return false;
        seen.add(description);
        return true;
      });

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
