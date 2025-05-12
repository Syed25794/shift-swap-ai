"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCcw,
  Settings,
  UserCircle,
  Users,
  X,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isLoading, isManager } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.push("/login")
    }
  }, [isMounted, isLoading, user, router])

  if (!isMounted || isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r md:block">
            <div className="flex h-full flex-col gap-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>
          <main className="flex-1 p-4">
            <div className="grid gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Import Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
      current: pathname === "/dashboard/schedule",
    },
    {
      name: "Swap Requests",
      href: "/dashboard/swap-requests",
      icon: RefreshCcw,
      current: pathname === "/dashboard/swap-requests",
    },
    {
      name: "Open Swaps",
      href: "/dashboard/open-swaps",
      icon: Clock,
      current: pathname === "/dashboard/open-swaps",
    },
  ]

  const managerNavigation = [
    {
      name: "Approvals",
      href: "/dashboard/approvals",
      icon: Users,
      current: pathname === "/dashboard/approvals",
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="font-bold">ShiftSwap</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="font-bold">ShiftSwap</span>
                  </Link>
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                        item.current ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                  {isManager && (
                    <>
                      <div className="my-2 border-t" />
                      <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Manager</p>
                      {managerNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                            item.current ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      ))}
                    </>
                  )}
                  <div className="my-2 border-t" />
                  <button
                    onClick={() => {
                      setIsMobileOpen(false)
                      logout()
                    }}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-muted"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <nav className="flex h-full flex-col gap-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  item.current ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            {isManager && (
              <>
                <div className="my-2 border-t" />
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Manager</p>
                {managerNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                      item.current ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}
            <div className="mt-auto">
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === "/dashboard/profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <UserCircle className="h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-muted"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
