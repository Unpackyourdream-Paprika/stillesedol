import {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  SetStateAction,
  Dispatch,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import SignatureModal from "./SignatureModal";
import Preview from "./InstagramStoryShare";
import React from "react";

interface Signature {
  id: string;
  message: string;
  signature_url: string;
  created_at: string;
  author_name: string;
  profile_image: string;
  likes?: number;
  reply?: string;
}

export interface MobileSignatureWallRef {
  fetchSignatures: () => void;
}

interface MobileSignatureWallProps {
  setOpenMission?: Dispatch<SetStateAction<boolean>>;
  setPostCount: Dispatch<SetStateAction<number>>;
}

const MobileSignatureWall = forwardRef<
  MobileSignatureWallRef,
  MobileSignatureWallProps
>(({ setOpenMission, setPostCount }, ref) => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedSignature, setSelectedSignature] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postLevel, setPostLevel] = useState("");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 20; // 페이지당 아이템 수
  const userId = getUserId();
  const containerRef = useRef<HTMLDivElement>(null);

  const levelValue = (count: number) => {
    switch (true) {
      case count > 100000:
        return "Bulltmode";
      case count > 90000:
        return "Re-Up-Era";
      case count > 75000:
        return "OG Time";
      case count > 60000:
        return "GOD TIER";
      case count > 45000:
        return "Talk Reckless";
      case count > 30000:
        return "Flex Season";
      case count > 20000:
        return "Rep Zone";
      case count > 10000:
        return "Clicked Up";
      case count > 5000:
        return "Noise Made";
      default:
        return "E-X";
    }
  };

  const fetchSignatures = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/signatures?page=${page}&limit=${itemsPerPage}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const {
          signatures: newSignatures,
          totalCount,
          hasMore,
          error: apiError,
        } = await response.json();

        if (apiError) {
          throw new Error(apiError);
        }

        // 전체 페이지 수 계산
        const totalPagesCount = Math.ceil(totalCount / itemsPerPage);
        setTotalPages(totalPagesCount);

        // 새로운 서명 데이터로 교체 (페이지네이션이므로 누적하지 않음)
        setSignatures(newSignatures);
        setPostCount(totalCount);
        setPostLevel(levelValue(totalCount));

        // 좋아요 상태 확인
        const likePromises = newSignatures.map(async (sig: Signature) => {
          try {
            const { data: likeData } = await supabase
              .from("signature_likes")
              .select("*")
              .eq("signature_id", sig.id)
              .eq("user_id", userId)
              .maybeSingle();

            return { id: sig.id, liked: !!likeData };
          } catch {
            return { id: sig.id, liked: false };
          }
        });

        const likeResults = await Promise.all(likePromises);
        const newLikedPosts: Record<string, boolean> = {};
        likeResults.forEach((result) => {
          newLikedPosts[result.id] = result.liked;
        });

        setLikedPosts(newLikedPosts);
      } catch (error) {
        console.error("Error fetching signatures:", error);
        setError("서명을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    },
    [userId, itemsPerPage]
  );

  // 초기 로드
  useEffect(() => {
    fetchSignatures(currentPage);
  }, [currentPage, fetchSignatures]);

  // 페이지 변경 함수
  const handlePageChange = (newPage: number) => {
    setSignatures([]);
    setLikedPosts({});
    if (newPage >= 0 && newPage < totalPages && !isLoading) {
      setCurrentPage(newPage);

      // 페이지 변경 시 즉시 스크롤 최상단으로
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // 좋아요 핸들러
  const handleLike = useCallback(
    async (e: React.MouseEvent, sigId: string) => {
      e.stopPropagation();

      try {
        const isCurrentlyLiked = likedPosts[sigId] || false;
        const newLikedState = !isCurrentlyLiked;

        // Optimistic update
        setLikedPosts((prev) => ({ ...prev, [sigId]: newLikedState }));
        setSignatures((prev) =>
          prev.map((sig) =>
            sig.id === sigId
              ? { ...sig, likes: (sig.likes || 0) + (newLikedState ? 1 : -1) }
              : sig
          )
        );

        if (newLikedState) {
          await supabase.from("signature_likes").insert({
            signature_id: sigId,
            user_id: userId,
            created_at: new Date().toISOString(),
          });
          await supabase.rpc("increment_likes", { signature_id: sigId });
        } else {
          await supabase
            .from("signature_likes")
            .delete()
            .eq("signature_id", sigId)
            .eq("user_id", userId);
          await supabase.rpc("decrement_likes", { signature_id: sigId });
        }
      } catch (err) {
        // 에러 시 롤백
        console.error("Error in handleLike:", err);
        setLikedPosts((prev) => ({ ...prev, [sigId]: !prev[sigId] }));
        setSignatures((prev) =>
          prev.map((sig) =>
            sig.id === sigId
              ? {
                  ...sig,
                  likes: (sig.likes || 0) + (likedPosts[sigId] ? -1 : 1),
                }
              : sig
          )
        );
      }
    },
    [likedPosts, userId]
  );

  const handleSignatureClick = useCallback((sigId: string) => {
    setSelectedSignature(sigId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSignature(null);
  }, []);

  const handleModalLikeChange = useCallback(
    (sigId: string, newLikeCount: number, isLiked: boolean) => {
      setLikedPosts((prev) => ({ ...prev, [sigId]: isLiked }));
      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === sigId ? { ...sig, likes: newLikeCount } : sig
        )
      );
    },
    []
  );

  // iOS pull-to-refresh 방지
  useEffect(() => {
    let startY = 0;

    const preventPullToRefresh = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop === 0 && touchY > startY) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", preventPullToRefresh, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", preventPullToRefresh);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    fetchSignatures: () => fetchSignatures(currentPage),
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-12 h-12 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  // 페이지 번호 생성 (모바일용 간소화)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // 모바일에서 보여질 최대 페이지 수

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // startPage 조정
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <div ref={containerRef} className="relative min-h-screen">
        {/* 서명 그리드 */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-2 transition-opacity duration-200 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {signatures.map((sig, index) => (
            <SignatureItem
              key={sig.id}
              signature={sig}
              isLiked={likedPosts[sig.id] || false}
              onLike={handleLike}
              onClick={handleSignatureClick}
              index={currentPage * itemsPerPage + index}
            />
          ))}
        </div>

        {/* 페이지네이션 컨트롤 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-6">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className={`p-2 rounded-lg ${
                currentPage === 0 || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-100"
              } transition-colors`}
              aria-label="이전 페이지"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* 페이지 번호들 */}
            <div className="flex gap-1">
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    currentPage === pageNum
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {pageNum + 1}
                </button>
              ))}
            </div>

            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isLoading}
              className={`p-2 rounded-lg ${
                currentPage >= totalPages - 1 || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-100"
              } transition-colors`}
              aria-label="다음 페이지"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 현재 페이지 정보 */}
        <div className="py-2 text-sm text-center text-gray-500">
          {currentPage + 1} / {totalPages} 페이지
        </div>

        {/* 로딩 오버레이 - 전체 화면 덮도록 수정 */}
        {isLoading && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
            <div className="p-6 rounded-lg shadow-xl ">
              <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
              <p className="mt-3 text-white">loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* 모달 */}
      {selectedSignature && (
        <SignatureModal
          signatureId={selectedSignature}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onLikeChange={handleModalLikeChange}
        />
      )}

      {/* 우측 상단 미션 버튼 */}
      <div
        onClick={() => setOpenMission?.(true)}
        className="fixed z-10 cursor-pointer top-3 md:top-5 right-2 md:right-10"
      >
        <div className="text-white flex justify-end flex-col items-right gap-0 md:gap-1 text-[12px] md:text-[20px]">
          <div className="text-right font-robotoMono tracking-[1.5px]">
            <p>Ni.Fan 🟡</p>
            <p>{postLevel} 🌑</p>
          </div>
        </div>
      </div>
    </>
  );
});

// SignatureItem 컴포넌트
const SignatureItem = React.memo(
  ({
    signature,
    isLiked,
    onLike,
    onClick,
    index,
  }: {
    signature: Signature;
    isLiked: boolean;
    onLike: (e: React.MouseEvent, id: string) => void;
    onClick: (id: string) => void;
    index: number;
  }) => {
    const previewRef = useRef<any>(null);

    const handleDownload = async () => {
      if (previewRef.current) {
        const fileName = `${signature.author_name}-${signature.id}.png`.replace(
          /\s+/g,
          "_"
        );
        await previewRef.current.download(fileName);
      }
    };

    return (
      <div
        className="relative flex flex-col p-1 transition rounded-lg cursor-pointer bg-black/40 backdrop-blur-sm sm:p-4 hover:bg-black/60"
        onClick={() => onClick(signature.id)}
      >
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 w-8 h-8 mr-2 overflow-hidden bg-white rounded-full md:w-12 md:h-12 md:mr-3 aspect-square">
            <img src={signature.profile_image} alt="" />
          </div>
          <div>
            <p className="text-sm font-medium text-white md:text-base">
              {signature.author_name || "Anonymous"}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(signature.created_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </p>
          </div>
        </div>

        {signature.signature_url && (
          <div className="relative w-full mb-2 overflow-hidden bg-transparent aspect-square">
            <img
              src={signature.signature_url}
              alt="Fan signature"
              loading="lazy"
              decoding="async"
              className="object-contain w-full h-full rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <p className="text-sm font-medium text-white break-all md:text-base message">
          {signature.message}
        </p>

        <div className="flex items-center justify-between mt-2">
          <button
            className={`flex items-center ${
              isLiked ? "text-red-500" : "text-gray-400"
            } hover:text-red-500`}
            onClick={(e) => onLike(e, signature.id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-1"
              fill={isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{signature.likes || 0}</span>
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <Preview
              ref={previewRef}
              signatureId={signature.id}
              signatureUrl={signature.signature_url}
              message={signature.message}
              authorName={signature.author_name || "Anonymous"}
              hashtags={["#진실을말해이세돌", "#침묵은공범이다"]}
            />
            <button
              onClick={handleDownload}
              className="flex items-center justify-center p-1 font-bold text-black transition-colors duration-200 bg-white rounded-full hover:bg-gray-100"
              title="이미지 다운로드"
            >
              <svg
                className="w-4 h-4 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 16l-6-6h4V4h4v6h4l-6 6zM6 18v2h12v-2H6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

SignatureItem.displayName = "SignatureItem";
MobileSignatureWall.displayName = "MobileSignatureWall";

export default MobileSignatureWall;
