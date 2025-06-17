import { useState, SetStateAction, Dispatch } from 'react';
import SignatureInput from './SignatureInput';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface SignatureDrawerProps {
  onSignatureSubmit: () => void;
  isMobile:boolean;
  videoMuted: boolean;
  setVideoMuted: Dispatch<SetStateAction<boolean>>
}

export default function SignatureDrawer({ onSignatureSubmit, isMobile, videoMuted, setVideoMuted }: SignatureDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 transition-transform duration-300 ease-in-out z-40"
      style={{ 
        transform: isMobile ? 
        (isOpen ? 'translateY(0px)' : 'translateY(calc(100%))') 
        : (isOpen ? 'translateY(0px)' : 'translateY(calc(100%))')
      }}
    >
      {/* Drawer Handle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -top-12  right-0 bg-black text-white p-3 rounded-t-lg border border-gray-800 border-b-0 hover:bg-gray-900 transition-colors"
        aria-label={isOpen ? "Close Signature Panel" : "Open Signature Panel"}
      >
        <PencilSquareIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div onClick={()=>{
          setVideoMuted(!videoMuted)
        }} className='absolute -top-12 left-0 flex justify-center items-center rounded-t-lg border border-gray-800 border-b-0 hover:bg-gray-900 transition-colors cursor-pointer bg-black p-3 z-50'>
        <img className='w-6 h-6' src={videoMuted ? '/mute.png' : '/play.png'} alt="" />
      </div>

      {/* Drawer Content */}
      <div className="max-w-4xl mx-auto w-full p-6">
        <SignatureInput onSignatureSubmit={onSignatureSubmit} />
      </div>
    </div>
  );
} 