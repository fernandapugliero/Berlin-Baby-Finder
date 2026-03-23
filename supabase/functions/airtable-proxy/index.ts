import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_ID = "appjWF7WnC8DRWaXM";

async function fetchAllRecords(tableName: string, pat: string) {
  const records: any[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${pat}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable ${tableName} fetch failed [${res.status}]: ${body}`);
    }

    const data = await res.json();
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);

  return records;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pat = Deno.env.get("AIRTABLE_PAT");
    if (!pat) {
      return new Response(
        JSON.stringify({ error: "AIRTABLE_PAT not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Events (required) and Venues (optional)
    const eventsRaw = await fetchAllRecords("Events", pat);
    let venuesRaw: any[] = [];
    try {
      venuesRaw = await fetchAllRecords("Venues", pat);
    } catch (e) {
      console.warn("Venues table fetch failed (optional), continuing without it:", e);
    }

    // Build venue lookup map by record ID
    const venueMap: Record<string, any> = {};
    for (const v of venuesRaw) {
      venueMap[v.id] = v.fields;
    }

    // Map events with resolved venue data
    const events = eventsRaw.map((r: any) => ({
      airtable_id: r.id,
      ...r.fields,
      _venue_resolved: null as any,
    }));

    // Resolve venue lookups
    for (const evt of events) {
      // Venue field might be a linked record array
      const venueRef = evt["Venue"];
      if (Array.isArray(venueRef) && venueRef.length > 0) {
        const venueData = venueMap[venueRef[0]];
        if (venueData) {
          evt._venue_resolved = venueData;
        }
      }
    }

    return new Response(
      JSON.stringify({ events, venues: venuesRaw.map((v: any) => ({ id: v.id, ...v.fields })) }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Airtable proxy error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
