import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getSignatureById } from "@/lib/signature";
import { getUserId, getUsername, hasValidUsername } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import Preview from "./InstagramStoryShare";

interface Comment {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

interface Signature {
  id: string;
  message: string;
  signature_url: string;
  author_name: string;
  profile_image: string;
  created_at: string;
  likes?: number;
}

interface SignatureModalProps {
  signatureId: string;
  isOpen: boolean;
  onClose: () => void;
  onLikeChange?: (
    signatureId: string,
    newLikeCount: number,
    isLiked: boolean
  ) => void;
}

const SignatureModal = ({
  signatureId,
  isOpen,
  onClose,
  onLikeChange,
}: SignatureModalProps) => {
  const [signature, setSignature] = useState<Signature | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  // useRef를 단일 객체로 변경
  const previewRef = useRef<{
    download: (fileName: string) => Promise<void>;
  } | null>(null);

  const getFileName = (authorName: string, signatureUrl: string) => {
    const urlParts = signatureUrl.split("/");
    const urlFileName = urlParts[urlParts.length - 1].split(".")[0];
    return `${authorName}-${urlFileName || "preview"}.png`.replace(/\s+/g, "_");
  };

  // 다운로드 핸들러 수정 (단일 ref 사용)
  const handleDownload = async () => {
    if (previewRef.current) {
      const { author_name, signature_url } = signature || {};
      if (author_name && signature_url) {
        await previewRef.current.download(
          getFileName(author_name, signature_url)
        );
      }
    }
  };

  const userId = getUserId();

  // 초기 로딩 시 쿠키에서 닉네임 가져오기
  useEffect(() => {
    const savedUsername = getUsername();
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // 게시글 데이터 로드
  useEffect(() => {
    if (!isOpen || !signatureId) return;

    async function loadSignatureData() {
      setLoading(true);
      try {
        console.log("Loading signature data for ID:", signatureId);

        // 게시글 정보 가져오기
        const { data: signatureData, error: signatureError } =
          await getSignatureById(signatureId);
        if (signatureError) throw signatureError;
        console.log("Signature data loaded:", signatureData);
        setSignature(signatureData);

        // 댓글 가져오기
        console.log("Fetching comments for signature ID:", signatureId);
        const { data: commentsData, error: commentsError } = await supabase
          .from("signature_comments")
          .select("*")
          .eq("signature_id", signatureId)
          .order("created_at", { ascending: true });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          throw commentsError;
        }

        console.log("Comments data loaded:", commentsData);
        setComments(commentsData || []);

        // 좋아요 상태 확인
        console.log("Checking like status for user:", userId);
        const { data: likeData, error: likeError } = await supabase
          .from("signature_likes")
          .select("*")
          .eq("signature_id", signatureId)
          .eq("user_id", userId)
          .maybeSingle();

        if (likeError) {
          console.error("Error checking like status:", likeError);
          throw likeError;
        }

        console.log("Like status:", !!likeData);
        setLiked(!!likeData);
      } catch (err) {
        console.error("Error loading signature data:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadSignatureData();
  }, [isOpen, signatureId, userId]);

  // 모달 외부 클릭 시 닫기
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 좋아요 버튼 클릭
  const handleLike = async () => {
    try {
      // 현재 상태의 반대로 설정
      const newLikedState = !liked;

      if (newLikedState) {
        // 좋아요 추가
        console.log("Adding like for signature:", signatureId);
        const { error: addLikeError } = await supabase
          .from("signature_likes")
          .insert({
            signature_id: signatureId,
            user_id: userId,
            created_at: new Date().toISOString(),
          });

        if (addLikeError) {
          console.error("Error adding like:", addLikeError);
          throw addLikeError;
        }

        // signatures 테이블의 likes 컬럼 업데이트
        const { data: updatedSignature, error: updateError } =
          await supabase.rpc("increment_likes", {
            signature_id: signatureId,
          });

        if (updateError) {
          console.error("Error incrementing likes:", updateError);
          throw updateError;
        }
      } else {
        // 좋아요 제거
        console.log("Removing like for signature:", signatureId);
        const { error: removeLikeError } = await supabase
          .from("signature_likes")
          .delete()
          .eq("signature_id", signatureId)
          .eq("user_id", userId);

        if (removeLikeError) {
          console.error("Error removing like:", removeLikeError);
          throw removeLikeError;
        }

        // signatures 테이블의 likes 컬럼 업데이트
        const { data: updatedSignature, error: updateError } =
          await supabase.rpc("decrement_likes", {
            signature_id: signatureId,
          });

        if (updateError) {
          console.error("Error decrementing likes:", updateError);
          throw updateError;
        }
      }

      // 로컬 상태 업데이트
      setLiked(newLikedState);

      // 직접 signature 데이터 가져와서 업데이트
      const { data: refreshedSignature, error: refreshError } = await supabase
        .from("signatures")
        .select("*")
        .eq("id", signatureId)
        .single();

      if (refreshError) {
        console.error("Error refreshing signature data:", refreshError);
        throw refreshError;
      }

      if (refreshedSignature) {
        console.log("Updated signature data:", refreshedSignature);
        setSignature(refreshedSignature);

        // 부모 컴포넌트에 알림
        if (onLikeChange) {
          onLikeChange(
            signatureId,
            refreshedSignature.likes || 0,
            newLikedState
          );
        }
      }
    } catch (err) {
      console.error("Error handling like action:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
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
  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 닉네임 필드가 비어있고 쿠키에 닉네임이 있으면 자동으로 설정
    if (!username.trim() && hasValidUsername()) {
      const savedUsername = getUsername();
      if (savedUsername) {
        setUsername(savedUsername);
        alert(`savedUsername:${savedUsername}`)
      } else {
        setUsername(await getRandomName());
        alert(`getRandomName:${await getRandomName()}`)
      }
    }

    // if (!newComment.trim() || !username.trim()) {
    //   console.log('newComment:', newComment)
    //   console.log('username:', username)
    //   alert("댓글 내용을 입력해주세요.");
    //   return;
    // }
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (!username.trim()) {
      alert("닉네임이 없습니다.");
      return;
    }

    setCommentLoading(true);

    try {
      console.log("Adding comment for signature:", signatureId);
      const { data, error } = await supabase
        .from("signature_comments")
        .insert({
          signature_id: signatureId,
          user_id: userId,
          username: username,
          message: newComment,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error adding comment:", error);
        throw error;
      }

      console.log("Comment added successfully:", data);

      if (data && data.length > 0) {
        setComments([...comments, data[0]]);
        setNewComment("");

        // 원본 게시글의 reply 필드 업데이트 (옵션)
        const { error: updateError } = await supabase
          .from("signatures")
          .update({ reply: (comments.length + 1).toString() })
          .eq("id", signatureId);

        if (updateError) {
          console.error("Error updating reply count:", updateError);
        }
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-70"
      onClick={handleClickOutside}
    >
      <div className="bg-black rounded-lg max-w-2xl w-full h-screen md:max-h-[90vh] pt-4 md:pt-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="w-12 h-12 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : signature ? (
          <div className="p-6">
            {/* 헤더 - 닫기 버튼 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">게시글</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 작성자 정보 */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 mr-3 overflow-hidden bg-white rounded-full">
                <Image
                  src={signature.profile_image || "/profiles/gg_1.png"}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <p className="font-medium text-white">
                  {signature.author_name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-400">
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

            {/* 서명 이미지 */}
            {signature.signature_url && (
              <div className="relative w-full mb-4 overflow-hidden bg-transparent aspect-square">
                <img
                  src={signature.signature_url}
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
                />
              </div>
            )}

            {/* 메시지 */}
            <div className="mb-4">
              <p className="text-lg text-white break-all">
                {signature.message}
              </p>
            </div>

            {/* 좋아요 버튼 */}
            <div className="flex items-center mb-6">
              <button
                className={`flex items-center ${
                  liked ? "text-red-500" : "text-gray-400"
                } hover:text-red-500`}
                onClick={handleLike}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 mr-1"
                  fill={liked ? "currentColor" : "none"}
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
            </div>

            {/* 인스타그램 공유 버튼 */}
            <div className="mb-4">
              <Preview
                ref={previewRef} // 단일 ref 전달
                signatureId={signatureId}
                signatureUrl={signature.signature_url}
                message={signature.message}
                authorName={signature.author_name || "Anonymous"}
             hashtags={["#진실을말해이세돌", "#침묵은공범이다"]}
              />
              <button
                onClick={() => handleDownload()}
                //  onClick={() => setViewNum(index)}
                className="flex items-center justify-center p-1 font-bold text-black transition-colors duration-200 bg-white rounded-full hover:bg-gray-100"
                title="이미지 다운로드"
              >
                {/* <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                </svg> */}
                <svg
                  className="w-4 h-4 md:w-6 md:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16l-6-6h4V4h4v6h4l-6 6zM6 18v2h12v-2H6z"
                    // fill="#3b82f6" /* Blue-500, 다크/라이트 테마 호환 */
                  />
                </svg>
              </button>
            </div>

            {/* 구분선 */}
            <div className="my-4 border-t border-gray-700"></div>

            {/* 댓글 목록 */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                댓글 {comments.length}개
              </h3>

              {comments.length === 0 ? (
                <p className="py-4 text-center text-gray-400">
                  첫 댓글을 남겨보세요!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 text-white bg-black border rounded-lg border-1 border-kanye-accent"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-white">
                          {comment.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleString(
                            "ko-KR",
                            {
                              month: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-white break-all">
                        {comment.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-4 py-2 text-white bg-black border rounded-l-lg border-1 border-kanye-accent focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="px-4 py-2 text-white rounded-r-lg bg-kanye-accent disabled:opacity-50"
                >
                  {commentLoading ? "Sending..." : "￥$"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            게시글을 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureModal;
