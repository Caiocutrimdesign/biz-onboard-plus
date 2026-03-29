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
  public: {
    Tables: {
      crm_users: {
        Row: {
          active: boolean | null
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          password: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          avatar?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          password: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          brand: string | null
          cep: string | null
          chassis: string | null
          city: string | null
          color: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          model: string | null
          neighborhood: string | null
          number: string | null
          payment_method: string | null
          phone: string
          plan: string | null
          plate: string | null
          renavam: string | null
          state: string | null
          status: string | null
          street: string | null
          updated_at: string | null
          vehicle_type: string | null
          year: string | null
        }
        Insert: {
          brand?: string | null
          cep?: string | null
          chassis?: string | null
          city?: string | null
          color?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          model?: string | null
          neighborhood?: string | null
          number?: string | null
          payment_method?: string | null
          phone: string
          plan?: string | null
          plate?: string | null
          renavam?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: string | null
        }
        Update: {
          brand?: string | null
          cep?: string | null
          chassis?: string | null
          city?: string | null
          color?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          model?: string | null
          neighborhood?: string | null
          number?: string | null
          payment_method?: string | null
          phone?: string
          plan?: string | null
          plate?: string | null
          renavam?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          created_at: string | null
          document: string | null
          email: string | null
          id: string
          last_contact_at: string | null
          name: string
          next_contact_at: string | null
          notes: string | null
          owner_id: string | null
          phone: string
          pipeline_id: string | null
          priority: string | null
          source: string | null
          stage_id: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name: string
          next_contact_at?: string | null
          notes?: string | null
          owner_id?: string | null
          phone: string
          pipeline_id?: string | null
          priority?: string | null
          source?: string | null
          stage_id?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name?: string
          next_contact_at?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string
          pipeline_id?: string | null
          priority?: string | null
          source?: string | null
          stage_id?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          id: string
          is_final: boolean | null
          name: string
          order_index: number | null
          pipeline_id: string | null
          probability: number | null
        }
        Insert: {
          color?: string | null
          id: string
          is_final?: boolean | null
          name: string
          order_index?: number | null
          pipeline_id?: string | null
          probability?: number | null
        }
        Update: {
          color?: string | null
          id?: string
          is_final?: boolean | null
          name?: string
          order_index?: number | null
          pipeline_id?: string | null
          probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
