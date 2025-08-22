'use client'

import { useState } from 'react'
import TeamSelector from '@/components/TeamSelector'
import RouletteWheel from '@/components/RouletteWheel'
import { Database } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

type TeamMember = Database['public']['Tables']['team_members']['Row']

export default function Home() {
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winners, setWinners] = useState<{
    top: TeamMember
    bottom: TeamMember
  } | null>(null)
  const [inviteCode, setInviteCode] = useState<string>('')

  const handleMembersChange = (members: TeamMember[]) => {
    setSelectedMembers(members)
    setWinners(null)
    setInviteCode('')
  }

  const handleSpin = () => {
    if (selectedMembers.length < 2) {
      alert('최소 2명 이상의 팀원이 필요합니다.')
      return
    }
    setIsSpinning(true)
    setWinners(null)
    setInviteCode('')
  }

  const handleSpinComplete = async (result: {
    top: TeamMember
    bottom: TeamMember
  }) => {
    setIsSpinning(false)
    setWinners(result)

    // 룰렛 결과 저장 및 초대 코드 생성
    await saveRouletteResult(result)
  }

  const saveRouletteResult = async (result: {
    top: TeamMember
    bottom: TeamMember
  }) => {
    try {
      // 룰렛 결과 저장
      const { data: rouletteData, error: rouletteError } = await supabase
        .from('roulettes')
        .insert({
          team_id: selectedMembers[0]?.team_id,
          selected_members: [
            { ...result.top, position: 'top' },
            { ...result.bottom, position: 'bottom' },
          ],
          total_participants: selectedMembers.length,
          executed_by: 'user',
        })
        .select()
        .single()

      if (rouletteError) {
        console.error('룰렛 결과 저장 오류:', rouletteError)
        return
      }

      // 초대 코드 생성
      const code = generateInviteCode()
      const { error: inviteError } = await supabase.from('invites').insert({
        roulette_id: rouletteData.id,
        code: code,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24시간 후 만료
      })

      if (inviteError) {
        console.error('초대 코드 생성 오류:', inviteError)
        return
      }

      setInviteCode(code)
    } catch (error) {
      console.error('저장 중 오류:', error)
    }
  }

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PR Reviewer
              </span>
              <span className="block text-3xl md:text-4xl mt-2 text-gray-700">
                랜덤 룰렛
              </span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              공정하고 재미있게 Pull Request 리뷰어를 선정하세요 🎯
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* 룰렛 영역 */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    룰렛 돌리기
                  </h2>
                </div>
              </div>

              {selectedMembers.length > 0 ? (
                <>
                  <div className="flex justify-center mb-6">
                    <RouletteWheel
                      members={selectedMembers}
                      isSpinning={isSpinning}
                      onSpinComplete={handleSpinComplete}
                    />
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleSpin}
                      disabled={isSpinning}
                      className={`relative px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform ${
                        isSpinning
                          ? 'bg-gray-400 cursor-not-allowed scale-95'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 hover:shadow-2xl shadow-xl'
                      }`}
                    >
                      <span className="relative z-10">
                        {isSpinning ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            룰렛 돌리는 중...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            룰렛 시작하기
                          </span>
                        )}
                      </span>
                      {!isSpinning && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl filter blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      )}
                    </button>
                  </div>

                  {/* 당첨자 표시 */}
                  {winners && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-2xl border-2 border-yellow-200 shadow-xl">
                      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center">
                        <span className="text-3xl mr-2">🎉</span>
                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          당첨자 발표!
                        </span>
                        <span className="text-3xl ml-2">🎉</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-5 bg-white/80 backdrop-blur rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 border border-red-100">
                          <p className="text-sm text-red-600 font-semibold mb-2">
                            상단 포인터
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {winners.top.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {winners.top.email}
                          </p>
                        </div>
                        <div className="text-center p-5 bg-white/80 backdrop-blur rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 border border-blue-100">
                          <p className="text-sm text-blue-600 font-semibold mb-2">
                            하단 포인터
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {winners.bottom.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {winners.bottom.email}
                          </p>
                        </div>
                      </div>

                      {inviteCode && (
                        <div className="mt-6 text-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg">
                          <p className="text-sm text-gray-600 mb-2">
                            초대 코드
                          </p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-mono tracking-wider">
                            {inviteCode}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            24시간 동안 유효합니다
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    팀을 선택하면 룰렛이 표시됩니다
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    오른쪽에서 팀을 선택해주세요 →
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 팀 선택 영역 */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <TeamSelector onMembersChange={handleMembersChange} />
          </div>
        </div>
      </div>
    </main>
  )
}
