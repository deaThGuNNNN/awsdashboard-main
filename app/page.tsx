"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InfoIcon, Loader2, RefreshCw, Search, Filter, Download, ArrowLeft, ArrowUpDown } from "lucide-react"
import Navbar from "@/components/navbar"
import InstanceTable, { InstanceTableRef } from "@/components/instance-table"
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
interface BaseEC2Instance {
  [key: string]: any
  "Instance ID"?: string
  "Instance Type"?: string
  State?: string
  "Launch Time"?: string
  InstanceId?: string
  InstanceType?: string
  LaunchTime?: string
}

interface EC2Instance {
  "Instance ID": string
  "Instance Type": string
  State: string
  "Launch Time": string
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

// Define props for Navbar and Analytics components
interface NavbarProps {
  isTableView: boolean
  setIsTableView: (value: boolean) => void
  isEC2View: boolean
  setIsEC2View: (value: boolean) => void
  isRDSView: boolean
  setIsRDSView: (value: boolean) => void
}

interface AnalyticsProps {
  isTableView: boolean
  isEC2View: boolean
  isRDSView: boolean
}

export default function Home() {
  // Add filters state
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [ec2Data] = useState<EC2Instance[]>(mockEC2Data.map((instance: BaseEC2Instance) => {
    const normalized: EC2Instance = {
      "Instance ID": instance["Instance ID"] || instance["InstanceId"] || "",
      "Instance Type": instance["Instance Type"] || instance["InstanceType"] || "",
      "State": instance.State || "",
      "Launch Time": instance["Launch Time"] || instance["LaunchTime"] || "",
      ...Object.entries(instance)
        .filter(([key]) => !["Instance ID", "Instance Type", "State", "Launch Time", "InstanceId", "InstanceType", "LaunchTime"].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    }
    return normalized
  }))
  const [rdsData] = useState<RDSInstance[]>(mockRDSData)
  const [filteredEC2Data, setFilteredEC2Data] = useState<EC2Instance[]>(ec2Data)
  const [filteredRDSData, setFilteredRDSData] = useState<RDSInstance[]>(rdsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("ec2")
  const [isLoading, setIsLoading] = useState(false)
  const [isTableView, setIsTableView] = useState(true)
  const [isEC2View, setIsEC2View] = useState(true)
  const [isRDSView, setIsRDSView] = useState(true)

  // Add refs for table export functionality
  const ec2TableRef = useRef<InstanceTableRef>(null);
  const rdsTableRef = useRef<InstanceTableRef>(null);

  // Add filter related functions
  const filterableFields = [
    // EC2 Instance Fields
    { key: "Instance ID", label: "Instance ID", type: "ec2" },
    { key: "Instance Type", label: "Instance Type", type: "ec2" },
    { key: "State", label: "State", type: "ec2" },
    { key: "Name", label: "Name", type: "ec2" },
    { key: "Application", label: "Application", type: "ec2" },
    { key: "Environment", label: "Environment", type: "ec2" },
    { key: "Region", label: "Region", type: "ec2" },
    { key: "AvailabilityZone", label: "Availability Zone", type: "ec2" },
    { key: "Operating System_y", label: "Operating System", type: "ec2" },
    { key: "Platform", label: "Platform", type: "ec2" },
    { key: "Private IP", label: "Private IP", type: "ec2" },
    { key: "Public IP", label: "Public IP", type: "ec2" },
    { key: "Launch Time", label: "Launch Time", type: "ec2" },
    
    // RDS Instance Fields
    { key: "DBInstanceIdentifier", label: "DB Instance ID", type: "rds" },
    { key: "DBInstanceClass", label: "DB Instance Class", type: "rds" },
    { key: "Engine", label: "Engine", type: "rds" },
    { key: "EngineVersion", label: "Engine Version", type: "rds" },
    { key: "DBInstanceStatus", label: "Status", type: "rds" },
    { key: "MasterUsername", label: "Master Username", type: "rds" },
    { key: "AllocatedStorage", label: "Allocated Storage", type: "rds" },
    { key: "Region", label: "Region", type: "rds" },
    { key: "AvailabilityZone", label: "Availability Zone", type: "rds" }
  ]

  // Add sorting options
  const sortOptions = [
    { key: "name_asc", label: "Name (A-Z)" },
    { key: "name_desc", label: "Name (Z-A)" },
    { key: "type_asc", label: "Type (A-Z)" },
    { key: "type_desc", label: "Type (Z-A)" },
    { key: "state_asc", label: "State (A-Z)" },
    { key: "state_desc", label: "State (Z-A)" },
    { key: "launch_time_asc", label: "Launch Time (Oldest)" },
    { key: "launch_time_desc", label: "Launch Time (Newest)" }
  ]

  const [sortBy, setSortBy] = useState("name_asc")

  // Enhanced filter change handler
  const handleFilterChange = (field: string, value: string | null) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if (value && value !== 'all') {
        newFilters[field] = value
      } else {
        delete newFilters[field]
      }
      return newFilters
    })
  }

  // Add sorting handler
  const handleSortChange = (value: string) => {
    setSortBy(value)
    const [field, direction] = value.split('_')
    
    const sortData = (data: any[]) => {
      return [...data].sort((a, b) => {
        let aValue = a[field] || ''
        let bValue = b[field] || ''
        
        if (field === 'launch_time') {
          aValue = new Date(a['Launch Time'] || a['LaunchTime'] || 0).getTime()
          bValue = new Date(b['Launch Time'] || b['LaunchTime'] || 0).getTime()
        }
        
        if (direction === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    setFilteredEC2Data(sortData(filteredEC2Data))
    setFilteredRDSData(sortData(filteredRDSData))
  }

  // Enhanced getUniqueValues function
  const getUniqueValues = (field: string, type: string) => {
    const values = new Set<string>()
    const data = type === 'ec2' ? ec2Data : rdsData
    
    data.forEach(item => {
      const value = item[field]
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value))
      }
    })
    
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }

  // Update the filter UI in both EC2 and RDS card headers
  const renderFilterAndSortButtons = (type: 'ec2' | 'rds') => (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="max-h-[400px] overflow-y-auto">
            {filterableFields
              .filter(field => field.type === type)
              .map(field => (
                <div key={field.key} className="p-2">
                  <div className="text-sm font-medium mb-2">{field.label}</div>
                  <Select
                    value={filters[field.key] || ''}
                    onValueChange={(value) => handleFilterChange(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Search..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="relative">
                        <input
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Type to search..."
                          onChange={(e) => {
                            const searchValue = e.target.value.toLowerCase();
                            // Update the select options
                            const options = e.currentTarget.parentElement?.querySelectorAll('[role="option"]');
                            options?.forEach((option) => {
                              if (option instanceof HTMLElement) {
                                const optionValue = option.getAttribute('data-value')?.toLowerCase() || '';
                                option.style.display = optionValue.includes(searchValue) ? '' : 'none';
                              }
                            });
                          }}
                        />
                      </div>
                      {getUniqueValues(field.key, type).map(value => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
          </div>
          
          {Object.keys(filters).length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFilters({})
                    if (type === 'ec2') {
                      setFilteredEC2Data(ec2Data)
                    } else {
                      setFilteredRDSData(rdsData)
                    }
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map(option => (
            <DropdownMenuItem
              key={option.key}
              className={sortBy === option.key ? "bg-accent" : ""}
              onClick={() => handleSortChange(option.key)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => type === 'ec2' ? ec2TableRef.current?.exportToCSV() : rdsTableRef.current?.exportToCSV()}>
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => type === 'ec2' ? ec2TableRef.current?.exportToJSON() : rdsTableRef.current?.exportToJSON()}>
            Export to JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  // Filter function for searching
  const filterData = useCallback(
    (term: string) => {
      const searchTermLower = term.toLowerCase()

      // Helper function to check if a value matches the search term
      const matchesSearchTerm = (value: any): boolean => {
        if (value === null || value === undefined) return false
        if (typeof value === "string") return value.toLowerCase().includes(searchTermLower)
        if (typeof value === "number" || typeof value === "boolean") return String(value).toLowerCase().includes(searchTermLower)
        if (typeof value === "object") {
          if (Array.isArray(value)) return value.some(item => matchesSearchTerm(item))
          return Object.values(value).some(v => matchesSearchTerm(v))
        }
        return false
      }

      setFilteredEC2Data(term.trim() === "" ? ec2Data : 
        ec2Data.filter(instance => Object.values(instance).some(value => matchesSearchTerm(value)))
      )

      setFilteredRDSData(term.trim() === "" ? rdsData :
        rdsData.filter(instance => Object.values(instance).some(value => matchesSearchTerm(value)))
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
      // setCurrentTab(tab) - This line is causing the error as setCurrentTab is not defined
    }
  }

  // Add export handlers
  const handleEC2Export = () => {
    ec2TableRef.current?.exportToCSV();
  };

  const handleRDSExport = () => {
    rdsTableRef.current?.exportToCSV();
  };

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
                <TabsTrigger value="ec2">EC2 Instances ({filteredEC2Data.length})</TabsTrigger>
                <TabsTrigger value="rds">RDS Instances ({filteredRDSData.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="ec2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>EC2 Instances</CardTitle>
                      <CardDescription>View and manage your EC2 instances across all regions</CardDescription>
                    </div>
                    <div className="flex gap-2">
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
                            onClick={() => {
                              setFilters({})
                              setFilteredEC2Data(ec2Data)
                            }}
                          >
                            Clear all filters
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => ec2TableRef.current?.exportToCSV()}>
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => ec2TableRef.current?.exportToJSON()}>
                            Export as JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                      <div className="h-[calc(100vh-300px)] overflow-auto">
                        <InstanceTable 
                          ref={ec2TableRef}
                          data={filteredEC2Data.map(instance => ({
                            ...instance,
                            "Instance ID": instance["Instance ID"] || instance["InstanceId"],
                            "Instance Type": instance["Instance Type"] || instance["InstanceType"],
                            "Launch Time": instance["Launch Time"] || instance["LaunchTime"],
                          }))} 
                          keyField="Instance ID" 
                          searchTerm={searchTerm}
                          filters={filters}
                          onClearFilters={() => {
                            setFilters({})
                            setFilteredEC2Data(ec2Data)
                          }}
                        />
                      </div>
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
                    <div className="flex gap-2">
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
                            onClick={() => {
                              setFilters({})
                              setFilteredRDSData(rdsData)
                            }}
                          >
                            Clear all filters
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => rdsTableRef.current?.exportToCSV()}>
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => rdsTableRef.current?.exportToJSON()}>
                            Export as JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                      <div className="h-[calc(100vh-300px)] overflow-auto">
                        <InstanceTable 
                          ref={rdsTableRef}
                          data={filteredRDSData} 
                          keyField="DBInstanceIdentifier" 
                          searchTerm={searchTerm}
                          filters={filters}
                          onClearFilters={() => {
                            setFilters({})
                            setFilteredRDSData(rdsData)
                          }}
                        />
                      </div>
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
