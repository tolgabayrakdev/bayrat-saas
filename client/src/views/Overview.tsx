import { ArrowUpRight, Check, KeyRound, Mail, Settings } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/auth/useAuth";

export default function Overview() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0];
  const joined = user
    ? new Intl.DateTimeFormat("tr-TR", {
        month: "long",
        year: "numeric",
      }).format(new Date(user.created_at))
    : "";

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-10 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-500">Hesap özeti</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Merhaba, {firstName}.
          </h1>
          <p className="mt-3 text-zinc-600">
            Hesabınız güncel ve kullanıma hazır.
          </p>
        </div>
        <Link
          to="/settings"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-transparent px-3 text-sm font-medium hover:bg-zinc-100"
        >
          <Settings className="size-4" />
          Ayarları yönet
        </Link>
      </div>
      <section className="grid gap-8 py-10 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl bg-zinc-950 p-7 text-white sm:p-9">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                Ana hesap
              </p>
              <p className="mt-7 text-2xl font-medium">{user?.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-emerald-400 text-zinc-950">
              <Check className="size-5" />
            </span>
          </div>
          <div className="mt-16 flex items-end justify-between">
            <div>
              <p className="text-xs text-zinc-500">Üyelik başlangıcı</p>
              <p className="mt-1 text-sm capitalize">{joined}</p>
            </div>
            <span className="text-xs font-medium text-emerald-300">
              DOĞRULANDI
            </span>
          </div>
        </div>
        <div className="py-2">
          <h2 className="text-sm font-semibold">Hızlı işlemler</h2>
          <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
            <Link
              to="/settings#profile"
              className="flex items-center gap-4 py-5 group"
            >
              <span className="grid size-9 place-items-center rounded-full bg-zinc-200">
                <Settings className="size-4" />
              </span>
              <span className="flex-1 text-sm">Profil bilgilerini düzenle</span>
              <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-zinc-950" />
            </Link>
            <Link
              to="/settings#email"
              className="flex items-center gap-4 py-5 group"
            >
              <span className="grid size-9 place-items-center rounded-full bg-zinc-200">
                <Mail className="size-4" />
              </span>
              <span className="flex-1 text-sm">E-posta adresini değiştir</span>
              <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-zinc-950" />
            </Link>
            <Link
              to="/settings#password"
              className="flex items-center gap-4 py-5 group"
            >
              <span className="grid size-9 place-items-center rounded-full bg-zinc-200">
                <KeyRound className="size-4" />
              </span>
              <span className="flex-1 text-sm">Parolayı güncelle</span>
              <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-zinc-950" />
            </Link>
          </div>
        </div>
      </section>
      <section className="border-t border-zinc-200 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Güvenlik durumu
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-semibold">Aktif</p>
            <p className="mt-1 text-sm text-zinc-500">E-posta doğrulaması</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">Korumalı</p>
            <p className="mt-1 text-sm text-zinc-500">Parola ve oturumlar</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">Güncel</p>
            <p className="mt-1 text-sm text-zinc-500">Hesap erişimi</p>
          </div>
        </div>
      </section>
    </div>
  );
}
