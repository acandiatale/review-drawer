'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type TeamMember = Database['public']['Tables']['team_members']['Row']

interface RouletteResult {
  id: string
  team_id: string
  selected_members: Array<TeamMember & { position: string }>
  total_participants: number
  executed_by: string
  created_at: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const code = params?.['code'] as string
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<RouletteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')

  useEffect(() => {
    if (code) {
      fetchRouletteResult()
    }
  }, [code])

  const fetchRouletteResult = async () => {
    try {
      // 초대 코드로 룰렛 ID 조회
      const { data: inviteData, error: inviteError } = await supabase
        .from('invites')
        .select('roulette_id, expires_at')
        .eq('code', code.toUpperCase())
        .single()

      if (inviteError || !inviteData) {
        setError('유효하지 않은 초대 코드입니다.')
        setLoading(false)
        return
      }

      // 만료 시간 확인
      if (new Date(inviteData.expires_at) < new Date()) {
        setError('만료된 초대 코드입니다.')
        setLoading(false)
        return
      }

      // 룰렛 결과 조회
      const { data: rouletteData, error: rouletteError } = await supabase
        .from('roulettes')
        .select('*')
        .eq('id', inviteData.roulette_id)
        .single()

      if (rouletteError || !rouletteData) {
        setError('룰렛 결과를 찾을 수 없습니다.')
        setLoading(false)
        return
      }

      // 팀 이름 조회
      if (rouletteData.team_id) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('name')
          .eq('id', rouletteData.team_id)
          .single()

        if (teamData) {
          setTeamName(teamData.name)
        }
      }

      setResult(rouletteData as RouletteResult)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching result:', err)
      setError('결과를 불러오는 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const topWinner = result?.selected_members?.find((m) => m.position === 'top')
  const bottomWinner = result?.selected_members?.find(
    (m) => m.position === 'bottom',
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-500"></div>
          <p className="mt-4 text-gray-600">결과를 불러오는 중...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </main>
    )
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
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PR Reviewer 룰렛 결과
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              초대 코드:{' '}
              <span className="font-mono font-bold text-indigo-600">
                {code?.toUpperCase()}
              </span>
            </p>
            {teamName && (
              <p className="text-gray-500 mt-2">
                팀: <span className="font-semibold">{teamName}</span>
              </p>
            )}
          </div>

          {/* 결과 카드 */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                <span className="text-4xl mr-3">🎉</span>
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  당첨자 발표
                </span>
                <span className="text-4xl ml-3">🎉</span>
              </h2>
              <p className="text-gray-500 mt-2">
                {result?.created_at &&
                  new Date(result.created_at).toLocaleString('ko-KR')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 상단 포인터 당첨자 */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-red-600">
                    상단 포인터
                  </h3>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    {topWinner?.name || '알 수 없음'}
                  </p>
                  <p className="text-gray-600">{topWinner?.email || '-'}</p>
                </div>
              </div>

              {/* 하단 포인터 당첨자 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    하단 포인터
                  </h3>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    {bottomWinner?.name || '알 수 없음'}
                  </p>
                  <p className="text-gray-600">{bottomWinner?.email || '-'}</p>
                </div>
              </div>
            </div>

            {/* 참가 정보 */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-600">
                총{' '}
                <span className="font-bold text-indigo-600">
                  {result?.total_participants || 0}명
                </span>
                의 팀원이 참여했습니다
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
              >
                새로운 룰렛 돌리기
              </button>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="px-8 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300"
              >
                링크 복사
              </button>
            </div>
          </div>

          {/* 공유 안내 */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              이 링크를 팀원들과 공유하여 룰렛 결과를 확인하세요
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
