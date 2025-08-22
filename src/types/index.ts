export interface Team {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  teamId: string
  name: string
  email?: string
  avatarUrl?: string
  createdAt: Date
}

export interface Roulette {
  id: string
  teamIds: string[]
  winners: RouletteWinner[]
  executedAt: Date
  createdAt: Date
}

export interface RouletteWinner {
  memberId: string
  memberName: string
  teamId: string
  position: 'top' | 'bottom'
}

export interface Invite {
  id: string
  rouletteId: string
  code: string
  expiresAt: Date
  usedAt?: Date
  createdAt: Date
}
