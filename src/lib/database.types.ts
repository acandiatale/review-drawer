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
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          email?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          email?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roulettes: {
        Row: {
          id: string
          team_id: string
          selected_members: {
            id: string
            name: string
            email: string
            position: 'top' | 'bottom'
          }[]
          total_participants: number
          executed_by: string | null
          executed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          selected_members: {
            id: string
            name: string
            email: string
            position: 'top' | 'bottom'
          }[]
          total_participants: number
          executed_by?: string | null
          executed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          selected_members?: {
            id: string
            name: string
            email: string
            position: 'top' | 'bottom'
          }[]
          total_participants?: number
          executed_by?: string | null
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
          used_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          roulette_id: string
          code: string
          expires_at: string
          used_at?: string | null
          used_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          roulette_id?: string
          code?: string
          expires_at?: string
          used_at?: string | null
          used_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
