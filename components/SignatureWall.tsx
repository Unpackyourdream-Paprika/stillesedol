import {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  SetStateAction,
  Dispatch,
} from "react";
// import Image from 'next/image';
import { supabase } from "@/lib/supabase";
// import { likeSignature, checkLikeStatus } from '@/lib/signature';
import { getUserId } from "@/lib/user";
import SignatureModal from "./SignatureModal";
import Preview from "./InstagramStoryShare";

import { TestModal } from "./test";

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

export interface SignatureWallRef {
  fetchSignatures: () => void;
}
interface SignatureWallProps {
  setOpenMission?: Dispatch<SetStateAction<boolean>>;
  setPostCount: Dispatch<SetStateAction<number>>;
}

interface downDataType {
  id: string;
  url: string;
  message: string;
  name: string;
}

const SignatureWall = forwardRef<SignatureWallRef, SignatureWallProps>(
  ({ setOpenMission, setPostCount }, ref) => {
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [selectedSignature, setSelectedSignature] = useState<string | null>(
      null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postLevel, setPostLevel] = useState("");
    const [viewNum, setViewNum] = useState<number | null>(null);

    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const fetchedPages = useRef<Set<number>>(new Set()); // 조회된 페이지 추적

    const itemsPerPage = 40;

    const previewRefs = useRef<
      Array<{ download: (fileName: string) => Promise<void> } | null>
    >(Array(signatures.length).fill(null));

    const getFileName = (authorName: string, signatureUrl: string) => {
      const urlParts = signatureUrl.split("/");
      const urlFileName = urlParts[urlParts.length - 1].split(".")[0];
      return `${authorName}-${urlFileName || "preview"}.png`.replace(
        /\s+/g,
        "_"
      );
    };

    const handleDownload = async (index: number) => {
      console.log("index:", index);
      const ref = previewRefs.current[index];
      if (ref) {
        const { author_name, signature_url } = signatures[index];
        await ref.download(getFileName(author_name, signature_url));
      }
    };

    const userId = getUserId();

    // const levelValue = (count: number) => {
    //   switch(true) {
    //     case count > 5000:
    //       return 2
    //     case count > 10000:
    //       return 3
    //     case count > 20000:
    //       return 4
    //     case count > 30000:
    //       return 5
    //     case count > 45000:
    //       return 6
    //     case count > 60000:
    //       return 7
    //     case count > 75000:
    //       return 8
    //     case count > 90000:
    //       return 9
    //     case count > 100000:
    //       return 10
    //     default:
    //       return 1
    //   }
    // }
    const levelValue = (count: number) => {
      switch (true) {
        case count > 5000:
          return "Noise Made";
        case count > 10000:
          return "Clicked Up";
        case count > 20000:
          return "Rep Zone";
        case count > 30000:
          return "Flex Season";
        case count > 45000:
          return "Talk Reckless";
        case count > 60000:
          return "GOD TIER";
        case count > 75000:
          return "OG Time";
        case count > 90000:
          return "Re-Up-Era";
        case count > 100000:
          return "Bulltmode";
        default:
          return "E⎯X";
      }
    };

    async function fetchSignatures(page: number) {
      if (fetchedPages.current.has(page) || isLoading) {
        console.log(`Page ${page} already fetched, skipping...`);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/signatures?page=${page}`);
        const {
          signatures: newSignatures,
          totalCount,
          hasMore,
          error,
        } = await response.json();
        if (!response.ok || error) {
          console.error("API fetch error:", error);
          setError("서명을 불러오는 중 오류가 발생했습니다.");
          return;
        }

        fetchedPages.current.add(page);
        console.log(
          `Fetched page ${page}, total cached pages:`,
          fetchedPages.current
        );

        setSignatures((prev) => [...prev, ...newSignatures]);
        setHasMore(hasMore);
        setPostCount(totalCount);
        setPostLevel(levelValue(totalCount));
        setError(null);

        // 각 게시글의 좋아요 상태 확인
        // console.log("Checking like status for all posts...");
        const likePromises = (newSignatures || []).map(
          async (sig: Signature) => {
            try {
              const { data: likeData, error: likeError } = await supabase
                .from("signature_likes")
                .select("*")
                .eq("signature_id", sig.id)
                .eq("user_id", userId)
                .maybeSingle();

              if (likeError) {
                console.error(
                  `Error checking like status for post ${sig.id}:`,
                  likeError
                );
                return { id: sig.id, liked: false };
              }

              return { id: sig.id, liked: !!likeData };
            } catch (err) {
              console.error(`Error in like check for post ${sig.id}:`, err);
              return { id: sig.id, liked: false };
            }
          }
        );

        const likeResults = await Promise.all(likePromises);
        console.log("Like status results:", likeResults);

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
    }

    // Intersection Observer 설정
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1 }
      );

      if (loaderRef.current) {
        observer.observe(loaderRef.current);
      }

      return () => {
        if (loaderRef.current) {
          observer.unobserve(loaderRef.current);
        }
      };
    }, [hasMore, isLoading]);

    useEffect(() => {
      fetchSignatures(page);
    }, [page]);

    // useImperativeHandle(ref, () => ({
    //   fetchSignatures
    // }));

    // 좋아요 버튼 클릭 핸들러
    const handleLike = async (e: React.MouseEvent, sigId: string) => {
      e.stopPropagation(); // 부모 요소 클릭 이벤트 전파 방지

      try {
        console.log("Like button clicked for post:", sigId);
        const isCurrentlyLiked = likedPosts[sigId] || false;
        const newLikedState = !isCurrentlyLiked;

        if (newLikedState) {
          // 좋아요 추가
          console.log("Adding like for signature:", sigId);
          const { error: addLikeError } = await supabase
            .from("signature_likes")
            .insert({
              signature_id: sigId,
              user_id: userId,
              created_at: new Date().toISOString(),
            });

          if (addLikeError) {
            console.error("Error adding like:", addLikeError);
            throw addLikeError;
          }

          // signatures 테이블의 likes 컬럼 업데이트
          const { data: updatedLikes, error: updateError } = await supabase.rpc(
            "increment_likes",
            {
              signature_id: sigId,
            }
          );

          if (updateError) {
            console.error("Error incrementing likes:", updateError);
            throw updateError;
          }

          console.log("Likes updated:", updatedLikes);
        } else {
          // 좋아요 제거
          console.log("Removing like for signature:", sigId);
          const { error: removeLikeError } = await supabase
            .from("signature_likes")
            .delete()
            .eq("signature_id", sigId)
            .eq("user_id", userId);

          if (removeLikeError) {
            console.error("Error removing like:", removeLikeError);
            throw removeLikeError;
          }

          // signatures 테이블의 likes 컬럼 업데이트
          const { data: updatedLikes, error: updateError } = await supabase.rpc(
            "decrement_likes",
            {
              signature_id: sigId,
            }
          );

          if (updateError) {
            console.error("Error decrementing likes:", updateError);
            throw updateError;
          }

          console.log("Likes updated:", updatedLikes);
        }

        // 좋아요 상태 업데이트
        setLikedPosts((prev) => ({
          ...prev,
          [sigId]: newLikedState,
        }));

        // 게시글 새로고침
        const { data: refreshedSignature, error: refreshError } = await supabase
          .from("signatures")
          .select("*")
          .eq("id", sigId)
          .single();

        if (refreshError) {
          console.error("Error refreshing signature data:", refreshError);
          throw refreshError;
        }

        if (refreshedSignature) {
          console.log("Updated signature data:", refreshedSignature);
          // 게시글 목록 업데이트
          setSignatures((prev) =>
            prev.map((sig) => (sig.id === sigId ? refreshedSignature : sig))
          );
        }
      } catch (err) {
        console.error("Error in handleLike:", err);
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    };

    // 모달에서 좋아요 상태가 변경됐을 때 처리하는 핸들러
    const handleModalLikeChange = (
      sigId: string,
      newLikeCount: number,
      isLiked: boolean
    ) => {
      console.log("Modal like change:", sigId, newLikeCount, isLiked);

      // 좋아요 상태 업데이트
      setLikedPosts((prev) => ({
        ...prev,
        [sigId]: isLiked,
      }));

      // 게시글 목록의 좋아요 수 업데이트
      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === sigId ? { ...sig, likes: newLikeCount } : sig
        )
      );
    };

    // 게시글 클릭 핸들러 - 모달 열기
    const handleSignatureClick = (sigId: string) => {
      setSelectedSignature(sigId);
      setIsModalOpen(true);
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedSignature(null);
      // 모달이 닫힐 때 게시글 목록 새로고침 - 필요 없어짐
      // fetchSignatures();
    };

    // iOS pull-to-refresh 방지
    useEffect(() => {
      const preventPullToRefresh = (e: TouchEvent) => {
        if (e.touches.length > 1) return; // 멀티터치 제외
        const touchY = e.touches[0].clientY;
        if (touchY <= 50 && window.scrollY === 0) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchstart", preventPullToRefresh, {
        passive: false,
      });
      return () => {
        document.removeEventListener("touchstart", preventPullToRefresh);
      };
    }, []);

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

    if (signatures.length === 0) {
      return <div className="py-4 text-center"></div>;
    }

    return (
      <>
        <div className="grid h-64 grid-cols-2 gap-3 p-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {signatures.map((sig, index) => (
            <div
              key={`sig.id-${index}`}
              className="relative flex flex-col p-1 transition rounded-lg cursor-pointer bg-black/40 backdrop-blur-sm sm:p-4 hover:bg-black/60"
              onClick={() => handleSignatureClick(sig.id)}
            >
              {/* Author Profile and Name */}
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 w-8 h-8 mr-2 overflow-hidden bg-white rounded-full md:w-12 md:h-12 md:mr-3 aspect-square">
                  <img src={sig.profile_image} alt="" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white md:text-base">
                    {sig.author_name || "Anonymous"}
                  </p>
                  {/* Timestamp */}
                  <p className="text-xs text-gray-400">
                    {new Date(sig.created_at).toLocaleString("ko-KR", {
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

              {/* Signature Image */}
              {sig.signature_url && (
                <div className="relative w-full mb-2 overflow-hidden bg-transparent aspect-square">
                  <img
                    src={sig.signature_url}
                    alt="Fan signature"
                    // fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    // priority
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                      width: "100%",
                      height: "100%",
                    }}
                    className="rounded"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Message */}
              <p className="text-sm font-medium text-white break-all md:text-base message">
                {sig.message}
              </p>

              {/* 좋아요 버튼과 댓글 수 */}
              <div className="flex items-center justify-between mt-2">
                <button
                  className={`flex items-center ${
                    likedPosts[sig.id] ? "text-red-500" : "text-gray-400"
                  } hover:text-red-500`}
                  onClick={(e) => handleLike(e, sig.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-1"
                    fill={likedPosts[sig.id] ? "currentColor" : "none"}
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
                  <span>{sig.likes || 0}</span>
                </button>

                {/* 인스타그램 스토리 공유 버튼 */}
                <div onClick={(e) => e.stopPropagation()}>
                  <Preview
                    ref={(
                      el: {
                        download: (fileName: string) => Promise<void>;
                      } | null
                    ) => {
                      previewRefs.current[index] = el; // 반환값 없음 (void)
                    }}
                    signatureId={sig.id}
                    signatureUrl={sig.signature_url}
                    message={sig.message}
                    authorName={sig.author_name || "Anonymous"}
                    hashtags={["#진실을말해이세돌", "#침묵은공범이다"]}
                  />
                  {/* {viewNum === index && (
                  <TestModal
                    signatureId={sig.id}
                    signatureUrl={sig.signature_url}
                    message={sig.message}
                    authorName={sig.author_name || 'Anonymous'}
                        hashtags={["#진실을말해이세돌", "#침묵은공범이다"]}
                  />
                )} */}

                  <button
                    onClick={() => handleDownload(index)}
                    //  onClick={() => setViewNum(index)}
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

                {/* 댓글 수 표시 (선택 사항) */}
                {sig.reply && parseInt(sig.reply) > 0 && (
                  <div className="flex items-center text-gray-400">
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
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span>{sig.reply}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* 로딩 스피너 및 로더 */}
          {isLoading && (
            <div className="py-4 text-center">
              <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            </div>
          )}
          {hasMore && !isLoading && (
            <div
              ref={loaderRef}
              style={{
                height: "50px",
                margin: "20px 0",
                background: "transparent",
              }}
              className="text-center"
            >
              <span>Loading more...</span> {/* 디버깅용 텍스트 */}
            </div>
          )}
          {!hasMore && !isLoading && <div className="py-4 text-center"></div>}
        </div>

        {/* 게시글 상세보기 모달 */}
        {selectedSignature && (
          <SignatureModal
            signatureId={selectedSignature}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onLikeChange={handleModalLikeChange}
          />
        )}
        <div
          onClick={() => {
            if (setOpenMission) {
              setOpenMission(true);
            }
          }}
          className="fixed z-10 cursor-pointer top-3 md:top-5 right-2 md:right-10"
        >
          <div
            className={`text-white flex justify-end flex-col items-right gap-0 md:gap-1 text-[12px] md:text-[20px]`}
          >
            <div className="text-right font-robotoMono tracking-[1.5px]">
              <p>Ni.Fan 🟡</p>
              <p>{postLevel}🌑</p>
            </div>
          </div>
        </div>
      </>
    );
  }
);

SignatureWall.displayName = "SignatureWall";

export default SignatureWall;
