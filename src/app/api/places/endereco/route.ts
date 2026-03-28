import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.length < 3) {
    return NextResponse.json([]);
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", input);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "default");

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
      .filter(
        (f: { properties: { countrycode?: string } }) =>
          f.properties.countrycode === "BR"
      )
      .map(
        (f: {
          geometry: { coordinates: number[] };
          properties: {
            name?: string;
            housenumber?: string;
            street?: string;
            district?: string;
            city?: string;
            state?: string;
            postcode?: string;
          };
        }) => {
          const p = f.properties;
          const parts = [
            p.street || p.name,
            p.housenumber,
            p.district,
            p.city,
            p.state,
          ].filter(Boolean);
          const description = parts.join(", ");
          const [longitude, latitude] = f.geometry.coordinates;
          return { description, latitude, longitude };
        }
      )
      .filter(
        ({
          description,
          latitude,
          longitude,
        }: {
          description: string;
          latitude: number;
          longitude: number;
        }) => {
          if (!description || seen.has(description) || !latitude || !longitude)
            return false;
          seen.add(description);
          return true;
        }
      );

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
