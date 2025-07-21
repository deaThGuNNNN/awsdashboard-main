"use client"

import { RefreshCw, Settings, Database, Server, BarChart, DollarSign, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/lib/auth-context"
import { UserAvatar } from "@/components/auth/user-avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export default function NavbarWithAuth() {
  const pathname = usePathname()
  const { isDark, toggleTheme, mounted } = useTheme()
  const { loading } = useAuth()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
            AWS Dashboard
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              className="flex items-center space-x-1"
            >
              <Database className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              variant={pathname === "/analytics" ? "default" : "ghost"}
              className="flex items-center space-x-1"
            >
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
          </Link>
          <Link href="/costs">
            <Button
              variant={pathname === "/costs" ? "default" : "ghost"}
              className="flex items-center space-x-1"
            >
              <DollarSign className="h-4 w-4" />
              <span>Costs</span>
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-2">
              <DropdownMenuItem>
                <Link href="/settings">General Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </Button>

          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : (
            <UserAvatar />
          )}
        </div>
        

      </div>
    </header>
  )
} 