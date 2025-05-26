"use client"

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts"
import { Badge } from "@/components/ui/badge"
import { BarChart as BarChartIcon, Server, Cloud, Box, Activity, Filter, ChevronDown } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { Button } from './ui/button'

interface AnalyticsProps {
  isTableView: boolean
  isEC2View: boolean
  isRDSView: boolean
}

interface ChartData {
  labels: string[]
  values: number[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e42", "#a78bfa", "#f43f5e", "#fbbf24", "#6366f1", "#14b8a6", "#f472b6", "#facc15"];

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function Analytics({
  isTableView,
  isEC2View,
  isRDSView
}: AnalyticsProps) {
  // Load real data from public/data
  const [ec2Data, setEc2Data] = useState<any[]>([])
  const [rdsData, setRdsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [envFilter, setEnvFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [durationRange, setDurationRange] = useState<{min: string, max: string}>({min: '', max: ''});
  const [sortBy, setSortBy] = useState<'cost' | 'duration'>('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/data/EC2_Merged.json").then(res => res.json()),
      fetch("/data/RDS_Merged.json").then(res => res.json())
    ]).then(([ec2, rds]) => {
      setEc2Data(ec2)
      setRdsData(rds)
      setLoading(false)
    })
  }, [])

  // Filtering logic
  const filteredEC2 = useMemo(() => {
    return ec2Data.filter(i => {
      const envOk = envFilter.length === 0 || envFilter.includes(i.Environment || "Unspecified");
      const stateOk = stateFilter.length === 0 || stateFilter.includes(i.State || "Unknown");
      const typeOk = typeFilter.length === 0 || typeFilter.includes(i["Instance Type"] || i.InstanceType || "Unknown");
      // Date range filter
      const launch = new Date(i["Launch Time"] || i.LaunchTime);
      let dateOk = true;
      if (dateRange.start) dateOk = dateOk && launch >= new Date(dateRange.start);
      if (dateRange.end) dateOk = dateOk && launch <= new Date(dateRange.end);
      // Duration filter
      const now = new Date();
      const duration = Math.floor((now.getTime() - launch.getTime()) / (1000*60*60*24));
      let durationOk = true;
      if (durationRange.min) durationOk = durationOk && duration >= parseInt(durationRange.min);
      if (durationRange.max) durationOk = durationOk && duration <= parseInt(durationRange.max);
      return envOk && stateOk && typeOk && dateOk && durationOk;
    });
  }, [ec2Data, envFilter, stateFilter, typeFilter, dateRange, durationRange]);

  // Helper: get unique values for filters
  const allEnvs = useMemo(() => unique(ec2Data.map(i => i.Environment || "Unspecified")), [ec2Data]);
  const allStates = useMemo(() => unique(ec2Data.map(i => i.State || "Unknown")), [ec2Data]);
  const allTypes = useMemo(() => unique(ec2Data.map(i => i["Instance Type"] || i.InstanceType || "Unknown")), [ec2Data]);

  if (loading) {
    return <div className="p-8 text-center text-lg text-gray-500">Loading analytics...</div>
  }

  // --- Analytics/Chart Data ---
  // Instance Type Distribution
  const getInstanceTypeData = (): ChartData => {
    const distribution = filteredEC2.reduce((acc: Record<string, number>, instance) => {
      const type = instance["Instance Type"] || instance.InstanceType || "Unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    return { labels: Object.keys(distribution), values: Object.values(distribution) }
  }
  // State Distribution
  const getStateData = (): ChartData => {
    const distribution = filteredEC2.reduce((acc: Record<string, number>, instance) => {
      const state = instance.State || "Unknown"
      acc[state] = (acc[state] || 0) + 1
      return acc
    }, {})
    return { labels: Object.keys(distribution), values: Object.values(distribution) }
  }
  // Cost by Environment (OnDemand/Reserved)
  const getCostByEnv = () => {
    const envs = unique(filteredEC2.map(i => i.Environment || "Unspecified"));
    return envs.map(env => {
      const group = filteredEC2.filter(i => (i.Environment || "Unspecified") === env);
      return {
        env,
        OnDemand: group.reduce((sum, i) => sum + (parseFloat(i.OnDemand) || 0), 0),
        Reserved: group.reduce((sum, i) => sum + (parseFloat(i.Reserved) || 0), 0)
      }
    });
  }
  // Top N Costliest Instances (sortable by cost or duration)
  const getTopCostliest = (n = 10) => {
    let arr = [...filteredEC2];
    if (sortBy === 'cost') {
      arr.sort((a, b) => sortDir === 'desc' ? (parseFloat(b.OnDemand) || 0) - (parseFloat(a.OnDemand) || 0) : (parseFloat(a.OnDemand) || 0) - (parseFloat(b.OnDemand) || 0));
    } else {
      const now = new Date();
      arr.sort((a, b) => {
        const la = new Date(a["Launch Time"] || a.LaunchTime);
        const lb = new Date(b["Launch Time"] || b.LaunchTime);
        const da = Math.floor((now.getTime() - la.getTime()) / (1000*60*60*24));
        const db = Math.floor((now.getTime() - lb.getTime()) / (1000*60*60*24));
        return sortDir === 'desc' ? db - da : da - db;
      });
    }
    return arr.slice(0, n);
  }
  // Resource Allocation (vCPU/Memory by env)
  const getResourceAlloc = () => {
    const envs = unique(filteredEC2.map(i => i.Environment || "Unspecified"));
    return envs.map(env => {
      const group = filteredEC2.filter(i => (i.Environment || "Unspecified") === env);
      return {
        env,
        vCPU: group.reduce((sum, i) => sum + (parseInt(i.vCPU) || 0), 0),
        Memory: group.reduce((sum, i) => sum + (parseInt((i.Memory||'').split(' ')[0]) || 0), 0)
      }
    });
  }
  // Instance Launches Over Time
  const getLaunchesOverTime = () => {
    const byDate: Record<string, number> = {};
    filteredEC2.forEach(i => {
      const date = (i["Launch Time"] || i.LaunchTime || "").slice(0, 10);
      if (date) byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate).map(([date, count]) => ({ date, count }));
  }
  // RDS Engine Distribution
  const getRDSEngineDist = () => {
    const dist: Record<string, number> = {};
    rdsData.forEach(i => {
      const engine = i.Engine || "Unknown";
      dist[engine] = (dist[engine] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }
  // RDS Storage Allocation
  const getRDSStorageAlloc = () => {
    const envs = unique(rdsData.map(i => {
      const tag = (i.Tags||[]).find((t:any) => t.Key === "Environment");
      return tag ? tag.Value : "Unspecified";
    }));
    return envs.map(env => {
      const group = rdsData.filter(i => {
        const tag = (i.Tags||[]).find((t:any) => t.Key === "Environment");
        return (tag ? tag.Value : "Unspecified") === env;
      });
      return {
        env,
        Storage: group.reduce((sum, i) => sum + (parseInt(i.AllocatedStorage) || 0), 0)
      }
    });
  }
  // Multi-AZ vs Single-AZ
  const getRDSMultiAZ = () => {
    let multi = 0, single = 0;
    rdsData.forEach(i => (i.MultiAZ ? multi++ : single++));
    return [
      { name: "Multi-AZ", value: multi },
      { name: "Single-AZ", value: single }
    ];
  }
  // Resource Age Distribution
  const getResourceAges = () => {
    const now = new Date();
    return filteredEC2.map(i => {
      const launch = new Date(i["Launch Time"] || i.LaunchTime);
      const age = Math.floor((now.getTime() - launch.getTime()) / (1000*60*60*24));
      return { name: i["Instance ID"] || i.InstanceId, age };
    });
  }

  // --- Chart Data ---
  const instanceTypeData = getInstanceTypeData();
  const stateData = getStateData();
  const costByEnv = getCostByEnv();
  const topCostliest = getTopCostliest(10);
  const resourceAlloc = getResourceAlloc();
  const launchesOverTime = getLaunchesOverTime();
  const rdsEngineDist = getRDSEngineDist();
  const rdsStorageAlloc = getRDSStorageAlloc();
  const rdsMultiAZ = getRDSMultiAZ();
  const resourceAges = getResourceAges();

  // --- UI ---
  const renderCustomizedLabel = ({ name, percent }: { name: string, percent: number }) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`
  }

  // --- Filter Bar ---
  function MultiSelect({ label, options, value, onChange }: { label: string, options: string[], value: string[], onChange: (v: string[]) => void }) {
    return (
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Filter className="w-3 h-3" />{label}</label>
        <div className="flex flex-wrap gap-1">
          {options.map(opt => (
            <button
              key={opt}
              className={`px-2 py-1 rounded text-xs border ${value.includes(opt) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600'} hover:bg-blue-50 transition`}
              onClick={() => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Date and Duration Filter UI ---
  function DateRangeFilter() {
    return (
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Filter className="w-3 h-3" />Launch Date</label>
        <div className="flex gap-2">
          <input type="date" value={dateRange.start} onChange={e => setDateRange(r => ({...r, start: e.target.value}))} className="border rounded px-2 py-1 text-xs" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={dateRange.end} onChange={e => setDateRange(r => ({...r, end: e.target.value}))} className="border rounded px-2 py-1 text-xs" />
        </div>
      </div>
    );
  }
  function DurationRangeFilter() {
    return (
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Filter className="w-3 h-3" />Duration (days)</label>
        <div className="flex gap-2">
          <input type="number" min={0} value={durationRange.min} onChange={e => setDurationRange(r => ({...r, min: e.target.value}))} placeholder="Min" className="border rounded px-2 py-1 text-xs w-16" />
          <span className="text-xs text-gray-400">to</span>
          <input type="number" min={0} value={durationRange.max} onChange={e => setDurationRange(r => ({...r, max: e.target.value}))} placeholder="Max" className="border rounded px-2 py-1 text-xs w-16" />
        </div>
      </div>
    );
  }

  const handleResetFilters = () => {
    setEnvFilter([])
    setStateFilter([])
    setTypeFilter([])
    setDateRange({start: '', end: ''})
    setDurationRange({min: '', max: ''})
    setSortBy('cost')
    setSortDir('desc')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">AWS Analytics Dashboard</h1>
        <p className="text-gray-600 mb-8 text-lg">Visualize your AWS resources, costs, and usage trends with interactive charts and insights.</p>
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col md:flex-row gap-4 items-center sticky top-0 z-20">
          <MultiSelect label="Environment" options={allEnvs} value={envFilter} onChange={setEnvFilter} />
          <MultiSelect label="State" options={allStates} value={stateFilter} onChange={setStateFilter} />
          <MultiSelect label="Instance Type" options={allTypes.slice(0, 20)} value={typeFilter} onChange={setTypeFilter} />
          <DateRangeFilter />
          <DurationRangeFilter />
          <Button variant="outline" className="mt-4 md:mt-0" onClick={handleResetFilters}>Reset Filters</Button>
        </div>
        {/* Sticky Summary Cards */}
        <div className="sticky top-20 z-10 bg-gray-50 pb-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-100 to-blue-300 shadow-lg rounded-xl hover:scale-[1.02] transition-transform">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Server className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Instances</p>
                  <h3 className="text-3xl font-bold text-blue-900">{filteredEC2.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-100 to-green-300 shadow-lg rounded-xl hover:scale-[1.02] transition-transform">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Box className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Instance Types</p>
                  <h3 className="text-3xl font-bold text-green-900">{instanceTypeData.labels.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-100 to-orange-300 shadow-lg rounded-xl hover:scale-[1.02] transition-transform">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Cloud className="h-7 w-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">Environments</p>
                  <h3 className="text-3xl font-bold text-orange-900">{allEnvs.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-100 to-purple-300 shadow-lg rounded-xl hover:scale-[1.02] transition-transform">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Activity className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Running Rate</p>
                  <h3 className="text-3xl font-bold text-purple-900">
                    {Math.round((filteredEC2.filter(i => (i.State || '').toLowerCase() === 'running').length / (filteredEC2.length || 1)) * 100)}%
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instance Types Distribution */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">Instance Types Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={instanceTypeData.values.map((value, index) => ({
                        name: instanceTypeData.labels[index],
                        value: value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {instanceTypeData.values.map((value, index) => (
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
          {/* Cost by Environment */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">Cost by Environment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByEnv}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="env" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="OnDemand" stackId="a" fill="#3b82f6" name="OnDemand" />
                    <Bar dataKey="Reserved" stackId="a" fill="#10b981" name="Reserved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Top Costliest Instances Table */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow col-span-1 lg:col-span-2">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">Top 10 Costliest Instances (OnDemand)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="px-2 py-1 cursor-pointer">Instance ID</th>
                    <th className="px-2 py-1 cursor-pointer">Type</th>
                    <th className="px-2 py-1 cursor-pointer">Environment</th>
                    <th className="px-2 py-1 cursor-pointer">OnDemand ($/hr)</th>
                    <th className="px-2 py-1 cursor-pointer">Reserved ($/hr)</th>
                  </tr>
                </thead>
                <tbody>
                  {topCostliest.map((i, idx) => (
                    <tr key={i["Instance ID"] || i.InstanceId || idx} className="hover:bg-blue-50">
                      <td className="px-2 py-1 font-mono">{i["Instance ID"] || i.InstanceId}</td>
                      <td className="px-2 py-1">{i["Instance Type"] || i.InstanceType}</td>
                      <td className="px-2 py-1">{i.Environment}</td>
                      <td className="px-2 py-1 text-blue-700 font-mono">{parseFloat(i.OnDemand).toFixed(3)}</td>
                      <td className="px-2 py-1 text-green-700 font-mono">{parseFloat(i.Reserved).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Resource Allocation by Environment */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">Resource Allocation by Environment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceAlloc}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="env" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vCPU" fill="#3b82f6" name="vCPU" />
                    <Bar dataKey="Memory" fill="#f59e42" name="Memory (GiB)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Instance Launches Over Time */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">Instance Launches Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={launchesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* RDS Engine Distribution */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">RDS Engine Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rdsEngineDist}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rdsEngineDist.map((_, index) => (
                        <Cell key={`cell-rds-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* RDS Storage Allocation */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">RDS Storage Allocation by Environment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rdsStorageAlloc}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="env" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Storage" fill="#10b981" name="Allocated Storage (GB)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* RDS Multi-AZ vs Single-AZ */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">RDS Multi-AZ vs Single-AZ</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rdsMultiAZ}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rdsMultiAZ.map((_, index) => (
                        <Cell key={`cell-multi-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Resource Age Distribution */}
          <Card className="overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow col-span-1 lg:col-span-2">
            <CardHeader className="border-b bg-gray-100 flex flex-row items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-lg font-semibold">Resource Age Distribution (EC2)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceAges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="age" fill="#6366f1" name="Age (days)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 