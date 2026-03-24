import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_ID = "appYjp7dTNaLjuaGB";
const EVENT_TABLE_CANDIDATES = ["Events", "Activities"];
const VENUE_TABLE_CANDIDATES = ["Venues", "Venue"];

function normalizePat(rawPat: string | null): string {
  if (!rawPat) return "";

  return rawPat
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/^['"]+|['"]+$/g, "");
}

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

async function fetchFirstAvailableTable(tableNames: string[], pat: string, required = true) {
  let lastError: Error | null = null;

  for (const tableName of tableNames) {
    try {
      const records = await fetchAllRecords(tableName, pat);
      return { tableName, records };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("[401]") || message.includes("AUTHENTICATION_REQUIRED")) {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error(message);
    }
  }

  if (required) {
    throw lastError ?? new Error(`No Airtable table found for candidates: ${tableNames.join(", ")}`);
  }

  return { tableName: null, records: [] as any[] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawPat = Deno.env.get("AIRTABLE_PAT");
    const pat = normalizePat(rawPat);
    console.log(`[DEBUG] AIRTABLE_PAT raw length: ${rawPat?.length ?? 0}, normalized length: ${pat.length}, starts with: ${pat.substring(0, 6)}..., ends with: ...${pat.substring(pat.length - 4)}`);
    if (!pat) {
      return new Response(
        JSON.stringify({ error: "AIRTABLE_PAT not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { records: eventsRaw, tableName: eventTableName } = await fetchFirstAvailableTable(
      EVENT_TABLE_CANDIDATES,
      pat,
      true,
    );

    const { records: venuesRaw, tableName: venueTableName } = await fetchFirstAvailableTable(
      VENUE_TABLE_CANDIDATES,
      pat,
      false,
    );

    const venueMap: Record<string, any> = {};
    for (const v of venuesRaw) {
      venueMap[v.id] = v.fields;
    }

    const events = eventsRaw.map((r: any) => ({
      airtable_id: r.id,
      ...r.fields,
      _venue_resolved: null as any,
    }));

    for (const evt of events) {
      const venueRef = evt["Venue"];
      if (Array.isArray(venueRef) && venueRef.length > 0) {
        const venueData = venueMap[venueRef[0]];
        if (venueData) {
          evt._venue_resolved = venueData;
        }
      }
    }

    return new Response(
      JSON.stringify({
        events,
        venues: venuesRaw.map((v: any) => ({ id: v.id, ...v.fields })),
        meta: {
          eventTableName,
          venueTableName,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("Airtable proxy error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
