import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { FormMessage } from "@/components/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({
    message: token ? "" : "Sıfırlama token'ı bulunamadı",
    error: !token,
  });
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setStatus({ message: "" });
    try {
      const response = await api.post<ApiResponse>("/auth/reset-password", {
        token,
        newPassword: form.get("newPassword"),
      });
      setStatus({ message: response.message ?? "Parolanız sıfırlandı" });
    } catch (caught) {
      setStatus({
        message:
          caught instanceof ApiError ? caught.message : "Parola sıfırlanamadı",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout
      eyebrow="Yeni parola"
      title="Yeni bir parola belirleyin."
      description="Daha önce kullanmadığınız, güçlü bir parola seçin."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Yeni parola</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            maxLength={72}
            required
            disabled={!token}
          />
        </div>
        <FormMessage
          message={status.message}
          type={status.error ? "error" : "success"}
        />
        <Button type="submit" className="w-full" size="lg" disabled={loading || !token}>
          {loading ? "Güncelleniyor…" : "Parolayı güncelle"}
        </Button>
        <Link
          to="/login"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Girişe dön
        </Link>
      </form>
    </AuthLayout>
  );
}
