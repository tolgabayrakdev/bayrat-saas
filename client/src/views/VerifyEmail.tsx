import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { FormMessage } from "@/components/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email") ?? "";
  const requested = useRef(false);
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({
    message: token ? "E-posta doğrulanıyor…" : "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    api
      .post<ApiResponse>("/auth/verify-email", { token })
      .then((response) =>
        setStatus({ message: response.message ?? "E-posta doğrulandı" }),
      )
      .catch((caught) =>
        setStatus({
          message:
            caught instanceof ApiError
              ? caught.message
              : "E-posta doğrulanamadı",
          error: true,
        }),
      );
  }, [token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setStatus({ message: "" });
    try {
      const response = await api.post<ApiResponse>(
        "/auth/resend-verification",
        { email: form.get("email") },
      );
      setStatus({
        message: response.message ?? "Doğrulama bağlantısı gönderildi",
      });
    } catch (caught) {
      setStatus({
        message:
          caught instanceof ApiError ? caught.message : "İstek tamamlanamadı",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="E-posta doğrulama"
      title={
        token ? "Bağlantınızı kontrol ediyoruz." : "Yeni bağlantı isteyin."
      }
      description="Doğrulama bağlantısı süreliyse veya kullanıldıysa yeni bir bağlantı isteyebilirsiniz."
    >
      <div className="space-y-7">
        <FormMessage
          message={status.message}
          type={status.error ? "error" : "success"}
        />
        {!token && (
          <form onSubmit={resend} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={email}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Gönderiliyor…" : "Doğrulama bağlantısı gönder"}
            </Button>
          </form>
        )}
        <Link
          to="/login"
          className="block text-sm text-zinc-600 underline underline-offset-4"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    </AuthLayout>
  );
}
