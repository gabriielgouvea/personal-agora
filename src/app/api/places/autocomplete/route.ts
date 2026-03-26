import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.length < 2) {
    return NextResponse.json([]);
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", input);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "default");
  url.searchParams.set("osm_tag", "place");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "PersonalAgora/1.0" },
    });
    const data = await res.json();

    if (!data.features || !Array.isArray(data.features)) {
      return NextResponse.json([]);
    }

    const seen = new Set<string>();
    const suggestions = data.features
      .filter((f: { properties: { countrycode?: string } }) =>
        f.properties.countrycode === "BR"
      )
      .map((f: { properties: { name?: string; city?: string; state?: string; country?: string; postcode?: string; district?: string }; }) => {
        const p = f.properties;
        const parts = [p.name, p.district, p.city, p.state].filter(Boolean);
        const description = parts.join(", ");
        return { description, placeId: description };
      })
      .filter(({ description }: { description: string }) => {
        if (!description || seen.has(description)) return false;
        seen.add(description);
        return true;
      });

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
