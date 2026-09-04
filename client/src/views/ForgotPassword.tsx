import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { FormMessage } from "@/components/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export default function ForgotPassword() {
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({
    message: "",
  });
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setStatus({ message: "" });
    try {
      const response = await api.post<ApiResponse>("/auth/forgot-password", {
        email: form.get("email"),
      });
      setStatus({ message: response.message ?? "Bağlantı gönderildi" });
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
      eyebrow="Parola yardımı"
      title="Hesabınıza yeniden ulaşın."
      description="Kayıtlı e-posta adresinize 15 dakika geçerli bir bağlantı göndereceğiz."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <FormMessage
          message={status.message}
          type={status.error ? "error" : "success"}
        />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
        </Button>
        <Link
          to="/login"
          className="block text-center text-sm text-zinc-600 hover:text-zinc-950"
        >
          Girişe dön
        </Link>
      </form>
    </AuthLayout>
  );
}
