# PR 리뷰어 랜덤 룰렛 서비스

Git Pull Request 리뷰어를 랜덤하게 선정하는 룰렛 서비스입니다.

## 🚀 기능

- 원형 룰렛 UI를 통한 랜덤 리뷰어 선정
- 운영팀/개발팀 구분 선택
- 2명 동시 선정 (상단/하단 핀)
- 초대 코드를 통한 당첨 결과 공유
- Supabase를 활용한 데이터 관리

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/          # Next.js App Router
├── components/   # React 컴포넌트
│   ├── ui/       # UI 컴포넌트
│   ├── layout/   # 레이아웃 컴포넌트
│   └── roulette/ # 룰렛 관련 컴포넌트
├── lib/          # 유틸리티 함수
├── types/        # TypeScript 타입 정의
├── hooks/        # Custom React Hooks
└── services/     # API 서비스 레이어
```

## 🔧 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 👥 팀 구성

### 운영팀
- 김영주, 고선경, 강유경, 박형준, 손동운, 장하연, 김현정, 이인호

### 개발팀
- 김진혁, 김의준, 박준우, 김민덕, 김경미, 안채령