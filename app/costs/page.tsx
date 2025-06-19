"use client";

import { useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Cpu, HardDrive, Database, Server, Monitor, ShoppingCart, Trash2, Plus, Minus, Box, User, Layers, Cloud, AlertTriangle, BarChart2, Settings, ChevronDown, Search as SearchIcon, Download, Upload, X, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface EC2Instance {
  "Instance Type": string;
  vCPU: string;
  Memory: string;
  "Storage Edition": string;
  Model: string;
  "Operating System": string;
  "Deployment Option": string;
  OnDemand: string;
  Reserved?: string;
}

interface BasketItem extends EC2Instance {
  quantity: number;
  note?: string;
}

interface SavedSession {
  id: string;
  name: string;
  items: BasketItem[];
  totalCost: number;
  dateCreated: string;
  dateModified: string;
}

function safeParseFloat(val: any): number {
  const num = parseFloat(val);
  if (isNaN(num)) {
    console.warn('Invalid OnDemand value:', val);
    return 0;
  }
  return num;
}

function InstanceListItem({ instance, id }: { instance: EC2Instance; id: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: instance });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`border-b px-4 py-4 bg-white hover:bg-gray-100 cursor-move transition rounded-lg shadow-sm mb-2 ${isDragging ? "opacity-50 scale-95" : ""}`}
      style={{ minWidth: 220 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <div className="font-semibold text-base text-black mb-1 flex items-center gap-2">
            <Server className="inline-block w-4 h-4 text-gray-700" />
            {instance["Instance Type"]}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-gray-400" /> vCPU: <span className="font-mono">{instance.vCPU}</span></span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3 text-gray-400" /> Mem: <span className="font-mono">{instance.Memory}</span></span>
            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-gray-400" /> Storage: <span className="font-mono">{instance["Storage Edition"]}</span></span>
            <span className="flex items-center gap-1"><Monitor className="w-3 h-3 text-gray-400" /> Model: <span className="font-mono">{instance.Model}</span></span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
            <span className="">OS: <span className="font-mono">{instance["Operating System"]}</span></span>
            <span className="">Deploy: <span className="font-mono">{instance["Deployment Option"]}</span></span>
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[120px]">
          <span className="text-base font-mono text-black font-bold">${safeParseFloat(instance.OnDemand).toFixed(3)}/hr <span className="text-xs text-gray-500 font-normal">OnDemand</span></span>
          {instance.Reserved && (
            <span className="text-xs font-mono text-green-700">${safeParseFloat(instance.Reserved).toFixed(3)}/hr <span className="text-gray-500">Reserved</span></span>
          )}
        </div>
      </div>
    </div>
  );
}

function Basket({ items, onRemove, onQuantityChange, onNoteChange }: {
  items: BasketItem[];
  onRemove: (type: string) => void;
  onQuantityChange: (type: string, qty: number) => void;
  onNoteChange: (type: string, note: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "basket" });
  const total = items.reduce((sum, item) => sum + safeParseFloat(item.OnDemand) * item.quantity, 0);
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[280px] flex flex-col border-2 rounded-2xl transition-colors sticky top-8 shadow-lg bg-white ${isOver ? "border-black bg-gray-100" : "border-gray-200"}`}
      style={{ maxHeight: 520 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 rounded-t-2xl bg-gradient-to-r from-black to-gray-700 text-white shadow-sm">
        <ShoppingCart className="w-5 h-5" />
        <h2 className="text-lg font-bold tracking-wide">Current Cart</h2>
        <Badge variant="secondary" className="ml-auto bg-white text-black">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>
      {/* Items */}
      <div className="flex-1 px-4 py-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Box className="w-10 h-10 mb-2" />
            <span className="text-base">Drag EC2 instances here</span>
            <span className="text-sm mt-1">or use the + button to add services</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item["Instance Type"]} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-700" />
                  <div>
                    <div className="font-semibold text-black text-sm">{item["Instance Type"]}</div>
                    <div className="text-xs text-gray-500 flex gap-2">
                      <Cpu className="w-3 h-3" />{item.vCPU} <Database className="w-3 h-3" />{item.Memory}
                    </div>
                    {/* Note input */}
                    <Input
                      type="text"
                      placeholder="Add a tag or note..."
                      value={String(item.note ?? "")}
                      onChange={e => onNoteChange(item["Instance Type"], e.target.value)}
                      className="mt-2 text-xs w-40"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-black"
                    aria-label="Decrease quantity"
                    onClick={() => onQuantityChange(item["Instance Type"], Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={String(item.quantity)}
                    onChange={e => onQuantityChange(item["Instance Type"], parseInt(e.target.value) || 1)}
                    className="w-10 text-center border border-gray-300 rounded px-1 py-0.5 focus:ring-2 focus:ring-black"
                  />
                  <button
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-black"
                    aria-label="Increase quantity"
                    onClick={() => onQuantityChange(item["Instance Type"], item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="ml-3 text-sm font-mono text-black font-bold">${(safeParseFloat(item.OnDemand) * item.quantity).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 ml-1">/hr</span>
                  <button
                    className="ml-4 p-1 rounded-full hover:bg-red-100 text-red-500"
                    aria-label="Remove"
                    title="Remove"
                    onClick={() => onRemove(item["Instance Type"])}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Total Footer */}
      <div className="px-5 py-4 border-t bg-gray-50 rounded-b-2xl flex items-center justify-between sticky bottom-0 z-10">
        <span className="text-base font-semibold text-gray-700">Total:</span>
        <span className="text-2xl font-bold text-black font-mono">${total.toFixed(2)}<span className="text-base font-normal text-gray-500">/hr</span></span>
      </div>
    </div>
  );
}

function SavedSessionsSidebar({ 
  sessions, 
  onLoadSession, 
  onDeleteSession, 
  searchTerm, 
  setSearchTerm 
}: {
  sessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (sessionId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (sessionId: string, sessionName: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      toast({
        title: "Session deleted",
        description: "The saved session has been removed.",
      });
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  return (
    <>
      <aside className="w-full max-w-xs min-w-[260px] bg-white border-r border-gray-200 flex flex-col h-full sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-gray-800 text-base flex items-center gap-2">
            <Box className="w-5 h-5" />Saved Sessions
          </span>
          <Badge variant="outline" className="text-xs">
            {sessions.length}
          </Badge>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search sessions..." 
              className="mb-3 pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <li className="text-center py-8 text-gray-400">
                {searchTerm ? 'No sessions found' : 'No saved sessions yet'}
              </li>
            ) : (
              filteredSessions.map((session) => (
                <li key={session.id} className="bg-gray-50 rounded-lg px-3 py-2 flex flex-col border hover:bg-gray-100 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 truncate">{session.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadSession(session);
                        }}
                        title="Load session"
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session.id, session.name);
                        }}
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{session.items.length} {session.items.length === 1 ? 'item' : 'items'}</span>
                    <span>•</span>
                    <span className="font-mono">${session.totalCost.toFixed(2)}/hr</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(session.dateModified).toLocaleDateString()}
                  </div>
                  <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onLoadSession(session)}
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this saved session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterBar({ 
  timeRange, setTimeRange, 
  service, setService, 
  region, setRegion,
  searchTerm, setSearchTerm,
  sortBy, setSortBy
}: any) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-6 bg-white rounded-lg shadow-sm px-4 py-3 border">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Last 30 Days" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="90d">Last 90 Days</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      <Select value={service} onValueChange={setService}>
        <SelectTrigger className="w-36"><SelectValue placeholder="All Services" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="ec2">EC2</SelectItem>
          <SelectItem value="rds">RDS</SelectItem>
        </SelectContent>
      </Select>
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger className="w-36"><SelectValue placeholder="All Regions" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          <SelectItem value="us-east-1">us-east-1</SelectItem>
          <SelectItem value="us-west-2">us-west-2</SelectItem>
          <SelectItem value="eu-west-1">eu-west-1</SelectItem>
          <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Sort by Cost" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="OnDemand_desc">Cost (High to Low)</SelectItem>
          <SelectItem value="OnDemand_asc">Cost (Low to High)</SelectItem>
          <SelectItem value="Instance Type_asc">Instance Type (A-Z)</SelectItem>
          <SelectItem value="vCPU_desc">vCPU (High to Low)</SelectItem>
          <SelectItem value="Memory_desc">Memory (High to Low)</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex-1" />
      <div className="relative">
        <Input 
          type="text" 
          placeholder="Search services..." 
          className="pl-9 w-64" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

function ServiceCatalog({ selected, onSelect }: { selected: string; onSelect: (service: string) => void }) {
  const cards = [
    { key: 'ec2', icon: <Server className="w-6 h-6 text-blue-600" />, label: "EC2", desc: "Compute instances" },
    { key: 'rds', icon: <Database className="w-6 h-6 text-purple-600" />, label: "RDS", desc: "Managed databases" },
    { key: 'ebs', icon: <Box className="w-6 h-6 text-yellow-600" />, label: "EBS Storage", desc: "Block storage" },
  ];
  return (
    <div className="flex gap-6 mb-6">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`flex flex-col items-center bg-white border rounded-xl shadow-sm px-8 py-6 hover:shadow-md cursor-pointer min-w-[160px] transition-all ${selected === c.key ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          onClick={() => onSelect(c.key)}
        >
          {c.icon}
          <span className="font-semibold text-lg mt-2 mb-1">{c.label}</span>
          <span className="text-xs text-gray-500">{c.desc}</span>
        </div>
      ))}
    </div>
  );
}

function EC2Table({ instances, onAdd }: { instances: any[]; onAdd: (instance: any) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Instance Type</th>
            <th className="px-4 py-3 text-left font-semibold">vCPU</th>
            <th className="px-4 py-3 text-left font-semibold">Memory</th>
            <th className="px-4 py-3 text-left font-semibold">Storage</th>
            <th className="px-4 py-3 text-left font-semibold">Network</th>
            <th className="px-4 py-3 text-left font-semibold">OS</th>
            <th className="px-4 py-3 text-left font-semibold">Deployment</th>
            <th className="px-4 py-3 text-left font-semibold">OnDemand/hr</th>
            <th className="px-4 py-3 text-left font-semibold">Reserved/hr</th>
            <th className="px-4 py-3 text-center font-semibold">Add to Cart</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((instance, idx) => (
            <EC2TableRow key={instance["Instance Type"] + idx} instance={instance} onAdd={onAdd} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EC2TableRow({ instance, onAdd }: { instance: any; onAdd: (instance: any) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: instance["Instance Type"], data: instance });
  return (
    <tr ref={setNodeRef} {...listeners} {...attributes} className={`hover:bg-gray-100 transition ${isDragging ? "opacity-50" : ""}`}> 
      <td className="px-4 py-2 font-mono text-black">{instance["Instance Type"]}</td>
      <td className="px-4 py-2">{instance.vCPU}</td>
      <td className="px-4 py-2">{instance.Memory}</td>
      <td className="px-4 py-2">{instance["Storage Edition"]}</td>
      <td className="px-4 py-2">{instance.Model}</td>
      <td className="px-4 py-2">{instance["Operating System"]}</td>
      <td className="px-4 py-2">{instance["Deployment Option"]}</td>
      <td className="px-4 py-2 font-mono">${safeParseFloat(instance.OnDemand).toFixed(3)}</td>
      <td className="px-4 py-2 font-mono">${safeParseFloat(instance.Reserved || 0).toFixed(3)}</td>
      <td className="px-4 py-2 text-center">
        <Button size="icon" variant="outline" onClick={() => onAdd(instance)} title="Add to cart">
          <Plus className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

function RDSTable({ instances, onAdd }: { instances: any[]; onAdd: (instance: any) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">DB Instance</th>
            <th className="px-4 py-3 text-left font-semibold">Engine</th>
            <th className="px-4 py-3 text-left font-semibold">Storage Type</th>
            <th className="px-4 py-3 text-left font-semibold">Deployment</th>
            <th className="px-4 py-3 text-left font-semibold">License</th>
            <th className="px-4 py-3 text-left font-semibold">OnDemand/hr</th>
            <th className="px-4 py-3 text-left font-semibold">Reserved/hr</th>
            <th className="px-4 py-3 text-center font-semibold">Add to Cart</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((instance, idx) => (
            <tr key={instance["DB Instance Class"] + idx} className="hover:bg-gray-100 transition">
              <td className="px-4 py-2 font-mono text-black">{instance["DB Instance Class"]}</td>
              <td className="px-4 py-2">{instance.Engine}</td>
              <td className="px-4 py-2">{instance["Storage Type"]}</td>
              <td className="px-4 py-2">{instance["Deployment Option"]}</td>
              <td className="px-4 py-2">{instance["License Model"]}</td>
              <td className="px-4 py-2 font-mono">${safeParseFloat(instance.OnDemand).toFixed(3)}</td>
              <td className="px-4 py-2 font-mono">${safeParseFloat(instance.Reserved || 0).toFixed(3)}</td>
              <td className="px-4 py-2 text-center">
                <Button size="icon" variant="outline" onClick={() => onAdd(instance)} title="Add to cart">
                  <Plus className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EBSTable({ onAdd }: { onAdd: (storage: any) => void }) {
  const ebsTypes = [
    {
      type: "General Purpose SSD (gp3)",
      basePrice: 0.08,
      iopsPrice: "3,000 free, then $0.005/IOPS",
      throughput: "125 MB/s free, then $0.04/MB/s",
      useCase: "Boot volumes, dev/test, low-latency interactive apps",
      maxIOPS: "16,000",
      maxThroughput: "1,000 MB/s"
    },
    {
      type: "General Purpose SSD (gp2)",
      basePrice: 0.10,
      iopsPrice: "Included",
      throughput: "Up to 250 MB/s",
      useCase: "Boot volumes, dev/test environments",
      maxIOPS: "16,000",
      maxThroughput: "250 MB/s"
    },
    {
      type: "Provisioned IOPS SSD (io2)",
      basePrice: 0.125,
      iopsPrice: "$0.065/IOPS",
      throughput: "Up to 1,000 MB/s",
      useCase: "Critical business applications, large databases",
      maxIOPS: "64,000",
      maxThroughput: "1,000 MB/s"
    },
    {
      type: "Throughput Optimized HDD (st1)",
      basePrice: 0.045,
      iopsPrice: "Included",
      throughput: "Up to 500 MB/s",
      useCase: "Big data, data warehouses, log processing",
      maxIOPS: "500",
      maxThroughput: "500 MB/s"
    },
    {
      type: "Cold HDD (sc1)",
      basePrice: 0.015,
      iopsPrice: "Included",
      throughput: "Up to 250 MB/s",
      useCase: "Infrequently accessed data",
      maxIOPS: "250",
      maxThroughput: "250 MB/s"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Storage Type</th>
            <th className="px-4 py-3 text-left font-semibold">Price/GB-month</th>
            <th className="px-4 py-3 text-left font-semibold">IOPS Pricing</th>
            <th className="px-4 py-3 text-left font-semibold">Throughput</th>
            <th className="px-4 py-3 text-left font-semibold">Use Case</th>
            <th className="px-4 py-3 text-left font-semibold">Max IOPS</th>
            <th className="px-4 py-3 text-left font-semibold">Max Throughput</th>
            <th className="px-4 py-3 text-center font-semibold">Add to Cart</th>
          </tr>
        </thead>
        <tbody>
          {ebsTypes.map((storage, idx) => (
            <tr key={storage.type + idx} className="hover:bg-gray-100 transition">
              <td className="px-4 py-2 font-mono text-black">{storage.type}</td>
              <td className="px-4 py-2 font-mono">${storage.basePrice.toFixed(3)}</td>
              <td className="px-4 py-2">{storage.iopsPrice}</td>
              <td className="px-4 py-2">{storage.throughput}</td>
              <td className="px-4 py-2">{storage.useCase}</td>
              <td className="px-4 py-2">{storage.maxIOPS}</td>
              <td className="px-4 py-2">{storage.maxThroughput}</td>
              <td className="px-4 py-2 text-center">
                <Button size="icon" variant="outline" onClick={() => onAdd(storage)} title="Add to cart">
                  <Plus className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BasketSidebar({ 
  items, 
  onRemove, 
  onQuantityChange, 
  onNoteChange, 
  total, 
  sessionName, 
  setSessionName, 
  onSave, 
  onClear 
}: any) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClearClick = () => {
    setClearDialogOpen(true);
  };

  const confirmClear = () => {
    onClear();
    setClearDialogOpen(false);
  };

  return (
    <>
      <aside className="w-full max-w-xs min-w-[320px] bg-gradient-to-b from-gray-100 to-white border-l border-gray-200 flex flex-col h-full sticky top-0 z-10 shadow-xl rounded-l-3xl">
        <div className="flex items-center gap-2 px-6 py-5 rounded-t-3xl bg-gradient-to-r from-black to-gray-800 text-white shadow-md">
          <ShoppingCart className="w-6 h-6" />
          <h2 className="text-xl font-extrabold tracking-wide">Current Cart</h2>
        </div>
        <div className="flex-1 px-5 py-4 overflow-y-auto bg-transparent">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Box className="w-12 h-12 mb-2" />
              <span className="text-base text-center">Add services to your cart by selecting them from the list.</span>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item: any) => (
                <li key={item["Instance Type"]} className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <Server className="w-6 h-6 text-gray-700" />
                    <div>
                      <div className="font-bold text-black text-base mb-1">{item["Instance Type"]}</div>
                      <div className="text-xs text-gray-500 flex gap-2 mb-1">
                        <Cpu className="w-3 h-3" />{item.vCPU} <Database className="w-3 h-3" />{item.Memory}
                      </div>
                      <Input
                        type="text"
                        placeholder="Add a tag or note..."
                        value={String(item.note ?? "")}
                        onChange={e => onNoteChange(item["Instance Type"], e.target.value)}
                        className="mt-1 text-xs w-40 bg-gray-50 border-gray-200 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-black" aria-label="Decrease quantity" onClick={() => onQuantityChange(item["Instance Type"], Math.max(1, item.quantity - 1))}><Minus className="w-4 h-4" /></button>
                      <input type="number" min={1} value={String(item.quantity)} onChange={e => onQuantityChange(item["Instance Type"], parseInt(e.target.value) || 1)} className="w-10 text-center border border-gray-300 rounded px-1 py-0.5 focus:ring-2 focus:ring-black" />
                      <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-black" aria-label="Increase quantity" onClick={() => onQuantityChange(item["Instance Type"], item.quantity + 1)}><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-base font-mono text-black font-bold">${(parseFloat(item.OnDemand) * item.quantity).toFixed(2)}</span>
                      <span className="text-xs text-gray-500">/hr</span>
                    </div>
                    <button className="mt-2 p-1 rounded-full hover:bg-red-100 text-red-500" aria-label="Remove" title="Remove" onClick={() => onRemove(item["Instance Type"])}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-6 py-6 border-t bg-gradient-to-t from-gray-100 to-white rounded-b-3xl flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-gray-700">Total Selected</span>
            <span className="text-3xl font-extrabold text-black font-mono">${total.toFixed(2)}</span>
          </div>
          <Input 
            type="text" 
            placeholder="Enter a name for this session" 
            value={sessionName} 
            onChange={e => setSessionName(e.target.value)} 
            className="mt-1 bg-gray-50 border-gray-200 rounded-md" 
          />
          <Button 
            className="w-full mt-3 font-bold text-base py-2 rounded-xl shadow-md" 
            onClick={onSave}
            disabled={items.length === 0 || !sessionName.trim()}
          >
            Save Session
          </Button>
          <Button 
            className="w-full mt-1 font-semibold text-base py-2 rounded-xl" 
            variant="outline" 
            onClick={handleClearClick}
            disabled={items.length === 0}
          >
            Clear Cart
          </Button>
        </div>
      </aside>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all items from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClear}>
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function CostsPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [rdsInstances, setRdsInstances] = useState<any[]>([]);
  const [basket, setBasket] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionSearchTerm, setSessionSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<string>("OnDemand_desc");
  const [timeRange, setTimeRange] = useState("30d");
  const [service, setService] = useState("ec2");
  const [region, setRegion] = useState("all");
  const [sessionName, setSessionName] = useState("");
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const { toast } = useToast();

  // Load saved sessions from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('awsDashboardSessions');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever savedSessions changes
  useEffect(() => {
    localStorage.setItem('awsDashboardSessions', JSON.stringify(savedSessions));
  }, [savedSessions]);

  useEffect(() => {
    fetch("/data/EC2_Pricing.json")
      .then(res => res.json())
      .then((data) => {
        const valid = (data || []).filter((item: any) => {
          if (!item || typeof item !== 'object') return false;
          if (!item["Instance Type"] || typeof item["Instance Type"] !== 'string') return false;
          const price = parseFloat(item.OnDemand);
          if (isNaN(price)) return false;
          return true;
        });
        setInstances(valid);
      });
    fetch("/data/RDS_Pricing.json")
      .then(res => res.json())
      .then((data) => {
        const valid = (data || []).filter((item: any) => {
          if (!item || typeof item !== 'object') return false;
          if (!item["Instance Type"] || typeof item["Instance Type"] !== 'string') return false;
          const price = parseFloat(item.OnDemand);
          if (isNaN(price)) return false;
          return true;
        });
        setRdsInstances(valid);
      });
  }, []);

  const handleDragEnd = (event: any) => {
    try {
      if (!event.active || !event.active.data || !event.active.data.current) return;
      const instance = event.active.data.current;
      if (event.over && event.over.id === "basket") {
        handleAddToBasket(instance);
        toast({
          title: "Service added to cart",
          description: `${instance["Instance Type"]} has been added to your cart.`,
        });
      }
    } catch (err) {
      console.error('Drag end error:', err, event);
    }
  };

  const handleRemove = (type: string) => {
    setBasket(prev => prev.filter(i => i["Instance Type"] !== type));
    toast({
      title: "Service removed",
      description: `${type} has been removed from your cart.`,
    });
  };

  const handleQuantityChange = (type: string, qty: number) => {
    setBasket(prev => prev.map(i =>
      i["Instance Type"] === type ? { ...i, quantity: Math.max(1, qty) } : i
    ));
  };

  const handleNoteChange = (type: string, note: string) => {
    setBasket(prev => prev.map(i =>
      i["Instance Type"] === type ? { ...i, note } : i
    ));
  };

  const handleAddToBasket = (instance: any) => {
    setBasket(prev => {
      const exists = prev.find(i => i["Instance Type"] === instance["Instance Type"]);
      if (exists) {
        toast({
          title: "Quantity updated",
          description: `${instance["Instance Type"]} quantity increased in your cart.`,
        });
        return prev.map(i =>
          i["Instance Type"] === instance["Instance Type"]
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        toast({
          title: "Service added to cart",
          description: `${instance["Instance Type"]} has been added to your cart.`,
        });
        return [...prev, { ...instance, quantity: 1 }];
      }
    });
  };

  const handleSaveBasket = () => {
    if (basket.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some services to your cart before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for your session.",
        variant: "destructive",
      });
      return;
    }

    const total = basket.reduce((sum, item) => sum + parseFloat(item.OnDemand) * item.quantity, 0);
    const newSession: SavedSession = {
      id: Date.now().toString(),
      name: sessionName.trim(),
      items: [...basket],
      totalCost: total,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    setSavedSessions(prev => [newSession, ...prev]);
    setSessionName("");
    
    toast({
      title: "Session saved successfully",
      description: `Your cart has been saved as "${newSession.name}".`,
    });
  };

  const handleClearBasket = () => {
    setBasket([]);
    setSessionName("");
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const handleLoadSession = (session: SavedSession) => {
    setBasket([...session.items]);
    setSessionName(session.name + " (Copy)");
    toast({
      title: "Session loaded",
      description: `"${session.name}" has been loaded into your cart.`,
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const filteredInstances = instances.filter(i => {
    // Search
    const matchesSearch = Object.values(i).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Add more filters here based on service, region, etc.
    return matchesSearch;
  });

  const sortedInstances = [...filteredInstances].sort((a, b) => {
    const [field, dir] = sortBy.split("_");
    let aValue = a[field];
    let bValue = b[field];
    
    if (["OnDemand", "Reserved", "vCPU"].includes(field)) {
      aValue = parseFloat(String(aValue));
      bValue = parseFloat(String(bValue));
    }
    if (field === "Memory") {
      aValue = parseFloat(String(aValue).split(" ")[0]);
      bValue = parseFloat(String(bValue).split(" ")[0]);
    }
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (aValue === bValue) return 0;
    if (dir === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  const total = basket.reduce((sum, item) => sum + parseFloat(item.OnDemand) * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 min-h-0">
        <SavedSessionsSidebar 
          sessions={savedSessions}
          onLoadSession={handleLoadSession}
          onDeleteSession={handleDeleteSession}
          searchTerm={sessionSearchTerm}
          setSearchTerm={setSessionSearchTerm}
        />
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2 text-black">Cost Analysis</h1>
          <FilterBar 
            timeRange={timeRange} 
            setTimeRange={setTimeRange} 
            service={service} 
            setService={setService} 
            region={region} 
            setRegion={setRegion}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <ServiceCatalog selected={service} onSelect={setService} />
          {service === 'ec2' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-black">EC2 Instance Types</h2>
                <Badge variant="outline">{sortedInstances.length} services available</Badge>
              </div>
              <DndContext onDragEnd={handleDragEnd}>
                <EC2Table instances={sortedInstances} onAdd={handleAddToBasket} />
              </DndContext>
            </div>
          )}
          {service === 'rds' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-black">RDS Instance Types</h2>
                <Badge variant="outline">{rdsInstances.length} services available</Badge>
              </div>
              <RDSTable instances={rdsInstances} onAdd={handleAddToBasket} />
            </div>
          )}
          {service === 'ebs' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-black">EBS Storage Types</h2>
                <Badge variant="outline">5 storage types available</Badge>
              </div>
              <EBSTable onAdd={handleAddToBasket} />
            </div>
          )}
        </main>
        <BasketSidebar
          items={basket}
          onRemove={handleRemove}
          onQuantityChange={handleQuantityChange}
          onNoteChange={handleNoteChange}
          total={total}
          sessionName={sessionName}
          setSessionName={setSessionName}
          onSave={handleSaveBasket}
          onClear={handleClearBasket}
        />
      </div>
    </div>
  );
} 