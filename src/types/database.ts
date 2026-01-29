export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      guestbook_entries: {
        Row: {
          author_id: string | null
          author_name: string
          created_at: string | null
          id: string
          memorial_id: string
          message: string
          relationship: string | null
        }
        Insert: {
          author_id?: string | null
          author_name: string
          created_at?: string | null
          id?: string
          memorial_id: string
          message: string
          relationship?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          created_at?: string | null
          id?: string
          memorial_id?: string
          message?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_entries_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          access_code: string
          access_level: Database["public"]["Enums"]["access_level"]
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          invited_by: string
          memorial_id: string
          phone: string | null
        }
        Insert: {
          accepted_at?: string | null
          access_code?: string
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by: string
          memorial_id: string
          phone?: string | null
        }
        Update: {
          accepted_at?: string | null
          access_code?: string
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string
          memorial_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          caption: string | null
          captured_at: string | null
          created_at: string | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          memorial_id: string
          tags: string[] | null
          thumbnail_url: string | null
          uploaded_by: string
          url: string
        }
        Insert: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          memorial_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          uploaded_by: string
          url: string
        }
        Update: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          memorial_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_participants: {
        Row: {
          accepted_at: string | null
          access_level: Database["public"]["Enums"]["access_level"]
          guest_email: string | null
          guest_name: string | null
          id: string
          invited_at: string | null
          invited_by: string
          memorial_id: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          access_level?: Database["public"]["Enums"]["access_level"]
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by: string
          memorial_id: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          access_level?: Database["public"]["Enums"]["access_level"]
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string
          memorial_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_participants_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorials: {
        Row: {
          bio: string | null
          birth_date: string | null
          cover_image: string | null
          created_at: string | null
          id: string
          name: string
          owner_id: string
          passing_date: string | null
          theme_color: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          cover_image?: string | null
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          passing_date?: string | null
          theme_color?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          cover_image?: string | null
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          passing_date?: string | null
          theme_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string | null
          id: string
          image_urls: string[] | null
          location: string | null
          memorial_id: string
          status: Database["public"]["Enums"]["approval_status"] | null
          submitted_by: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_urls?: string[] | null
          location?: string | null
          memorial_id: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_by: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_urls?: string[] | null
          location?: string | null
          memorial_id?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_by?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      rituals: {
        Row: {
          created_at: string | null
          expires_at: string | null
          guest_name: string | null
          id: string
          memorial_id: string
          message: string | null
          ritual_type: Database["public"]["Enums"]["ritual_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          guest_name?: string | null
          id?: string
          memorial_id: string
          message?: string | null
          ritual_type?: Database["public"]["Enums"]["ritual_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          guest_name?: string | null
          id?: string
          memorial_id?: string
          message?: string | null
          ritual_type?: Database["public"]["Enums"]["ritual_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rituals_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
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
      access_level: "owner" | "contributor" | "visitor"
      approval_status: "pending" | "approved" | "rejected"
      media_type: "photo" | "video" | "audio"
      ritual_type: "candle" | "flower" | "heart" | "custom"
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

export const Constants = {
  public: {
    Enums: {
      access_level: ["owner", "contributor", "visitor"],
      approval_status: ["pending", "approved", "rejected"],
      media_type: ["photo", "video", "audio"],
      ritual_type: ["candle", "flower", "heart", "custom"],
    },
  },
} as const
