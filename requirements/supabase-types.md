Current Supabase Types:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendly_templates: {
        Row: {
          active: boolean | null
          created_at: string
          prompt: string | null
          id: string
          name: string | null
          spreadsheet_id: string | null
          updated_at: string | null
          uri: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          prompt?: string | null
          id?: string
          name?: string | null
          spreadsheet_id?: string | null
          updated_at?: string | null
          uri?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          prompt?: string | null
          id?: string
          name?: string | null
          spreadsheet_id?: string | null
          updated_at?: string | null
          uri?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendly_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendly_oauth_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expiry_date: string | null
          id: string
          organization: string | null
          refresh_token: string | null
          updated_at: string | null
          uri: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          organization?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          uri?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          organization?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          uri?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendly_oauth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      google_oauth_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expiry_date: string | null
          id: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_oauth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          ai_insights: Json | null
          bot_id: string | null
          column_headers: string[] | null
          created_at: string
          prompt: string | null
          event_uri: string | null
          fields_analyzed: number | null
          id: string
          metrics: Json | null
          name: string | null
          processed_data: Json | null
          processing_duration: number | null
          speaker_participation: Json | null
          spreadsheet_id: string | null
          status: string
          topic_distribution: Json | null
          transcript: Json | null
          updated_at: string
          user_id: string | null
          meeting_link: string | null
        }
        Insert: {
          ai_insights?: Json | null
          bot_id?: string | null
          column_headers?: string[] | null
          created_at: string
          prompt?: string | null
          event_uri?: string | null
          fields_analyzed?: number | null
          id?: string
          metrics?: Json | null
          name?: string | null
          processed_data?: Json | null
          processing_duration?: number | null
          speaker_participation?: Json | null
          spreadsheet_id?: string | null
          status?: string
          topic_distribution?: Json | null
          transcript?: Json | null
          updated_at: string
          user_id?: string | null
          meeting_link?: string | null
        }
        Update: {
          ai_insights?: Json | null
          bot_id?: string | null
          column_headers?: string[] | null
          created_at?: string
          prompt?: string | null
          event_uri?: string | null
          fields_analyzed?: number | null
          id?: string
          metrics?: Json | null
          name?: string | null
          processed_data?: Json | null
          processing_duration?: number | null
          speaker_participation?: Json | null
          spreadsheet_id?: string | null
          status?: string
          topic_distribution?: Json | null
          transcript?: Json | null
          updated_at?: string
          user_id?: string | null
          meeting_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_oauth_flows: {
        Row: {
          created_at: string
          data: string | null
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_oauth_flows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          column_headers: string[] | null
          created_at: string
          prompt: string | null
          id: string
          name: string
          spreadsheet_id: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          column_headers?: string[] | null
          created_at: string
          prompt?: string | null
          id?: string
          name: string
          spreadsheet_id?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          column_headers?: string[] | null
          created_at?: string
          prompt?: string | null
          id?: string
          name?: string
          spreadsheet_id?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auto_renewal_enabled: boolean | null
          auto_renewal_package_hours: number | null
          calendly_access_until: string | null
          calendly_enabled: boolean | null
          created_at: string
          email: string | null
          id: string
          meeting_hours_remaining: number | null
          meetings_used: number | null
          stripe_customer_id: string | null
          total_hours_purchased: number | null
          updated_at: string | null
        }
        Insert: {
          auto_renewal_enabled?: boolean | null
          auto_renewal_package_hours?: number | null
          calendly_access_until?: string | null
          calendly_enabled?: boolean | null
          created_at: string
          email?: string | null
          id?: string
          meeting_hours_remaining?: number | null
          meetings_used?: number | null
          stripe_customer_id?: string | null
          total_hours_purchased?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_renewal_enabled?: boolean | null
          auto_renewal_package_hours?: number | null
          calendly_access_until?: string | null
          calendly_enabled?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_hours_remaining?: number | null
          meetings_used?: number | null
          stripe_customer_id?: string | null
          total_hours_purchased?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zoom_oauth_credentials: {
        Row: {
          created_at: string
          id: string
          recall_id: string | null
          recall_oauth_app: string | null
          recall_user_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at: string
          id?: string
          recall_id?: string | null
          recall_oauth_app?: string | null
          recall_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recall_id?: string | null
          recall_oauth_app?: string | null
          recall_user_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoom_oauth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
```