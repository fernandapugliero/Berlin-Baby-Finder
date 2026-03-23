import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 🔥 CONFIG FIXA (para funcionar agora)
const BASE_ID = "appYjp7dTNaLjuaGB";
const AIRTABLE_PAT = "patV5b9FiOhOSIeUK";

const EVENT_TABLE = "Events / Activities";
const VENUE_TABLE = "Venues";

async function fetchAllRecords(tableName: string) {
  const records: any[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`
    );

    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
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
    console.log("🚀 Fetching Airtable data...");

    const eventsRaw = await fetchAllRecords(EVENT_TABLE);
    const venuesRaw = await fetchAllRecords(VENUE_TABLE);

    // 🔗 mapear venues
    const venueMap: Record<string, any> = {};
    for (const v of venuesRaw) {
      venueMap[v.id] = v.fields;
    }

    // 🔗 juntar venue dentro do evento
    const events = eventsRaw.map((r: any) => {
      const evt = {
        airtable_id: r.id,
        ...r.fields,
        _venue_resolved: null as any,
      };

      const venueRef = evt["Venue"];

      if (Array.isArray(venueRef) && venueRef.length > 0) {
        const venueData = venueMap[venueRef[0]];
        if (venueData) {
          evt._venue_resolved = venueData;
        }
      }

      return evt;
    });

    return new Response(
      JSON.stringify({
        events,
        venues: venuesRaw.map((v: any) => ({
          id: v.id,
          ...v.fields,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("❌ Airtable proxy error:", error);

    const msg = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
