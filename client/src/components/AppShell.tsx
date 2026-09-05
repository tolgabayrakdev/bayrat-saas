import { useState, type ComponentType } from "react";
import { Landmark, LayoutGrid, LogOut, Menu, Settings } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type NavigationItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
};

const navigationItems: NavigationItem[] = [
  { label: "Genel bakış", path: "/overview", icon: LayoutGrid },
  { label: "Hesap ayarları", path: "/settings", icon: Settings },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`;

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={navClass}
            onClick={onNavigate}
          >
            <Icon className="size-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function LogoutDialog({ onLogout }: { onLogout: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-zinc-600"
          />
        }
      >
        <LogOut />
        Çıkış yap
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Çıkış yapmak istiyor musunuz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu cihazdaki oturumunuz kapatılacak. Daha sonra tekrar giriş
            yapabilirsiniz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction onClick={onLogout}>Çıkış yap</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AppShell() {
  const { user, endSession } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function logout() {
    setMobileMenuOpen(false);
    try {
      await api.post("/auth/logout");
    } finally {
      endSession();
      navigate("/login", { replace: true });
    }
  }

  const account = (
    <div className="border-t border-zinc-200 pt-5">
      <p className="truncate px-2 text-sm font-medium">{user?.name}</p>
      <p className="truncate px-2 text-xs text-zinc-500">{user?.email}</p>
      <LogoutDialog onLogout={logout} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-[#f7f7f3] p-5 md:flex md:flex-col">
        <div className="flex items-center gap-2 px-2 text-sm font-semibold tracking-tight">
          <Landmark className="size-4 text-emerald-700" />
          BAYRAT
        </div>
        <div className="mt-12">
          <Navigation />
        </div>
        <div className="mt-auto">{account}</div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-[#f7f7f3]/90 px-5 backdrop-blur-md md:hidden">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Landmark className="size-4 text-emerald-700" />
          BAYRAT
        </span>
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu />
            <span className="sr-only">Menüyü aç</span>
          </DialogTrigger>
          <DialogContent
            showCloseButton
            className="left-auto right-0 top-0 flex h-dvh max-w-[20rem] translate-x-0 translate-y-0 flex-col rounded-none p-5"
          >
            <DialogTitle className="flex items-center gap-2 px-2 text-sm font-semibold">
              <Landmark className="size-4 text-emerald-700" />
              BAYRAT
            </DialogTitle>
            <DialogDescription className="sr-only">
              Uygulama menüsü
            </DialogDescription>
            <div className="mt-10">
              <Navigation onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div className="mt-auto">{account}</div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
