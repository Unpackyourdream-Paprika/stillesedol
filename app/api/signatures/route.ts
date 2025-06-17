import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    // const itemsPerPage = parseInt(searchParams.get('itemsPerPage' || "0"));
    console.log("page:", page);
    const itemsPerPage = 20;

    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // 데이터와 총 개수 조회
    const { data, error, count } = await supabase
      .from("signatures")
      .select("*", { count: "exact" }) // count: 'exact'로 총 행 수 조회
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { error: "서명을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signatures: data,
      hasMore: data.length === itemsPerPage,
      totalCount: count || 0, // 전체 행 수 반환
    });
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json(
      { error: "서명을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
