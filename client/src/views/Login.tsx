import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { FormMessage } from "@/components/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/useAuth";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse, Session } from "@/types/api";

export default function Login() {
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    setUnverifiedEmail("");
    try {
      const response = await api.post<ApiResponse<Session>>("/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
      });
      startSession(response.data);
      navigate("/overview", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(String(form.get("email") ?? ""));
      }
      setError(
        caught instanceof ApiError ? caught.message : "Giriş yapılamadı",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Tekrar hoş geldiniz"
      title="Hesabınıza giriş yapın."
      description="Hesabınızı ve güvenlik ayarlarınızı tek bir sade alandan yönetin."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="siz@example.com"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Parola</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Parolamı unuttum
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <FormMessage message={error} />
        {unverifiedEmail && (
          <Link
            to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className="inline-block text-sm font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
          >
            Doğrulama e-postasını tekrar gönder
          </Link>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          <ArrowRight />
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link
            to="/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Hesap oluşturun
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
