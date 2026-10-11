import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm", className)} {...rest}>{children}</div>;
}
export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 md:p-5 pb-2", className)}>{children}</div>;
}
export function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display font-bold text-lg", className)}>{children}</h3>;
}
export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 md:p-5 pt-2", className)}>{children}</div>;
}
export function Button({ className, variant = "default", size = "md", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "secondary" | "outline" | "ghost" | "fun"; size?: "sm" | "md" | "lg" }) {
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    outline: "border-2 border-slate-200 hover:border-slate-300 bg-white",
    ghost: "hover:bg-slate-100 text-slate-600",
    fun: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg",
  };
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };
  return <button className={cn("rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50", variants[variant], sizes[size], className)} {...rest} />;
}
export function Badge({ className, children }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700", className)}>{children}</span>;
}
export function Progress({ value, className }: { value: number; className?: string }) {
  return <div className={cn("h-2.5 bg-slate-100 rounded-full overflow-hidden", className)}><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
export function Slider({ label, value, min, max, step = 1, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-medium mb-1"><span>{label}</span><span className="font-bold text-blue-700">{format ? format(value) : value}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
export function Tabs({ tabs, active, onChange }: { tabs: Array<{ id: string; label: string }>; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={cn("flex-1 px-3 py-1.5 rounded-lg text-sm font-bold", active === t.id ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}>{t.label}</button>
      ))}
    </div>
  );
}
