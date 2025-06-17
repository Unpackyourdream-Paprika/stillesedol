"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";

export interface PreviewRef {
  download: (fileName: string) => Promise<void>;
}

interface PreviewProps {
  signatureId: string;
  signatureUrl: string;
  message: string;
  authorName: string;
  hashtags?: string[];
}

const Preview = forwardRef<PreviewRef, PreviewProps>(
  (
    {
      signatureId,
      signatureUrl,
      message,
      authorName,
      hashtags = ["#진실을말해이세돌", "#침묵은공범이다"],
    },
    ref
  ) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useImperativeHandle(ref, () => ({
      download: async (fileName: string) => {
        if (!previewRef.current || !imageRef.current) return;

        // 이미지 로드 완료 대기
        await new Promise((resolve) => {
          if (imageRef.current?.complete) {
            resolve(null);
          } else {
            imageRef.current!.onload = resolve;
            imageRef.current!.onerror = () => {
              console.error("Image failed to load:", signatureUrl);
              alert("Failed to load image for download.");
              resolve(null);
            };
          }
        });

        try {
          const canvas = await html2canvas(previewRef.current, {
            useCORS: true,
            backgroundColor: "#000",
          });

          canvas.toBlob((blob: Blob | null) => {
            if (!blob) return;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName || "preview.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, "image/png");
        } catch (error) {
          console.error("Error generating image:", error);
          alert("Failed to download image.");
        }
      },
    }));

    return (
      <div
        ref={previewRef}
        className="fixed -top-[9999px] -left-[9999px] w-[1080px] h-[1920px] bg-black flex flex-col justify-center items-center p-20 box-border font-arial"
      >
        {/* Bully 로고 */}
        <div className="absolute text-5xl font-bold text-white top-16 right-16">
          Bully
        </div>

        {/* 작성자 이름 */}
        <div className="mb-10 text-6xl font-bold text-center text-white">
          {authorName}
        </div>

        {/* 서명 이미지 */}
        <img
          ref={imageRef}
          // src={signatureUrl}
          src={`/api/proxy-image?url=${encodeURIComponent(signatureUrl)}`}
          alt="Signature"
          className="max-w-[800px] max-h-[800px] object-contain mb-10"
          crossOrigin="anonymous"
        />

        {/* 메시지 */}
        <div className="text-white text-[42px] text-center mb-16 leading-[1.4] break-all max-w-[900px]">
          {message}
        </div>

        {/* 해시태그 박스 */}
        <div className="flex justify-center text-[rgba(255,215,0,0.9)] items-center gap-1 h-[112px] px-16 rounded-2xl">
          {hashtags.map((has, index) => {
            return (
              <div
                key={`has-${index}`}
                className="text-5xl font-bold text-center"
              >
                {has}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center items-center text-[42px] mt-4">
          https://www.stillesedol.live
        </div>
      </div>
    );
  }
);
Preview.displayName = "Preview";

export default Preview;
