import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('팀 목록 조회 오류:', error)
      return NextResponse.json(
        { error: '팀 목록을 불러올 수 없습니다.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: '팀 이름은 필수입니다.' },
        { status: 400 },
      )
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({ name, description })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 존재하는 팀 이름입니다.' },
          { status: 409 },
        )
      }
      console.error('팀 생성 오류:', error)
      return NextResponse.json(
        { error: '팀을 생성할 수 없습니다.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
