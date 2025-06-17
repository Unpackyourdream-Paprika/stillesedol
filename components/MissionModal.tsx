import { Dispatch, SetStateAction, useRef } from "react";

interface ModalPropData {
  setOpenMission: Dispatch<SetStateAction<boolean>>;
}

export const MissionModal = ({ setOpenMission }: ModalPropData) => {
  const checkRef = useRef<HTMLInputElement>(null);
  const checkMRef = useRef<HTMLInputElement>(null);

  async function setCookie(name: string, value: string, expires: Date) {
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  }

  const handleCloseForToday = async () => {
    if (!checkRef.current || !checkMRef.current) return;

    if (checkRef.current.checked || checkMRef.current.checked) {
      console.log("checkRef.current.checked:", checkRef.current.checked);
      const expires = new Date();
      expires.setHours(23, 59, 59, 999); // 오늘 자정까지
      await setCookie("hidePopup", "true", expires);
    }
    setOpenMission(false);
  };

  return (
    <div className="fixed z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 backdrop-blur">
      <div
        onClick={() => {
          handleCloseForToday();
        }}
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="z-20 bg-[rgba(0,0,0,1)]  overflow-y-auto overflow-x-hidden text-[14px] md:text-[16px] rounded-lg max-w-[800px] w-full h-screen md:h-auto p-4 md:p-12 relative text-white">
        <div
          onClick={() => {
            handleCloseForToday();
          }}
          className="absolute top-[8%] right-8 md:top-5 md:right-5 cursor-pointer w-6"
        >
          <img src="/x-close.png" alt="" />
        </div>
        <div className="absolute hidden md:block bottom-4 top-5 right-16">
          <label
            htmlFor="popupCheck"
            className="text-[14px] cursor-pointer flex justify-center items-center gap-2"
          >
            <input
              ref={checkRef}
              type="checkbox"
              className=""
              id="popupCheck"
            />
            오늘 하루 보지 않기
          </label>
        </div>
        <div className="w-full h-full mx-auto max-w-[600px] font-pretendart flex justify-center items-center">
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="max-w-[110px] md:max-w-[150px] mx-auto ">
              <img src="/YE-1.png" alt="" />
            </div>
            <div>
              <span className="py-1 px-5 bg-[#606060] rounded-full text-[12px] ">
                "니세계만아이돌"
              </span>
            </div>
            <p className="text-[24px] md:text-[30px] font-[700]">
              🌀 ‘이’세계는 사라지고, ‘니’세계만 남았다?
            </p>
            <p className="text-[18px] md:text-[26px] font-[700]">
              ‘이세돌’에게 진실을 묻습니다.
            </p>

            <br />

            <p className="text-[16px] md:text-[20px] font-[700] text-center">
              왁타버스와 이세계아이돌을 둘러싼 수많은 논란과 <br /> 의혹들—
              진실을 알고 싶은 마음은 죄가 아닙니다.
            </p>

            <br />

            <p className="text-[16px] md:text-[20px] font-[700] text-center">
              서명은 해명을 요구할 수 있는 자격입니다.
            </p>

            <p className="text-[16px] md:text-[20px] font-[700] text-center">
              서명 수가 일정 기준을 넘을 때마다, 우리는 공식 해명을 요청합니다.
            </p>

            <br />

            <div className="w-full flex flex-col gap-3 min-w-[350px] md:gap-4 rounded-[16px] bg-[#5a5a5a] p-4 md:p-6">
              <div className="flex justify-between w-full">
                <p className="text-left">📌 단계별 해명 요구안</p>
                <p className="text-right">
                  <span className="font-[600]">
                    서명 달성 논란 주제 요구 내용
                  </span>
                </p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-left">✅ 1,000명</p>
                <p className="text-right">
                  <span className="font-[600]">
                    🎵 IP 무단 사용 음원·2차 창작 저작권 사용 절차 공개
                  </span>
                </p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-left">✅ 2,000명</p>
                <p className="text-right">
                  <span className="font-[600]">
                    🎬 제작/금전 투명성 지원 기준·자금 사용 내역 공개
                  </span>
                </p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-left">✅ 3,000명</p>
                <p className="text-right">
                  <span className="font-[600]">
                    🎧 DLC/사과 논란 DLC 제외 배경 및 공식 입장
                  </span>
                </p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-left">✅ 4,000명</p>
                <p className="text-right">
                  <span className="font-[600]">
                    ⚖️ 커뮤니티 고소/검열 고소 기준 및 운영 원칙 명시
                  </span>
                </p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-left">✅ 5,000명</p>
                <p className="text-right">
                  <span className="font-[600]">
                    🤝 팬덤 과열/비하 팬덤 가이드라인 및 책임 표명
                  </span>
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-[400]">🎯 지금 서명하고, 책임을 요구하세요.</p>
              {/* <p>#칸붕아돌아와</p> */}
            </div>
            <div
              onClick={() => {
                handleCloseForToday();
              }}
              className="px-10 py-2 bg-[#fe3d00] cursor-pointer"
            >
              🔻 [지금 서명하면, 진실이 온다]
            </div>
            <div className="block md:hidden ">
              <label
                htmlFor="popupCheckM"
                className="text-[14px] cursor-pointer flex justify-center items-center gap-2"
              >
                <input
                  ref={checkMRef}
                  type="checkbox"
                  className=""
                  id="popupCheckM"
                />
                오늘 하루 보지 않기
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
