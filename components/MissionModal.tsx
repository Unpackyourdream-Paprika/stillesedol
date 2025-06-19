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
        <div className="w-full h-full mx-auto max-w-[600px] font-pretendart flex justify-center items-center pt-[70px] pb-[14px] md:pt-0">
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="max-w-[110px] md:max-w-[150px] mx-auto ">
              <img src="/YE-1.png" alt="" />
            </div>
            <div>
              <span className="py-1 px-5 bg-[#606060] rounded-full text-[12px] ">
                "니세계만아이돌"
              </span>
            </div>
            {/* <p className="text-[24px] md:text-[30px] font-[700] text-center">
              🌀 ‘이’세계는 사라지고, <br className="block md:hidden" />
              <span className="pl-4 md:pl-0"> ‘니’세계만 남았다.</span>
            </p>
            <p className="text-[16px] md:text-[26px] font-[700]">
              ‘이세돌’, 그리고 ‘우왁굳’에게 묻습니다.
            </p> */}

            <p className="text-[16px] md:text-[26px] font-[700]">
              이 수많은 논란 앞에, 지금의 침묵이 최선입니까?
            </p>

            <p className="text-[16px] md:text-[26px] font-[700] text-center">
              우리는 서명을 통해, 공식 해명을 요구합니다.
            </p>

            <div className="w-full flex flex-col gap-3 min-w-[350px] mt-4 md:gap-4 rounded-[16px] bg-[#5a5a5a] p-4 md:p-6">
              <div className="flex flex-col gap-2 md:flex-col md:justify-between md:items-start">
                <p className="w-full text-xl font-semibold text-center text-white">
                  ✅ 서명 10,000명 달성시
                </p>
                <p className="text-white text-sm md:text-xl w-full text-center md:max-w-[100%]">
                  <span className="font-[600]">
                    금전적·정신적으로 피해를 입은 이들을 대신해, <br /> 당신들의
                    입으로 공식 사과를 받아내겠습니다.
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="font-[400]">🎯 지금 서명하고, 책임을 요구하세요.</p>
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
