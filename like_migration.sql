-- 좋아요 관련 테이블 생성
CREATE TABLE IF NOT EXISTS signature_likes (
  id BIGSERIAL PRIMARY KEY,
  signature_id BIGINT REFERENCES signatures(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(signature_id, user_id)
);

-- 댓글 관련 테이블 생성
CREATE TABLE IF NOT EXISTS signature_comments (
  id BIGSERIAL PRIMARY KEY,
  signature_id BIGINT REFERENCES signatures(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 좋아요 수 증가 함수
CREATE OR REPLACE FUNCTION increment_likes(signature_id BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  updated_likes BIGINT;
BEGIN
  UPDATE signatures
  SET likes = likes + 1
  WHERE id = signature_id
  RETURNING likes INTO updated_likes;
  
  RETURN updated_likes;
END;
$$;

-- 좋아요 수 감소 함수
CREATE OR REPLACE FUNCTION decrement_likes(signature_id BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  updated_likes BIGINT;
BEGIN
  UPDATE signatures
  SET likes = GREATEST(0, likes - 1)
  WHERE id = signature_id
  RETURNING likes INTO updated_likes;
  
  RETURN updated_likes;
END;
$$; 