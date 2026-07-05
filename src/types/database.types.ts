/**
 * Type `Database` écrit à la main, reflétant
 * `supabase/migrations/20260704140000_auth_profiles_and_roles.sql`,
 * `supabase/migrations/20260704150000_countries_and_currencies.sql`,
 * `supabase/migrations/20260704160000_dashboard_core.sql`,
 * `supabase/migrations/20260704170000_distribution_module.sql` et
 * `supabase/migrations/20260705120000_pricing_and_payments.sql`.
 *
 * Normalement généré par `pnpm supabase:gen:types` contre un vrai projet
 * Supabase (local Docker ou cloud) — indisponible dans cet environnement
 * (voir docs/adr/0007-auth-architecture.md, section "Contrainte
 * d'environnement"). Dès qu'un projet existe, régénérer ce fichier avec la
 * commande ci-dessus : la forme (Row/Insert/Update/Enums/Functions) est déjà
 * conforme au format réel, seule la source de vérité change.
 *
 * Ne PAS éditer à la main une fois régénéré.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name: string | null;
          avatar_url: string | null;
          country: string | null;
          currency: string;
          locale: string;
          notify_email: boolean;
          notify_whatsapp: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          currency?: string;
          locale?: string;
          notify_email?: boolean;
          notify_whatsapp?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          currency?: string;
          locale?: string;
          notify_email?: boolean;
          notify_whatsapp?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_country_fkey";
            columns: ["country"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "profiles_currency_fkey";
            columns: ["currency"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
        ];
      };
      countries: {
        Row: {
          code: string;
          default_currency: string;
          default_payment_provider: Database["public"]["Enums"]["payment_provider"];
          active: boolean;
          sort_order: number;
        };
        Insert: {
          code: string;
          default_currency: string;
          default_payment_provider?: Database["public"]["Enums"]["payment_provider"];
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          code?: string;
          default_currency?: string;
          default_payment_provider?: Database["public"]["Enums"]["payment_provider"];
          active?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "countries_default_currency_fkey";
            columns: ["default_currency"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          self_service: boolean;
          trial_days: number;
          active: boolean;
          sort_order: number;
        };
        Insert: {
          id: string;
          self_service?: boolean;
          trial_days?: number;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          self_service?: boolean;
          trial_days?: number;
          active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      pricing_regions: {
        Row: {
          id: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      pricing_region_countries: {
        Row: {
          region_id: string;
          country_code: string;
        };
        Insert: {
          region_id: string;
          country_code: string;
        };
        Update: {
          region_id?: string;
          country_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pricing_region_countries_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "pricing_regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pricing_region_countries_country_code_fkey";
            columns: ["country_code"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["code"];
          },
        ];
      };
      plan_prices: {
        Row: {
          id: string;
          plan_id: string;
          region_id: string;
          period: Database["public"]["Enums"]["billing_period"];
          currency_code: string;
          amount: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          plan_id: string;
          region_id: string;
          period: Database["public"]["Enums"]["billing_period"];
          currency_code: string;
          amount: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          plan_id?: string;
          region_id?: string;
          period?: Database["public"]["Enums"]["billing_period"];
          currency_code?: string;
          amount?: number;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "plan_prices_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_prices_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "pricing_regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_prices_currency_code_fkey";
            columns: ["currency_code"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
        ];
      };
      plan_features: {
        Row: {
          plan_id: string;
          feature_key: string;
          enabled: boolean;
        };
        Insert: {
          plan_id: string;
          feature_key: string;
          enabled?: boolean;
        };
        Update: {
          plan_id?: string;
          feature_key?: string;
          enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      addons: {
        Row: {
          id: string;
          billing: string;
          active: boolean;
          sort_order: number;
        };
        Insert: {
          id: string;
          billing?: string;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          billing?: string;
          active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      addon_prices: {
        Row: {
          id: string;
          addon_id: string;
          region_id: string;
          currency_code: string;
          amount: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          addon_id: string;
          region_id: string;
          currency_code: string;
          amount: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          addon_id?: string;
          region_id?: string;
          currency_code?: string;
          amount?: number;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "addon_prices_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "addons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "addon_prices_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "pricing_regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "addon_prices_currency_code_fkey";
            columns: ["currency_code"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
        ];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: Database["public"]["Enums"]["discount_type"];
          discount_value: number;
          plan_id: string | null;
          max_redemptions: number | null;
          redemptions_count: number;
          valid_from: string;
          valid_until: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: Database["public"]["Enums"]["discount_type"];
          discount_value: number;
          plan_id?: string | null;
          max_redemptions?: number | null;
          redemptions_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          active?: boolean;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: Database["public"]["Enums"]["discount_type"];
          discount_value?: number;
          plan_id?: string | null;
          max_redemptions?: number | null;
          redemptions_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          period: Database["public"]["Enums"]["billing_period"];
          status: Database["public"]["Enums"]["subscription_status"];
          provider: Database["public"]["Enums"]["payment_provider"];
          external_id: string | null;
          coupon_id: string | null;
          trial_ends_at: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          period: Database["public"]["Enums"]["billing_period"];
          status?: Database["public"]["Enums"]["subscription_status"];
          provider: Database["public"]["Enums"]["payment_provider"];
          external_id?: string | null;
          coupon_id?: string | null;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          period?: Database["public"]["Enums"]["billing_period"];
          status?: Database["public"]["Enums"]["subscription_status"];
          provider?: Database["public"]["Enums"]["payment_provider"];
          external_id?: string | null;
          coupon_id?: string | null;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["payment_type"];
          provider: Database["public"]["Enums"]["payment_provider"];
          amount: number;
          currency: string;
          status: Database["public"]["Enums"]["payment_status"];
          external_id: string | null;
          release_id: string | null;
          addon_id: string | null;
          coupon_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["payment_type"];
          provider: Database["public"]["Enums"]["payment_provider"];
          amount: number;
          currency: string;
          status?: Database["public"]["Enums"]["payment_status"];
          external_id?: string | null;
          release_id?: string | null;
          addon_id?: string | null;
          coupon_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database["public"]["Enums"]["payment_type"];
          provider?: Database["public"]["Enums"]["payment_provider"];
          amount?: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          external_id?: string | null;
          release_id?: string | null;
          addon_id?: string | null;
          coupon_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_currency_fkey";
            columns: ["currency"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "payments_release_id_fkey";
            columns: ["release_id"];
            isOneToOne: false;
            referencedRelation: "releases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "addons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
        ];
      };
      currencies: {
        Row: {
          code: string;
          active: boolean;
          sort_order: number;
        };
        Insert: {
          code: string;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          code?: string;
          active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      artists: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          links: Json;
          plan: Database["public"]["Enums"]["artist_plan"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          links?: Json;
          plan?: Database["public"]["Enums"]["artist_plan"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          links?: Json;
          plan?: Database["public"]["Enums"]["artist_plan"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artists_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      releases: {
        Row: {
          id: string;
          artist_id: string;
          type: Database["public"]["Enums"]["release_type"];
          title: string;
          upc: string | null;
          genre: string | null;
          sub_genre: string | null;
          language: string | null;
          explicit: boolean;
          apple_artwork: boolean;
          artwork_url: string | null;
          release_date: string | null;
          release_time: string | null;
          release_timezone: string | null;
          recording_date: string | null;
          copyright_p: string | null;
          copyright_c: string | null;
          label_name: string;
          current_step: number;
          submitted_at: string | null;
          status: Database["public"]["Enums"]["release_status"];
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          type: Database["public"]["Enums"]["release_type"];
          title: string;
          upc?: string | null;
          genre?: string | null;
          sub_genre?: string | null;
          language?: string | null;
          explicit?: boolean;
          apple_artwork?: boolean;
          artwork_url?: string | null;
          release_date?: string | null;
          release_time?: string | null;
          release_timezone?: string | null;
          recording_date?: string | null;
          copyright_p?: string | null;
          copyright_c?: string | null;
          label_name?: string;
          current_step?: number;
          submitted_at?: string | null;
          status?: Database["public"]["Enums"]["release_status"];
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          type?: Database["public"]["Enums"]["release_type"];
          title?: string;
          upc?: string | null;
          genre?: string | null;
          sub_genre?: string | null;
          language?: string | null;
          explicit?: boolean;
          apple_artwork?: boolean;
          artwork_url?: string | null;
          release_date?: string | null;
          release_time?: string | null;
          release_timezone?: string | null;
          recording_date?: string | null;
          copyright_p?: string | null;
          copyright_c?: string | null;
          label_name?: string;
          current_step?: number;
          submitted_at?: string | null;
          status?: Database["public"]["Enums"]["release_status"];
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "releases_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
        ];
      };
      tracks: {
        Row: {
          id: string;
          release_id: string;
          position: number;
          title: string;
          isrc: string | null;
          audio_url: string | null;
          duration: number | null;
          explicit: boolean;
          version: string | null;
          audio_hash: string | null;
          sample_rate: number | null;
          bit_depth: number | null;
          codec: string | null;
          loudness_lufs: number | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          release_id: string;
          position?: number;
          title: string;
          isrc?: string | null;
          audio_url?: string | null;
          duration?: number | null;
          explicit?: boolean;
          version?: string | null;
          audio_hash?: string | null;
          sample_rate?: number | null;
          bit_depth?: number | null;
          codec?: string | null;
          loudness_lufs?: number | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          release_id?: string;
          position?: number;
          title?: string;
          isrc?: string | null;
          audio_url?: string | null;
          duration?: number | null;
          explicit?: boolean;
          version?: string | null;
          audio_hash?: string | null;
          sample_rate?: number | null;
          bit_depth?: number | null;
          codec?: string | null;
          loudness_lufs?: number | null;
          file_size?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracks_release_id_fkey";
            columns: ["release_id"];
            isOneToOne: false;
            referencedRelation: "releases";
            referencedColumns: ["id"];
          },
        ];
      };
      contributors: {
        Row: {
          id: string;
          track_id: string;
          role: Database["public"]["Enums"]["contributor_role"];
          name: string;
          split_pct: number;
          linked_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          role: Database["public"]["Enums"]["contributor_role"];
          name: string;
          split_pct: number;
          linked_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          role?: Database["public"]["Enums"]["contributor_role"];
          name?: string;
          split_pct?: number;
          linked_user_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contributors_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributors_linked_user_id_fkey";
            columns: ["linked_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      release_platforms: {
        Row: {
          id: string;
          release_id: string;
          dsp: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          release_id: string;
          dsp: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          release_id?: string;
          dsp?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "release_platforms_release_id_fkey";
            columns: ["release_id"];
            isOneToOne: false;
            referencedRelation: "releases";
            referencedColumns: ["id"];
          },
        ];
      };
      labelgrid_sync: {
        Row: {
          id: string;
          release_id: string;
          external_id: string;
          status: string;
          last_synced_at: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          release_id: string;
          external_id: string;
          status: string;
          last_synced_at?: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          release_id?: string;
          external_id?: string;
          status?: string;
          last_synced_at?: string;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "labelgrid_sync_release_id_fkey";
            columns: ["release_id"];
            isOneToOne: false;
            referencedRelation: "releases";
            referencedColumns: ["id"];
          },
        ];
      };
      upload_sessions: {
        Row: {
          id: string;
          uploader_id: string;
          kind: Database["public"]["Enums"]["upload_kind"];
          file_name: string;
          file_size: number;
          mime_type: string;
          r2_key: string;
          r2_upload_id: string;
          part_size: number;
          total_parts: number;
          status: Database["public"]["Enums"]["upload_status"];
          sha256_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          uploader_id: string;
          kind: Database["public"]["Enums"]["upload_kind"];
          file_name: string;
          file_size: number;
          mime_type: string;
          r2_key: string;
          r2_upload_id: string;
          part_size: number;
          total_parts: number;
          status?: Database["public"]["Enums"]["upload_status"];
          sha256_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          uploader_id?: string;
          kind?: Database["public"]["Enums"]["upload_kind"];
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          r2_key?: string;
          r2_upload_id?: string;
          part_size?: number;
          total_parts?: number;
          status?: Database["public"]["Enums"]["upload_status"];
          sha256_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "upload_sessions_uploader_id_fkey";
            columns: ["uploader_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      upload_parts: {
        Row: {
          id: string;
          session_id: string;
          part_number: number;
          etag: string;
          size: number;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          part_number: number;
          etag: string;
          size: number;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          part_number?: number;
          etag?: string;
          size?: number;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "upload_parts_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "upload_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      validation_reports: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          report: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          report: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          report?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      stats_monthly: {
        Row: {
          id: string;
          artist_id: string;
          track_id: string | null;
          period: string;
          dsp: string;
          country: string | null;
          streams: number;
          revenue: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          track_id?: string | null;
          period: string;
          dsp: string;
          country?: string | null;
          streams?: number;
          revenue?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          track_id?: string | null;
          period?: string;
          dsp?: string;
          country?: string | null;
          streams?: number;
          revenue?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stats_monthly_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stats_monthly_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      wallet: {
        Row: {
          id: string;
          user_id: string;
          currency: string;
          balance_available: number;
          balance_pending: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          currency?: string;
          balance_available?: number;
          balance_pending?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          currency?: string;
          balance_available?: number;
          balance_pending?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_currency_fkey";
            columns: ["currency"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          type: string;
          payload: Json | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          type: string;
          payload?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          type?: string;
          payload?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          diff: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          diff?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          diff?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      owns_artist: {
        Args: { target_artist_id: string };
        Returns: boolean;
      };
      owns_release: {
        Args: { target_release_id: string };
        Returns: boolean;
      };
      owns_track: {
        Args: { target_track_id: string };
        Returns: boolean;
      };
      owns_validation_entity: {
        Args: { target_entity_type: string; target_entity_id: string };
        Returns: boolean;
      };
      validate_coupon: {
        Args: { coupon_code: string; target_plan_id: string };
        Returns: {
          discount_type: Database["public"]["Enums"]["discount_type"];
          discount_value: number;
        }[];
      };
      increment_coupon_redemption: {
        Args: { coupon_code: string };
        Returns: undefined;
      };
    };
    Enums: {
      user_role:
        | "super_admin"
        | "accounting"
        | "support"
        | "ar_manager"
        | "marketing"
        | "manager"
        | "artist"
        | "team_member"
        | "organizer";
      artist_plan: "solo" | "label";
      release_type: "single" | "ep" | "album";
      release_status:
        | "draft"
        | "in_review"
        | "delivering"
        | "delivered"
        | "error"
        | "takedown_requested"
        | "removed";
      notification_channel: "inapp" | "email" | "whatsapp";
      contributor_role:
        | "main_artist"
        | "featuring"
        | "composer"
        | "author"
        | "producer"
        | "mixing"
        | "mastering";
      upload_kind: "audio" | "artwork";
      upload_status: "in_progress" | "completed" | "aborted";
      billing_period: "monthly" | "annual";
      discount_type: "percent" | "fixed";
      payment_provider: "stripe" | "flutterwave";
      subscription_status: "incomplete" | "active" | "past_due" | "canceled";
      payment_type: "subscription" | "addon";
      payment_status: "pending" | "succeeded" | "failed" | "refunded";
    };
    CompositeTypes: Record<string, never>;
  };
};
