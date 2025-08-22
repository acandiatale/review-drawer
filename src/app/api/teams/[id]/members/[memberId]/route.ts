import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id: teamId, memberId } = await params

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId)

    if (error) {
      console.error('팀원 삭제 오류:', error)
      return NextResponse.json(
        { error: '팀원을 삭제할 수 없습니다.' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: '팀원이 성공적으로 삭제되었습니다.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id: teamId, memberId } = await params

    const { data: member, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single()

    if (error) {
      console.error('팀원 조회 오류:', error)
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
