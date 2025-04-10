"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InfoIcon, Loader2, RefreshCw, Search } from "lucide-react"
import Navbar from "@/components/navbar"
import InstanceTable from "@/components/instance-table"
import { mockEC2Data, mockRDSData } from "@/lib/mock-data"

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
  // Initialize data directly from imports
  const [ec2Data] = useState<EC2Instance[]>(mockEC2Data)
  const [rdsData] = useState<RDSInstance[]>(mockRDSData)

  // Initialize filtered data with all data
  const [filteredEC2Data, setFilteredEC2Data] = useState<EC2Instance[]>(mockEC2Data)
  const [filteredRDSData, setFilteredRDSData] = useState<RDSInstance[]>(mockRDSData)

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("ec2")
  const [isLoading, setIsLoading] = useState(false)

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
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onRefresh={handleRefresh} />

      <main className="container mx-auto py-6 px-4 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">AWS Resources Dashboard</h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>Refresh</span>
            </Button>
          </div>
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

        <Tabs defaultValue="ec2" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="ec2">EC2 Instances ({ec2Data.length})</TabsTrigger>
            <TabsTrigger value="rds">RDS Instances ({rdsData.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ec2">
            <Card>
              <CardHeader>
                <CardTitle>EC2 Instances</CardTitle>
                <CardDescription>View and manage your EC2 instances across all regions</CardDescription>
              </CardHeader>
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
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rds">
            <Card>
              <CardHeader>
                <CardTitle>RDS Instances</CardTitle>
                <CardDescription>View and manage your RDS database instances across all regions</CardDescription>
              </CardHeader>
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
                  <InstanceTable data={filteredRDSData} keyField="DBInstanceIdentifier" searchTerm={searchTerm} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
