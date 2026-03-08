import type { Database } from "@/integrations/supabase/types";

export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
export type BerlinDistrict = Database["public"]["Enums"]["berlin_district"];
export type BabyAgeGroup = Database["public"]["Enums"]["baby_age_group"];

export const BERLIN_DISTRICTS: BerlinDistrict[] = [
  "Mitte",
  "Friedrichshain-Kreuzberg",
  "Pankow",
  "Charlottenburg-Wilmersdorf",
  "Spandau",
  "Steglitz-Zehlendorf",
  "Tempelhof-Schöneberg",
  "Neukölln",
  "Treptow-Köpenick",
  "Marzahn-Hellersdorf",
  "Lichtenberg",
  "Reinickendorf",
];

export const AGE_GROUPS: BabyAgeGroup[] = [
  "0-6 months",
  "6-12 months",
  "1-2 years",
  "2-3 years",
  "3+ years",
];

export interface SearchFilters {
  timeRange: "now" | "today" | "tomorrow" | "custom";
  customDate?: Date;
  district?: BerlinDistrict;
  ageGroup?: BabyAgeGroup;
  isFree?: boolean;
  registrationRequired?: boolean;
  nearLat?: number;
  nearLng?: number;
  locationQuery?: string;
}
