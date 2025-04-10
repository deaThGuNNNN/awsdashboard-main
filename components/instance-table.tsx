"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Copy, ExternalLink, MoreHorizontal, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InstanceTableProps {
  data: Record<string, any>[]
  keyField?: string
  searchTerm?: string
  filters: Record<string, string>
  onClearFilters: () => void
}

export default function InstanceTable({ data, keyField = "id", searchTerm = "", filters = {}, onClearFilters }: InstanceTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const [visibleColumns, setVisibleColumns] = useState<string[]>([])

  const router = useRouter()

  // Add state for managing the dialog
  const [selectedInstance, setSelectedInstance] = useState<Record<string, any> | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    if (data.length > 0) {
      const allKeys = Object.keys(data[0]).filter(
        (key) => typeof data[0][key] !== "object" || data[0][key] === null,
      )

      // Create a map of normalized column names to prevent duplicates
      const columnMap = new Map()
      
      // Define priority columns with their normalized names
      const priorityColumnMappings = [
        ["Instance ID", ["Instance ID", "InstanceId"]],
        ["Instance Type", ["Instance Type", "InstanceType"]],
        ["Launch Time", ["Launch Time", "LaunchTime"]],
        ["State", ["State"]],
        ["Name", ["Name"]],
        ["Application", ["Application"]],
        ["Environment", ["Environment"]],
        ["Region", ["Region"]],
        ["AvailabilityZone", ["AvailabilityZone"]],
        ["vCPU", ["vCPU"]],
        ["Memory", ["Memory"]],
        ["Operating System", ["Operating System_y"]],
        ["OnDemand", ["OnDemand"]]
      ]

      // Add priority columns first, using the normalized names
      const priorityColumns = priorityColumnMappings
        .filter(([normalizedName, possibleNames]) => 
          possibleNames.some(name => allKeys.includes(name))
        )
        .map(([normalizedName]) => {
          columnMap.set(normalizedName, true)
          return normalizedName
        })

      // Add remaining columns that aren't already included
      const otherColumns = allKeys
        .filter(key => {
          // Check if this key is already represented by a normalized name
          const isAlreadyIncluded = priorityColumnMappings.some(([_, possibleNames]) => 
            possibleNames.includes(key)
          )
          return !isAlreadyIncluded
        })
        .slice(0, 8) // Limit to 8 additional columns

      setVisibleColumns([...priorityColumns, ...otherColumns])
    }
  }, [data, keyField])

  // Define filterable fields with more AWS-relevant options
  const filterableFields = [
    { key: "State", label: "State" },
    { key: "Instance Type", label: "Instance Type" },
    { key: "Environment", label: "Environment" },
    { key: "Operating System_y", label: "Operating System" },
    { key: "Application", label: "Application" }
  ]

  // Enhanced getUniqueValues to handle transformations
  const getUniqueValues = (field: string) => {
    const values = new Set<string>()
    const fieldConfig = filterableFields.find(f => f.key === field)
    
    data.forEach(item => {
      const value = item[field]
      if (value !== null && value !== undefined && value !== '') {
        if (fieldConfig?.transform) {
          values.add(fieldConfig.transform(value))
        } else {
          values.add(String(value))
        }
      }
    })
    return Array.from(values).sort()
  }

  // Enhanced filtering logic to handle transformed values
  const filteredData = data.filter(item => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || filterValue === 'all') return true
      
      const fieldConfig = filterableFields.find(f => f.key === key)
      const itemValue = item[key]
      
      if (fieldConfig?.transform) {
        return fieldConfig.transform(itemValue) === filterValue
      }
      return String(itemValue) === filterValue
    })
  })

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig

    if (a[key] === null || a[key] === undefined) return direction === "ascending" ? -1 : 1
    if (b[key] === null || b[key] === undefined) return direction === "ascending" ? 1 : -1

    if (typeof a[key] === "string" && typeof b[key] === "string") {
      return direction === "ascending" ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key])
    }

    return direction === "ascending" 
      ? (a[key] < b[key] ? -1 : 1)
      : (a[key] > b[key] ? -1 : 1)
  })

  // Handle filter change
  const handleFilterChange = (field: string, value: string | null) => {
    // This function is now handled by the parent component
  }

  // Clear all filters
  const clearFilters = () => {
    // This function is now handled by the parent component
  }

  // Handle column sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Format cell value for display
  const formatCellValue = (value: any, key: string): React.ReactNode => {
    if (value === null || value === undefined) return "-"

    // Handle boolean values
    if (typeof value === "boolean") {
      return value ? "Yes" : "No"
    }

    // Handle status fields
    if (key === "State" || key === "DBInstanceStatus") {
      const status = String(value).toLowerCase()
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

      if (status === "running" || status === "available") {
        variant = "default"
      } else if (status === "stopped" || status === "stopping") {
        variant = "destructive"
      } else if (status === "pending" || status === "starting") {
        variant = "secondary"
      }

      return <Badge variant={variant}>{value}</Badge>
    }

    // Handle date strings
    if (
      typeof value === "string" &&
      (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) || value.match(/^\d{4}-\d{2}-\d{2}\s\d{1,2}:\d{2}:\d{2}/))
    ) {
      try {
        return new Date(value).toLocaleString()
      } catch (e) {
        return value
      }
    }

    // Handle objects
    if (typeof value === "object") {
      try {
        return (
          <span className="text-xs font-mono">
            {JSON.stringify(value).substring(0, 50)}
            {JSON.stringify(value).length > 50 ? "..." : ""}
          </span>
        )
      } catch (e) {
        return "[Complex Object]"
      }
    }

    return String(value)
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null

    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  // Copy value to clipboard
  const copyToClipboard = (value: any) => {
    if (value === null || value === undefined) return

    const textToCopy = typeof value === "object" ? JSON.stringify(value) : String(value)

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  // Highlight search term in cell text
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm || typeof text !== "string") return text

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"))

    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  // Modify the cell value accessor to handle normalized column names
  const getCellValue = (instance: Record<string, any>, columnName: string): any => {
    switch (columnName) {
      case "Instance ID":
        return instance["Instance ID"] || instance["InstanceId"]
      case "Instance Type":
        return instance["Instance Type"] || instance["InstanceType"]
      case "Launch Time":
        return instance["Launch Time"] || instance["LaunchTime"]
      default:
        return instance[columnName]
    }
  }

  // Add this function to handle viewing details
  const handleViewDetails = (instance: Record<string, any>) => {
    setSelectedInstance(instance)
    setIsDetailsOpen(true)
  }

  // Add this function to format the value for display
  const formatDetailValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  // Add summary statistics
  const getFilterSummary = () => {
    const total = filteredData.length
    const running = filteredData.filter(i => 
      (i.State || '').toLowerCase() === 'running' || 
      (i.DBInstanceStatus || '').toLowerCase() === 'available'
    ).length
    const stopped = filteredData.filter(i => 
      (i.State || '').toLowerCase().includes('stopped') ||
      (i.DBInstanceStatus || '').toLowerCase().includes('stopped')
    ).length

    return { total, running, stopped }
  }

  const summary = getFilterSummary()

  return (
    <div>
      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Instances</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Running</div>
          <div className="text-2xl font-bold text-green-600">{summary.running}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Stopped</div>
          <div className="text-2xl font-bold text-red-600">{summary.stopped}</div>
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">
            {/* If you have a table title, put it here */}
          </div>
          {filters && Object.keys(filters).length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="text-destructive hover:text-destructive"
            >
              Clear all filters ({Object.keys(filters).length})
            </Button>
          )}
        </div>

        <Table className="border-collapse w-full">
          <TableHeader className="bg-gray-50 sticky top-0">
            <TableRow>
              {visibleColumns.map((columnName, index) => (
                <TableHead
                  key={`header-${columnName}-${index}`}
                  className={cn(
                    "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
                    sortConfig?.key === columnName ? "bg-gray-100" : "",
                  )}
                  onClick={() => requestSort(columnName)}
                >
                  <div className="flex items-center">
                    {columnName}
                    {getSortDirectionIndicator(columnName)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="px-4 py-2 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.filter(item => {
              return Object.entries(filters).every(([key, value]) => {
                if (!value || value === 'all') return true
                return String(item[key]) === value
              })
            }).length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-8">
                  <p className="text-gray-500">No instances match the current filters.</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.filter(item => {
                return Object.entries(filters).every(([key, value]) => {
                  if (!value || value === 'all') return true
                  return String(item[key]) === value
                })
              }).map((instance, rowIndex) => (
                <TableRow key={`row-${instance[keyField] || rowIndex}`} className="border-b hover:bg-gray-50">
                  {visibleColumns.map((columnName, colIndex) => (
                    <TableCell 
                      key={`cell-${instance[keyField] || rowIndex}-${columnName}-${colIndex}`} 
                      className="px-4 py-2 text-sm whitespace-nowrap"
                    >
                      {typeof formatCellValue(getCellValue(instance, columnName), columnName) === "string"
                        ? highlightSearchTerm(formatCellValue(getCellValue(instance, columnName), columnName) as string)
                        : formatCellValue(getCellValue(instance, columnName), columnName)}
                    </TableCell>
                  ))}
                  <TableCell className="px-4 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(instance[keyField])}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(instance)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add the Dialog component for instance details */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Instance Details</DialogTitle>
          </DialogHeader>
          {selectedInstance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {Object.entries(selectedInstance)
                .filter(([key, value]) => value !== null && value !== undefined)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <div className="text-sm font-medium text-gray-500">{key}</div>
                    <div className="mt-1 break-words">
                      {typeof value === 'object' ? (
                        <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-sm">{formatDetailValue(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
