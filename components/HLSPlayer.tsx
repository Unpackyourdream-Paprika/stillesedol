// 'use client'
// import { useEffect, useRef, useState } from 'react'
// import Hls from 'hls.js'

// interface HLSPlayerProps {
//   src: string;
//   isMobile: boolean;
//   isScrolled: boolean;
//   videoMuted: boolean;
// }

// export default function HLSPlayer({ src, isMobile, isScrolled, videoMuted }: HLSPlayerProps) {
//     const videoRef = useRef<HTMLVideoElement>(null)
//     // const [videoMuted, setVideoMuted] = useState(true)
  
//     useEffect(() => {
//       const video = videoRef.current
  
//       if (video) {
//         if (Hls.isSupported()) {
//           const hls = new Hls()
//           hls.loadSource(src)
//           hls.attachMedia(video)
  
//           return () => {
//             hls.destroy()
//           }
//         } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//           // Safari의 경우
//           video.src = src
//         }
//       }
//     }, [src])

//     useEffect(()=>{
//       const video = videoRef.current
//       if (video) {
//         video.muted = videoMuted
//       }
//     }, [videoMuted])

  
//     return (
//       <div className='relative h-full mx-auto'>
//         <video
//           ref={videoRef}
//           // controls
//           autoPlay
//           muted
//           playsInline
//           style={{ 
//             height: '100%',
//             margin: '0 auto', 
//             padding: '4px 0', 
//             backgroundColor: 'black',
//             position: isScrolled ? 'fixed' : 'static'
//           }}
//           className={`
//             ${isMobile ? `top-0 left-4 ${isScrolled ? 'max-w-[105px] max-h-[70px]' : ''}` : `bottom-10 left-0 ${isScrolled ? 'max-w-[350px] max-h-[225px]' : 'max-w-auto'}`}
//           `}
//         >
//         </video>
//         {/* <div className='absolute top-0 left-[50%] -translate-x-[50%] w-full h-full'  style={{ width: boxSize }} /> */}
        
//       </div>
//     )
//   }

// youtube
// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import YouTube from 'react-youtube';

// interface YouTubePlayerProps {
//   src: string; // YouTube 영상 URL (예: https://www.youtube.com/watch?v=VIDEO_ID)
//   isMobile: boolean;
//   isScrolled: boolean;
//   videoMuted: boolean;
// }

// export default function HLSPlayer({ src, isMobile, isScrolled, videoMuted }: YouTubePlayerProps) {
//   const playerRef = useRef<HTMLDivElement>(null);
//   const playerInstance = useRef<any>(null);

//   // YouTube 비디오 ID 추출 함수
//   const getYouTubeVideoId = (url: string) => {
//     const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
//     const match = url.match(regex);
//     return match ? match[1] : '';
//   };

//   const videoId = getYouTubeVideoId(src);

//   // YouTube 플레이어 옵션
//   const opts = {
//     // height: '100%',
//     width: '100%',
//     playerVars: {
//       autoplay: 1, // 자동재생 활성화
//       mute: 1, // props로 음소거 제어
//       playsinline: 1, // 모바일에서 인라인 재생
//       controls: 0, // 컨트롤러 표시
//       rel: 0, // 관련 동영상 비활성화
//       modestbranding: 1, // YouTube 로고 최소화
//     },
//   };

//   // 플레이어 준비 완료 시 호출
//   const onReady = (event: any) => {
//     playerInstance.current = event.target;
//     if (videoMuted) event.target.mute(); // 음소거 상태 보장
//     console.log('YouTube Player is ready');
//   };

//   // 비디오 상태 변경 시 호출
//   const onStateChange = (event: any) => {
//     if (event.data === YouTube.PlayerState.PLAYING) {
//       console.log('Video is playing');
//     }
//   };

//   // 에러 처리
//   const onError = (event: any) => {
//     console.error('YouTube Player Error:', event.data);
//   };

//   // videoMuted 변경 시 음소거 상태 업데이트
//   useEffect(() => {
//     if (playerInstance.current) {
//       if (videoMuted) {
//         playerInstance.current.mute();
//       } else {
//         playerInstance.current.unMute();
//       }
//     }
//   }, [videoMuted]);

//   // 유효하지 않은 YouTube URL 처리
//   if (!videoId) {
//     return <div>Invalid YouTube URL</div>;
//   }

//   return (
//     <div className="relative h-full mx-auto" >
//       <div
//         ref={playerRef}
//         style={{
//           height: '100%',
//           margin: '0 auto',
//           padding: '4px 0',
//           backgroundColor: 'black',
//           position: isScrolled ? 'fixed' : 'static',
//         }}
//         className={`
//           ${isMobile ? `top-0 left-4 ${isScrolled ? 'max-w-[105px] max-h-[70px]' : ''}` : `bottom-10 left-0 ${isScrolled ? 'max-w-[350px] max-h-[360px]' : 'max-w-auto'}`}
//         `}
//       >
//         <YouTube
//           videoId={videoId}
//           opts={opts}
//           onReady={onReady}
//           onStateChange={onStateChange}
//           onError={onError}
//         />
//       </div>
//       {/* 필요 시 오버레이 */}
//       {/* <div className='absolute top-0 left-[50%] -translate-x-[50%] w-full h-full' style={{ width: boxSize }} /> */}
//     </div>
//   );
// }

// iframe
'use client';
import { useEffect, useRef } from 'react';

// Window 인터페이스 확장
interface YouTubeWindow extends Window {
  [x: string]: any;
  onYouTubeIframeAPIReady: () => void;
}

declare let window: YouTubeWindow;

interface YouTubePlayerProps {
  src: string; // YouTube 영상 URL (예: https://www.youtube.com/watch?v=VIDEO_ID)
  isMobile: boolean;
  isScrolled: boolean;
  videoMuted: boolean;
}

export default function HLSPlayer({ src, isMobile, isScrolled, videoMuted }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);

  // YouTube 비디오 ID 추출 함수
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const videoId = getYouTubeVideoId(src);

  useEffect(() => {
    if (!videoId) {
      console.error('Invalid YouTube URL');
      return;
    }

    // YouTube IFrame API 스크립트 동적 로드
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // YouTube IFrame API 준비 완료 시 호출
    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        playerInstance.current = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            mute: 1,
            autoplay: 1, // 자동재생 활성화
            playsinline: 1, // 모바일에서 인라인 재생
            controls: 1, // 컨트롤러 숨기기
            rel: 0, // 관련 동영상 비활성화
            modestbranding: 1, // YouTube 로고 최소화
          },
          events: {
            onReady: (event: any) => {
              if (videoMuted) {
                event.target.mute(); // 초기 음소거 상태 적용
              } else {
                event.target.unMute();
              }
              console.log('YouTube Player is ready');
              // 디버깅: 플레이어 크기 확인
              console.log('Player size:', playerRef.current?.getBoundingClientRect());
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                // 영상이 종료되었을 때 호출
                event.target.playVideo();
                // 원하는 이벤트 처리 (예: 다른 함수 호출, 상태 업데이트 등)
                
              }
            },
            onEnded: (event: any) => {
              console.log('enden',event.data)
            },
            onError: (event: any) => {
              console.error('YouTube Player Error:', event.data);
            },
          },
        });
      }
    };

    // 클린업
    return () => {
      // delete window.onYouTubeIframeAPIReady;
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
    };
  }, [videoId]);

  // videoMuted 변경 시 음소거 상태 업데이트
  useEffect(() => {
    if (playerInstance.current) {
      if (videoMuted) {
        playerInstance.current.mute();
      } else {
        playerInstance.current.unMute();
      }
    }
  }, [videoMuted]);

  // 유효하지 않은 YouTube URL 처리
  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  return (
    <div className={`relative ${isScrolled ? '' : 'h-full'} mx-auto`}>
      <div
        style={{
          height: '100%',
          margin: '0 auto',
          padding: '4px 0',
          backgroundColor: 'black',
          position: isScrolled ? 'fixed' : 'static',
        }}
        className={`
          ${isMobile ? `top-0 left-4 ${isScrolled ? 'max-w-[105px] max-h-[70px]' : ''}` : `bottom-10 left-0 ${isScrolled ? 'max-w-[350px] max-h-[190px]' : 'max-w-auto'}`}
        `}
      >
        <div ref={playerRef} />
      </div>
    </div>
  );
}