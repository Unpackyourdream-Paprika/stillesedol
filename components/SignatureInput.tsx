import { useState, useRef, useEffect } from "react";
import { submitSignature } from "@/lib/signature";
import { uploadSignatureImage } from "@/lib/uploadToS3";
import Image from "next/image";
import {
  getUserId,
  getUsername,
  setUsername,
  hasValidUsername,
} from "@/lib/user";

interface SignatureInputProps {
  onSignatureSubmit: () => void;
}

const SignatureInput = ({ onSignatureSubmit }: SignatureInputProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(3);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [isUsernameFetching, setIsUsernameFetching] = useState(false);

  // 처음 로드될 때 쿠키에서 닉네임 가져오기
  useEffect(() => {
    const savedUsername = getUsername();
    if (savedUsername) {
      setUsernameState(savedUsername);
    } else {
      // 쿠키에 닉네임이 없으면 새로 생성
      generateUsername();
    }
  }, []);

  // 랜덤 닉네임 생성 함수
  const generateUsername = async () => {
    setIsUsernameFetching(true);
    try {
      // API 호출 대신 랜덤 닉네임 생성
      const newUsername = await getRandomName();
      setUsernameState(newUsername);
      // 쿠키에 저장
      setUsername(newUsername);
    } catch (error) {
      console.error("Error generating username:", error);
    } finally {
      setIsUsernameFetching(false);
    }
  };

  const getRandomName = async (): Promise<string> => {
    try {
      const response = await fetch("/api/name-generator?ts=" + Date.now(), {
        cache: "no-store", // 클라이언트 캐싱 비활성화
        headers: {
          "Cache-Control": "no-cache",
          "X-Request-ID": Date.now().toString() + Math.random(),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch name");
      }
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error("Error getting random name:", error);
      return "Ye Fan"; // Fallback name
    }
  };

  // 6가지 색상 옵션 (첫번째 빨간색 유지하고 나머지 변경)
  const colorOptions = [
    { color: "#ff0000", name: "Red" },
    { color: "#FF69B4", name: "Hot Pink" },
    { color: "#8A2BE2", name: "Purple" },
    { color: "#FFA500", name: "Orange" },
    { color: "#20B2AA", name: "Teal" },
    { color: "#9370DB", name: "Medium Purple" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match its display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
  }, []);

  // Update stroke style when color changes
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
  }, [currentColor, brushSize]);

  // Resize canvas when window is resized
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentWidth = canvas.width;
      const currentHeight = canvas.height;

      // Create a temporary canvas to store the current drawing
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = currentWidth;
      tempCanvas.height = currentHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize the canvas
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Restore the drawing
      const ctx = canvas.getContext("2d");
      if (ctx && tempCtx) {
        ctx.drawImage(
          tempCanvas,
          0,
          0,
          currentWidth,
          currentHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentColor, brushSize]);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Mouse event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.closePath();
      }
      setIsDrawing(false);
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling when drawing
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    if (!point) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling when drawing
    if (!isDrawing || e.touches.length === 0) return;

    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    if (!point) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      console.error("Selected file is not an image");
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      console.log(
        "File loaded successfully",
        event.target?.result ? "with data" : "without data"
      );
      if (event.target?.result) {
        // 직접 setUploadedImage 호출
        setUploadedImage(event.target.result as string);
      } else {
        console.error("No data in loaded file");
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading the selected file");
    };

    reader.readAsDataURL(file);

    // Reset the input to allow selecting the same file again
    e.target.value = "";
  };

  const canvasToBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert canvas to blob"));
            return;
          }
          resolve(blob);
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    });
  };

  // 이미지와 캔버스를 합성하는 함수
  const combineImageAndCanvas = async (): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // 정사각형 캔버스 생성 (1:1 비율)
    const combinedCanvas = document.createElement("canvas");

    // 정사각형 캔버스 크기 설정
    const squareSize = Math.max(canvas.width, canvas.height);
    combinedCanvas.width = squareSize;
    combinedCanvas.height = squareSize;

    const ctx = combinedCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // 배경을 투명하게 설정
    ctx.clearRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    // 업로드된 이미지가 있으면 그리기
    if (uploadedImage) {
      return new Promise((resolve) => {
        const img = document.createElement("img") as HTMLImageElement;
        img.onload = async () => {
          // 이미지 비율 계산
          const imgRatio = img.width / img.height;

          // 이미지를 정사각형 안에 맞추기 (비율 유지)
          let drawWidth, drawHeight, offsetX, offsetY;

          // 이미지 크기를 정사각형 안에 맞추기 (90% 영역 사용)
          if (imgRatio < 1) {
            // 세로가 긴 이미지
            drawHeight = combinedCanvas.height * 0.9;
            drawWidth = drawHeight * imgRatio;
          } else {
            // 가로가 긴 이미지
            drawWidth = combinedCanvas.width * 0.9;
            drawHeight = drawWidth / imgRatio;
          }

          // 이미지를 중앙에 배치
          offsetX = (combinedCanvas.width - drawWidth) / 2;
          offsetY = (combinedCanvas.height - drawHeight) / 2;

          // 이미지 그리기 (비율 유지)
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // 캔버스 그리기 - 항상 중앙에 배치
          const scaleFactor = 1.0; // 그림 크기를 그대로 유지
          const scaledWidth = canvas.width * scaleFactor;
          const scaledHeight = canvas.height * scaleFactor;

          // 그림을 항상 중앙에 배치
          const canvasOffsetX = (combinedCanvas.width - scaledWidth) / 2;
          const canvasOffsetY = (combinedCanvas.height - scaledHeight) / 2;

          // 캔버스 내용 그리기
          ctx.drawImage(
            canvas,
            canvasOffsetX,
            canvasOffsetY,
            scaledWidth,
            scaledHeight
          );

          // blob으로 변환하여 반환 (PNG로 저장하여 투명 배경 유지)
          combinedCanvas.toBlob((blob) => {
            if (!blob) {
              throw new Error("Failed to convert combined canvas to blob");
            }
            resolve(blob);
          }, "image/png");
        };

        img.onerror = () => {
          // 이미지 로드 실패 시 그냥 캔버스만 반환
          const canvasCenterX = (combinedCanvas.width - canvas.width) / 2;
          const canvasCenterY = (combinedCanvas.height - canvas.height) / 2;
          ctx.drawImage(canvas, canvasCenterX, canvasCenterY);
          combinedCanvas.toBlob((blob) => {
            if (!blob) {
              throw new Error("Failed to convert canvas to blob");
            }
            resolve(blob);
          }, "image/png");
        };

        img.src = uploadedImage;
      });
    } else {
      // 이미지가 없으면 캔버스 내용을 정사각형 캔버스 중앙에 그리기
      const scaleFactor = 1.0; // 그림 크기 유지
      const scaledWidth = canvas.width * scaleFactor;
      const scaledHeight = canvas.height * scaleFactor;

      // 그림을 중앙에 배치
      const canvasOffsetX = (combinedCanvas.width - scaledWidth) / 2;
      const canvasOffsetY = (combinedCanvas.height - scaledHeight) / 2;

      // 캔버스 그리기
      ctx.drawImage(
        canvas,
        canvasOffsetX,
        canvasOffsetY,
        scaledWidth,
        scaledHeight
      );

      return canvasToBlob(combinedCanvas);
    }
  };

  // Function to get a random profile image from our set
  const getRandomProfileImage = (): string => {
    const profileCount = 6; // k1부터 k10까지 10개의 프로필 이미지
    const randomIndex = Math.floor(Math.random() * profileCount) + 1;
    return `/profiles/gg_${randomIndex}.png`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() === "") {
      alert("메시지를 입력해주세요.");
      return;
    }

    // 닉네임이 없으면 제출 불가
    if (!username) {
      alert("닉네임을 생성 중입니다. 잠시 후 다시 시도해주세요.");
      generateUsername();
      return;
    }

    setIsSubmitting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas is not available");
      }

      let signatureImageBlob: Blob;

      if (uploadedImage) {
        signatureImageBlob = await combineImageAndCanvas();
      } else {
        signatureImageBlob = await canvasToBlob(canvas);
      }

      // Upload signature image to S3
      const imageUrl = await uploadSignatureImage(signatureImageBlob);

      if (!imageUrl) {
        throw new Error("Failed to upload signature image");
      }

      // 저장된 닉네임과 랜덤 프로필 이미지 사용
      const profileImage = getRandomProfileImage();

      // console.log("username:", username);
      // Submit signature to Supabase
      const result = await submitSignature({
        message: message,
        signature_url: imageUrl,
        author_name: username,
        profile_image: profileImage,
      });

      if (result.error) {
        throw result.error;
      }

      // Clear form
      setMessage("");
      clearCanvas();
      setUploadedImage(null);

      // Call parent callback
      onSignatureSubmit();

      alert("서명이 성공적으로 등록되었습니다!");
    } catch (error) {
      console.error("Error submitting signature:", error);
      alert("서명 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative w-full max-h-[250px] md:max-h-[400px] aspect-square mb-4 bg-transparent border border-kanye-accent rounded-lg overflow-hidden">
        {uploadedImage && (
          <>
            <div className="absolute inset-0 z-0 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImage}
                alt="Background"
                className="object-contain w-full h-full"
                onError={(e) => {
                  console.error("Error loading image");
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setUploadedImage(null)}
              className="absolute z-20 flex items-center justify-center w-8 h-8 p-1 text-white bg-red-600 rounded-full top-2 right-2 hover:bg-red-700"
              aria-label="Remove image"
            >
              ✕
            </button>
          </>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="absolute top-0 left-0 z-10 w-full h-full cursor-crosshair"
          style={{ touchAction: "none" }}
        />
      </div>
      {/* 색상 선택 도구 */}
      <div className="flex flex-wrap items-center justify-between w-full mb-4 md:flex-nowrap ">
        <div className="flex items-center justify-start gap-1 mr-4">
          <label
            htmlFor="brushSize"
            className="flex items-center justify-start gap-1 text-sm text-white"
          >
            <input
              id="brushSize"
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
              style={{ accentColor: "#FFA500" }}
            />
            <span>{brushSize}px</span>
          </label>
        </div>
        <div className="flex space-x-2">
          {colorOptions.map((option) => (
            <button
              key={option.color}
              type="button"
              onClick={() => setCurrentColor(option.color)}
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 ${
                currentColor === option.color
                  ? "border-white"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: option.color }}
              aria-label={`Select ${option.name} color`}
            />
          ))}
        </div>
        <label className="flex items-center justify-center w-full px-4 py-2 mt-3 text-white transition-colors rounded cursor-pointer md:mt-0 md:w-auto bg-kanye-accent hover:bg-opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          ADD IMAGE
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        // placeholder="Share your message..."
        placeholder="SHARE YOUR MESSAGE..."
        className="w-full p-4 mb-4 text-white bg-transparent border rounded-lg resize-none border-kanye-accent focus:ring-2 focus:ring-kanye-accent focus:outline-none"
        rows={2} // 높이 줄임
      />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-6 py-3 text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          {/* Clear Signature */}
          CLEAR SIGNATURE
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !message}
          className="flex-1 px-6 py-3 font-bold text-white transition-opacity rounded-lg bg-kanye-accent hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing..." : "￥$"}
        </button>
      </div>
    </form>
  );
};

export default SignatureInput;
