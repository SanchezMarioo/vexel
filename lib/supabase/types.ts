export type UserAuthSource = "credentials" | "google";
export type UserRole = "user" | "admin";
export type ProjectStatus = "draft" | "active" | "archived";
export type RequestStatus = "pending" | "accepted" | "rejected";
export type ProjectType = "landing_page" | "local_campaign" | "ecommerce" | "other";
export type MessageSenderRole = "user" | "admin";
export type PaymentStatus = "pending" | "paid";

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
          role: UserRole;
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
          role?: UserRole;
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
          role?: UserRole;
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
          request_id: string | null;
          budget_final: number | null;
          estimated_days: number | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          summary?: string | null;
          status?: ProjectStatus;
          request_id?: string | null;
          budget_final?: number | null;
          estimated_days?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          summary?: string | null;
          status?: ProjectStatus;
          request_id?: string | null;
          budget_final?: number | null;
          estimated_days?: number | null;
          admin_notes?: string | null;
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
      project_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          project_type: ProjectType;
          budget: string | null;
          reference_url: string | null;
          status: RequestStatus;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          project_type?: ProjectType;
          budget?: string | null;
          reference_url?: string | null;
          status?: RequestStatus;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          project_type?: ProjectType;
          budget?: string | null;
          reference_url?: string | null;
          status?: RequestStatus;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      project_messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          sender_role: MessageSenderRole;
          content: string;
          image_urls: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          sender_role: MessageSenderRole;
          content: string;
          image_urls?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          sender_role?: MessageSenderRole;
          content?: string;
          image_urls?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "user_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "user_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      project_payments: {
        Row: {
          id: string;
          project_id: string;
          description: string;
          amount: number;
          due_date: string | null;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          description: string;
          amount: number;
          due_date?: string | null;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          description?: string;
          amount?: number;
          due_date?: string | null;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "user_projects";
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
export type ProjectRequestRow = Database["public"]["Tables"]["project_requests"]["Row"];
export type ProjectMessageRow = Database["public"]["Tables"]["project_messages"]["Row"];
export type ProjectPaymentRow = Database["public"]["Tables"]["project_payments"]["Row"];
