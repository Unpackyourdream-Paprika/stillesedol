import { v4 as uuidv4 } from 'uuid';

// 사용자 ID를 쿠키에서 가져오거나 새로 생성
export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  
  let userId = getCookie('user_id');
  
  if (!userId) {
    userId = uuidv4();
    setCookie('user_id', userId, 365); // 1년 동안 유효
  }
  
  return userId;
}

// 닉네임 가져오기 (쿠키에 저장된 닉네임 리턴)
export function getUsername(): string | null {
  let username =  getCookie('username');
  alert(`username: ${username}`)
  if (username?.includes('[')) {
    const val = JSON.parse(username)
    return val[0];
  } else {
    return username
  }
}

// 닉네임 설정하기
export function setUsername(username: string): void {
  if (typeof window === 'undefined') return;
  setCookie('username', username, 365); // 1년 동안 유효
}

// 닉네임 유효성 확인 (닉네임이 존재하고 비어있지 않은지 확인)
export function hasValidUsername(): boolean {
  const username = getUsername();
  return !!username && username.trim() !== '';
}

// 쿠키 설정 함수
export function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// 쿠키 가져오기 함수
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
} 