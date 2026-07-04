/**
 * Type `Database` écrit à la main, reflétant
 * `supabase/migrations/20260704140000_auth_profiles_and_roles.sql`,
 * `supabase/migrations/20260704150000_countries_and_currencies.sql`,
 * `supabase/migrations/20260704160000_dashboard_core.sql` et
 * `supabase/migrations/20260704170000_distribution_module.sql`.
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
          active: boolean;
          sort_order: number;
        };
        Insert: {
          code: string;
          default_currency: string;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          code?: string;
          default_currency?: string;
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
    };
    CompositeTypes: Record<string, never>;
  };
};
