import { NextRequest, NextResponse } from "next/server";
import { findNearbyPlaces } from "@/lib/places/provider";
import { validateCoordinates, validateServiceType } from "@/lib/validation/assistantSchemas";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const typeStr = searchParams.get("type");
  const radiusStr = searchParams.get("radius");
  const limitStr = searchParams.get("limit");
  const require24x7Str = searchParams.get("require24x7");
  const requireGovtStr = searchParams.get("requireGovt") || searchParams.get("government");
  const subCategory = searchParams.get("subCategory") || searchParams.get("specialty") || undefined;
  const query = searchParams.get("query") || undefined;

  // Validate coordinates
  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "Missing required parameters 'lat' and 'lng'." },
      { status: 400 }
    );
  }

  const coords = validateCoordinates(latStr, lngStr);
  if (!coords) {
    return NextResponse.json(
      { error: "Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180." },
      { status: 400 }
    );
  }

  // Validate service type
  const serviceType = validateServiceType(typeStr);
  if (!serviceType) {
    return NextResponse.json(
      { error: "Invalid 'type'. Allowed values: hospital, police_station, pharmacy." },
      { status: 400 }
    );
  }

  const radiusMeters = radiusStr
    ? Math.min(Math.max(Number(radiusStr), 500), 25000)
    : 8000;
  const limit = limitStr ? Math.min(Math.max(Number(limitStr), 1), 30) : 10;
  const require24x7 = require24x7Str === "true" || require24x7Str === "1";
  const requireGovt = requireGovtStr === "true" || requireGovtStr === "1";

  try {
    const places = await findNearbyPlaces({
      lat: coords.lat,
      lng: coords.lng,
      type: serviceType,
      radiusMeters,
      limit,
      require24x7,
      requireGovt,
      subCategory,
      query,
    });

    return NextResponse.json({
      data: places,
      total: places.length,
      filters: {
        type: serviceType,
        radiusMeters,
        require24x7,
        requireGovt,
        subCategory,
        query,
      },
      retrievedAt: new Date().toISOString(),
      source: "Nagpur Municipal Corporation & City Health Directory",
    });
  } catch (err: unknown) {
    console.error("Error fetching places:", err);
    return NextResponse.json(
      { error: "Failed to retrieve nearby services." },
      { status: 500 }
    );
  }
}
