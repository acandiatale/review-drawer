import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedTeams() {
  console.log('팀 데이터 시딩 시작...')

  // 기존 데이터 삭제
  console.log('기존 데이터 삭제 중...')
  await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 팀 생성
  console.log('팀 생성 중...')
  const { data: operationTeam, error: operationError } = await supabase
    .from('teams')
    .insert({
      name: '운영팀',
      description: '서비스 운영 및 관리를 담당하는 팀'
    })
    .select()
    .single()

  if (operationError) {
    console.error('운영팀 생성 오류:', operationError)
    return
  }

  const { data: devTeam, error: devError } = await supabase
    .from('teams')
    .insert({
      name: '개발팀',
      description: '제품 개발을 담당하는 팀'
    })
    .select()
    .single()

  if (devError) {
    console.error('개발팀 생성 오류:', devError)
    return
  }

  // 운영팀 멤버 추가
  console.log('운영팀 멤버 추가 중...')
  const operationMembers = [
    { name: '김영주', email: 'youngjoo.kim@example.com', team_id: operationTeam.id },
    { name: '고선경', email: 'sunkyung.ko@example.com', team_id: operationTeam.id },
    { name: '강유경', email: 'yukyung.kang@example.com', team_id: operationTeam.id },
    { name: '박형준', email: 'hyungjun.park@example.com', team_id: operationTeam.id },
    { name: '손동운', email: 'dongwoon.son@example.com', team_id: operationTeam.id },
    { name: '장하연', email: 'hayeon.jang@example.com', team_id: operationTeam.id },
    { name: '김현정', email: 'hyunjung.kim@example.com', team_id: operationTeam.id },
    { name: '이인호', email: 'inho.lee@example.com', team_id: operationTeam.id }
  ]

  const { error: opMembersError } = await supabase
    .from('team_members')
    .insert(operationMembers)

  if (opMembersError) {
    console.error('운영팀 멤버 추가 오류:', opMembersError)
    return
  }

  // 개발팀 멤버 추가
  console.log('개발팀 멤버 추가 중...')
  const devMembers = [
    { name: '김진혁', email: 'jinhyuk.kim@example.com', team_id: devTeam.id },
    { name: '김의준', email: 'euijun.kim@example.com', team_id: devTeam.id },
    { name: '박준우', email: 'junwoo.park@example.com', team_id: devTeam.id },
    { name: '김민덕', email: 'mindeok.kim@example.com', team_id: devTeam.id },
    { name: '김경미', email: 'kyungmi.kim@example.com', team_id: devTeam.id },
    { name: '안채령', email: 'chaeryung.ahn@example.com', team_id: devTeam.id }
  ]

  const { error: devMembersError } = await supabase
    .from('team_members')
    .insert(devMembers)

  if (devMembersError) {
    console.error('개발팀 멤버 추가 오류:', devMembersError)
    return
  }

  console.log('✅ 팀 데이터 시딩 완료!')
  console.log(`- 운영팀: ${operationMembers.length}명`)
  console.log(`- 개발팀: ${devMembers.length}명`)
}

seedTeams().catch(console.error)