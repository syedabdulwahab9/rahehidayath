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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          published: boolean
          section: string
          summary: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          published?: boolean
          section: string
          summary?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          published?: boolean
          section?: string
          summary?: string
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          label: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          label?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      app_state: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_progress: {
        Row: {
          day: string
          dhikr: number
          fasting: boolean
          good_deeds: number
          id: string
          prayers: string[]
          quran_pages: number
          sadaqah: boolean
          streak: number
          tahajjud: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          day: string
          dhikr?: number
          fasting?: boolean
          good_deeds?: number
          id?: string
          prayers?: string[]
          quran_pages?: number
          sadaqah?: boolean
          streak?: number
          tahajjud?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          day?: string
          dhikr?: number
          fasting?: boolean
          good_deeds?: number
          id?: string
          prayers?: string[]
          quran_pages?: number
          sadaqah?: boolean
          streak?: number
          tahajjud?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dua_amens: {
        Row: {
          created_at: string
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dua_amens_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "dua_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      dua_requests: {
        Row: {
          body: string
          category: string
          created_at: string
          dua_count: number
          id: string
          language: string
          published: boolean
          user_id: string | null
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          dua_count?: number
          id?: string
          language?: string
          published?: boolean
          user_id?: string | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          dua_count?: number
          id?: string
          language?: string
          published?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      encouragements: {
        Row: {
          created_at: string
          family_id: string
          from_user: string
          id: string
          message: string
          to_user: string
        }
        Insert: {
          created_at?: string
          family_id: string
          from_user: string
          id?: string
          message: string
          to_user: string
        }
        Update: {
          created_at?: string
          family_id?: string
          from_user?: string
          id?: string
          message?: string
          to_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "encouragements_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          hide_prayer_times: boolean
          id: string
          joined_at: string
          role: string
          share_deeds: boolean
          share_dhikr: boolean
          share_fasting: boolean
          share_last_active: boolean
          share_quran: boolean
          share_sadaqah: boolean
          share_salah: boolean
          share_streak: boolean
          share_tahajjud: boolean
          user_id: string
        }
        Insert: {
          family_id: string
          hide_prayer_times?: boolean
          id?: string
          joined_at?: string
          role?: string
          share_deeds?: boolean
          share_dhikr?: boolean
          share_fasting?: boolean
          share_last_active?: boolean
          share_quran?: boolean
          share_sadaqah?: boolean
          share_salah?: boolean
          share_streak?: boolean
          share_tahajjud?: boolean
          user_id: string
        }
        Update: {
          family_id?: string
          hide_prayer_times?: boolean
          id?: string
          joined_at?: string
          role?: string
          share_deeds?: boolean
          share_dhikr?: boolean
          share_fasting?: boolean
          share_last_active?: boolean
          share_quran?: boolean
          share_sadaqah?: boolean
          share_salah?: boolean
          share_streak?: boolean
          share_tahajjud?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          last_active: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          last_active?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          last_active?: string
        }
        Relationships: []
      }
      quran_mistakes: {
        Row: {
          ayah: number
          corrected: boolean
          created_at: string
          explanation: string
          id: string
          rule: string
          severity: string
          surah: number
          user_id: string
          word: string
          word_index: number
        }
        Insert: {
          ayah: number
          corrected?: boolean
          created_at?: string
          explanation?: string
          id?: string
          rule?: string
          severity?: string
          surah: number
          user_id: string
          word?: string
          word_index?: number
        }
        Update: {
          ayah?: number
          corrected?: boolean
          created_at?: string
          explanation?: string
          id?: string
          rule?: string
          severity?: string
          surah?: number
          user_id?: string
          word?: string
          word_index?: number
        }
        Relationships: []
      }
      quran_progress: {
        Row: {
          ayat: number
          day: string
          id: string
          pages: number
          pronunciation_accuracy: number
          streak: number
          tajweed_accuracy: number
          updated_at: string
          user_id: string
          words: number
        }
        Insert: {
          ayat?: number
          day?: string
          id?: string
          pages?: number
          pronunciation_accuracy?: number
          streak?: number
          tajweed_accuracy?: number
          updated_at?: string
          user_id: string
          words?: number
        }
        Update: {
          ayat?: number
          day?: string
          id?: string
          pages?: number
          pronunciation_accuracy?: number
          streak?: number
          tajweed_accuracy?: number
          updated_at?: string
          user_id?: string
          words?: number
        }
        Relationships: []
      }
      quran_sessions: {
        Row: {
          ayah: number
          language: string
          line: number
          mode: string
          page: number
          qari: string
          surah: number
          updated_at: string
          user_id: string
          word_index: number
        }
        Insert: {
          ayah?: number
          language?: string
          line?: number
          mode?: string
          page?: number
          qari?: string
          surah?: number
          updated_at?: string
          user_id: string
          word_index?: number
        }
        Update: {
          ayah?: number
          language?: string
          line?: number
          mode?: string
          page?: number
          qari?: string
          surah?: number
          updated_at?: string
          user_id?: string
          word_index?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_family: {
        Args: { _name: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "families"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_family_progress: {
        Args: { _since: string }
        Returns: {
          day: string
          dhikr: number
          fasting: boolean
          good_deeds: number
          id: string
          prayers: string[]
          quran_pages: number
          sadaqah: boolean
          streak: number
          tahajjud: boolean
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "daily_progress"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      join_family_by_code: {
        Args: { _code: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "families"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      my_family_ids: { Args: never; Returns: string[] }
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
