import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { fbLoad, fbSave } from "@/db/helpers";
import { v4 as uuid } from "uuid";

const mapRow = (r: any) => ({
  id: r.id, title: r.title, content: r.content, moduleId: r.module_id ?? r.moduleId,
  tags: r.tags, mood: r.mood, createdAt: r.created_at ?? r.createdAt, updatedAt: r.updated_at ?? r.updatedAt,
});

export async function GET() {
  if (!useFallback && sqlite) {
    const rows = sqlite.prepare("SELECT * FROM journal_entries ORDER BY updated_at DESC").all() as any[];
    return NextResponse.json(rows.map(mapRow));
  }
  return NextResponse.json(fbLoad()["journal_entries"] ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = uuid();
  const now = new Date().toISOString();
  if (!useFallback && sqlite) {
    sqlite.prepare("INSERT INTO journal_entries (id,title,content,module_id,tags,mood,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)").run(
      id, body.title, body.content, body.moduleId || null, JSON.stringify(body.tags ?? []), body.mood || null, now, now
    );
    return NextResponse.json({ id, success: true });
  }
  const store = fbLoad();
  store["journal_entries"] = [{ id, ...body, createdAt: now, updatedAt: now }, ...(store["journal_entries"] ?? [])];
  fbSave(store);
  return NextResponse.json({ id, success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false });
  if (!useFallback && sqlite) sqlite.prepare("DELETE FROM journal_entries WHERE id=?").run(id);
  else {
    const store = fbLoad();
    store["journal_entries"] = (store["journal_entries"] ?? []).filter((e: any) => e.id !== id);
    fbSave(store);
  }
  return NextResponse.json({ success: true });
}
