# 포트 3005에서 실행 중인 프로세스 종료 (있다면)
try {
    Write-Host "이전에 실행 중이던 서버가 있으면 종료합니다..."
    npx kill-port 3005
} catch {
    Write-Host "이전 서버를 종료하는 중 오류가 발생했습니다. 계속 진행합니다."
}

# 개발 서버 시작
Write-Host "개발 서버를 시작합니다..."
npm run dev 