"use client"

import { RefreshCw, Settings, Database, Home, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NavbarProps {
  onRefresh: () => void
}

export default function Navbar({ onRefresh }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AWS Dashboard</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="#ec2" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
            <Server className="h-4 w-4" />
            <span>EC2 Instances</span>
          </Link>
          <Link href="#rds" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
            <Database className="h-4 w-4" />
            <span>RDS Instances</span>
          </Link>
          <Link href="#settings" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
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
