export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          address: string | null
          age_groups: Database["public"]["Enums"]["baby_age_group"][]
          category: string | null
          created_at: string
          description: string | null
          district: Database["public"]["Enums"]["berlin_district"]
          end_time: string | null
          id: string
          image_url: string | null
          is_approved: boolean
          is_free: boolean
          latitude: number | null
          location_name: string
          longitude: number | null
          price_info: string | null
          recurrence_rule: string | null
          recurring: boolean | null
          registration_required: boolean
          registration_url: string | null
          source: string | null
          source_url: string | null
          start_time: string
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          age_groups?: Database["public"]["Enums"]["baby_age_group"][]
          category?: string | null
          created_at?: string
          description?: string | null
          district: Database["public"]["Enums"]["berlin_district"]
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_free?: boolean
          latitude?: number | null
          location_name: string
          longitude?: number | null
          price_info?: string | null
          recurrence_rule?: string | null
          recurring?: boolean | null
          registration_required?: boolean
          registration_url?: string | null
          source?: string | null
          source_url?: string | null
          start_time: string
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          age_groups?: Database["public"]["Enums"]["baby_age_group"][]
          category?: string | null
          created_at?: string
          description?: string | null
          district?: Database["public"]["Enums"]["berlin_district"]
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_free?: boolean
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          price_info?: string | null
          recurrence_rule?: string | null
          recurring?: boolean | null
          registration_required?: boolean
          registration_url?: string | null
          source?: string | null
          source_url?: string | null
          start_time?: string
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      crawler_overrides: {
        Row: {
          age_override: string | null
          created_at: string
          description_override: string | null
          district_override: string | null
          event_key: string
          hidden: boolean
          id: string
          notes: string | null
          paused_until: string | null
          title_override: string | null
          updated_at: string
        }
        Insert: {
          age_override?: string | null
          created_at?: string
          description_override?: string | null
          district_override?: string | null
          event_key: string
          hidden?: boolean
          id?: string
          notes?: string | null
          paused_until?: string | null
          title_override?: string | null
          updated_at?: string
        }
        Update: {
          age_override?: string | null
          created_at?: string
          description_override?: string | null
          district_override?: string | null
          event_key?: string
          hidden?: boolean
          id?: string
          notes?: string | null
          paused_until?: string | null
          title_override?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kindercafes: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          district: Database["public"]["Enums"]["berlin_district"]
          features: string[] | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_approved: boolean
          is_sponsored: boolean
          latitude: number | null
          longitude: number | null
          name: string
          submitted_by: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          district: Database["public"]["Enums"]["berlin_district"]
          features?: string[] | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_sponsored?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          submitted_by?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          district?: Database["public"]["Enums"]["berlin_district"]
          features?: string[] | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_sponsored?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          submitted_by?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          district: Database["public"]["Enums"]["berlin_district"] | null
          districts: string[]
          email: string
          id: string
          is_active: boolean
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          district?: Database["public"]["Enums"]["berlin_district"] | null
          districts?: string[]
          email: string
          id?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          district?: Database["public"]["Enums"]["berlin_district"] | null
          districts?: string[]
          email?: string
          id?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      baby_age_group:
        | "0-6 months"
        | "6-12 months"
        | "1-2 years"
        | "2-3 years"
        | "3+ years"
      berlin_district:
        | "Mitte"
        | "Friedrichshain-Kreuzberg"
        | "Pankow"
        | "Charlottenburg-Wilmersdorf"
        | "Spandau"
        | "Steglitz-Zehlendorf"
        | "Tempelhof-Schöneberg"
        | "Neukölln"
        | "Treptow-Köpenick"
        | "Marzahn-Hellersdorf"
        | "Lichtenberg"
        | "Reinickendorf"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      baby_age_group: [
        "0-6 months",
        "6-12 months",
        "1-2 years",
        "2-3 years",
        "3+ years",
      ],
      berlin_district: [
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
      ],
    },
  },
} as const
