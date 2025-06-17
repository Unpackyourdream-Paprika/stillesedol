import { supabase } from './supabase'

export interface SignatureData {
  message: string
  signature_url: string  // Make this required since we always need it
  author_name: string
  profile_image: string
}

export interface CommentData {
  signature_id: string
  user_id: string
  username: string
  message: string
}

export async function submitSignature(data: SignatureData) {
  try {
    console.log('Submitting signature to Supabase:', data)
    
    // First, check if the table exists and has the correct structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('signatures')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('Error checking table:', tableError)
      throw new Error('Table check failed: ' + tableError.message)
    }

    // Insert the signature
    const { data: result, error } = await supabase
      .from('signatures')
      .insert({
        message: data.message,
        signature_url: data.signature_url,
        author_name: data.author_name,
        profile_image: data.profile_image,
        created_at: new Date().toISOString(),
        likes: 0 // 초기 좋아요 수 0으로 설정
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting signature:', error)
      throw error
    }

    console.log('Signature submitted successfully:', result)
    return { data: result, error: null }
  } catch (error) {
    console.error('Error in submitSignature:', error)
    return { data: null, error }
  }
}

export async function getSignatures() {
  try {
    console.log('Fetching signatures from Supabase')
    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching signatures:', error)
      throw error
    }

    console.log('Signatures fetched successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('Error in getSignatures:', error)
    return { data: null, error }
  }
}

// 게시글 상세 정보 가져오기 함수
export async function getSignatureById(id: string) {
  try {
    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching signature:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getSignatureById:', error)
    return { data: null, error }
  }
}

// 좋아요 추가 함수
export async function likeSignature(id: string, userId: string) {
  try {
    // 먼저 이 사용자가 이미 좋아요를 눌렀는지 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('signature_likes')
      .select('*')
      .eq('signature_id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing like:', checkError)
      throw checkError
    }

    // 이미 좋아요를 눌렀으면 취소
    if (existingLike) {
      const { error: deleteLikeError } = await supabase
        .from('signature_likes')
        .delete()
        .eq('signature_id', id)
        .eq('user_id', userId)

      if (deleteLikeError) {
        console.error('Error removing like:', deleteLikeError)
        throw deleteLikeError
      }

      // 좋아요 수 감소
      const { data: signature, error: updateError } = await supabase.rpc('decrement_likes', {
        signature_id: id
      })

      if (updateError) {
        console.error('Error updating like count:', updateError)
        throw updateError
      }

      return { data: { liked: false, count: signature }, error: null }
    } 
    // 아직 좋아요를 누르지 않았으면 추가
    else {
      const { error: addLikeError } = await supabase
        .from('signature_likes')
        .insert({
          signature_id: id,
          user_id: userId,
          created_at: new Date().toISOString()
        })

      if (addLikeError) {
        console.error('Error adding like:', addLikeError)
        throw addLikeError
      }

      // 좋아요 수 증가
      const { data: signature, error: updateError } = await supabase.rpc('increment_likes', {
        signature_id: id
      })

      if (updateError) {
        console.error('Error updating like count:', updateError)
        throw updateError
      }

      return { data: { liked: true, count: signature }, error: null }
    }
  } catch (error) {
    console.error('Error in likeSignature:', error)
    return { data: null, error }
  }
}

// 좋아요 상태 확인 함수
export async function checkLikeStatus(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('signature_likes')
      .select('*')
      .eq('signature_id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error checking like status:', error)
      throw error
    }

    return { data: !!data, error: null }
  } catch (error) {
    console.error('Error in checkLikeStatus:', error)
    return { data: false, error }
  }
}

// 댓글 추가 함수
export async function addComment(commentData: CommentData) {
  try {
    const { data, error } = await supabase
      .from('signature_comments')
      .insert({
        signature_id: commentData.signature_id,
        user_id: commentData.user_id,
        username: commentData.username,
        message: commentData.message,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error adding comment:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in addComment:', error)
    return { data: null, error }
  }
}

// 댓글 가져오기 함수
export async function getComments(signatureId: string) {
  try {
    const { data, error } = await supabase
      .from('signature_comments')
      .select('*')
      .eq('signature_id', signatureId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getComments:', error)
    return { data: null, error }
  }
} 