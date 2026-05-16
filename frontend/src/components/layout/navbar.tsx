"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  FileText, 
  Calendar, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { useAuthStore } from "@/features/auth/store/authStore"
import authAction from "@/services/actions/auth.action"
import { useListNotifications } from "@/services/generated/api"

const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/criteria", label: "Tiêu chí", icon: FileText },
  { href: "/activities", label: "Hoạt động", icon: Calendar },
]

const adminNavItems = [
  { href: "/admin/activities", label: "QL hoạt động", icon: Calendar },
  { href: "/admin/evidences", label: "Duyệt minh chứng", icon: FileText },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuth, user, isInitialized } = useAuthStore();
  const isAuthenticated = isAuth === true;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const notificationsQuery = useListNotifications({
    query: {
      enabled: isInitialized && isAuthenticated,
      retry: false,
      refetchOnWindowFocus: false,
    },
  });
  const unreadNotificationsCount =
    notificationsQuery.data?.data?.filter((notification) => !notification.isRead).length ?? 0;
  const unreadNotificationsLabel =
    unreadNotificationsCount > 99 ? "99+" : String(unreadNotificationsCount);
  const handleLogout = async () => {
    await authAction.logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                5T
              </div>
              <span className="text-lg font-semibold text-foreground hidden sm:block">
                Bản đồ 5 Tốt
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin &&
                adminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isInitialized ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-9 w-20 rounded-md bg-muted/60" />
                <div className="h-9 w-20 rounded-md bg-muted/60" />
              </div>
            ) : !isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                      {unreadNotificationsLabel}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-primary/20">
                    {user?.displayName?.charAt(0) || (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user?.displayName}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Đăng xuất"
                >
                  <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
                </Button>
              </div>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin &&
                adminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              {!isInitialized ? null : !isAuthenticated ? (
                <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                  <Link
                    href="/login"
                    className="flex-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full" size="sm">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-border flex flex-col gap-2">
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Thông báo</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-medium text-destructive-foreground">
                        {unreadNotificationsLabel}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Trang cá nhân ({user?.displayName})</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
