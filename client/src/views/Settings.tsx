import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/auth/useAuth";
import { FormMessage } from "@/components/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse, User } from "@/types/api";

type Status = { message: string; error?: boolean };
const emptyStatus: Status = { message: "" };

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-8 grid gap-7 border-t border-zinc-200 py-10 lg:grid-cols-[17rem_1fr]"
    >
      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, reloadUser, endSession } = useAuth();
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState<Status>(emptyStatus);
  const [emailStatus, setEmailStatus] = useState<Status>(emptyStatus);
  const [passwordStatus, setPasswordStatus] = useState<Status>(emptyStatus);
  const [deleteStatus, setDeleteStatus] = useState<Status>(emptyStatus);
  const [loading, setLoading] = useState("");

  const errorMessage = (error: unknown) =>
    error instanceof ApiError ? error.message : "İşlem tamamlanamadı";

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading("profile");
    setProfileStatus(emptyStatus);
    try {
      const response = await api.patch<ApiResponse<User>>(
        "/users/me",
        { name: form.get("name") },
        true,
      );
      await reloadUser();
      setProfileStatus({ message: response.message ?? "Profil güncellendi" });
    } catch (error) {
      setProfileStatus({ message: errorMessage(error), error: true });
    } finally {
      setLoading("");
    }
  }

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setLoading("email");
    setEmailStatus(emptyStatus);
    try {
      const response = await api.post<ApiResponse>(
        "/users/me/email-change",
        {
          currentPassword: form.get("currentPassword"),
          newEmail: form.get("newEmail"),
        },
        true,
      );
      setEmailStatus({
        message: response.message ?? "Doğrulama bağlantısı gönderildi",
      });
      formElement.reset();
    } catch (error) {
      setEmailStatus({ message: errorMessage(error), error: true });
    } finally {
      setLoading("");
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading("password");
    setPasswordStatus(emptyStatus);
    try {
      const response = await api.patch<ApiResponse>(
        "/users/me/password",
        {
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        },
        true,
      );
      setPasswordStatus({ message: response.message ?? "Parola güncellendi" });
      endSession();
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (error) {
      setPasswordStatus({ message: errorMessage(error), error: true });
      setLoading("");
    }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("confirmation") !== "SİL") {
      setDeleteStatus({ message: "Devam etmek için SİL yazın", error: true });
      return;
    }
    setLoading("delete");
    setDeleteStatus(emptyStatus);
    try {
      await api.delete<ApiResponse>(
        "/users/me",
        { currentPassword: form.get("currentPassword") },
        true,
      );
      endSession();
      navigate("/login", { replace: true });
    } catch (error) {
      setDeleteStatus({ message: errorMessage(error), error: true });
      setLoading("");
    }
  }

  return (
    <div>
      <header className="pb-10">
        <p className="text-sm text-zinc-500">Kişisel alan</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Hesap ayarları
        </h1>
        <p className="mt-3 max-w-xl text-zinc-600">
          Profilinizi, giriş bilgilerinizi ve hesabınızın güvenliğini yönetin.
        </p>
      </header>

      <SettingsSection
        id="profile"
        title="Profil bilgileri"
        description="Hesabınızda görünen adı buradan değiştirebilirsiniz."
      >
        <form onSubmit={updateProfile} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Ad soyad</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name}
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input value={user?.email ?? ""} disabled />
            <p className="text-xs text-zinc-500">
              E-posta adresi aşağıdaki doğrulama akışıyla değiştirilir.
            </p>
          </div>
          <FormMessage
            message={profileStatus.message}
            type={profileStatus.error ? "error" : "success"}
          />
          <Button type="submit" disabled={loading === "profile"}>
            {loading === "profile" ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection
        id="email"
        title="E-posta değişikliği"
        description="Yeni adresiniz, gönderilen bağlantıyı doğrulayana kadar hesabınıza uygulanmaz."
      >
        <form onSubmit={changeEmail} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newEmail">Yeni e-posta</Label>
            <Input id="newEmail" name="newEmail" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailPassword">Mevcut parola</Label>
            <Input
              id="emailPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <FormMessage
            message={emailStatus.message}
            type={emailStatus.error ? "error" : "success"}
          />
          <Button type="submit" variant="outline" disabled={loading === "email"}>
            {loading === "email"
              ? "Gönderiliyor…"
              : "Doğrulama bağlantısı gönder"}
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection
        id="password"
        title="Parola"
        description="Parola değiştiğinde güvenliğiniz için tüm cihazlardaki oturumlar kapatılır."
      >
        <form onSubmit={changePassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mevcut parola</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni parola</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              maxLength={72}
              required
            />
          </div>
          <FormMessage
            message={passwordStatus.message}
            type={passwordStatus.error ? "error" : "success"}
          />
          <Button type="submit" disabled={loading === "password"}>
            {loading === "password" ? "Güncelleniyor…" : "Parolayı güncelle"}
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection
        id="delete"
        title="Hesabı sil"
        description="Bu işlem geri alınamaz. Profiliniz ve bütün oturumlarınız kalıcı olarak silinir."
      >
        <form onSubmit={deleteAccount} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="deletePassword">Mevcut parola</Label>
            <Input
              id="deletePassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">Onaylamak için SİL yazın</Label>
            <Input
              id="confirmation"
              name="confirmation"
              required
              autoComplete="off"
            />
          </div>
          <FormMessage message={deleteStatus.message} type="error" />
          <Button type="submit" variant="destructive" disabled={loading === "delete"}>
            {loading === "delete" ? "Siliniyor…" : "Hesabı kalıcı olarak sil"}
          </Button>
        </form>
      </SettingsSection>
    </div>
  );
}
