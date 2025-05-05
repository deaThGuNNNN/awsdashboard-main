"use client"

import type React from "react"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
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
import { ChevronDown, ChevronUp, Copy, ExternalLink, MoreHorizontal, Filter, Download } from "lucide-react"
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

export interface InstanceTableRef {
  exportToCSV: () => void;
  exportToJSON: () => void;
}

interface InstanceTableProps {
  data: Record<string, any>[]
  keyField?: string
  searchTerm?: string
  filters: Record<string, string>
  onClearFilters: () => void
}

const InstanceTable = forwardRef<InstanceTableRef, InstanceTableProps>(({ data, keyField = "id", searchTerm = "", filters = {}, onClearFilters }, ref) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const [visibleColumns, setVisibleColumns] = useState<string[]>([])

  const router = useRouter()

  // Add state for managing the dialog
  const [selectedInstance, setSelectedInstance] = useState<Record<string, any> | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [isDrawing, setIsDrawing] = useState(false);

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

  // Handle drawing state
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        setIsDrawing(true);
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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

  // Add export functions
  const exportToCSV = () => {
    if (data.length === 0) return;
    
    // Get headers from the first item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      // Headers row
      headers.join(','),
      // Data rows
      ...data.map(item => 
        headers.map(header => {
          const value = item[header];
          // Handle special characters and commas in values
          return typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `instances_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (data.length === 0) return;
    
    // Create JSON content
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Create and trigger download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `instances_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Expose export functions through ref
  useImperativeHandle(ref, () => ({
    exportToCSV,
    exportToJSON
  }));

  return (
    <div className="table-container">
      {isDrawing && <div className="drawing-overlay" />}
      
      <div className="table-content">
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
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              {/* If you have a table title, put it here */}
            </div>
            <div className="flex gap-2">
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
          </div>

          <div className="border rounded-lg">
            <div className="relative h-[600px] flex flex-col">
              {/* Fixed Header */}
              <div className="w-full">
                <div className="min-w-full divide-y divide-gray-200">
                  <div className="bg-white">
                    <div className="flex">
                      {visibleColumns.map((columnName, index) => (
                        <div
                          key={`header-${columnName}-${index}`}
                          className={cn(
                            "border-b border-gray-200 bg-white bg-opacity-100 px-4 py-3 text-left text-sm font-semibold text-gray-900",
                            sortConfig?.key === columnName ? "bg-gray-50" : ""
                          )}
                          style={{ minWidth: columnName === "Instance ID" ? "200px" : "150px", flex: 1 }}
                          onClick={() => requestSort(columnName)}
                        >
                          <div className="flex items-center gap-2">
                            <span>{columnName}</span>
                            {getSortDirectionIndicator(columnName)}
                          </div>
                        </div>
                      ))}
                      <div
                        className="border-b border-gray-200 bg-white bg-opacity-100 px-4 py-3 text-right text-sm font-semibold text-gray-900"
                        style={{ width: "100px" }}
                      >
                        <span className="sr-only">Actions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-auto scroll-container">
                <div className="min-w-full divide-y divide-gray-200">
                  <div className="divide-y divide-gray-200 bg-white">
                    {sortedData.filter(item => {
                      return Object.entries(filters).every(([key, value]) => {
                        if (!value || value === 'all') return true
                        return String(item[key]) === value
                      })
                    }).length === 0 ? (
                      <div className="table-cell px-4 py-4 text-center text-sm text-gray-500">
                        <p>No instances match the current filters.</p>
                      </div>
                    ) : (
                      sortedData
                        .filter(item => {
                          return Object.entries(filters).every(([key, value]) => {
                            if (!value || value === 'all') return true
                            return String(item[key]) === value
                          })
                        })
                        .map((instance, rowIndex) => (
                          <div 
                            key={`row-${instance[keyField] || rowIndex}`}
                            className="flex hover:bg-gray-50"
                          >
                            {visibleColumns.map((columnName, colIndex) => (
                              <div
                                key={`cell-${instance[keyField] || rowIndex}-${columnName}-${colIndex}`}
                                className="table-cell whitespace-nowrap px-4 py-2 text-sm text-gray-900"
                                style={{ minWidth: columnName === "Instance ID" ? "200px" : "150px", flex: 1 }}
                              >
                                {typeof formatCellValue(getCellValue(instance, columnName), columnName) === "string"
                                  ? highlightSearchTerm(formatCellValue(getCellValue(instance, columnName), columnName) as string)
                                  : formatCellValue(getCellValue(instance, columnName), columnName)}
                              </div>
                            ))}
                            <div className="whitespace-nowrap px-4 py-2 text-right text-sm" style={{ width: "100px" }}>
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
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="w-full">
                <div className="min-w-full divide-y divide-gray-200">
                  <div className="bg-gray-50">
                    <div className="flex">
                      {visibleColumns.map((columnName, index) => {
                        const sum = sortedData.reduce((acc, item) => {
                          const value = getCellValue(item, columnName);
                          if (typeof value === 'number') {
                            return acc + value;
                          }
                          if (typeof value === 'string') {
                            const numericValue = parseFloat(value);
                            if (!isNaN(numericValue)) {
                              return acc + numericValue;
                            }
                          }
                          return acc;
                        }, 0);

                        const shouldShowSum = sortedData.some(item => {
                          const value = getCellValue(item, columnName);
                          return typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)));
                        });

                        return (
                          <div
                            key={`footer-${columnName}-${index}`}
                            className="table-cell border-t border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap"
                            style={{ minWidth: columnName === "Instance ID" ? "200px" : "150px", flex: 1 }}
                          >
                            {shouldShowSum ? (
                              <span className="font-semibold">
                                Total: {sum.toLocaleString()}
                              </span>
                            ) : columnName === "State" ? (
                              <span className="font-semibold">
                                Total Rows: {sortedData.length}
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                      <div className="table-cell border-t border-gray-200 px-4 py-3 text-right" style={{ width: "100px" }}>
                        {/* Empty cell for actions column */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
})

InstanceTable.displayName = "InstanceTable"

export default InstanceTable
