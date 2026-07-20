import { NextResponse } from "next/server";
import { importBooksFromOL } from "@/lib/import-books";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await importBooksFromOL();
  return NextResponse.json(result);
}
