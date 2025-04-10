"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { Badge } from "@/components/ui/badge"

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
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstances}</div>
            <p className="text-xs text-muted-foreground">
              {runningInstances} running instances
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Instance Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(instanceTypeData).length}</div>
            <p className="text-xs text-muted-foreground">
              Different instance types in use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Environments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(envData).length}</div>
            <p className="text-xs text-muted-foreground">
              Active environments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Instance Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={instanceTypeChartData}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {instanceTypeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={400} height={300} data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={envChartData}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {envChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Running Instances by Type</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(instanceTypeData).map(([type, count]) => (
                    <Badge key={type} variant="secondary">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Environment Overview</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(envData).map(([env, count]) => (
                    <Badge key={env} variant="outline">
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