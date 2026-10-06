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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      art_assets: {
        Row: {
          has_alpha: boolean | null
          height: number | null
          name: string
          uploaded_at: string
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          has_alpha?: boolean | null
          height?: number | null
          name: string
          uploaded_at?: string
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          has_alpha?: boolean | null
          height?: number | null
          name?: string
          uploaded_at?: string
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          due: string
          id: string
          learner_id: string
          skill: string
          state: Json
          word_id: string
        }
        Insert: {
          due: string
          id?: string
          learner_id: string
          skill: string
          state: Json
          word_id: string
        }
        Update: {
          due?: string
          id?: string
          learner_id?: string
          skill?: string
          state?: Json
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      compounds: {
        Row: {
          hanzi: string
          verdict: string
        }
        Insert: {
          hanzi: string
          verdict: string
        }
        Update: {
          hanzi?: string
          verdict?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          created_at: string
          format: string
          id: string
          learner_id: string | null
          level: number
          payload: Json | null
          place_id: string | null
          recipe: string | null
          required_word_ids: string[]
          status: string
          surface: string
        }
        Insert: {
          created_at?: string
          format: string
          id?: string
          learner_id?: string | null
          level?: number
          payload?: Json | null
          place_id?: string | null
          recipe?: string | null
          required_word_ids?: string[]
          status?: string
          surface: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          learner_id?: string | null
          level?: number
          payload?: Json | null
          place_id?: string | null
          recipe?: string | null
          required_word_ids?: string[]
          status?: string
          surface?: string
        }
        Relationships: []
      }
      drama_videos: {
        Row: {
          aspect: string
          captions: Json
          content_ref: string
          created_at: string
          duration_s: number
          error: string | null
          gateway_job_id: string | null
          id: string
          learner_id: string
          model: string
          progress: number | null
          prompt: string
          status: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          aspect?: string
          captions?: Json
          content_ref: string
          created_at?: string
          duration_s?: number
          error?: string | null
          gateway_job_id?: string | null
          id?: string
          learner_id: string
          model: string
          progress?: number | null
          prompt: string
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          aspect?: string
          captions?: Json
          content_ref?: string
          created_at?: string
          duration_s?: number
          error?: string | null
          gateway_job_id?: string | null
          id?: string
          learner_id?: string
          model?: string
          progress?: number | null
          prompt?: string
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drama_videos_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          activity: string
          created_at: string
          id: string
          learner_id: string
          outcome: string
          prev_card: Json | null
          prev_learner_word: Json | null
          request_id: string
          result: Json | null
          skill: string
          undone: boolean
          word_id: string
        }
        Insert: {
          activity: string
          created_at?: string
          id?: string
          learner_id: string
          outcome: string
          prev_card?: Json | null
          prev_learner_word?: Json | null
          request_id: string
          result?: Json | null
          skill: string
          undone?: boolean
          word_id: string
        }
        Update: {
          activity?: string
          created_at?: string
          id?: string
          learner_id?: string
          outcome?: string
          prev_card?: Json | null
          prev_learner_word?: Json | null
          request_id?: string
          result?: Json | null
          skill?: string
          undone?: boolean
          word_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          input: Json | null
          kind: string
          learner_id: string
          outputs: Json | null
          status: string
          step: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          input?: Json | null
          kind: string
          learner_id: string
          outputs?: Json | null
          status?: string
          step?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          input?: Json | null
          kind?: string
          learner_id?: string
          outputs?: Json | null
          status?: string
          step?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      layouts: {
        Row: {
          hotspots: Json
          id: string
          learner_id: string | null
          picture: string
          updated_at: string
        }
        Insert: {
          hotspots?: Json
          id?: string
          learner_id?: string | null
          picture: string
          updated_at?: string
        }
        Update: {
          hotspots?: Json
          id?: string
          learner_id?: string | null
          picture?: string
          updated_at?: string
        }
        Relationships: []
      }
      learner_words: {
        Row: {
          entered_at: string
          entered_via: string | null
          id: string
          learner_id: string
          queue_position: number | null
          source_id: string | null
          status: string
          word_id: string
        }
        Insert: {
          entered_at?: string
          entered_via?: string | null
          id?: string
          learner_id: string
          queue_position?: number | null
          source_id?: string | null
          status: string
          word_id: string
        }
        Update: {
          entered_at?: string
          entered_via?: string | null
          id?: string
          learner_id?: string
          queue_position?: number | null
          source_id?: string | null
          status?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          about: string | null
          avatar: string | null
          chinese_name: string | null
          chinese_name_pinyin: string | null
          coins: number
          created_at: string
          daily_produce: number
          daily_recognise: number
          display_name: string
          id: string
          is_synthetic: boolean
          lesson_pace: number
          pinyin_on: boolean
          timezone: string
        }
        Insert: {
          about?: string | null
          avatar?: string | null
          chinese_name?: string | null
          chinese_name_pinyin?: string | null
          coins?: number
          created_at?: string
          daily_produce?: number
          daily_recognise?: number
          display_name?: string
          id: string
          is_synthetic?: boolean
          lesson_pace?: number
          pinyin_on?: boolean
          timezone?: string
        }
        Update: {
          about?: string | null
          avatar?: string | null
          chinese_name?: string | null
          chinese_name_pinyin?: string | null
          coins?: number
          created_at?: string
          daily_produce?: number
          daily_recognise?: number
          display_name?: string
          id?: string
          is_synthetic?: boolean
          lesson_pace?: number
          pinyin_on?: boolean
          timezone?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          course_key: string | null
          id: string
          ord: number
          source_id: string
          title: string
          word_ids: string[]
        }
        Insert: {
          course_key?: string | null
          id?: string
          ord: number
          source_id: string
          title: string
          word_ids?: string[]
        }
        Update: {
          course_key?: string | null
          id?: string
          ord?: number
          source_id?: string
          title?: string
          word_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "lessons_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      model_calls: {
        Row: {
          attempt: number | null
          cached_tokens: number | null
          cost_usd: number | null
          created_at: string
          elapsed_ms: number | null
          error: string | null
          id: string
          input_tokens: number | null
          job_id: string | null
          learner_id: string | null
          model: string | null
          ok: boolean | null
          output_tokens: number | null
          stage: string | null
        }
        Insert: {
          attempt?: number | null
          cached_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
          elapsed_ms?: number | null
          error?: string | null
          id?: string
          input_tokens?: number | null
          job_id?: string | null
          learner_id?: string | null
          model?: string | null
          ok?: boolean | null
          output_tokens?: number | null
          stage?: string | null
        }
        Update: {
          attempt?: number | null
          cached_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
          elapsed_ms?: number | null
          error?: string | null
          id?: string
          input_tokens?: number | null
          job_id?: string | null
          learner_id?: string | null
          model?: string | null
          ok?: boolean | null
          output_tokens?: number | null
          stage?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          art: Json | null
          created_at: string
          host: Json | null
          id: string
          kind: string
          learner_id: string | null
          lines: Json | null
          objects: Json | null
          scenario: Json | null
          slot: string
          source_id: string | null
          status: string
        }
        Insert: {
          art?: Json | null
          created_at?: string
          host?: Json | null
          id?: string
          kind?: string
          learner_id?: string | null
          lines?: Json | null
          objects?: Json | null
          scenario?: Json | null
          slot: string
          source_id?: string | null
          status?: string
        }
        Update: {
          art?: Json | null
          created_at?: string
          host?: Json | null
          id?: string
          kind?: string
          learner_id?: string | null
          lines?: Json | null
          objects?: Json | null
          scenario?: Json | null
          slot?: string
          source_id?: string | null
          status?: string
        }
        Relationships: []
      }
      review_sessions: {
        Row: {
          created_at: string
          day: string
          direction: string
          grades: Json
          id: string
          items: Json
          learner_id: string
          position: number
          round: number
          seed: number
        }
        Insert: {
          created_at?: string
          day: string
          direction: string
          grades?: Json
          id?: string
          items: Json
          learner_id: string
          position?: number
          round?: number
          seed: number
        }
        Update: {
          created_at?: string
          day?: string
          direction?: string
          grades?: Json
          id?: string
          items?: Json
          learner_id?: string
          position?: number
          round?: number
          seed?: number
        }
        Relationships: []
      }
      seen: {
        Row: {
          content_id: string
          learner_id: string
          seen_at: string
        }
        Insert: {
          content_id: string
          learner_id: string
          seen_at?: string
        }
        Update: {
          content_id?: string
          learner_id?: string
          seen_at?: string
        }
        Relationships: []
      }
      sentence_targets: {
        Row: {
          answers: string[]
          gap: string | null
          id: string
          sentence_id: string
          word_id: string
        }
        Insert: {
          answers?: string[]
          gap?: string | null
          id?: string
          sentence_id: string
          word_id: string
        }
        Update: {
          answers?: string[]
          gap?: string | null
          id?: string
          sentence_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentence_targets_sentence_id_fkey"
            columns: ["sentence_id"]
            isOneToOne: false
            referencedRelation: "sentences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sentence_targets_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      sentences: {
        Row: {
          course_key: string | null
          english: string
          id: string
          learner_id: string | null
          needs_user_name: boolean
          origin: string
          tokens: Json
        }
        Insert: {
          course_key?: string | null
          english: string
          id?: string
          learner_id?: string | null
          needs_user_name?: boolean
          origin: string
          tokens: Json
        }
        Update: {
          course_key?: string | null
          english?: string
          id?: string
          learner_id?: string | null
          needs_user_name?: boolean
          origin?: string
          tokens?: Json
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          id: string
          kind: string
          learner_id: string | null
          plan: Json | null
          status: string
          title: string
          word_ids: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          learner_id?: string | null
          plan?: Json | null
          status?: string
          title: string
          word_ids?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          learner_id?: string | null
          plan?: Json | null
          status?: string
          title?: string
          word_ids?: string[]
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          learner_id: string
          place_id: string | null
          turns: Json
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          learner_id: string
          place_id?: string | null
          turns?: Json
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          learner_id?: string
          place_id?: string | null
          turns?: Json
        }
        Relationships: []
      }
      words: {
        Row: {
          accepted: string[]
          alt_readings: string[]
          course_lesson: number | null
          created_at: string
          hanzi: string
          id: string
          meaning: string
          origin: string
          pinyin: string
          self_scored: boolean
          synonyms: string[]
        }
        Insert: {
          accepted?: string[]
          alt_readings?: string[]
          course_lesson?: number | null
          created_at?: string
          hanzi: string
          id?: string
          meaning: string
          origin: string
          pinyin: string
          self_scored?: boolean
          synonyms?: string[]
        }
        Update: {
          accepted?: string[]
          alt_readings?: string[]
          course_lesson?: number | null
          created_at?: string
          hanzi?: string
          id?: string
          meaning?: string
          origin?: string
          pinyin?: string
          self_scored?: boolean
          synonyms?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_word_import: { Args: { p: Json; uid: string }; Returns: Json }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
