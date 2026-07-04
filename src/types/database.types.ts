/**
 * Type `Database` écrit à la main, reflétant
 * `supabase/migrations/20260704140000_auth_profiles_and_roles.sql`,
 * `supabase/migrations/20260704150000_countries_and_currencies.sql` et
 * `supabase/migrations/20260704160000_dashboard_core.sql`.
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
          language: string | null;
          explicit: boolean;
          apple_artwork: boolean;
          artwork_url: string | null;
          release_date: string | null;
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
          language?: string | null;
          explicit?: boolean;
          apple_artwork?: boolean;
          artwork_url?: string | null;
          release_date?: string | null;
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
          language?: string | null;
          explicit?: boolean;
          apple_artwork?: boolean;
          artwork_url?: string | null;
          release_date?: string | null;
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
    };
    CompositeTypes: Record<string, never>;
  };
};
