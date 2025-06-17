import { Dispatch, SetStateAction, useRef } from "react";

interface ModalPropData {
    setOpenMission:  Dispatch<SetStateAction<boolean>>;
}

export const MissionModal = ({setOpenMission}:ModalPropData) => {
    const checkRef = useRef<HTMLInputElement>(null)
    const checkMRef = useRef<HTMLInputElement>(null)

    async function setCookie(name: string, value: string, expires: Date) {
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`
    }

    const handleCloseForToday = async() => {
        if (!checkRef.current || !checkMRef.current) return

        if (checkRef.current.checked || checkMRef.current.checked) {
            console.log('checkRef.current.checked:', checkRef.current.checked)
            const expires = new Date()
            expires.setHours(23, 59, 59, 999) // 오늘 자정까지
            await setCookie('hidePopup', 'true', expires)
        }
        setOpenMission(false)
    }
    

    return (
        <div 
            className="fixed flex bg-black bg-opacity-50 items-center justify-center w-full h-full backdrop-blur z-50"
        >
            <div onClick={()=>{
                handleCloseForToday()
            }} className="absolute w-full h-full left-0 top-0" />
            <div className="z-20 bg-[rgba(0,0,0,1)]  overflow-y-auto overflow-x-hidden text-[14px] md:text-[16px] rounded-lg max-w-[800px] w-full h-screen md:h-auto p-4 md:p-12 relative text-white">
                <div onClick={()=>{
                    handleCloseForToday()
                }} className="absolute top-[8%] right-8 md:top-5 md:right-5 cursor-pointer w-6">
                    <img src="/x-close.png" alt="" />
                </div>
                <div className="md:block hidden absolute bottom-4 top-5 right-16">
                    <label htmlFor="popupCheck" className="text-[14px] cursor-pointer flex justify-center items-center gap-2">
                        <input ref={checkRef} type="checkbox" className="" id="popupCheck" />
                        오늘 하루 보지 않기
                    </label>
                </div>
                <div className="w-full h-full mx-auto max-w-[600px] font-pretendart flex justify-center items-center">
                    <div className="flex flex-col items-center gap-2 pt-4">
                        <div className="max-w-[110px] md:max-w-[150px] mx-auto ">
                            <img src="/YE-1.png" alt="" />
                        </div>
                        <div>
                            <span className="py-1 px-5 bg-[#606060] rounded-full text-[12px] ">서명 달성 공약 이벤트</span>
                        </div>
                        <p className="text-[24px] md:text-[30px] font-[700]">🔥 돌아와, YE 🔥</p>
                        <p className="text-[18px] md:text-[26px] font-[700]">"서명이 쌓일수록, 전설은 다시 시작된다!"</p>
                        <div className="w-full flex flex-col gap-3 min-w-[350px] md:gap-4 rounded-[16px] bg-[#5a5a5a] p-4 md:p-6">
                            <div className="w-full flex justify-between">
                                <p className="text-left">5,000명</p>
                                <p className="text-right">공연 주최사{" "}
                                    <span className="font-[600]">채널캔디 관계자{" "}</span>
                                    인터뷰
                                </p>
                            </div>
                            <div className="w-full flex justify-between">
                                <p className="text-left">10,000명</p>
                                <p className="text-right">공연 주최사{" "}
                                    <span className="font-[600]">쿠팡플레이 관계자{" "}</span>
                                    인터뷰
                                </p>
                            </div>
                            <div className="w-full flex justify-between">
                                <p className="text-left">100,000명</p>
                                <p className="text-right">
                                    <span className="font-[600]">칸예 관계자</span>
                                    와의 전화 인터뷰
                                </p>
                            </div>
                            <div className="w-full flex justify-between">
                                <p className="text-left">500,000명</p>
                                <p className="text-right">
                                    <span className="font-[600]">칸예 리스닝 파티{" "}</span>
                                    개최
                                </p>
                            </div>
                            <div className="w-full flex justify-between">
                                <p className="text-left">5,000,000명</p>
                                <p className="text-right">
                                    <span className="font-[600]">칸예 내한,{" "}</span>
                                    우리가 만든다!
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-[400]">🎧 여기에 서명하고, 함께 외쳐줘.</p>
                            <p>#칸붕아돌아와</p>
                        </div>
                        <div onClick={()=>{
                            handleCloseForToday()
                        }} className="px-10 py-2 bg-[#fe3d00] cursor-pointer">
                            지금 서명하면, YE가 온다!
                        </div>
                        <div className="md:hidden block ">
                            <label htmlFor="popupCheckM" className="text-[14px] cursor-pointer flex justify-center items-center gap-2">
                                <input ref={checkMRef} type="checkbox" className="" id="popupCheckM" />
                                오늘 하루 보지 않기
                            </label>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}