"use client"

import { RefreshCw, Settings, Database, Server, BarChart, Table2, DollarSign, Moon, Sun, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/lib/auth-context"
import { UserAvatar } from "@/components/auth/user-avatar"
import { LoginDialog } from "@/components/auth/login-dialog"
import { useState } from "react"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isDark, toggleTheme, mounted } = useTheme()
  const { user, loading } = useAuth()
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

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
          <Link href="/" className={`flex items-center space-x-1 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
            >
              <Table2 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/analytics" className={`flex items-center space-x-1 ${pathname === '/analytics' ? 'text-primary' : 'text-muted-foreground'}`}> 
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
            >
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
          </Link>
          <Link href="/costs" className={`flex items-center space-x-1 ${pathname === '/costs' ? 'text-primary' : 'text-muted-foreground'}`}> 
            <Button
              variant="ghost"
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
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                General Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings/notifications')}>
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings/account')}>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/api')}>
                API Configuration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center space-x-2">
          {mounted && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center space-x-1"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center space-x-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <Avatar className="h-12 w-12 border-2 border-border shadow-md transition-transform hover:scale-105 hover:border-primary">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 mt-2">
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => {
                // Add logout logic here
                console.log('Logout clicked')
              }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
