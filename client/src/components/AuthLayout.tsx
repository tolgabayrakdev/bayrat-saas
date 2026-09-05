import type { ReactNode } from "react";
import { Link } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col">
        <div className="flex items-center justify-between">
          <Link to="/" className="w-fit text-sm font-semibold tracking-tight">BAYRAT</Link>
          <ModeToggle />
        </div>
        <div className="my-auto grid gap-14 py-16 lg:grid-cols-[1fr_28rem] lg:items-center">
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            {children}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Güvenli hesap yönetimi, gereksiz kalabalık olmadan.
        </p>
      </div>
    </main>
  );
}
