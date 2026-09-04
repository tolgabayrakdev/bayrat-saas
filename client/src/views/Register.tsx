import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { FormMessage } from "@/components/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export default function Register() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post<ApiResponse>("/auth/register", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });
      setMessage(
        response.message ?? "Hesabınız oluşturuldu. E-postanızı kontrol edin.",
      );
      formElement.reset();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Hesap oluşturulamadı",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Yeni hesap"
      title="Birkaç bilgiyle başlayın."
      description="Hesabınız oluşturulduktan sonra e-posta adresinizi doğrulamanız gerekir."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Ad soyad</Label>
          <Input
            id="name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Parola</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
          />
          <p className="text-xs text-zinc-500">En az 8 karakter.</p>
        </div>
        <FormMessage message={error} />
        <FormMessage message={message} type="success" />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Oluşturuluyor…" : "Hesap oluştur"}
        </Button>
        <p className="text-center text-sm text-zinc-600">
          Zaten hesabınız var mı?{" "}
          <Link
            to="/login"
            className="font-medium text-zinc-950 underline underline-offset-4"
          >
            Giriş yapın
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
