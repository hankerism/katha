/* ---------------------------------------------------------------------------
 * KATHA · Supabase — database types (GENERATED)
 * lib/supabase/database-types.ts
 *
 * Generated from the live local schema (Sprint 8 Step 4):
 *   npx supabase gen types typescript --local > lib/supabase/database-types.ts
 * The generated schema is the source of truth — regenerate after every
 * migration; do not hand-edit.
 * ------------------------------------------------------------------------- */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      authors: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string
          display_name: string
          id: string
          location: string
          slug: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          display_name: string
          id: string
          location?: string
          slug: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          display_name?: string
          id?: string
          location?: string
          slug?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          chapter_id: string
          created_at: string
          paragraph_index: number
          preview: string
          user_id: string
          work_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          paragraph_index: number
          preview?: string
          user_id: string
          work_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          paragraph_index?: number
          preview?: string
          user_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          id: string
          manuscript: string
          position: number
          title: string
          work_id: string
        }
        Insert: {
          id: string
          manuscript?: string
          position: number
          title?: string
          work_id: string
        }
        Update: {
          id?: string
          manuscript?: string
          position?: number
          title?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          first_name: string
          id: string
          joined_at: string
          last_name: string
          tier: string
        }
        Insert: {
          first_name?: string
          id: string
          joined_at?: string
          last_name?: string
          tier?: string
        }
        Update: {
          first_name?: string
          id?: string
          joined_at?: string
          last_name?: string
          tier?: string
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          chapter_id: string
          paragraph_index: number
          user_id: string
          visited_at: string
          work_id: string
        }
        Insert: {
          chapter_id: string
          paragraph_index: number
          user_id: string
          visited_at?: string
          work_id: string
        }
        Update: {
          chapter_id?: string
          paragraph_index?: number
          user_id?: string
          visited_at?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_history_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          chapter_id: string
          updated_at: string
          user_id: string
          work_id: string
        }
        Insert: {
          chapter_id: string
          updated_at?: string
          user_id: string
          work_id: string
        }
        Update: {
          chapter_id?: string
          updated_at?: string
          user_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          archived_at: string | null
          author_id: string
          category: string
          cover_url: string | null
          created_at: string
          id: string
          language: string
          lifecycle: string
          published_at: string | null
          slug: string
          status: string
          synopsis: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          author_id: string
          category?: string
          cover_url?: string | null
          created_at?: string
          id: string
          language?: string
          lifecycle?: string
          published_at?: string | null
          slug: string
          status?: string
          synopsis?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          author_id?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          language?: string
          lifecycle?: string
          published_at?: string | null
          slug?: string
          status?: string
          synopsis?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "works_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
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
    Enums: {},
  },
} as const

