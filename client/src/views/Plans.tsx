import { useEffect, useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  ApiResponse,
  BillingPeriod,
  Plan,
  Subscription,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/FormMessage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const periodLabels: Record<BillingPeriod, string> = {
  monthly: "1 aylık",
  quarterly: "3 aylık",
  yearly: "1 yıllık",
};

const planLabels = { free: "Ücretsiz", premium: "Premium" };

export default function PlansPage({ embedded = false }: { embedded?: boolean }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<BillingPeriod>("monthly");
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({
    message: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<Plan[]>>("/subscriptions/plans"),
      api.get<ApiResponse<Subscription>>("/subscriptions/me", true),
    ])
      .then(([plansResponse, subscriptionResponse]) => {
        setPlans(plansResponse.data);
        setSubscription(subscriptionResponse.data);
        if (subscriptionResponse.data.billing_period) {
          setSelectedPeriod(subscriptionResponse.data.billing_period);
        }
      })
      .catch((error) =>
        setStatus({
          message:
            error instanceof ApiError ? error.message : "Planlar yüklenemedi",
          error: true,
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  async function upgrade() {
    setLoading(true);
    setStatus({ message: "" });
    try {
      const response = await api.post<ApiResponse<Subscription>>(
        "/subscriptions/me/upgrade",
        { billingPeriod: selectedPeriod },
        true,
      );
      setSubscription(response.data);
      setStatus({ message: response.message ?? "Premium aktif edildi" });
    } catch (error) {
      setStatus({
        message:
          error instanceof ApiError ? error.message : "İşlem tamamlanamadı",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    setLoading(true);
    setStatus({ message: "" });
    try {
      const response = await api.post<ApiResponse<Subscription>>(
        "/subscriptions/me/cancel",
        {},
        true,
      );
      setSubscription(response.data);
      setStatus({ message: response.message ?? "Abonelik iptal edildi" });
    } catch (error) {
      setStatus({
        message:
          error instanceof ApiError ? error.message : "İşlem tamamlanamadı",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const premium = plans.find((plan) => plan.code === "premium");
  const endDate = subscription?.ends_at
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(subscription.ends_at))
    : null;
  const startDate = subscription?.starts_at
    ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(subscription.starts_at))
    : "—";
  const currentPeriod = subscription?.plan_code === "premium" ? subscription.billing_period : null;

  return (
    <div>
      {!embedded && <header className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-10 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-500">Üyelik</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Plan ve abonelik
          </h1>
          <p className="mt-3 max-w-xl text-zinc-600">
            İhtiyacınıza uygun kullanım dönemini seçin. Ödeme entegrasyonu demo
            sürümünde kapalıdır.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-800">
            {subscription?.plan_code === "premium" ? (
              <Crown className="size-5" />
            ) : (
              <Check className="size-5" />
            )}
          </span>
          <div>
            <p className="text-xs text-zinc-500">Mevcut plan</p>
            <p className="font-semibold">
              {loading && !subscription
                ? "Yükleniyor…"
                : subscription && planLabels[subscription.plan_code]}
            </p>
          </div>
        </div>
      </header>}
      <FormMessage
        message={status.message}
        type={status.error ? "error" : "success"}
      />
      <div className="mt-6 border-y border-zinc-200 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`grid size-10 place-items-center rounded-full ${subscription?.plan_code === "premium" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}>
              {subscription?.plan_code === "premium" ? <Crown className="size-5" /> : <Check className="size-5" />}
            </span>
            <div><p className="text-xs text-zinc-500">Aktif üyelik</p><p className={`mt-1 text-lg font-semibold ${subscription?.plan_code === "premium" ? "text-emerald-800" : "text-zinc-900"}`}>{loading && !subscription ? "Yükleniyor…" : subscription && planLabels[subscription.plan_code]}</p></div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${subscription?.plan_code === "premium" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}>{subscription?.plan_code === "premium" && subscription.billing_period ? periodLabels[subscription.billing_period] : "Ücretsiz"}</span>
        </div>
        <p className={`mt-4 text-sm ${subscription?.plan_code === "premium" ? "text-emerald-700" : "text-zinc-500"}`}>{subscription?.plan_code === "premium" ? "Tüm Premium özellikler kullanıma açık" : "Temel özelliklerle ücretsiz erişim"}</p>
        <div className="mt-5 grid grid-cols-2 gap-6 text-sm"><div><p className="text-xs text-zinc-500">Başlangıç</p><p className="mt-1">{startDate}</p></div><div><p className="text-xs text-zinc-500">Bitiş</p><p className="mt-1">{endDate ?? "Süresiz"}</p></div></div>
      </div>
      <section className={embedded ? "py-8" : "grid gap-10 py-10 lg:grid-cols-[1fr_1.2fr]"}>
        {!embedded && <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Premium
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Daha fazlasına hazır olun.
          </h2>
          <p className="mt-4 max-w-md leading-7 text-zinc-600">
            {premium?.description ?? "Tüm premium özelliklere erişim"}
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            <li className="flex gap-3">
              <Check className="size-4 text-emerald-700" />
              Tüm premium özelliklere erişim
            </li>
            <li className="flex gap-3">
              <Check className="size-4 text-emerald-700" />
              Esnek abonelik dönemleri
            </li>
            <li className="flex gap-3">
              <Check className="size-4 text-emerald-700" />
              İstediğiniz zaman Ücretsiz plana dönüş
            </li>
          </ul>
        </div>}
        <div>
          <h3 className="text-sm font-semibold">Kullanım dönemi</h3>
          <Select
            value={selectedPeriod}
            onValueChange={(value) => value && setSelectedPeriod(value)}
          >
            <SelectTrigger className="mt-3 w-full">
              <SelectValue>{periodLabels[selectedPeriod]}{currentPeriod === selectedPeriod ? " — Aktif" : ""}</SelectValue>
            </SelectTrigger>
            <SelectContent>
            {premium?.options.map((option) => (
              <SelectItem
                key={option.billingPeriod}
                value={option.billingPeriod}
                disabled={currentPeriod === option.billingPeriod}
              >
                {periodLabels[option.billingPeriod]}
                {currentPeriod === option.billingPeriod ? " — Aktif" : ""}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
          <Button
            className="mt-6 w-full sm:w-auto"
            onClick={upgrade}
            disabled={loading || currentPeriod === selectedPeriod}
          >
            <Sparkles />
            {currentPeriod === selectedPeriod ? "Bu dönem aktif" : subscription?.plan_code === "premium" ? "Dönemi değiştir" : "Demo Premium'a geç"}
          </Button>
          {subscription?.plan_code === "premium" && (
            <div className="mt-6 border-t border-zinc-200 pt-6">
              <p className="text-sm text-zinc-600">
                Premium erişiminiz{" "}
                {endDate ? `${endDate} tarihine kadar` : "aktif"}.
              </p>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="mt-2 px-0 text-destructive"
                    />
                  }
                >
                  Premium'u iptal et
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Ücretsiz plana dönmek istiyor musunuz?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Premium erişiminiz demo sürümünde hemen sona erecek.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                    <AlertDialogAction onClick={cancel}>
                      Ücretsiz plana dön
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
