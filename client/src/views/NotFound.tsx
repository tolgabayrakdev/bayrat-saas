import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="text-center">
        <p className="text-sm font-medium text-emerald-700">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Bu sayfa bulunamadı.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Adres değişmiş veya sayfa kaldırılmış olabilir.
        </p>
        <Button className="mt-7" onClick={() => location.assign("/")}>
          Ana sayfaya dön
        </Button>
      </div>
    </main>
  );
}
