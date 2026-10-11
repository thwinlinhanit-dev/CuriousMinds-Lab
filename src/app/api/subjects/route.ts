import { NextResponse } from "next/server";
import { DAL } from "@/db/helpers";

export async function GET() {
  return NextResponse.json(DAL.subjects());
}
