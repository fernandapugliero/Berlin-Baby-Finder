/**
 * Activity data layer — stub that returns an empty list.
 * A new data source will be connected later.
 */
import type { Activity, BerlinDistrict } from "./types";

// ─── Public API ────────────────────────────────────────────────────────────

export interface AirtableActivity extends Omit<Activity, "submitted_by" | "submitter_email" | "submitter_name"> {
  submitted_by: string | null;
  submitter_email: string | null;
  submitter_name: string | null;
  _distance?: number | null;
  _nextOccurrence?: Date | null;
  _ageLabel?: string | null;
  _sponsored?: boolean;
  _registrationLink?: string | null;
  _verifiedAt?: string | null;
  _recurrenceType?: string | null;
  _dayOfWeek?: string | null;
}

export function clearAirtableCache() {
  // no-op — no cache to clear
}

export async function loadAirtableActivities(): Promise<AirtableActivity[]> {
  // Stub: returns empty list until a new data source is connected
  return [];
}
