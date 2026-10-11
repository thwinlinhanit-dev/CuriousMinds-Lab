import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { fbLoad, fbSave } from "@/db/helpers";
import { v4 as uuid } from "uuid";

const mapRow = (r: any) => ({
  id: r.id, title: r.title, description: r.description, moduleId: r.module_id ?? r.moduleId,
  subjectId: r.subject_id ?? r.subjectId, type: r.type,
  data: typeof r.data === "string" ? JSON.parse(r.data) : r.data,
  thumbnail: r.thumbnail, createdAt: r.created_at ?? r.createdAt, updatedAt: r.updated_at ?? r.updatedAt,
  isFavorite: !!(r.is_favorite ?? r.isFavorite),
});

export async function GET() {
  if (!useFallback && sqlite) {
    const rows = sqlite.prepare("SELECT * FROM saved_projects ORDER BY updated_at DESC").all() as any[];
    return NextResponse.json(rows.map(mapRow));
  }
  return NextResponse.json(fbLoad()["saved_projects"] ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = uuid();
  const now = new Date().toISOString();
  if (!useFallback && sqlite) {
    sqlite.prepare("INSERT INTO saved_projects (id,title,description,module_id,subject_id,type,data,thumbnail,created_at,updated_at,is_favorite) VALUES (?,?,?,?,?,?,?,?,?,?,0)").run(
      id, body.title, body.description || "", body.moduleId || null, body.subjectId || null, body.type, JSON.stringify(body.data), body.thumbnail || null, now, now
    );
    return NextResponse.json({ id, success: true });
  }
  const store = fbLoad();
  store["saved_projects"] = [{ id, ...body, createdAt: now, updatedAt: now, isFavorite: false }, ...(store["saved_projects"] ?? [])];
  fbSave(store);
  // award creator achievement check happens via progress endpoint; also grant small XP here
  return NextResponse.json({ id, success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!useFallback && sqlite) {
    sqlite.prepare("UPDATE saved_projects SET title=?, description=?, data=?, thumbnail=?, updated_at=?, is_favorite=? WHERE id=?").run(
      body.title, body.description, JSON.stringify(body.data), body.thumbnail ?? null, new Date().toISOString(), body.isFavorite ? 1 : 0, body.id
    );
    return NextResponse.json({ success: true });
  }
  const store = fbLoad();
  store["saved_projects"] = (store["saved_projects"] ?? []).map((p: any) => (p.id === body.id ? { ...p, ...body, updatedAt: new Date().toISOString() } : p));
  fbSave(store);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false });
  if (!useFallback && sqlite) sqlite.prepare("DELETE FROM saved_projects WHERE id=?").run(id);
  else {
    const store = fbLoad();
    store["saved_projects"] = (store["saved_projects"] ?? []).filter((p: any) => p.id !== id);
    fbSave(store);
  }
  return NextResponse.json({ success: true });
}
