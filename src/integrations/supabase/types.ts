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
      connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_id: string | null
          last_message_text: string | null
          last_message_time: string | null
          participant1_id: string
          participant1_unread_count: number | null
          participant2_id: string
          participant2_unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_id?: string | null
          last_message_text?: string | null
          last_message_time?: string | null
          participant1_id: string
          participant1_unread_count?: number | null
          participant2_id: string
          participant2_unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_id?: string | null
          last_message_text?: string | null
          last_message_time?: string | null
          participant1_id?: string
          participant1_unread_count?: number | null
          participant2_id?: string
          participant2_unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credential_shares: {
        Row: {
          created_at: string
          credential_ids: string[]
          expiry_date: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_ids: string[]
          expiry_date?: string | null
          id: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_ids?: string[]
          expiry_date?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          credential_type: string
          description: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          issuer: string
          title: string
          user_id: string
          verification_status: string
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          credential_type: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuer: string
          title: string
          user_id: string
          verification_status?: string
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          credential_type?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          title?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      cvs: {
        Row: {
          created_at: string
          cv_data: Json
          id: string
          template_used: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_data: Json
          id?: string
          template_used: string
          user_id: string
        }
        Update: {
          created_at?: string
          cv_data?: Json
          id?: string
          template_used?: string
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          degree: string
          end_year: number | null
          field: string
          id: string
          is_currently_studying: boolean | null
          start_year: number
          university: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree: string
          end_year?: number | null
          field: string
          id?: string
          is_currently_studying?: boolean | null
          start_year: number
          university: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree?: string
          end_year?: number | null
          field?: string
          id?: string
          is_currently_studying?: boolean | null
          start_year?: number
          university?: string
          user_id?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          event_id: string | null
          id: string
          photo_url: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          photo_url: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          photo_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          archive_url: string | null
          calendar_link: string | null
          category: string | null
          created_at: string
          created_by: string
          date: string
          description: string
          end_date: string | null
          event_image_url: string | null
          id: string
          is_public: boolean | null
          is_virtual: boolean | null
          location: string
          max_attendees: number | null
          name: string
          status: string | null
          virtual_link: string | null
        }
        Insert: {
          archive_url?: string | null
          calendar_link?: string | null
          category?: string | null
          created_at?: string
          created_by: string
          date: string
          description: string
          end_date?: string | null
          event_image_url?: string | null
          id?: string
          is_public?: boolean | null
          is_virtual?: boolean | null
          location: string
          max_attendees?: number | null
          name: string
          status?: string | null
          virtual_link?: string | null
        }
        Update: {
          archive_url?: string | null
          calendar_link?: string | null
          category?: string | null
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          end_date?: string | null
          event_image_url?: string | null
          id?: string
          is_public?: boolean | null
          is_virtual?: boolean | null
          location?: string
          max_attendees?: number | null
          name?: string
          status?: string | null
          virtual_link?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          from_user_id: string | null
          id: string
          is_read: boolean
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          branch: string | null
          current_company: string | null
          email: string
          full_name: string
          graduation_year: number | null
          id: number
          is_profile_complete: boolean | null
          job_title: string | null
          location: string | null
          password: string
          registration_number: string | null
          skills: string[] | null
          university_name: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          current_company?: string | null
          email: string
          full_name: string
          graduation_year?: number | null
          id?: never
          is_profile_complete?: boolean | null
          job_title?: string | null
          location?: string | null
          password: string
          registration_number?: string | null
          skills?: string[] | null
          university_name?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          current_company?: string | null
          email?: string
          full_name?: string
          graduation_year?: number | null
          id?: never
          is_profile_complete?: boolean | null
          job_title?: string | null
          location?: string | null
          password?: string
          registration_number?: string | null
          skills?: string[] | null
          university_name?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          id: string
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen_at: string | null
          online_status: boolean | null
          user_id: string
        }
        Insert: {
          last_seen_at?: string | null
          online_status?: boolean | null
          user_id: string
        }
        Update: {
          last_seen_at?: string | null
          online_status?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_privacy: {
        Row: {
          allow_connection_requests: boolean
          connection_visibility: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_connection_requests?: boolean
          connection_visibility?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_connection_requests?: boolean
          connection_visibility?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          provider: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          provider?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          provider?: string | null
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_currently_working: boolean | null
          location: string | null
          position: string
          start_date: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_currently_working?: boolean | null
          location?: string | null
          position: string
          start_date: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_currently_working?: boolean | null
          location?: string | null
          position?: string
          start_date?: string
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
          user_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_event_full: {
        Args: { event_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "moderator" | "student" | "alumni"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "moderator", "student", "alumni"],
    },
  },
} as const
