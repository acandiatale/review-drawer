import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: teamId } = await params

    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('name', { ascending: true })

    if (error) {
      console.error('팀원 목록 조회 오류:', error)
      return NextResponse.json(
        { error: '팀원 목록을 불러올 수 없습니다.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: teamId } = await params
    const body = await request.json()
    const { name, email, github_username, avatar_url, is_active = true } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: '이름과 이메일은 필수입니다.' },
        { status: 400 },
      )
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        name,
        email,
        github_username,
        avatar_url,
        is_active,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 등록된 팀원입니다.' },
          { status: 409 },
        )
      }
      console.error('팀원 추가 오류:', error)
      return NextResponse.json(
        { error: '팀원을 추가할 수 없습니다.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: teamId } = await params
    const body = await request.json()
    const { memberId, name, email, github_username, avatar_url, is_active } =
      body

    if (!memberId) {
      return NextResponse.json(
        { error: '팀원 ID가 필요합니다.' },
        { status: 400 },
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (github_username !== undefined)
      updateData.github_username = github_username
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: member, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('team_id', teamId)
      .select()
      .single()

    if (error) {
      console.error('팀원 수정 오류:', error)
      return NextResponse.json(
        { error: '팀원 정보를 수정할 수 없습니다.' },
        { status: 500 },
      )
    }

    if (!member) {
      return NextResponse.json(
        { error: '팀원을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
