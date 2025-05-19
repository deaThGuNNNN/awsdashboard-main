"use client"

import { RefreshCw, Settings, Database, Server, BarChart, Table2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface NavbarProps {
  isTableView: boolean
  setIsTableView: (value: boolean) => void
  isEC2View: boolean
  setIsEC2View: (value: boolean) => void
  isRDSView: boolean
  setIsRDSView: (value: boolean) => void
}

export default function Navbar({
  isTableView,
  setIsTableView,
  isEC2View,
  setIsEC2View,
  isRDSView,
  setIsRDSView
}: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabClick = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    switch (tab) {
      case 'analytics':
        setIsTableView(false)
        setIsEC2View(false)
        setIsRDSView(false)
        break;
      case 'dashboard':
        setIsTableView(true)
        setIsEC2View(true)
        setIsRDSView(true)
        break;
      case 'settings':
        setIsTableView(false)
        setIsEC2View(true)
        setIsRDSView(true)
        break;
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AWS Dashboard</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 ${
              isTableView ? 'text-primary' : 'text-gray-700'
            }`}
            onClick={handleTabClick('dashboard')}
          >
            <Table2 className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Link href="/analytics" className={`flex items-center space-x-1 ${pathname === '/analytics' ? 'text-primary' : 'text-gray-700'}`}> 
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
            >
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 ${
              !isTableView && isEC2View && isRDSView ? 'text-primary' : 'text-gray-700'
            }`}
            onClick={handleTabClick('settings')}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Link href="/costs" className={`flex items-center space-x-1 ${pathname === '/costs' ? 'text-primary' : 'text-gray-700'}`}> 
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
            >
              <DollarSign className="h-4 w-4" />
              <span>Costs</span>
            </Button>
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center space-x-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
