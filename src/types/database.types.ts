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
    PostgrestVersion: "14.5"
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
      addon_prices: {
        Row: {
          active: boolean
          addon_id: string
          amount: number
          currency_code: string
          id: string
          region_id: string
        }
        Insert: {
          active?: boolean
          addon_id: string
          amount: number
          currency_code: string
          id?: string
          region_id: string
        }
        Update: {
          active?: boolean
          addon_id?: string
          amount?: number
          currency_code?: string
          id?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_prices_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addon_prices_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "addon_prices_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "pricing_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          active: boolean
          billing: string
          id: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          billing?: string
          id: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          billing?: string
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          id: string
          last_login_at: string | null
          password_hash: string
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          id?: string
          last_login_at?: string | null
          password_hash: string
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          id?: string
          last_login_at?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          links: Json
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["artist_plan"]
          slug: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          links?: Json
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["artist_plan"]
          slug: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          links?: Json
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["artist_plan"]
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      contributors: {
        Row: {
          created_at: string
          id: string
          linked_user_id: string | null
          name: string
          role: Database["public"]["Enums"]["contributor_role"]
          split_pct: number
          track_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_user_id?: string | null
          name: string
          role: Database["public"]["Enums"]["contributor_role"]
          split_pct: number
          track_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_user_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["contributor_role"]
          split_pct?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributors_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributors_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          active: boolean
          code: string
          default_currency: string
          default_payment_provider: Database["public"]["Enums"]["payment_provider"]
          sort_order: number
        }
        Insert: {
          active?: boolean
          code: string
          default_currency: string
          default_payment_provider?: Database["public"]["Enums"]["payment_provider"]
          sort_order?: number
        }
        Update: {
          active?: boolean
          code?: string
          default_currency?: string
          default_payment_provider?: Database["public"]["Enums"]["payment_provider"]
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "countries_default_currency_fkey"
            columns: ["default_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          max_redemptions: number | null
          plan_id: string | null
          redemptions_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          code: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          max_redemptions?: number | null
          plan_id?: string | null
          redemptions_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          max_redemptions?: number | null
          plan_id?: string | null
          redemptions_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          active: boolean
          code: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          code: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          code?: string
          sort_order?: number
        }
        Relationships: []
      }
      labelgrid_sync: {
        Row: {
          created_at: string
          external_id: string
          id: string
          last_synced_at: string
          payload: Json | null
          release_id: string
          status: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          last_synced_at?: string
          payload?: Json | null
          release_id: string
          status: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          last_synced_at?: string
          payload?: Json | null
          release_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "labelgrid_sync_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          payload: Json | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          id: string
          ocr_amount: number | null
          ocr_text: string | null
          payment_method: string
          period: Database["public"]["Enums"]["billing_period"]
          plan_id: string
          region_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_r2_key: string
          status: Database["public"]["Enums"]["payment_proof_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code: string
          id?: string
          ocr_amount?: number | null
          ocr_text?: string | null
          payment_method: string
          period: Database["public"]["Enums"]["billing_period"]
          plan_id: string
          region_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_r2_key: string
          status?: Database["public"]["Enums"]["payment_proof_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          id?: string
          ocr_amount?: number | null
          ocr_text?: string | null
          payment_method?: string
          period?: Database["public"]["Enums"]["billing_period"]
          plan_id?: string
          region_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_r2_key?: string
          status?: Database["public"]["Enums"]["payment_proof_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "payment_proofs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "pricing_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          addon_id: string | null
          amount: number
          coupon_id: string | null
          created_at: string
          currency: string
          external_id: string | null
          id: string
          metadata: Json
          provider: Database["public"]["Enums"]["payment_provider"]
          release_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          user_id: string
        }
        Insert: {
          addon_id?: string | null
          amount: number
          coupon_id?: string | null
          created_at?: string
          currency: string
          external_id?: string | null
          id?: string
          metadata?: Json
          provider: Database["public"]["Enums"]["payment_provider"]
          release_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          user_id: string
        }
        Update: {
          addon_id?: string | null
          amount?: number
          coupon_id?: string | null
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          metadata?: Json
          provider?: Database["public"]["Enums"]["payment_provider"]
          release_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type?: Database["public"]["Enums"]["payment_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "payments_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          enabled: boolean
          feature_key: string
          plan_id: string
        }
        Insert: {
          enabled?: boolean
          feature_key: string
          plan_id: string
        }
        Update: {
          enabled?: boolean
          feature_key?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_prices: {
        Row: {
          active: boolean
          amount: number
          currency_code: string
          id: string
          period: Database["public"]["Enums"]["billing_period"]
          plan_id: string
          region_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          currency_code: string
          id?: string
          period: Database["public"]["Enums"]["billing_period"]
          plan_id: string
          region_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          currency_code?: string
          id?: string
          period?: Database["public"]["Enums"]["billing_period"]
          plan_id?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_prices_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "plan_prices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_prices_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "pricing_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          id: string
          max_artists: number | null
          self_service: boolean
          sort_order: number
          trial_days: number
        }
        Insert: {
          active?: boolean
          id: string
          max_artists?: number | null
          self_service?: boolean
          sort_order?: number
          trial_days?: number
        }
        Update: {
          active?: boolean
          id?: string
          max_artists?: number | null
          self_service?: boolean
          sort_order?: number
          trial_days?: number
        }
        Relationships: []
      }
      pricing_region_countries: {
        Row: {
          country_code: string
          region_id: string
        }
        Insert: {
          country_code: string
          region_id: string
        }
        Update: {
          country_code?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_region_countries_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "pricing_region_countries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "pricing_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_regions: {
        Row: {
          id: string
          sort_order: number
        }
        Insert: {
          id: string
          sort_order?: number
        }
        Update: {
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string
          full_name: string | null
          id: string
          locale: string
          notify_email: boolean
          notify_whatsapp: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          full_name?: string | null
          id: string
          locale?: string
          notify_email?: boolean
          notify_whatsapp?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          full_name?: string | null
          id?: string
          locale?: string
          notify_email?: boolean
          notify_whatsapp?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_fkey"
            columns: ["country"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      release_platforms: {
        Row: {
          created_at: string
          dsp: string
          id: string
          release_id: string
          status: string
        }
        Insert: {
          created_at?: string
          dsp: string
          id?: string
          release_id: string
          status?: string
        }
        Update: {
          created_at?: string
          dsp?: string
          id?: string
          release_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_platforms_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          apple_artwork: boolean
          archived: boolean
          artist_id: string
          artwork_url: string | null
          copyright_c: string | null
          copyright_p: string | null
          created_at: string
          current_step: number
          explicit: boolean
          genre: string | null
          id: string
          label_name: string
          language: string | null
          recording_date: string | null
          release_date: string | null
          release_time: string | null
          release_timezone: string | null
          status: Database["public"]["Enums"]["release_status"]
          sub_genre: string | null
          submitted_at: string | null
          title: string
          type: Database["public"]["Enums"]["release_type"]
          upc: string | null
          updated_at: string
        }
        Insert: {
          apple_artwork?: boolean
          archived?: boolean
          artist_id: string
          artwork_url?: string | null
          copyright_c?: string | null
          copyright_p?: string | null
          created_at?: string
          current_step?: number
          explicit?: boolean
          genre?: string | null
          id?: string
          label_name?: string
          language?: string | null
          recording_date?: string | null
          release_date?: string | null
          release_time?: string | null
          release_timezone?: string | null
          status?: Database["public"]["Enums"]["release_status"]
          sub_genre?: string | null
          submitted_at?: string | null
          title: string
          type: Database["public"]["Enums"]["release_type"]
          upc?: string | null
          updated_at?: string
        }
        Update: {
          apple_artwork?: boolean
          archived?: boolean
          artist_id?: string
          artwork_url?: string | null
          copyright_c?: string | null
          copyright_p?: string | null
          created_at?: string
          current_step?: number
          explicit?: boolean
          genre?: string | null
          id?: string
          label_name?: string
          language?: string | null
          recording_date?: string | null
          release_date?: string | null
          release_time?: string | null
          release_timezone?: string | null
          status?: Database["public"]["Enums"]["release_status"]
          sub_genre?: string | null
          submitted_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["release_type"]
          upc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_monthly: {
        Row: {
          artist_id: string
          country: string | null
          created_at: string
          dsp: string
          id: string
          period: string
          revenue: number
          streams: number
          track_id: string | null
        }
        Insert: {
          artist_id: string
          country?: string | null
          created_at?: string
          dsp: string
          id?: string
          period: string
          revenue?: number
          streams?: number
          track_id?: string | null
        }
        Update: {
          artist_id?: string
          country?: string | null
          created_at?: string
          dsp?: string
          id?: string
          period?: string
          revenue?: number
          streams?: number
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stats_monthly_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stats_monthly_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          coupon_id: string | null
          created_at: string
          current_period_end: string | null
          external_id: string | null
          id: string
          period: Database["public"]["Enums"]["billing_period"]
          plan_id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          current_period_end?: string | null
          external_id?: string | null
          id?: string
          period: Database["public"]["Enums"]["billing_period"]
          plan_id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          current_period_end?: string | null
          external_id?: string | null
          id?: string
          period?: Database["public"]["Enums"]["billing_period"]
          plan_id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          audio_hash: string | null
          audio_url: string | null
          bit_depth: number | null
          codec: string | null
          created_at: string
          duration: number | null
          explicit: boolean
          file_size: number | null
          id: string
          isrc: string | null
          loudness_lufs: number | null
          position: number
          release_id: string
          sample_rate: number | null
          title: string
          version: string | null
        }
        Insert: {
          audio_hash?: string | null
          audio_url?: string | null
          bit_depth?: number | null
          codec?: string | null
          created_at?: string
          duration?: number | null
          explicit?: boolean
          file_size?: number | null
          id?: string
          isrc?: string | null
          loudness_lufs?: number | null
          position?: number
          release_id: string
          sample_rate?: number | null
          title: string
          version?: string | null
        }
        Update: {
          audio_hash?: string | null
          audio_url?: string | null
          bit_depth?: number | null
          codec?: string | null
          created_at?: string
          duration?: number | null
          explicit?: boolean
          file_size?: number | null
          id?: string
          isrc?: string | null
          loudness_lufs?: number | null
          position?: number
          release_id?: string
          sample_rate?: number | null
          title?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_parts: {
        Row: {
          etag: string
          id: string
          part_number: number
          session_id: string
          size: number
          uploaded_at: string
        }
        Insert: {
          etag: string
          id?: string
          part_number: number
          session_id: string
          size: number
          uploaded_at?: string
        }
        Update: {
          etag?: string
          id?: string
          part_number?: number
          session_id?: string
          size?: number
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_parts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "upload_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_sessions: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          kind: Database["public"]["Enums"]["upload_kind"]
          mime_type: string
          part_size: number
          r2_key: string
          r2_upload_id: string
          sha256_hash: string | null
          status: Database["public"]["Enums"]["upload_status"]
          total_parts: number
          updated_at: string
          uploader_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          kind: Database["public"]["Enums"]["upload_kind"]
          mime_type: string
          part_size: number
          r2_key: string
          r2_upload_id: string
          sha256_hash?: string | null
          status?: Database["public"]["Enums"]["upload_status"]
          total_parts: number
          updated_at?: string
          uploader_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          kind?: Database["public"]["Enums"]["upload_kind"]
          mime_type?: string
          part_size?: number
          r2_key?: string
          r2_upload_id?: string
          sha256_hash?: string | null
          status?: Database["public"]["Enums"]["upload_status"]
          total_parts?: number
          updated_at?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_sessions_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_reports: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          report: Json
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          report: Json
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          report?: Json
        }
        Relationships: []
      }
      wallet: {
        Row: {
          balance_available: number
          balance_pending: number
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_available?: number
          balance_pending?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_available?: number
          balance_pending?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_coupon_redemption: {
        Args: { coupon_code: string }
        Returns: undefined
      }
      is_staff: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      owns_artist: { Args: { target_artist_id: string }; Returns: boolean }
      owns_release: { Args: { target_release_id: string }; Returns: boolean }
      owns_track: { Args: { target_track_id: string }; Returns: boolean }
      owns_validation_entity: {
        Args: { target_entity_id: string; target_entity_type: string }
        Returns: boolean
      }
      validate_coupon: {
        Args: { coupon_code: string; target_plan_id: string }
        Returns: {
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
        }[]
      }
    }
    Enums: {
      artist_plan: "solo" | "label" | "pro"
      billing_period: "monthly" | "annual"
      contributor_role:
        | "main_artist"
        | "featuring"
        | "composer"
        | "author"
        | "producer"
        | "mixing"
        | "mastering"
      discount_type: "percent" | "fixed"
      notification_channel: "inapp" | "email" | "whatsapp"
      payment_proof_status: "pending" | "approved" | "rejected"
      payment_provider: "stripe" | "flutterwave" | "paypal" | "manual"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      payment_type: "subscription" | "addon"
      release_status:
        | "draft"
        | "in_review"
        | "delivering"
        | "delivered"
        | "error"
        | "takedown_requested"
        | "removed"
      release_type: "single" | "ep" | "album"
      subscription_status: "incomplete" | "active" | "past_due" | "canceled"
      upload_kind: "audio" | "artwork" | "payment_proof"
      upload_status: "in_progress" | "completed" | "aborted"
      user_role:
        | "super_admin"
        | "accounting"
        | "support"
        | "ar_manager"
        | "marketing"
        | "manager"
        | "artist"
        | "team_member"
        | "organizer"
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
      artist_plan: ["solo", "label", "pro"],
      billing_period: ["monthly", "annual"],
      contributor_role: [
        "main_artist",
        "featuring",
        "composer",
        "author",
        "producer",
        "mixing",
        "mastering",
      ],
      discount_type: ["percent", "fixed"],
      notification_channel: ["inapp", "email", "whatsapp"],
      payment_proof_status: ["pending", "approved", "rejected"],
      payment_provider: ["stripe", "flutterwave", "paypal", "manual"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      payment_type: ["subscription", "addon"],
      release_status: [
        "draft",
        "in_review",
        "delivering",
        "delivered",
        "error",
        "takedown_requested",
        "removed",
      ],
      release_type: ["single", "ep", "album"],
      subscription_status: ["incomplete", "active", "past_due", "canceled"],
      upload_kind: ["audio", "artwork", "payment_proof"],
      upload_status: ["in_progress", "completed", "aborted"],
      user_role: [
        "super_admin",
        "accounting",
        "support",
        "ar_manager",
        "marketing",
        "manager",
        "artist",
        "team_member",
        "organizer",
      ],
    },
  },
} as const
