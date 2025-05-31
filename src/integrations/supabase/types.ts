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
      api_applications: {
        Row: {
          application_type: string
          client_id: string
          client_secret: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string | null
          rate_limit_per_hour: number | null
          redirect_uris: string[] | null
          scopes: string[] | null
          updated_at: string | null
        }
        Insert: {
          application_type?: string
          client_id: string
          client_secret: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id?: string | null
          rate_limit_per_hour?: number | null
          redirect_uris?: string[] | null
          scopes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          application_type?: string
          client_id?: string
          client_secret?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string | null
          rate_limit_per_hour?: number | null
          redirect_uris?: string[] | null
          scopes?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          application_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_revoked: boolean | null
          last_used_at: string | null
          scopes: string[] | null
          token_hash: string
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          last_used_at?: string | null
          scopes?: string[] | null
          token_hash: string
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          last_used_at?: string | null
          scopes?: string[] | null
          token_hash?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "api_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          application_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "api_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
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
      credential_anomalies: {
        Row: {
          analysis_id: string
          anomaly_type: string
          confidence_score: number
          created_at: string
          description: string | null
          evidence: Json | null
          id: string
          severity: number
        }
        Insert: {
          analysis_id: string
          anomaly_type: string
          confidence_score: number
          created_at?: string
          description?: string | null
          evidence?: Json | null
          id?: string
          severity: number
        }
        Update: {
          analysis_id?: string
          anomaly_type?: string
          confidence_score?: number
          created_at?: string
          description?: string | null
          evidence?: Json | null
          id?: string
          severity?: number
        }
        Relationships: [
          {
            foreignKeyName: "credential_anomalies_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "credential_fraud_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_fraud_analysis: {
        Row: {
          credential_id: string
          detection_details: Json
          detection_method: string[]
          detection_timestamp: string
          id: string
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: Database["public"]["Enums"]["fraud_risk_level"]
          risk_score: number
        }
        Insert: {
          credential_id: string
          detection_details: Json
          detection_method: string[]
          detection_timestamp?: string
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level: Database["public"]["Enums"]["fraud_risk_level"]
          risk_score: number
        }
        Update: {
          credential_id?: string
          detection_details?: Json
          detection_method?: string[]
          detection_timestamp?: string
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: Database["public"]["Enums"]["fraud_risk_level"]
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "credential_fraud_analysis_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
        ]
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
      cv_templates: {
        Row: {
          created_at: string
          description: string
          id: string
          image_preview_url: string
          name: string
          template_file: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_preview_url: string
          name: string
          template_file: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_preview_url?: string
          name?: string
          template_file?: string
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
      external_mappings: {
        Row: {
          connector_id: string | null
          created_at: string | null
          external_entity_data: Json | null
          external_entity_id: string
          id: string
          last_synced_at: string | null
          local_entity_id: string
          local_entity_type: string
        }
        Insert: {
          connector_id?: string | null
          created_at?: string | null
          external_entity_data?: Json | null
          external_entity_id: string
          id?: string
          last_synced_at?: string | null
          local_entity_id: string
          local_entity_type: string
        }
        Update: {
          connector_id?: string | null
          created_at?: string | null
          external_entity_data?: Json | null
          external_entity_id?: string
          id?: string
          last_synced_at?: string | null
          local_entity_id?: string
          local_entity_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_mappings_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_logs: {
        Row: {
          created_at: string
          credential_id: string | null
          details: Json
          event_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          details?: Json
          event_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          details?: Json
          event_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_detection_logs_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connectors: {
        Row: {
          authentication_method: string | null
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          endpoint_url: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          authentication_method?: string | null
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          authentication_method?: string | null
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          connector_id: string | null
          error_details: Json | null
          errors_count: number | null
          id: string
          records_processed: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connector_id?: string | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          records_processed?: number | null
          started_at?: string | null
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connector_id?: string | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean | null
          job_type: string[] | null
          keywords: string[] | null
          locations: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          job_type?: string[] | null
          keywords?: string[] | null
          locations?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          job_type?: string[] | null
          keywords?: string[] | null
          locations?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_board: {
        Row: {
          company: string
          description: string | null
          id: string
          location: string | null
          posted_at: string
          title: string
          user_id: string
        }
        Insert: {
          company: string
          description?: string | null
          id?: string
          location?: string | null
          posted_at?: string
          title: string
          user_id: string
        }
        Update: {
          company?: string
          description?: string | null
          id?: string
          location?: string | null
          posted_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      job_bookmarks: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_bookmarks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          benefits: string | null
          company_id: string | null
          created_at: string
          description: string
          experience_level: string | null
          id: string
          job_type: string
          location: string
          posted_by: string
          requirements: string | null
          salary_range: string | null
          skills: string[] | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string | null
          company_id?: string | null
          created_at?: string
          description: string
          experience_level?: string | null
          id?: string
          job_type: string
          location: string
          posted_by: string
          requirements?: string | null
          salary_range?: string | null
          skills?: string[] | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          benefits?: string | null
          company_id?: string | null
          created_at?: string
          description?: string
          experience_level?: string | null
          id?: string
          job_type?: string
          location?: string
          posted_by?: string
          requirements?: string | null
          salary_range?: string | null
          skills?: string[] | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability: Json | null
          bio: string
          created_at: string
          expertise: string[]
          id: string
          is_active: boolean | null
          max_mentees: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          bio: string
          created_at?: string
          expertise: string[]
          id?: string
          is_active?: boolean | null
          max_mentees?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          bio?: string
          created_at?: string
          expertise?: string[]
          id?: string
          is_active?: boolean | null
          max_mentees?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentorship_relationships: {
        Row: {
          created_at: string
          end_date: string | null
          goals: string
          id: string
          is_active: boolean | null
          mentee_id: string
          mentor_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          goals: string
          id?: string
          is_active?: boolean | null
          mentee_id: string
          mentor_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          goals?: string
          id?: string
          is_active?: boolean | null
          mentee_id?: string
          mentor_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          created_at: string
          goals: string
          id: string
          interests: string[]
          mentee_id: string
          mentor_id: string | null
          message: string | null
          status:
            | Database["public"]["Enums"]["mentorship_request_status"]
            | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals: string
          id?: string
          interests: string[]
          mentee_id: string
          mentor_id?: string | null
          message?: string | null
          status?:
            | Database["public"]["Enums"]["mentorship_request_status"]
            | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals?: string
          id?: string
          interests?: string[]
          mentee_id?: string
          mentor_id?: string | null
          message?: string | null
          status?:
            | Database["public"]["Enums"]["mentorship_request_status"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_resources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          relationship_id: string | null
          resource_type: string
          resource_url: string
          shared_by: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          relationship_id?: string | null
          resource_type: string
          resource_url: string
          shared_by: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          relationship_id?: string | null
          resource_type?: string
          resource_url?: string
          shared_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_resources_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentorship_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          created_at: string
          duration: number
          id: string
          location: string | null
          notes: string | null
          relationship_id: string
          scheduled_at: string
          status:
            | Database["public"]["Enums"]["mentorship_session_status"]
            | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          location?: string | null
          notes?: string | null
          relationship_id: string
          scheduled_at: string
          status?:
            | Database["public"]["Enums"]["mentorship_session_status"]
            | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          location?: string | null
          notes?: string | null
          relationship_id?: string
          scheduled_at?: string
          status?:
            | Database["public"]["Enums"]["mentorship_session_status"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentorship_relationships"
            referencedColumns: ["id"]
          },
        ]
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
      notification_preferences: {
        Row: {
          created_at: string
          email: boolean
          id: string
          in_app: boolean
          push: boolean
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: boolean
          id?: string
          in_app?: boolean
          push?: boolean
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: boolean
          id?: string
          in_app?: boolean
          push?: boolean
          type?: string
          updated_at?: string
          user_id?: string
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
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          branch: string | null
          created_at: string
          current_company: string | null
          email: string
          full_name: string
          graduation_year: number | null
          id: number
          is_profile_complete: boolean | null
          job_title: string | null
          location: string | null
          registration_number: string | null
          skills: string[] | null
          theme: string | null
          university_name: string | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          created_at?: string
          current_company?: string | null
          email: string
          full_name: string
          graduation_year?: number | null
          id?: never
          is_profile_complete?: boolean | null
          job_title?: string | null
          location?: string | null
          registration_number?: string | null
          skills?: string[] | null
          theme?: string | null
          university_name?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          created_at?: string
          current_company?: string | null
          email?: string
          full_name?: string
          graduation_year?: number | null
          id?: never
          is_profile_complete?: boolean | null
          job_title?: string | null
          location?: string | null
          registration_number?: string | null
          skills?: string[] | null
          theme?: string | null
          university_name?: string | null
          updated_at?: string
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
      session_feedback: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          rating: number
          session_id: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          session_id: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          session_id?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      success_stories: {
        Row: {
          created_at: string
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          relationship_id: string
          story: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          relationship_id: string
          story: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          relationship_id?: string
          story?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_stories_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentorship_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
          connection_request_setting: string
          connection_visibility: string | null
          contact_email_visibility: string
          contact_phone_visibility: string
          location_sharing_enabled: boolean
          post_visibility: string
          profile_visibility: string
          read_receipts_enabled: boolean
          show_in_search: boolean
          tagged_posts_allowed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_connection_requests?: boolean
          connection_request_setting?: string
          connection_visibility?: string | null
          contact_email_visibility?: string
          contact_phone_visibility?: string
          location_sharing_enabled?: boolean
          post_visibility?: string
          profile_visibility?: string
          read_receipts_enabled?: boolean
          show_in_search?: boolean
          tagged_posts_allowed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_connection_requests?: boolean
          connection_request_setting?: string
          connection_visibility?: string | null
          contact_email_visibility?: string
          contact_phone_visibility?: string
          location_sharing_enabled?: boolean
          post_visibility?: string
          profile_visibility?: string
          read_receipts_enabled?: boolean
          show_in_search?: boolean
          tagged_posts_allowed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          fraud_attempts: number
          last_updated: string
          trust_score: number
          user_id: string
          verification_count: number
        }
        Insert: {
          fraud_attempts?: number
          last_updated?: string
          trust_score?: number
          user_id: string
          verification_count?: number
        }
        Update: {
          fraud_attempts?: number
          last_updated?: string
          trust_score?: number
          user_id?: string
          verification_count?: number
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
      votes: {
        Row: {
          created_at: string
          id: string
          is_upvote: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_upvote?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_upvote?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_endpoint_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_endpoint_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_endpoint_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          application_id: string | null
          created_at: string | null
          events: string[] | null
          id: string
          is_active: boolean | null
          secret: string
          updated_at: string | null
          url: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          secret: string
          updated_at?: string | null
          url: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          secret?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "api_applications"
            referencedColumns: ["id"]
          },
        ]
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
      add_user_role: {
        Args: { user_id_param: string; role_param: string }
        Returns: undefined
      }
      generate_fake_profiles: {
        Args: { num_profiles: number }
        Returns: undefined
      }
      get_all_tags: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          name: string
        }[]
      }
      get_post_comments: {
        Args: { post_ids: string[] }
        Returns: {
          post_id: string
          id: string
        }[]
      }
      get_post_votes: {
        Args: { post_ids: string[] }
        Returns: {
          post_id: string
          is_upvote: boolean
        }[]
      }
      get_user_bookmarks: {
        Args: { user_id: string }
        Returns: {
          post_id: string
        }[]
      }
      get_user_post_bookmarks: {
        Args: { user_id: string; post_ids: string[] }
        Returns: {
          post_id: string
        }[]
      }
      get_user_post_votes: {
        Args: { user_id: string; post_ids: string[] }
        Returns: {
          post_id: string
        }[]
      }
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
      match_mentee_with_mentors: {
        Args: { mentee_id: string; interests: string[] }
        Returns: {
          mentor_id: string
          user_id: string
          expertise: string[]
          bio: string
          match_score: number
        }[]
      }
      remove_user_role: {
        Args: { user_id_param: string; role_param: string }
        Returns: undefined
      }
    }
    Enums: {
      fraud_risk_level: "low" | "medium" | "high" | "critical"
      mentorship_request_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
      mentorship_session_status: "scheduled" | "completed" | "canceled"
      user_role: "admin" | "moderator" | "student" | "alumni" | "faculty"
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
      fraud_risk_level: ["low", "medium", "high", "critical"],
      mentorship_request_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
      ],
      mentorship_session_status: ["scheduled", "completed", "canceled"],
      user_role: ["admin", "moderator", "student", "alumni", "faculty"],
    },
  },
} as const
