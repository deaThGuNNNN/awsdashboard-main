"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InfoIcon, Loader2, RefreshCw, Search, Filter } from "lucide-react"
import Navbar from "@/components/navbar"
import InstanceTable from "@/components/instance-table"
import { mockEC2Data, mockRDSData } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Analytics from "@/components/analytics"

// Define types for our data
interface EC2Instance {
  "Instance ID"?: string
  InstanceId?: string
  "Instance Type"?: string
  InstanceType?: string
  State?: string
  "Launch Time"?: string
  LaunchTime?: string
  Name?: string
  Application?: string
  Environment?: string
  Region?: string
  AvailabilityZone?: string
  [key: string]: any
}

interface RDSInstance {
  DBInstanceIdentifier: string
  DBInstanceClass: string
  Engine: string
  EngineVersion: string
  DBInstanceStatus: string
  MasterUsername: string
  AllocatedStorage: number
  Region: string
  AvailabilityZone: string
  [key: string]: any
}

export default function Home() {
  // Add filters state
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [ec2Data] = useState<EC2Instance[]>(mockEC2Data)
  const [rdsData] = useState<RDSInstance[]>(mockRDSData)
  const [filteredEC2Data, setFilteredEC2Data] = useState<EC2Instance[]>(mockEC2Data)
  const [filteredRDSData, setFilteredRDSData] = useState<RDSInstance[]>(mockRDSData)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("ec2")
  const [isLoading, setIsLoading] = useState(false)

  // Add filter related functions
  const filterableFields = [
    { key: "State", label: "State" },
    { key: "Instance Type", label: "Instance Type" },
    { key: "Environment", label: "Environment" },
    { key: "Operating System_y", label: "Operating System" },
    { key: "Application", label: "Application" }
  ]

  const handleFilterChange = (field: string, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }))
  }

  const clearFilters = useCallback(() => {
    setFilters({})
    setFilteredEC2Data(ec2Data)
    setFilteredRDSData(rdsData)
  }, [ec2Data, rdsData])

  // Get unique values for filterable fields
  const getUniqueValues = (field: string) => {
    const values = new Set<string>()
    const allData = [...ec2Data, ...rdsData]
    allData.forEach(item => {
      const value = item[field]
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value))
      }
    })
    return Array.from(values).sort()
  }

  // Filter function for searching
  const filterData = useCallback(
    (term: string) => {
      if (term.trim() === "") {
        setFilteredEC2Data(ec2Data)
        setFilteredRDSData(rdsData)
        return
      }

      const searchTermLower = term.toLowerCase()

      // Helper function to check if a value matches the search term
      const matchesSearchTerm = (value: any): boolean => {
        if (value === null || value === undefined) return false

        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTermLower)
        }

        if (typeof value === "number" || typeof value === "boolean") {
          return String(value).toLowerCase().includes(searchTermLower)
        }

        if (typeof value === "object") {
          if (Array.isArray(value)) {
            return value.some((item) => matchesSearchTerm(item))
          }
          return Object.values(value).some((v) => matchesSearchTerm(v))
        }

        return false
      }

      // Filter EC2 data
      setFilteredEC2Data(
        ec2Data.filter((instance) => Object.values(instance).some((value) => matchesSearchTerm(value))),
      )

      // Filter RDS data
      setFilteredRDSData(
        rdsData.filter((instance) => Object.values(instance).some((value) => matchesSearchTerm(value))),
      )
    },
    [ec2Data, rdsData],
  )

  // Handle search
  const handleSearch = () => {
    filterData(searchTerm)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)

    // Auto-search after a short delay if the search term is long enough
    if (newSearchTerm.length >= 3 || newSearchTerm.length === 0) {
      const debounceTimer = setTimeout(() => {
        filterData(newSearchTerm)
      }, 300)

      return () => clearTimeout(debounceTimer)
    }
  }

  // Handle search on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Refresh data - simulate a refresh with a loading state
  const handleRefresh = () => {
    setIsLoading(true)

    // Simulate a refresh delay
    setTimeout(() => {
      // Reset filtered data to show all data
      setFilteredEC2Data(ec2Data)
      setFilteredRDSData(rdsData)
      setSearchTerm("")
      setIsLoading(false)
    }, 500)
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update the tabs component value
    if (tab === 'ec2' || tab === 'rds') {
      // Only update if it's one of the main tabs
      setCurrentTab(tab)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        onRefresh={handleRefresh} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="container mx-auto py-6 px-4 flex-grow">
        {activeTab === 'analytics' ? (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Analyze your AWS resources usage and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <Analytics ec2Data={ec2Data} rdsData={rdsData} />
            </CardContent>
          </Card>
        ) : activeTab === 'settings' ? (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your Dashboard settings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add settings content here */}
              <div className="text-gray-500">Settings page coming soon...</div>
            </CardContent>
          </Card>
        ) : activeTab === 'dashboard' ? (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>View your AWS resources at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add dashboard content here */}
              <div className="text-gray-500">Dashboard overview coming soon...</div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl font-bold">Instances Dashboard</h1>
            </div>

            <div className="mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search instances..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="ec2">EC2 Instances ({ec2Data.length})</TabsTrigger>
                <TabsTrigger value="rds">RDS Instances ({rdsData.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="ec2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>EC2 Instances</CardTitle>
                      <CardDescription>View and manage your EC2 instances across all regions</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Filters
                          {Object.keys(filters || {}).length > 0 && (
                            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-white">
                              {Object.keys(filters || {}).length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {filterableFields.map(({ key, label }) => (
                          <DropdownMenuItem key={key} className="flex flex-col items-start p-2">
                            <div className="font-medium mb-1">{label}</div>
                            <Select
                              value={filters?.[key] || null}
                              onValueChange={(value) => handleFilterChange(key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getUniqueValues(key).map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-center justify-center text-destructive"
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  {filters && Object.keys(filters).length > 0 && (
                    <div className="px-6 py-2 border-b">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([field, value]) => value && value !== 'all' && (
                          <div key={field} className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            <span>{field}: {value}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleFilterChange(field, null)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading EC2 instances...</span>
                      </div>
                    ) : filteredEC2Data.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No EC2 instances found matching your search criteria.</p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setSearchTerm("")
                              setFilteredEC2Data(ec2Data)
                            }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    ) : (
                      <InstanceTable 
                        data={filteredEC2Data.map(instance => ({
                          ...instance,
                          // Normalize the field names to use consistent keys
                          "Instance ID": instance["Instance ID"] || instance["InstanceId"],
                          "Instance Type": instance["Instance Type"] || instance["InstanceType"],
                          "Launch Time": instance["Launch Time"] || instance["LaunchTime"],
                        }))} 
                        keyField="Instance ID" 
                        searchTerm={searchTerm}
                        filters={filters}
                        onClearFilters={clearFilters}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rds">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>RDS Instances</CardTitle>
                      <CardDescription>View and manage your RDS database instances across all regions</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Filters
                          {Object.keys(filters || {}).length > 0 && (
                            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-white">
                              {Object.keys(filters || {}).length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {filterableFields.map(({ key, label }) => (
                          <DropdownMenuItem key={key} className="flex flex-col items-start p-2">
                            <div className="font-medium mb-1">{label}</div>
                            <Select
                              value={filters?.[key] || null}
                              onValueChange={(value) => handleFilterChange(key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getUniqueValues(key).map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-center justify-center text-destructive"
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  {filters && Object.keys(filters).length > 0 && (
                    <div className="px-6 py-2 border-b">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([field, value]) => value && value !== 'all' && (
                          <div key={field} className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            <span>{field}: {value}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleFilterChange(field, null)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading RDS instances...</span>
                      </div>
                    ) : filteredRDSData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No RDS instances found matching your search criteria.</p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setSearchTerm("")
                              setFilteredRDSData(rdsData)
                            }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    ) : (
                      <InstanceTable 
                        data={filteredRDSData} 
                        keyField="DBInstanceIdentifier" 
                        searchTerm={searchTerm}
                        filters={filters}
                        onClearFilters={clearFilters}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
