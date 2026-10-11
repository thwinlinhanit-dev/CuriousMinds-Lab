"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Button, Badge } from "@/components/ui/primitives";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const load = () => fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm("Delete this creation?")) return;
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    load();
  };
  const fav = async (p: any) => {
    await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, isFavorite: !p.isFavorite, data: p.data }) });
    load();
  };
  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">🎨 My Projects</h1>
      <p className="text-slate-500 text-sm">Everything you save from labs lives here. {projects.length} creations!</p>
      {projects.length === 0 && <Card><CardContent><p className="text-center py-8">No creations yet — go make something! 🚀<br /><span className="text-sm text-slate-500">Hint: press 💾 Save in Piano Lab, Beat Machine, Pixel Art...</span></p></CardContent></Card>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id}><CardContent>
            <div className="flex items-start gap-2">
              <p className="font-extrabold flex-1">{p.title}</p>
              <button onClick={() => fav(p)} className="text-xl">{p.isFavorite ? "⭐" : "☆"}</button>
            </div>
            <p className="text-xs text-slate-500">{p.type} • {new Date(p.updatedAt ?? p.updated_at ?? Date.now()).toLocaleDateString()}</p>
            {p.description && <p className="text-sm text-slate-600 mt-1">{p.description}</p>}
            <pre className="text-[10px] bg-slate-50 rounded-lg p-2 mt-2 max-h-24 overflow-hidden">{JSON.stringify(p.data ?? {}, null, 1).slice(0, 300)}</pre>
            <div className="flex gap-2 mt-2">
              {p.moduleId && <a href={`/learn/${p.subjectId ?? ""}/${p.moduleId}`}><Button size="sm" variant="outline">Open lab →</Button></a>}
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-red-500">Delete</Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
