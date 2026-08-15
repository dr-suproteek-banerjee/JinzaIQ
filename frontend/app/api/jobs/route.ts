import { NextRequest, NextResponse } from "next/server";
import { filterJobs, getJobData } from "@/lib/jobs";

export const runtime = "nodejs";
export const revalidate = 21600;

export async function GET(request: NextRequest) {
  const data = await getJobData();
  const items = filterJobs(data.items, request.nextUrl.searchParams);
  return NextResponse.json({ ...data, total: items.length, items });
}
