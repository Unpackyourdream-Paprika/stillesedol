
interface PreviewProps {
    signatureId: string;
    signatureUrl: string;
    message: string;
    authorName: string;
    hashtags?: string[];
  }

export const TestModal = ({ 
  signatureId, 
  signatureUrl, 
  message, 
  authorName,
  hashtags = ['#고칸붕캠페인', '#ComebackYe']
}:PreviewProps) => {
    return (
        <div
        className="fixed top-[200px] left-[600px]   w-[1080px] h-[1920px] bg-white flex flex-col justify-center items-center p-20 box-border z-[100] font-arial"
        >
        {/* Bully 로고 */}
        <div className="absolute top-16 right-16 text-black text-5xl font-bold">
          Bully
        </div>
  
        {/* 작성자 이름 */}
        <div className="text-black text-6xl font-bold text-center mb-10">
          {authorName}
        </div>
  
        {/* 서명 이미지 */}
        <img
            src={signatureUrl}
            alt="Signature"
            className="max-w-[800px] max-h-[800px] object-contain mb-10"
            crossOrigin="anonymous"
          />
  
        {/* 메시지 */}
        <div className="text-black text-[42px] text-center mb-16 leading-[1.4] break-all max-w-[900px]">
          {message}
        </div>
  
        {/* 해시태그 박스 */}
        <div className="flex justify-center items-center bg-[rgba(255,215,0,0.9)] py-8 px-16 rounded-2xl">
          <div className="text-black text-5xl font-bold text-center">
            {hashtags.join(' ')}
          </div>
        </div>
      </div>
    );
}