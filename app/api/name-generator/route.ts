import { NextResponse } from "next/server";
import OpenAI from "openai";
export const dynamic = "force-dynamic"; // ⬅️ 핵심!

// List of predefined Kanye-related names (fallback)
const uwakNames = [
  "니세돌님",
  "망상가좌",
  "초월자충",
  "반쯤뜬눈러",
  "이탈자님",
  "세계멸망러",
  "니예언자",
  "탈출선도자",
  "은하귀환자",
  "불신자코어",
  "세카이님",
  "이세닉러",
  "세계수신자",
  "니트킹",
  "지구망령각",
  "니우주충",
  "전도자좌",
  "연성자찐",
  "니세러버",
  "우앜각성자",
];

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function GET() {
  try {
    // If OpenAI client is available, use it to generate a name
    if (openai) {
      const uniqueSeed = Date.now() + Math.random(); // 고유 시드 추가
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "당신은 '이세계아이돌' 관련 패러디/비꼼/풍자적인 닉네임을 창의적으로 생성하는 전문가입니다. 영어나 한글로 15자 이내의 이름만 응답하세요. 이름 외에는 아무 말도 하지 마세요.",
            },
            {
              role: "user",
              content:
                "이세계아이돌과 관련된 비꼬고 풍자적인 닉네임을 하나만 만들어줘.",
            },
          ],
          temperature: 0.9,
          max_tokens: 10,
        });

        const name = response.choices[0]?.message?.content?.trim();
        console.log("nameopenai:", name);

        if (name) {
          return NextResponse.json(
            { name, type: "gpt" },
            {
              headers: {
                "Cache-Control": "no-store, max-age=0",
              },
            }
          );
        }
      } catch (error) {
        console.error("OpenAI API 오류:", error);
        // OpenAI API 호출 실패 시 fallback으로 진행
      }
    }

    // Fallback: 미리 정의된 배열에서 랜덤하게 선택
    const randomIndex = Math.floor(Math.random() * uwakNames.length);
    const name = uwakNames[randomIndex];
    console.log("name:", name);

    return NextResponse.json(
      { name, type: "random" },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("이름 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "이름 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
