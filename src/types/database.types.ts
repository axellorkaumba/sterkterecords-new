/**
 * Type `Database` écrit à la main, reflétant
 * `supabase/migrations/20260704140000_auth_profiles_and_roles.sql` et
 * `supabase/migrations/20260704150000_countries_and_currencies.sql`.
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
    };
    CompositeTypes: Record<string, never>;
  };
};
