'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Team = Database['public']['Tables']['teams']['Row']
type TeamMember = Database['public']['Tables']['team_members']['Row']

interface TeamSelectorProps {
  onMembersChange: (members: TeamMember[]) => void
}

export default function TeamSelector({ onMembersChange }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamMembers(selectedTeamId)
    } else {
      setTeamMembers([])
      onMembersChange([])
    }
  }, [selectedTeamId])

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (error) {
      console.error('팀 목록 조회 실패:', error)
      return
    }

    setTeams(data || [])
  }

  const fetchTeamMembers = async (teamId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('팀원 목록 조회 실패:', error)
      setTeamMembers([])
      onMembersChange([])
      setLoading(false)
      return
    }

    setTeamMembers(data || [])
    onMembersChange(data || [])
    setLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">팀 선택</h2>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium">
            {teamMembers.length}명 선택
          </span>
        </div>

        <div className="mb-6">
          <div className="flex gap-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedTeamId === team.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-md'
                }`}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              팀원 목록
            </h3>
            {teamMembers.length > 0 && (
              <span className="text-sm text-gray-500">
                총 {teamMembers.length}명의 팀원
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-500"></div>
              <p className="mt-3 text-gray-500">로딩 중...</p>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name[0]}
                    </div>
                    <p className="ml-3 font-medium text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                      {member.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate pl-13">
                    {member.email}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                위에서 팀을 선택해주세요
              </p>
              <p className="text-sm text-gray-400 mt-1">
                팀을 선택하면 팀원 목록이 표시됩니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}