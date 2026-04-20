export type UserAuthSource = "credentials" | "google";
export type ProjectStatus = "draft" | "active" | "archived";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_accounts: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          password_hash: string | null;
          auth_source: UserAuthSource;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          password_hash?: string | null;
          auth_source?: UserAuthSource;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          password_hash?: string | null;
          auth_source?: UserAuthSource;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          summary: string | null;
          status: ProjectStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          summary?: string | null;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          summary?: string | null;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type UserAccountRow = Database["public"]["Tables"]["user_accounts"]["Row"];
export type UserProjectRow = Database["public"]["Tables"]["user_projects"]["Row"];