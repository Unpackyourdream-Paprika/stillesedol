"use client";

// import dynamic from 'next/dynamic'
import SignatureDrawer from "@/components/SignatureDrawer";
import SignatureWall from "@/components/SignatureWall";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MissionModal } from "../components/MissionModal";

import HLSPlayer from "@/components/HLSPlayer";
import MobileSignatureWall from "@/components/MobileSignatureWall";

// const YouTubeEmbed = dynamic(() => import('@/components/YouTubeEmbed'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-[56.25vw] max-h-[480px] bg-gray-900 animate-pulse" />
//   ),
// })

export default function Home() {
  const signatureWallRef = useRef<{ fetchSignatures: () => void } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [device, setDevice] = useState("Other");
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=oDuxP2vnWNk"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [openMission, setOpenMission] = useState(false);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // 초기 실행
    handleResize();

    // 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 스크롤 위치에 따라 상태 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        setIsScrolled(true); // 100px 초과 시 축소, 이하 시 확대
      } else if (scrollY === 0) {
        setIsScrolled(false);
      }
      // 단일 임계값 사용
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    // let isChrome = false
    // // 브라우저 판별
    // if (/chrome|crios/.test(userAgent) && !/edge|opr|ucbrowser|samsungbrowser/.test(userAgent)) {
    //     isChrome = true;
    //   }
    // https://livelivex.live/live/stream/manifest.mpd
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      setDevice("iOS");
      // setVideoUrl("https://livelivex.live/live/stream/playlist.m3u8")
      setVideoUrl(videoUrl);
    } else if (/Android/i.test(userAgent)) {
      setDevice("Android");
      // setVideoUrl("https://livelivex.live/live/stream/playlist.m3u8")
      setVideoUrl(videoUrl);
    } else {
      setDevice("Other");
      // setVideoUrl("https://livelivex.live/live/stream/playlist.m3u8")
      setVideoUrl(videoUrl);
    }
  }, []);

  useEffect(() => {
    const hidePopup = getCookie("hidePopup");
    if (!hidePopup) {
      setOpenMission(true);
    }
  }, []);

  useEffect(() => {
    if (openMission) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [openMission]);

  const handleSignatureSubmit = () => {
    signatureWallRef.current?.fetchSignatures();
  };

  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  return (
    <div className="relative flex flex-col items-center w-full min-h-screen pb-12 text-white bg-black md:pb-24 font-dinbek">
      {/* Sticky Container - 상단에 고정될 요소들을 그룹화 */}
      <div className="fixed top-0 z-10 w-full ">
        {/* 광고 섹션 */}
        <div
          className={`w-full bg-black transition-all duration-300 ${
            isScrolled ? "py-2" : "py-2"
          }`}
        >
          <div className="relative flex items-center justify-center w-full gap-2 md:gap-4">
            {/* Left GIF */}
            <Link
              href="https://smartstore.naver.com/donquiniku/products/11852523127"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hidden md:block"
              style={{ width: "30%", maxWidth: "350px" }}
            >
              <Image
                src="/100_Kayne_m.gif"
                alt="Bully Link"
                width={350}
                height={250}
                className="w-full h-auto rounded-lg"
              />
            </Link>
            {/* <div className="flex-shrink-0 hidden md:block" 
            style={{ width: '30%', maxWidth: '350px' }}>
              <Image
                src="/100_Kayne_m.gif"
                alt="Bully Link"
                width={350}
                height={250}
                className="w-full h-auto rounded-lg"
              />
            </div> */}

            {/* Logo */}
            <div
              className={`${
                isScrolled ? "w-[150px] md:w-[200px]" : "w-[180px] md:w-[300px]"
              } relative flex-shrink-0 transition-all duration-300`}
              style={{ width: "30%", maxWidth: "300px" }}
            >
              <Image
                src="/Bully.svg"
                alt="Kanye Fan Logo"
                width={300}
                height={109}
                priority
                className="w-full h-auto"
              />
            </div>

            {/* Right GIF */}
            <Link
              href="https://smartstore.naver.com/donquiniku/products/11854994885"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hidden md:block"
              style={{ width: "30%", maxWidth: "350px" }}
            >
              <Image
                src="/100_Kayne_m.gif"
                alt="Bully Link"
                width={350}
                height={250}
                className="w-full h-auto rounded-lg"
              />
            </Link>
            {/* <div className="flex-shrink-0 hidden md:block" 
            style={{ width: '30%', maxWidth: '350px' }}>
              <Image
                src="/100_Kayne_m.gif"
                alt="Bully Link"
                width={350}
                height={250}
                className="w-full h-auto rounded-lg"
              />
            </div> */}
          </div>
        </div>
        <div className="flex items-center justify-center block w-full gap-2 p-4 bg-black md:hidden">
          {/* Left GIF */}
          <Link
            href="https://smartstore.naver.com/donquiniku/products/11852523127"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
            style={{ width: "50%", maxWidth: "350px" }}
          >
            <Image
              src="/100_Kayne_m.gif"
              alt="Bully Link"
              width={350}
              height={250}
              className="w-full h-auto rounded-lg"
            />
          </Link>
          {/* <div className="flex-shrink-0 block md:hidden" 
            style={{ width: '50%', maxWidth: '350px' }}>
              <Image
                src="/100_Kayne_m.gif"
                alt="Bully Link"
                width={350}
                height={250}
                className="w-full h-auto rounded-lg"
              />
            </div> */}
          {/* Right GIF */}
          <Link
            href="https://smartstore.naver.com/donquiniku/products/11854994885"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
            style={{ width: "50%", maxWidth: "350px" }}
          >
            <Image
              src="/100_Kayne_m.gif"
              alt="Bully Link"
              width={350}
              height={250}
              className="w-full h-auto rounded-lg"
            />
          </Link>
          {/* <div className="flex-shrink-0 block md:hidden" 
            style={{ width: '50%', maxWidth: '350px' }}>
              <Image
                src="/100_Kayne_m.gif"
                alt="Bully Link"
                width={350}
                height={250}
                className="w-full h-auto rounded-lg"
              />
            </div> */}
        </div>
        <div className="pb-2 md:py-2 text-[20px] bg-black font-hannaPro relative flex justify-center items-center gap-4">
          <p className="text-center text-white">
            Ye 팬들을 위한 디지털 신전, <br className="block md:hidden" />
            서명하고, 소리치고, 남겨라.
          </p>
          <p className="flex flex-col gap-0 text-center md:flex-row md:justify-center md:gap-1">
            <span>{"<YE‘s서명>"}</span>
            <span className="">{postCount.toLocaleString()}</span>
          </p>
        </div>
        {/* YouTube Video */}
        <div
          className={`w-full transition-all duration-300 ease-in-out bg-bg-transparent ${
            isMobile ? "" : "bottom-5 left-0"
          }`}
          style={{
            height: isMobile
              ? isScrolled
                ? "0px"
                : "225px"
              : isScrolled
              ? "0px"
              : "365px", // 스크롤시 더 작게
            // minHeight: '120px',
            maxHeight: isMobile
              ? isScrolled
                ? "0px"
                : "225px"
              : isScrolled
              ? "0px"
              : "365px",
            // transitionProperty: 'height, padding-top, padding-bottom', // 전환 속성 명시
          }}
        >
          <div className="w-full h-full max-w-4xl px-4 mx-auto">
            {/* <YouTubeEmbed /> */}
            <HLSPlayer
              src={videoUrl}
              isMobile={isMobile}
              isScrolled={isScrolled}
              videoMuted={videoMuted}
            />
          </div>
        </div>
      </div>

      {/* 본문 콘텐츠 - 고정 요소 아래에 배치 */}
      <div
        className={`w-full max-w-6xl px-4 mt-4 transition-all duration-300 ${
          isScrolled ? "pt-[300px]" : "pt-[450px] md:pt-[600px]"
        }`}
      >
        {isMobile ? (
          <MobileSignatureWall
            ref={signatureWallRef}
            setOpenMission={setOpenMission}
            setPostCount={setPostCount}
          />
        ) : (
          <SignatureWall
            ref={signatureWallRef}
            setOpenMission={setOpenMission}
            setPostCount={setPostCount}
          />
        )}
      </div>

      {/* Signature Drawer */}
      <SignatureDrawer
        onSignatureSubmit={handleSignatureSubmit}
        isMobile={isMobile}
        videoMuted={videoMuted}
        setVideoMuted={setVideoMuted}
      />
      {openMission && <MissionModal setOpenMission={setOpenMission} />}
    </div>
  );
}
