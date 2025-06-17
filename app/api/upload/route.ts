import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = "ap-northeast-2";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const bucket = "kayne-sign";

const s3 = new S3Client({
  region: region,
  endpoint: `https://s3.ap-northeast-2.amazonaws.com`,
  credentials: {
    accessKeyId: accessKeyId as string,
    secretAccessKey: secretAccessKey as string,
  },
  forcePathStyle: true,
});





export async function POST(request: Request) {
  console.log("Starting file upload process...");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      console.log("No file received in request");
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `signature-${Date.now()}.png`;

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: "image/png",
    });

    console.log("Sending to S3...");
    const result = await s3.send(command);

    console.log(result, "result?");

    // URL을 하드코딩된 형식으로 생성
    const url = `https://kayne-sign.s3.ap-northeast-2.amazonaws.com/${fileName}`;
    console.log("Upload successful:", url);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : "Unknown",
      },
      { status: 500 }
    );
  }
}
