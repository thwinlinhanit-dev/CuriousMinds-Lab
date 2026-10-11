import { NextResponse } from "next/server";
import { DAL } from "@/db/helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId") ?? undefined;
  return NextResponse.json(DAL.modules(subjectId));
}
