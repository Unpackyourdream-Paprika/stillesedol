# Kayne Sign 프로젝트

칸예 웨스트 팬들을 위한 서명 및 메시지 공유 웹 애플리케이션

## 기능

- 사용자가 글과 서명 이미지를 남길 수 있습니다
- 각 서명은 랜덤하게 생성된 칸예 웨스트 관련 이름과 프로필 이미지를 가집니다
- 실시간 비디오 스트리밍 지원
- 반응형 디자인으로 모바일 및 데스크톱 지원

## 시작하기

### 개발 환경 설정

1. 저장소를 클론합니다:
```
git clone <repository-url>
cd kayne_sign
```

2. 의존성을 설치합니다:
```
npm install
```

3. 환경 변수를 설정합니다:
   - 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # 독특한 이름 생성을 위한 OpenAI API 키 (선택 사항)
   OPENAI_API_KEY=your_openai_api_key
   ```

### 개발 서버 실행

#### PowerShell에서 시작
PowerShell에서는 제공된 스크립트를 사용하여 쉽게 시작할 수 있습니다:
```
.\start-dev.ps1
```

#### 수동으로 시작
또는 다음 명령으로 수동 시작:
```
npm run dev
```

서버가 시작되면 브라우저에서 `http://localhost:3005`로 접속하세요.

## 데이터베이스 설정

Supabase 데이터베이스를 설정하려면 `README_MIGRATION.md` 파일을 참조하세요. 이 파일은 데이터베이스 스키마를 설정하는 방법을 안내합니다.

## 사용된 기술

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://openai.com/api/) (독특한 이름 생성용, 선택 사항)
