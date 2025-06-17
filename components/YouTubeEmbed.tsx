'use client'
import { useEffect, useRef } from 'react'

// 직접 링크 지정
const VIDEO_ID = '55iMkzfrQ8M'

export default function YouTubeEmbed() {
  const iframeRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // 비디오 자동 재생을 위한 처리
    const iframe = iframeRef.current
    if (!iframe) return

    // iframe 로드 완료 후 처리
    iframe.onload = () => {
      // 자동 재생 시도
      iframe.focus()
      try {
        // setTimeout(() => {
        //   iframe.contentWindow?.postMessage(
        //     JSON.stringify({ event: 'command', func: 'playVideo' }),
        //     '*'
        //   )
        // }, 1000)
      } catch (e) {
        console.error('자동 재생 활성화 중 오류:', e)
      }
    }

    // 비디오가 보이게 되면 다시 로드
    const handleVisibilityChange = () => {
      // if (document.visibilityState === 'visible' && iframe) {
        iframe.src = 'https://youtu.be/Jg5wkZ-dJXA?feature=shared'
      // }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 일반 임베드 방식 */}
      <video
        ref={iframeRef}
        src={`https://youtu.be/Jg5wkZ-dJXA?feature=shared`}
        className="absolute top-0 left-0 w-full h-full"
        // frameBorder="0"
        // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        // allowFullScreen
        autoPlay
        muted
        playsInline
      ></video>

      {/* 직접 링크 제공 - 사용자가 클릭할 수 있는 링크 */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-20">
        <a 
          href={`https://youtu.be/Jg5wkZ-dJXA?feature=shared`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          직접 보기
        </a>
      </div>
    </div>
  )
} 