export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          name: string
          email: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      roulettes: {
        Row: {
          id: string
          team_ids: string[]
          winners: Json
          executed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_ids: string[]
          winners: Json
          executed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_ids?: string[]
          winners?: Json
          executed_at?: string
          created_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          roulette_id: string
          code: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          roulette_id: string
          code: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          roulette_id?: string
          code?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
