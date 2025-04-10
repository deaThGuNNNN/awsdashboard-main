"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Server, Cloud, Box, Activity } from "lucide-react"

interface AnalyticsProps {
  ec2Data: any[]
  rdsData: any[]
}

export default function Analytics({ ec2Data, rdsData }: AnalyticsProps) {
  // Calculate instance type distribution
  const instanceTypeData = ec2Data.reduce((acc: any, instance) => {
    const type = instance["Instance Type"] || instance.InstanceType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const instanceTypeChartData = Object.entries(instanceTypeData).map(([type, count]) => ({
    name: type,
    value: count
  }))

  // Calculate status distribution
  const statusData = ec2Data.reduce((acc: any, instance) => {
    const status = instance.State || "Unknown"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count
  }))

  // Calculate environment distribution
  const envData = ec2Data.reduce((acc: any, instance) => {
    const env = instance.Environment || "Unspecified"
    acc[env] = (acc[env] || 0) + 1
    return acc
  }, {})

  const envChartData = Object.entries(envData).map(([env, count]) => ({
    name: env,
    value: count
  }))

  // Calculate cost estimates (example calculation)
  const totalInstances = ec2Data.length
  const runningInstances = ec2Data.filter(i => 
    (i.State || '').toLowerCase() === 'running'
  ).length

  // Pie chart colors
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-8">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Server className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Instances</p>
                <h3 className="text-2xl font-bold">{totalInstances}</h3>
                <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                  {runningInstances} running
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Box className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Instance Types</p>
                <h3 className="text-2xl font-bold">{Object.keys(instanceTypeData).length}</h3>
                <p className="text-sm text-green-600/70 dark:text-green-400/70">
                  Different types in use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Cloud className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Environments</p>
                <h3 className="text-2xl font-bold">{Object.keys(envData).length}</h3>
                <p className="text-sm text-orange-600/70 dark:text-orange-400/70">
                  Active environments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Running Rate</p>
                <h3 className="text-2xl font-bold">
                  {Math.round((runningInstances / totalInstances) * 100)}%
                </h3>
                <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                  Utilization rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="text-lg font-medium">Instance Types Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={instanceTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {instanceTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="text-lg font-medium">Instance Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="text-lg font-medium">Environment Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={envChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {envChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="text-lg font-medium">Instance Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Running Instances by Type</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(instanceTypeData).map(([type, count]) => (
                    <Badge 
                      key={type} 
                      variant="secondary"
                      className="px-3 py-1 bg-blue-50 text-blue-600 border-blue-200"
                    >
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Environment Overview</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(envData).map(([env, count]) => (
                    <Badge 
                      key={env} 
                      variant="outline"
                      className="px-3 py-1 bg-green-50 text-green-600 border-green-200"
                    >
                      {env}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 