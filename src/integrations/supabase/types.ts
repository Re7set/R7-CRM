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
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          client_id: string | null
          contact_id: string | null
          created_at: string | null
          date: string | null
          deal_id: string | null
          description: string | null
          id: string
          type: Database["public"]["Enums"]["activity_type"] | null
        }
        Insert: {
          client_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          date?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["activity_type"] | null
        }
        Update: {
          client_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          date?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["activity_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      assignment_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          stage: Database["public"]["Enums"]["deal_stage"]
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          stage: Database["public"]["Enums"]["deal_stage"]
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_rules_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_onboarding_items: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          day_offset: number
          deal_id: string
          description: string | null
          id: string
          is_completed: boolean | null
          template_id: string | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          day_offset?: number
          deal_id: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          template_id?: string | null
          title: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          day_offset?: number
          deal_id?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_onboarding_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_onboarding_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_onboarding_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_services: {
        Row: {
          created_at: string | null
          deal_id: string
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_services_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_tags: {
        Row: {
          created_at: string | null
          deal_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_tags_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assigned_to: string | null
          audit_report_url: string | null
          barreau_ordre: string | null
          client_id: string | null
          contact_id: string | null
          created_at: string | null
          expected_close_date: string | null
          id: string
          lemlist_campaign_id: string | null
          mrr: number | null
          mrr_cible: number | null
          name: string
          notes: string | null
          offer_type: Database["public"]["Enums"]["offer_type"] | null
          onboarding_started_at: string | null
          probability: number | null
          profession: Database["public"]["Enums"]["profession"] | null
          sibyle_validation: boolean | null
          source: Database["public"]["Enums"]["deal_source"] | null
          stage: Database["public"]["Enums"]["deal_stage"]
          updated_at: string | null
          value: number | null
          warm_status: Database["public"]["Enums"]["warm_status"] | null
        }
        Insert: {
          assigned_to?: string | null
          audit_report_url?: string | null
          barreau_ordre?: string | null
          client_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          lemlist_campaign_id?: string | null
          mrr?: number | null
          mrr_cible?: number | null
          name: string
          notes?: string | null
          offer_type?: Database["public"]["Enums"]["offer_type"] | null
          onboarding_started_at?: string | null
          probability?: number | null
          profession?: Database["public"]["Enums"]["profession"] | null
          sibyle_validation?: boolean | null
          source?: Database["public"]["Enums"]["deal_source"] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string | null
          value?: number | null
          warm_status?: Database["public"]["Enums"]["warm_status"] | null
        }
        Update: {
          assigned_to?: string | null
          audit_report_url?: string | null
          barreau_ordre?: string | null
          client_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          lemlist_campaign_id?: string | null
          mrr?: number | null
          mrr_cible?: number | null
          name?: string
          notes?: string | null
          offer_type?: Database["public"]["Enums"]["offer_type"] | null
          onboarding_started_at?: string | null
          probability?: number | null
          profession?: Database["public"]["Enums"]["profession"] | null
          sibyle_validation?: boolean | null
          source?: Database["public"]["Enums"]["deal_source"] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string | null
          value?: number | null
          warm_status?: Database["public"]["Enums"]["warm_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          deal_id: string | null
          id: string
          is_read: boolean | null
          team_member_id: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          is_read?: boolean | null
          team_member_id: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          is_read?: boolean | null
          team_member_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          created_at: string | null
          day_offset: number
          description: string | null
          id: string
          position: number
          title: string
        }
        Insert: {
          created_at?: string | null
          day_offset?: number
          description?: string | null
          id?: string
          position?: number
          title: string
        }
        Update: {
          created_at?: string | null
          day_offset?: number
          description?: string | null
          id?: string
          position?: number
          title?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          id: string
          name: string
          position: number
          visible: boolean | null
        }
        Insert: {
          color?: string | null
          id?: string
          name: string
          position?: number
          visible?: boolean | null
        }
        Update: {
          color?: string | null
          id?: string
          name?: string
          position?: number
          visible?: boolean | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          role: Database["public"]["Enums"]["team_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "note"
        | "lemlist_email"
        | "stan_call"
        | "lemlist_open"
        | "lemlist_click"
      client_status: "prospect" | "active" | "inactive" | "churned"
      deal_source: "cold_email" | "linkedin" | "referral" | "other"
      deal_stage:
        | "Réponse positive"
        | "Audit en cours"
        | "Visio/Closing"
        | "Signé"
        | "Perdu"
      offer_type: "audit_one_shot" | "recurrent_seo_geo" | "bundle_ia"
      profession:
        | "avocat"
        | "notaire"
        | "commissaire_de_justice"
        | "expert_comptable"
      team_role: "prospection" | "audit" | "closing" | "visio" | "admin"
      warm_status: "none" | "opened" | "clicked" | "replied"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type: [
        "call",
        "email",
        "meeting",
        "note",
        "lemlist_email",
        "stan_call",
        "lemlist_open",
        "lemlist_click",
      ],
      client_status: ["prospect", "active", "inactive", "churned"],
      deal_source: ["cold_email", "linkedin", "referral", "other"],
      deal_stage: [
        "Réponse positive",
        "Audit en cours",
        "Visio/Closing",
        "Signé",
        "Perdu",
      ],
      offer_type: ["audit_one_shot", "recurrent_seo_geo", "bundle_ia"],
      profession: [
        "avocat",
        "notaire",
        "commissaire_de_justice",
        "expert_comptable",
      ],
      team_role: ["prospection", "audit", "closing", "visio", "admin"],
      warm_status: ["none", "opened", "clicked", "replied"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.84.2 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
