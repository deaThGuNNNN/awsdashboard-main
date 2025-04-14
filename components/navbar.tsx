"use client"

import { RefreshCw, Settings, Database, Home, Server, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface NavbarProps {
  onRefresh: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navbar({ onRefresh, activeTab, onTabChange }: NavbarProps) {
  const router = useRouter()

  const handleTabClick = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    onTabChange(tab)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-700'}`}
            onClick={handleTabClick('dashboard')}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 ${activeTab === 'settings' ? 'text-primary' : 'text-gray-700'}`}
            onClick={handleTabClick('settings')}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 ${activeTab === 'analytics' ? 'text-primary' : 'text-gray-700'}`}
            onClick={handleTabClick('analytics')}
          >
            <BarChart className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center space-x-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
