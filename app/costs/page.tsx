"use client";

import { useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Cpu, HardDrive, Database, Server, Monitor, ShoppingCart, Trash2, Plus, Minus, Box, User, Layers, Cloud, AlertTriangle, BarChart2, Settings, ChevronDown, Search as SearchIcon, Download, Upload, X, Check, Activity, Clock, RotateCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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

interface EBSVolume {
  "Volume Type": string;
  Description: string;
  "Size (GiB)": number;
  IOPS: number;
  "Throughput (MB/s)": number;
  PricePerGBMonth: number;
  Region: string;
}

interface RDSInstance {
  "Instance Type": string;
  Engine: string;
  vCPU: number;
  "Memory (GiB)": number;
  "Storage (GiB)": number;
  PricePerHour: number;
  Region: string;
}

interface BasketItem {
  quantity: number;
  note?: string;
  attachedTo?: string; // For EBS volumes, indicates which EC2 instance it's attached to
  // EC2 properties
  "Instance Type"?: string;
  vCPU?: string;
  Memory?: string;
  "Storage Edition"?: string;
  Model?: string;
  "Operating System"?: string;
  "Deployment Option"?: string;
  OnDemand?: string;
  Reserved?: string;
  // EBS properties
  "Volume Type"?: string;
  Description?: string;
  "Size (GiB)"?: number;
  IOPS?: number;
  "Throughput (MB/s)"?: number;
  PricePerGBMonth?: number;
  // RDS properties
  Engine?: string;
  PricePerHour?: number;
  "Memory (GiB)"?: number;
  "Storage (GiB)"?: number;
  // Common properties
  Region?: string;
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
      className={`group bg-card hover:bg-muted/50 cursor-move transition-all rounded-2xl shadow-md hover:shadow-xl border border-border hover:border-muted-foreground px-5 py-4 mb-3 ${isDragging ? "opacity-50 scale-95 rotate-2" : ""}`}
      style={{ minWidth: 280 }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
              <Server className="w-5 h-5 text-foreground" />
            </div>
            <div className="font-bold text-lg text-foreground">{instance["Instance Type"]}</div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" /> 
              <span className="font-medium">{instance.vCPU} vCPU</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Database className="w-3.5 h-3.5 text-muted-foreground" /> 
              <span className="font-medium">{instance.Memory}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground" /> 
              <span className="font-medium">{instance["Storage Edition"]}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Monitor className="w-3.5 h-3.5 text-muted-foreground" /> 
              <span className="font-medium">{instance.Model}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
              {instance["Operating System"]}
            </span>
            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
              {instance["Deployment Option"]}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[140px]">
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground font-mono">
              ${safeParseFloat(instance.OnDemand).toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">per hour</div>
          </div>
          {instance.Reserved && (
            <div className="mt-1 px-2 py-1 bg-green-100 rounded-lg">
              <span className="text-xs font-mono text-green-700 font-medium">
                ${safeParseFloat(instance.Reserved).toFixed(3)}/hr
              </span>
              <span className="text-xs text-green-600 ml-1">Reserved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Basket({ items, onRemove, onQuantityChange, onNoteChange }: {
  items: BasketItem[];
  onRemove: (item: BasketItem) => void;
  onQuantityChange: (item: BasketItem, qty: number) => void;
  onNoteChange: (item: BasketItem, note: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "basket" });
  const total = items.reduce((sum, item) => {
    if (item.OnDemand) {
      return sum + safeParseFloat(item.OnDemand) * item.quantity;
    } else if (item.PricePerGBMonth) {
      // For EBS, calculate monthly cost based on size and price per GB
      const size = parseFloat(String(item["Size (GiB)"] || 0));
      const pricePerGB = safeParseFloat(String(item.PricePerGBMonth || 0));
      return sum + (size * pricePerGB * item.quantity) / (24 * 30); // Convert to hourly
    } else if (item.PricePerHour) {
      return sum + safeParseFloat(String(item.PricePerHour || 0)) * item.quantity;
    }
    return sum;
  }, 0);
  const monthlyTotal = total * 24 * 30; // Approximate monthly cost
  const yearlyTotal = total * 24 * 365; // Approximate yearly cost
  
  const getItemIcon = (item: any) => {
    if (item.OnDemand) return <Server className="w-5 h-5 text-foreground" />;
    if (item.PricePerGBMonth) return <HardDrive className="w-5 h-5 text-foreground" />;
    if (item.PricePerHour) return <Database className="w-5 h-5 text-foreground" />;
    return <Server className="w-5 h-5 text-foreground" />;
  };

  const getItemPrice = (item: any) => {
    if (item.OnDemand) {
      return {
        price: safeParseFloat(item.OnDemand),
        unit: "per hour"
      };
    } else if (item.PricePerGBMonth) {
      const size = parseFloat(String(item["Size (GiB)"] || 0));
      const pricePerGB = safeParseFloat(String(item.PricePerGBMonth || 0));
      return {
        price: (size * pricePerGB) / (24 * 30), // Convert to hourly
        unit: "per hour"
      };
    } else if (item.PricePerHour) {
      return {
        price: safeParseFloat(String(item.PricePerHour || 0)),
        unit: "per hour"
      };
    }
    return { price: 0, unit: "per hour" };
  };

  const getItemDetails = (item: any) => {
    if (item.OnDemand) {
      return [
        { label: "vCPU", value: item.vCPU || "N/A" },
        { label: "Memory", value: item.Memory || "N/A" },
        { label: "Storage", value: item["Storage Edition"] || "N/A" }
      ];
    } else if (item.PricePerGBMonth) {
      return [
        { label: "Size", value: `${item["Size (GiB)"] || 0} GiB` },
        { label: "IOPS", value: item.IOPS || "N/A" },
        { label: "Throughput", value: `${item["Throughput (MB/s)"] || 0} MB/s` }
      ];
    } else if (item.PricePerHour) {
      return [
        { label: "Engine", value: item.Engine || "N/A" },
        { label: "vCPU", value: item.vCPU || "N/A" },
        { label: "Memory", value: `${item["Memory (GiB)"] || 0} GiB` }
      ];
    }
    return [];
  };
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[280px] flex flex-col rounded-3xl transition-all sticky top-8 shadow-2xl bg-gradient-to-b from-card to-muted ${isOver ? "ring-4 ring-primary ring-opacity-50 scale-[1.02]" : "ring-1 ring-border"}`}
      style={{ maxHeight: 400 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 rounded-t-3xl bg-black text-white shadow-lg">
        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-wide">Cost Calculator</h2>
          <p className="text-xs text-white/80 mt-0.5">Drag services to calculate costs</p>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>
      
      {/* Cost Summary - Always visible at top */}
      {items.length > 0 && (
        <div className="px-5 py-3 border-b border-border bg-card/50">
          <div className="bg-gradient-to-br from-muted to-muted/80 rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                Hourly Total
              </span>
              <span className="text-lg font-bold text-foreground font-mono">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Items */}
      <div className="flex-1 px-5 py-4 overflow-y-auto" style={{ maxHeight: '150px' }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground px-4">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-br from-muted to-muted/80 rounded-full">
                <Box className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-card rounded-full shadow-lg border">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Building</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag services here to calculate costs
            </p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Drag & drop from the catalog</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Click the + button to add</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Save configurations for later</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map(item => {
              const itemPrice = getItemPrice(item);
              const itemDetails = getItemDetails(item);
              const itemKey = item["Instance Type"] || item["Volume Type"] || "Unknown";
              
              return (
                <li key={itemKey} className="group bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-lg transition-all hover:border-muted-foreground">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                        {getItemIcon(item)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-foreground text-base mb-1">{itemKey}</div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                          {itemDetails.map((detail, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <span className="font-medium">{detail.label}:</span>
                              <span>{detail.value}</span>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="Add note..."
                            value={item.note || ""}
                            onChange={(e) => onNoteChange(itemKey, e.target.value)}
                            className="text-xs h-7"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground font-mono">
                          ${itemPrice.price.toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground">{itemPrice.unit}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQuantityChange(itemKey, item.quantity - 1)}
                          className="w-6 h-6 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium text-foreground min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQuantityChange(itemKey, item.quantity + 1)}
                          className="w-6 h-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(itemKey)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          

            </>
          )}
        </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-card rounded-b-3xl">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Hourly Total:</span>
            <span className="text-xl font-bold text-foreground font-mono">${total.toFixed(3)}</span>
          </div>
        </div>
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

  const handleExportSession = (session: SavedSession, format: 'json' | 'csv' = 'json') => {
    // Recalculate totalCost to ensure it's accurate
    const recalculatedTotal = session.items.reduce((sum, item) => {
      if (item.OnDemand) {
        return sum + parseFloat(String(item.OnDemand)) * item.quantity;
      } else if (item.PricePerHour) {
        return sum + parseFloat(String(item.PricePerHour)) * item.quantity;
      } else if (item.PricePerGBMonth) {
        const size = parseFloat(String(item["Size (GiB)"] || 0));
        const pricePerGB = parseFloat(String(item.PricePerGBMonth || 0));
        const monthlyPrice = size * pricePerGB;
        const hourlyPrice = monthlyPrice / (24 * 30.44);
        return sum + (hourlyPrice * item.quantity);
      }
      return sum;
    }, 0);

    if (format === 'json') {
      const exportData = {
        name: session.name,
        items: session.items,
        totalCost: recalculatedTotal,
        totalCostPerMonth: recalculatedTotal * 24 * 30.44,
        totalCostPerYear: recalculatedTotal * 24 * 365,
        dateCreated: session.dateCreated,
        dateModified: session.dateModified,
        exportedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-config-${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Prepare CSV data
      const csvData = session.items.map(item => {
        const itemType = item["Instance Type"] || item["Volume Type"] || 'Unknown';
        const hourlyPrice = item.OnDemand || 
          (item.PricePerHour) || 
          (item.PricePerGBMonth ? (parseFloat(String(item["Size (GiB)"] || 0)) * parseFloat(String(item.PricePerGBMonth || 0))) / (24 * 30.44) : 0);
        
        return {
          'ENV': '',
          'QUOI': '',
          'Configuration Name': session.name,
          'Item Type': itemType,
          'Service Type': item["Instance Type"] ? 'EC2' : item["Volume Type"] ? 'EBS' : item.Engine ? 'RDS' : 'Unknown',
          'Quantity': item.quantity,
          'vCPU': item.vCPU || '',
          'Memory': item.Memory || item["Memory (GiB)"] || '',
          'Storage': item["Storage Edition"] || item["Size (GiB)"] || item["Storage (GiB)"] || '',
          'Operating System': item["Operating System"] || '',
          'Engine': item.Engine || '',
          'Region': item.Region || '',
          'Hourly Price': parseFloat(String(hourlyPrice)).toFixed(4),
          'Monthly Price': (parseFloat(String(hourlyPrice)) * 24 * 30.44).toFixed(2),
          'Total Hourly (Qty)': (parseFloat(String(hourlyPrice)) * item.quantity).toFixed(4),
          'Total Monthly (Qty)': (parseFloat(String(hourlyPrice)) * item.quantity * 24 * 30.44).toFixed(2),
          'Note': item.note || '',
          'Attached To': item.attachedTo || '',
          'Date Created': new Date(session.dateCreated).toLocaleDateString(),
          'Date Modified': new Date(session.dateModified).toLocaleDateString()
        };
      });

      // Add summary row
      csvData.push({
        'ENV': '',
        'QUOI': '',
        'Configuration Name': `TOTAL - ${session.name}`,
        'Item Type': 'SUMMARY',
        'Service Type': '',
                  'Quantity': session.items.reduce((sum, item) => sum + item.quantity, 0),
        'vCPU': '',
        'Memory': '',
        'Storage': '',
        'Operating System': '',
        'Engine': '',
        'Region': '',
        'Hourly Price': '',
        'Monthly Price': '',
        'Total Hourly (Qty)': recalculatedTotal.toFixed(4),
        'Total Monthly (Qty)': (recalculatedTotal * 24 * 30.44).toFixed(2),
        'Note': 'Configuration Total',
        'Attached To': '',
        'Date Created': new Date(session.dateCreated).toLocaleDateString(),
        'Date Modified': new Date(session.dateModified).toLocaleDateString()
      });

      // Convert to CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-config-${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Configuration exported",
      description: `${session.name} has been exported as ${format.toUpperCase()} successfully.`,
    });
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
      <aside className="w-[300px] bg-card border-r border-border flex flex-col h-screen shadow-sm flex-shrink-0">
        <div className="px-5 py-5 border-b bg-gradient-to-br from-muted to-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg shadow-sm">
              <Box className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-base truncate">Saved Configurations</h3>
              <p className="text-xs text-muted-foreground">{sessions.length} configuration{sessions.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col px-4 pt-4 pb-2 min-h-0">
          <div className="relative mb-3 flex-shrink-0">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input 
              type="text" 
              placeholder="Search configurations..." 
              className="pl-9 pr-3 h-9 text-sm bg-muted border-border rounded-lg w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-muted rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Box className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium text-sm">
                  {searchTerm ? 'No configurations found' : 'No saved configurations yet'}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Save your cart to access it later
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div key={session.id} className="relative bg-card rounded-lg p-3 border border-border hover:border-muted-foreground hover:shadow-sm cursor-pointer group transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate text-sm">{session.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {session.items.length} item{session.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-mono font-medium text-foreground">
                          ${(() => {
                            const recalculatedTotal = session.items.reduce((sum, item) => {
                              if (item.OnDemand) {
                                return sum + parseFloat(String(item.OnDemand)) * item.quantity;
                              } else if (item.PricePerHour) {
                                return sum + parseFloat(String(item.PricePerHour)) * item.quantity;
                              } else if (item.PricePerGBMonth) {
                                const size = parseFloat(String(item["Size (GiB)"] || 0));
                                const pricePerGB = parseFloat(String(item.PricePerGBMonth || 0));
                                const monthlyPrice = size * pricePerGB;
                                const hourlyPrice = monthlyPrice / (24 * 30.44);
                                return sum + (hourlyPrice * item.quantity);
                              }
                              return sum;
                            }, 0);
                            return recalculatedTotal.toFixed(2);
                          })()}/hr
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(session.dateModified).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            title="Export session"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportSession(session, 'json');
                            }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">JSON</span>
                            <span>Configuration file</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportSession(session, 'csv');
                            }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">CSV</span>
                            <span>Spreadsheet data</span>
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(session.id, session.name);
                        }}
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div 
                    className="absolute inset-0 cursor-pointer rounded-lg"
                    onClick={() => onLoadSession(session)}
                  />
                </div>
              ))
            )}
          </div>
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
  searchTerm, setSearchTerm,
  searchCriteria, setSearchCriteria,
  sortBy, setSortBy,
  service
}: any) {
  const hasActiveFilters = searchCriteria.length > 0 || searchTerm.trim() !== "";
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-card to-muted/30 rounded-2xl shadow-lg border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Search & Filter</h3>
              <p className="text-xs text-muted-foreground">Find and sort your AWS services</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {(searchCriteria.length + (searchTerm ? 1 : 0))} active
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSortBy("OnDemand_desc");
                setSearchTerm("");
                setSearchCriteria([]);
              }}
              className="h-7 px-3 text-xs hover:bg-muted"
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Sort Section */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Sort Results</label>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-9 rounded-lg bg-background border-border/60 hover:border-border transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OnDemand_desc">💰 Cost (High to Low)</SelectItem>
                  <SelectItem value="OnDemand_asc">💰 Cost (Low to High)</SelectItem>
                  <SelectItem value="PricePerGBMonth_desc">📊 Price/GB (High to Low)</SelectItem>
                  <SelectItem value="PricePerGBMonth_asc">📊 Price/GB (Low to High)</SelectItem>
                  <SelectItem value="PricePerHour_desc">⏱️ Price/Hour (High to Low)</SelectItem>
                  <SelectItem value="PricePerHour_asc">⏱️ Price/Hour (Low to High)</SelectItem>
                  <SelectItem value="Instance Type_asc">🔤 Instance Type (A-Z)</SelectItem>
                  <SelectItem value="Volume Type_asc">🔤 Volume Type (A-Z)</SelectItem>
                  <SelectItem value="vCPU_desc">⚡ vCPU (High to Low)</SelectItem>
                  <SelectItem value="Memory_desc">🧠 Memory (High to Low)</SelectItem>
                  <SelectItem value="Size (GiB)_desc">💾 Size (High to Low)</SelectItem>
                  <SelectItem value="IOPS_desc">🚀 IOPS (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Section */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <SearchIcon className="w-3 h-3 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Search & Filter</label>
              </div>
              <AdvancedSearch
                searchCriteria={searchCriteria}
                setSearchCriteria={setSearchCriteria}
                quickSearch={searchTerm}
                setQuickSearch={setSearchTerm}
                service={service}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCatalog({ selectedService, onServiceSelect }: { 
  selectedService: "ec2" | "ebs" | "rds"; 
  onServiceSelect: (service: "ec2" | "ebs" | "rds") => void; 
}) {
  const cards = [
    { 
      id: "ec2" as const,
      icon: <Server className="w-7 h-7" />, 
      label: "EC2", 
      desc: "Compute instances",
      color: "from-gray-700 to-black",
      bgColor: "from-gray-50 to-gray-100",
      count: "200+"
    },
    { 
      id: "ebs" as const,
      icon: <HardDrive className="w-7 h-7" />, 
      label: "EBS", 
      desc: "Block storage volumes",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100",
      count: "Multiple types"
    },
    { 
      id: "rds" as const,
      icon: <Database className="w-7 h-7" />, 
      label: "RDS", 
      desc: "Managed databases",
      color: "from-gray-800 to-black",
      bgColor: "from-gray-50 to-gray-100",
      count: "6 engines"
    }
  ];
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-muted-foreground" />
        Service Categories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {cards.map((c, i) => (
          <div 
            key={i} 
            className={`group relative bg-card rounded-xl transition-all duration-200 cursor-pointer border ${
              selectedService === c.id 
                ? "border-primary bg-primary/5 shadow-md" 
                : "border-border hover:border-muted-foreground hover:shadow-sm"
            }`}
            onClick={() => onServiceSelect(c.id)}
          >
            <div className="relative px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${c.color} text-white transition-transform group-hover:scale-105 ${
                  selectedService === c.id ? "scale-105" : ""
                }`}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-base text-foreground">{c.label}</h3>
                    {selectedService === c.id ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">{c.desc}</p>
                    <span className="text-xs font-medium text-muted-foreground ml-2 flex-shrink-0">{c.count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EC2Table({ instances, onAdd, sortBy, setSortBy }: { 
  instances: any[]; 
  onAdd: (instance: any) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(instances.length / rowsPerPage);
  const paginatedInstances = instances.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (field: string) => {
    const [currentField, currentDirection] = sortBy.split('_');
    if (currentField === field) {
      // Toggle direction
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSortBy(`${field}_${newDirection}`);
    } else {
      // New field, default to desc for numeric fields, asc for text
      const defaultDirection = ['OnDemand', 'vCPU', 'Memory'].includes(field) ? 'desc' : 'asc';
      setSortBy(`${field}_${defaultDirection}`);
    }
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDirection] = sortBy.split('_');
    if (currentField === field) {
      return currentDirection === 'asc' ? (
        <ArrowUpDown className="w-3 h-3 text-primary" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-primary rotate-180" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />;
  };

  if (instances.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <SearchIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No instances found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th 
                className="group px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none hover:bg-muted/30"
                onClick={() => handleSort('Instance Type')}
              >
                <div className="flex items-center gap-2">
                  Instance Type
                  {getSortIcon('Instance Type')}
                </div>
              </th>
              <th 
                className="group px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none hover:bg-muted/30"
                onClick={() => handleSort('vCPU')}
              >
                <div className="flex items-center gap-2">
                  vCPU
                  {getSortIcon('vCPU')}
                </div>
              </th>
              <th 
                className="group px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none hover:bg-muted/30"
                onClick={() => handleSort('Memory')}
              >
                <div className="flex items-center gap-2">
                  Memory
                  {getSortIcon('Memory')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Storage
              </th>
              <th 
                className="group px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none hover:bg-muted/30"
                onClick={() => handleSort('OnDemand')}
              >
                <div className="flex items-center gap-2">
                  Cost/hr
                  {getSortIcon('OnDemand')}
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedInstances.map((instance, idx) => (
              <EC2TableRow key={instance["Instance Type"] + idx} instance={instance} onAdd={onAdd} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 border-t border-border">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          {/* Windowed Pagination Logic */}
          {(() => {
            const window = 2;
            const pages: (number | string)[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 ||
                i === totalPages ||
                (i >= page - window && i <= page + window)
              ) {
                pages.push(i);
              } else if (
                (i === page - window - 1 && i > 1) ||
                (i === page + window + 1 && i < totalPages)
              ) {
                pages.push('ellipsis-' + i);
              }
            }
            let last = 0;
            return pages.map((p, idx) => {
              if (typeof p === 'number') {
                last = p;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={page === p ? "default" : "outline"}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              } else {
                // Ellipsis
                if (pages[idx - 1] !== p) {
                  return <span key={p} className="px-1 text-muted-foreground">...</span>;
                }
                return null;
              }
            });
          })()}
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function EC2TableRow({ instance, onAdd }: { instance: any; onAdd: (instance: any) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: `ec2-${instance["Instance Type"]}`, 
    data: { current: instance }
  });
  return (
    <tr 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className={`hover:bg-muted transition-all duration-200 cursor-move group ${isDragging ? "opacity-50 bg-muted scale-[0.98]" : ""}`}
    > 
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="p-1.5 bg-muted rounded-lg">
              <Box className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{instance["Instance Type"]}</div>
            <div className="text-xs text-muted-foreground">{instance.Model || "Standard"}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-foreground">{instance.vCPU}</span>
          </div>
          <span className="text-sm text-muted-foreground font-medium">cores</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-lg">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="font-medium text-foreground">{instance.Memory}</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <Badge variant="outline" className="text-xs">
          {instance["Storage Edition"]}
        </Badge>
      </td>
      <td className="px-6 py-3">
        <div>
          <div className="font-mono font-bold text-foreground text-base">
            ${safeParseFloat(instance.OnDemand).toFixed(3)}
          </div>
          <div className="text-xs text-muted-foreground">per hour</div>
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            onAdd(instance);
          }}
          title="Add to cart"
          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </td>
    </tr>
  );
}

function EBSTable({ volumes, onAdd, sortBy, setSortBy }: { 
  volumes: any[]; 
  onAdd: (volume: any) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(volumes.length / rowsPerPage);
  const paginatedVolumes = volumes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (field: string) => {
    const [currentField, currentDirection] = sortBy.split('_');
    if (currentField === field) {
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSortBy(`${field}_${newDirection}`);
    } else {
      const defaultDirection = ['PricePerGBMonth', 'Size (GiB)', 'IOPS', 'Throughput (MB/s)'].includes(field) ? 'desc' : 'asc';
      setSortBy(`${field}_${defaultDirection}`);
    }
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDirection] = sortBy.split('_');
    if (currentField === field) {
      return currentDirection === 'asc' ? (
        <ArrowUpDown className="w-3 h-3 text-primary" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-primary rotate-180" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />;
  };

  if (volumes.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <SearchIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No volumes found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Volume Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Size (GiB)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                IOPS
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Throughput
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Price/GB/Month
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedVolumes.map((volume, idx) => (
              <EBSTableRow key={volume["Volume Type"] + idx} volume={volume} onAdd={onAdd} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 border-t border-border">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          {/* Windowed Pagination Logic */}
          {(() => {
            const window = 2;
            const pages: (number | string)[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 ||
                i === totalPages ||
                (i >= page - window && i <= page + window)
              ) {
                pages.push(i);
              } else if (
                (i === page - window - 1 && i > 1) ||
                (i === page + window + 1 && i < totalPages)
              ) {
                pages.push('ellipsis-' + i);
              }
            }
            let last = 0;
            return pages.map((p, idx) => {
              if (typeof p === 'number') {
                last = p;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={page === p ? "default" : "outline"}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              } else {
                // Ellipsis
                if (pages[idx - 1] !== p) {
                  return <span key={p} className="px-1 text-muted-foreground">...</span>;
                }
                return null;
              }
            });
          })()}
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function EBSTableRow({ volume, onAdd }: { volume: any; onAdd: (volume: any) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: `ebs-${volume["Volume Type"]}`, 
    data: { current: volume }
  });
  return (
    <tr 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className={`hover:bg-muted transition-all duration-200 cursor-move group ${isDragging ? "opacity-50 bg-muted scale-[0.98]" : ""}`}
    > 
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="p-1.5 bg-muted rounded-lg">
              <Box className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{volume["Volume Type"]}</div>
            <div className="text-xs text-muted-foreground">{volume.Description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-foreground">{volume["Size (GiB)"]}</span>
          </div>
          <span className="text-sm text-muted-foreground font-medium">GiB</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-lg">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="font-medium text-foreground">{volume.IOPS}</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-lg">
            <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="font-medium text-foreground">{volume["Throughput (MB/s)"]} MB/s</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div>
          <div className="font-mono font-bold text-foreground text-base">
            ${safeParseFloat(volume.PricePerGBMonth).toFixed(3)}
          </div>
          <div className="text-xs text-muted-foreground">per GB/month</div>
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            onAdd(volume);
          }}
          title="Add to cart"
          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </td>
    </tr>
  );
}

function RDSTable({ instances, onAdd, sortBy, setSortBy }: { 
  instances: any[]; 
  onAdd: (instance: any) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(instances.length / rowsPerPage);
  const paginatedInstances = instances.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (field: string) => {
    const [currentField, currentDirection] = sortBy.split('_');
    if (currentField === field) {
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSortBy(`${field}_${newDirection}`);
    } else {
      const defaultDirection = ['PricePerHour', 'vCPU', 'Memory (GiB)', 'Storage (GiB)'].includes(field) ? 'desc' : 'asc';
      setSortBy(`${field}_${defaultDirection}`);
    }
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDirection] = sortBy.split('_');
    if (currentField === field) {
      return currentDirection === 'asc' ? (
        <ArrowUpDown className="w-3 h-3 text-primary" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-primary rotate-180" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />;
  };

  if (instances.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <SearchIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No instances found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Instance Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Engine
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                vCPU
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Memory
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Storage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Price/Hour
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedInstances.map((instance, idx) => (
              <RDSTableRow key={instance["Instance Type"] + idx} instance={instance} onAdd={onAdd} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 border-t border-border">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          {/* Windowed Pagination Logic */}
          {(() => {
            const window = 2;
            const pages: (number | string)[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 ||
                i === totalPages ||
                (i >= page - window && i <= page + window)
              ) {
                pages.push(i);
              } else if (
                (i === page - window - 1 && i > 1) ||
                (i === page + window + 1 && i < totalPages)
              ) {
                pages.push('ellipsis-' + i);
              }
            }
            let last = 0;
            return pages.map((p, idx) => {
              if (typeof p === 'number') {
                last = p;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={page === p ? "default" : "outline"}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              } else {
                // Ellipsis
                if (pages[idx - 1] !== p) {
                  return <span key={p} className="px-1 text-muted-foreground">...</span>;
                }
                return null;
              }
            });
          })()}
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function RDSTableRow({ instance, onAdd }: { instance: any; onAdd: (instance: any) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: `rds-${instance["Instance Type"]}`, 
    data: { current: instance }
  });
  return (
    <tr 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className={`hover:bg-muted transition-all duration-200 cursor-move group ${isDragging ? "opacity-50 bg-muted scale-[0.98]" : ""}`}
    > 
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="p-1.5 bg-muted rounded-lg">
              <Box className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{instance["Instance Type"]}</div>
            <div className="text-xs text-muted-foreground">Managed Database</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <Badge variant="outline" className="text-xs">
          {instance.Engine}
        </Badge>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-foreground">{instance.vCPU}</span>
          </div>
          <span className="text-sm text-muted-foreground font-medium">cores</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-lg">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="font-medium text-foreground">{instance["Memory (GiB)"]} GiB</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-lg">
            <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="font-medium text-foreground">{instance["Storage (GiB)"]} GiB</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <div>
          <div className="font-mono font-bold text-foreground text-base">
            ${safeParseFloat(instance.PricePerHour).toFixed(3)}
          </div>
          <div className="text-xs text-muted-foreground">per hour</div>
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            onAdd(instance);
          }}
          title="Add to cart"
          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </td>
    </tr>
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
  const { setNodeRef, isOver } = useDroppable({ id: "basket" });
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
      <aside 
        ref={setNodeRef}
        className={`w-[380px] bg-card border-l border-border flex flex-col h-screen max-h-screen shadow-xl flex-shrink-0 transition-all duration-200 ${isOver ? "ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-950" : ""}`}
      >
        <div className="px-5 py-3 bg-gradient-to-r from-card to-muted text-foreground flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">Cost Calculator</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Build your AWS infrastructure</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Items in cart</span>
            <span className="text-xl font-bold">{items.length}</span>
          </div>
        </div>
        
        {/* Cost Summary & Save Actions - Always visible at top */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-b border-border bg-card/80 flex-shrink-0">
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Hourly Total
                  </span>
                  <span className="text-xl font-bold text-primary font-mono">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Input 
                  type="text" 
                  placeholder="Name this configuration..." 
                  value={sessionName} 
                  onChange={e => setSessionName(e.target.value)} 
                  className="h-9 text-sm bg-muted/50 border-border focus:border-primary focus:bg-card rounded-lg" 
                />
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 font-semibold text-sm h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-lg" 
                    onClick={onSave}
                    disabled={items.length === 0 || !sessionName.trim()}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Save Configuration
                  </Button>
                  <Button 
                    className="px-3 h-9 rounded-lg" 
                    variant="outline" 
                    onClick={handleClearClick}
                    disabled={items.length === 0}
                    title="Clear cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 px-5 py-3 overflow-y-auto bg-gradient-to-b from-card to-muted min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground px-4">
              <div className="relative mb-6">
                <div className="p-6 bg-gradient-to-br from-muted to-muted/80 rounded-full">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-card rounded-full shadow-lg border-2 border-card">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Add AWS services to start calculating your infrastructure costs
              </p>
              <div className="bg-muted rounded-lg p-4 w-full">
                <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">How to get started:</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-background">1</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Browse the instance catalog below</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-background">2</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Drag instances here or click the Add button</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-background">3</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Save your configuration for future reference</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Selected Services</div>
              <ul className="space-y-2">
                {items
                  .filter((item: BasketItem) => !item.attachedTo) // Only show top-level items (EC2 instances and standalone services)
                  .map((item: BasketItem, index: number) => {
                    const itemKey = item["Instance Type"] || item["Volume Type"] || "Unknown";
                    const attachedItems = items.filter((i: BasketItem) => i.attachedTo === itemKey);
                    // Create unique key by combining itemKey with size for EBS volumes and index for uniqueness
                    const uniqueKey = item["Volume Type"] 
                      ? `${itemKey}-${item["Size (GiB)"] || 0}-${index}`
                      : `${itemKey}-${index}`;
                    return (
                      <li key={uniqueKey} className="group bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all hover:border-muted-foreground">
                        {/* Main Item */}
                        <div className="flex flex-col gap-3 p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                                {item["Instance Type"] ? <Server className="w-5 h-5 text-foreground" /> : 
                                 item["Volume Type"] ? <HardDrive className="w-5 h-5 text-foreground" /> :
                                 item.Engine ? <Database className="w-5 h-5 text-foreground" /> :
                                 <Server className="w-5 h-5 text-foreground" />}
                              </div>
                              <div className="flex-1">
                                                        <div className="font-bold text-foreground text-base">{itemKey}</div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          {item.vCPU && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                              <Cpu className="w-3 h-3" />
                              {item.vCPU} vCPU
                            </span>
                          )}
                          {item.Memory && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                              <Database className="w-3 h-3" />
                              {item.Memory}
                            </span>
                          )}
                          {item["Size (GiB)"] && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                              <HardDrive className="w-3 h-3" />
                              {item["Size (GiB)"]} GiB
                            </span>
                          )}
                          {item.IOPS && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                              <Activity className="w-3 h-3" />
                              {item.IOPS} IOPS
                            </span>
                          )}
                          {item.Engine && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                              <Database className="w-3 h-3" />
                              {item.Engine}
                            </span>
                          )}
                          {(() => {
                            // Show region if there are multiple items with different regions
                            const uniqueRegions = new Set(items.map((i: BasketItem) => i.Region).filter(Boolean));
                            const shouldShowRegion = uniqueRegions.size > 1 && item.Region;
                            
                            if (shouldShowRegion) {
                              return (
                                <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  <Cloud className="w-3 h-3" />
                                  {item.Region}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                              </div>
                            </div>
                            <button 
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                              aria-label="Remove" 
                              title="Remove from cart" 
                              onClick={() => onRemove(item)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <Input
                            type="text"
                            placeholder="Add a tag or note..."
                            value={String(item.note ?? "")}
                            onChange={e => onNoteChange(item, e.target.value)}
                            className="text-xs bg-muted border-border focus:bg-card"
                          />
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                              <button 
                                className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                                aria-label="Decrease quantity" 
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    onRemove(item);
                                  } else {
                                    onQuantityChange(item, item.quantity - 1);
                                  }
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input 
                                type="number" 
                                min={1} 
                                value={String(item.quantity)} 
                                onChange={e => onQuantityChange(item, parseInt(e.target.value) || 1)} 
                                className="w-12 text-center bg-card border border-border rounded-md px-1 py-1 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent" 
                              />
                              <button 
                                className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                                aria-label="Increase quantity" 
                                onClick={() => onQuantityChange(item, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground font-mono">
                                ${(() => {
                                  let price = 0;
                                  if (item.OnDemand) {
                                    price = parseFloat(String(item.OnDemand));
                                  } else if (item.PricePerHour) {
                                    price = parseFloat(String(item.PricePerHour));
                                  } else if (item.PricePerGBMonth) {
                                    const size = parseFloat(String(item["Size (GiB)"] || 0));
                                    const pricePerGB = parseFloat(String(item.PricePerGBMonth || 0));
                                    price = (size * pricePerGB) / (24 * 30);
                                  }
                                  return (price * item.quantity).toFixed(2);
                                })()}<span className="text-xs text-muted-foreground font-normal">/hr</span>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                ${(() => {
                                  let price = 0;
                                  if (item.OnDemand) {
                                    price = parseFloat(String(item.OnDemand));
                                  } else if (item.PricePerHour) {
                                    price = parseFloat(String(item.PricePerHour));
                                  } else if (item.PricePerGBMonth) {
                                    const size = parseFloat(String(item["Size (GiB)"] || 0));
                                    const pricePerGB = parseFloat(String(item.PricePerGBMonth || 0));
                                    price = (size * pricePerGB) / (24 * 30);
                                  }
                                  return (price * item.quantity * 24 * 30).toFixed(0);
                                })()}/mo
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Attached Items */}
                        {attachedItems.length > 0 && (
                          <div className="border-t border-border bg-muted/30">
                            <div className="px-3 py-2">
                              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                <div className="w-4 h-px bg-muted-foreground"></div>
                                <span>Attached Storage</span>
                                <div className="flex-1 h-px bg-muted-foreground"></div>
                              </div>
                              {attachedItems.map((attachedItem: any, attachedIndex: number) => {
                                const attachedKey = attachedItem["Volume Type"] || "Unknown";
                                const attachedUniqueKey = `${attachedKey}-${attachedItem["Size (GiB)"] || 0}-attached-${attachedIndex}`;
                                return (
                                  <div key={attachedUniqueKey} className="flex items-center justify-between bg-card rounded-lg p-2 mb-2 last:mb-0 border border-border/50">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-muted rounded-md">
                                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-sm text-foreground">{attachedKey}</div>
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                          {attachedItem["Size (GiB)"] && (
                                            <span>{attachedItem["Size (GiB)"]} GiB</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                                        <button 
                                          className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                                          aria-label="Decrease quantity" 
                                          onClick={() => {
                                            if (attachedItem.quantity === 1) {
                                              onRemove(attachedItem);
                                            } else {
                                              onQuantityChange(attachedItem, attachedItem.quantity - 1);
                                            }
                                          }}
                                        >
                                          <Minus className="w-2.5 h-2.5" />
                                        </button>
                                        <span className="text-xs font-medium text-foreground min-w-[16px] text-center">
                                          {attachedItem.quantity}
                                        </span>
                                        <button 
                                          className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                                          aria-label="Increase quantity" 
                                          onClick={() => onQuantityChange(attachedItem, attachedItem.quantity + 1)}
                                        >
                                          <Plus className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-mono font-medium text-foreground">
                                          ${(() => {
                                            const size = parseFloat(String(attachedItem["Size (GiB)"] || 0));
                                            const pricePerGB = parseFloat(String(attachedItem.PricePerGBMonth || 0));
                                            const monthlyPrice = size * pricePerGB;
                                            const hourlyPrice = monthlyPrice / (24 * 30.44); // Use 30.44 days per month for more accurate calculation
                                            return (hourlyPrice * attachedItem.quantity).toFixed(3);
                                          })()}/hr
                                        </div>
                                      </div>
                                      <button 
                                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-500 transition-all"
                                        aria-label="Remove attached storage" 
                                        title="Remove attached storage" 
                                        onClick={() => onRemove(attachedItem)}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-border bg-card flex-shrink-0">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Cost Summary</h3>
            <div className="bg-gradient-to-br from-muted to-muted/80 rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  Hourly
                </span>
                <span className="text-lg font-bold text-foreground font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input 
              type="text" 
              placeholder="Name this configuration..." 
              value={sessionName} 
              onChange={e => setSessionName(e.target.value)} 
              className="h-8 text-sm bg-muted border-border focus:border-primary focus:bg-card rounded-lg" 
            />
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 font-semibold text-sm h-8 bg-primary hover:bg-primary/80 text-primary-foreground shadow-md rounded-lg" 
                onClick={onSave}
                disabled={items.length === 0 || !sessionName.trim()}
              >
                <Check className="w-3 h-3 mr-1.5" />
                Save Configuration
              </Button>
              <Button 
                className="px-3 h-8 rounded-lg" 
                variant="outline" 
                onClick={handleClearClick}
                disabled={items.length === 0}
                title="Clear cart"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
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

function EBSSelectionDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  onSkipStorage,
  availableVolumes,
  ec2InstanceType,
  defaultVolumeType,
  defaultSize 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (volume: EBSVolume, size: number) => void;
  onSkipStorage?: () => void;
  availableVolumes: EBSVolume[];
  ec2InstanceType?: string;
  defaultVolumeType?: string;
  defaultSize?: number;
}) {
  const [selectedVolumeType, setSelectedVolumeType] = useState(defaultVolumeType || "gp3");
  const [selectedSize, setSelectedSize] = useState(defaultSize || 100);
  
  // Reset when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      setSelectedVolumeType(defaultVolumeType || "gp3");
      setSelectedSize(defaultSize || 100);
    }
  }, [open, defaultVolumeType, defaultSize]);
  
  const volumeTypes = [...new Set(availableVolumes.map(v => v["Volume Type"]))];
  const selectedVolume = availableVolumes.find(v => v["Volume Type"] === selectedVolumeType);
  
  const handleConfirm = () => {
    if (selectedVolume) {
      const customVolume = {
        ...selectedVolume,
        "Size (GiB)": selectedSize
      };
      onConfirm(customVolume, selectedSize);
      onOpenChange(false);
    }
  };

  const calculateMonthlyCost = () => {
    if (!selectedVolume) return 0;
    return selectedSize * selectedVolume.PricePerGBMonth;
  };

  const calculateHourlyCost = () => {
    return calculateMonthlyCost() / (24 * 30.44);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add EBS Storage</DialogTitle>
          <DialogDescription>
            {ec2InstanceType 
              ? `Configure storage for ${ec2InstanceType}. This instance requires EBS storage to function.`
              : "Configure your EBS volume size and specifications."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Volume Type</label>
            <Select value={selectedVolumeType} onValueChange={setSelectedVolumeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {volumeTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Size (GiB)</label>
            <Input
              type="number"
              min="1"
              max="16384"
              value={selectedSize}
              onChange={(e) => setSelectedSize(parseInt(e.target.value) || 100)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 1 GiB, Maximum: 16,384 GiB
            </p>
          </div>
          
          {selectedVolume && (
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IOPS:</span>
                <span className="font-medium">{selectedVolume.IOPS}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Throughput:</span>
                <span className="font-medium">{selectedVolume["Throughput (MB/s)"]} MB/s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per GB/month:</span>
                <span className="font-medium">${selectedVolume.PricePerGBMonth}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Monthly cost:</span>
                  <span>${calculateMonthlyCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hourly cost:</span>
                  <span>${calculateHourlyCost().toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              if (ec2InstanceType && onSkipStorage) {
                onSkipStorage();
              } else {
                onOpenChange(false);
              }
            }}
          >
            {ec2InstanceType ? "Skip Storage" : "Cancel"}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedVolume}>
            {ec2InstanceType ? "Add Storage" : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SearchCriteria {
  field: string;
  operator: string;
  value: string;
  id: string;
}

interface AdvancedSearchProps {
  searchCriteria: SearchCriteria[];
  setSearchCriteria: (criteria: SearchCriteria[]) => void;
  quickSearch: string;
  setQuickSearch: (search: string) => void;
  service: "ec2" | "ebs" | "rds";
}

function AdvancedSearch({ 
  searchCriteria, 
  setSearchCriteria, 
  quickSearch, 
  setQuickSearch,
  service 
}: AdvancedSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const fieldOptions = {
    ec2: [
      { value: "Instance Type", label: "Instance Type" },
      { value: "vCPU", label: "vCPU" },
      { value: "Memory", label: "Memory" },
      { value: "OnDemand", label: "Price (On-Demand)" },
      { value: "Operating System", label: "Operating System" },
      { value: "Storage Edition", label: "Storage Edition" },
      { value: "Model", label: "Model" },
    ],
    ebs: [
      { value: "Volume Type", label: "Volume Type" },
      { value: "Size (GiB)", label: "Size (GiB)" },
      { value: "IOPS", label: "IOPS" },
      { value: "Throughput (MB/s)", label: "Throughput (MB/s)" },
      { value: "PricePerGBMonth", label: "Price per GB/Month" },
      { value: "Description", label: "Description" },
    ],
    rds: [
      { value: "Instance Type", label: "Instance Type" },
      { value: "Engine", label: "Engine" },
      { value: "vCPU", label: "vCPU" },
      { value: "Memory (GiB)", label: "Memory (GiB)" },
      { value: "Storage (GiB)", label: "Storage (GiB)" },
      { value: "PricePerHour", label: "Price per Hour" },
    ]
  };

  const operatorOptions = [
    { value: "contains", label: "contains", icon: "🔍" },
    { value: "equals", label: "equals", icon: "=" },
    { value: "gt", label: "greater than", icon: ">" },
    { value: "lt", label: "less than", icon: "<" },
    { value: "gte", label: "greater than or equal", icon: "≥" },
    { value: "lte", label: "less than or equal", icon: "≤" },
    { value: "startsWith", label: "starts with", icon: "^" },
    { value: "endsWith", label: "ends with", icon: "$" },
    { value: "not", label: "does not contain", icon: "≠" },
  ];

  const addCriteria = () => {
    const newCriteria: SearchCriteria = {
      id: Date.now().toString(),
      field: fieldOptions[service][0].value,
      operator: "contains",
      value: ""
    };
    setSearchCriteria([...searchCriteria, newCriteria]);
  };

  const updateCriteria = (id: string, updates: Partial<SearchCriteria>) => {
    setSearchCriteria(
      searchCriteria.map(criteria => 
        criteria.id === id ? { ...criteria, ...updates } : criteria
      )
    );
  };

  const removeCriteria = (id: string) => {
    setSearchCriteria(searchCriteria.filter(criteria => criteria.id !== id));
  };

  const clearAllCriteria = () => {
    setSearchCriteria([]);
    setQuickSearch("");
  };

  const hasActiveFilters = searchCriteria.length > 0 || quickSearch.trim() !== "";

  return (
    <div className="space-y-3">
      {/* Quick Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Quick search across all fields..." 
          className="pl-10 pr-24 h-10 rounded-xl bg-background" 
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${searchCriteria.length > 0 ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Settings className="w-3 h-3 mr-1" />
                Advanced
                {searchCriteria.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {searchCriteria.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-sm mb-2">Advanced Search</h4>
                <p className="text-xs text-muted-foreground">
                  Add multiple criteria to filter results precisely
                </p>
              </div>
              
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {searchCriteria.map((criteria) => (
                  <div key={criteria.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Select
                      value={criteria.field}
                      onValueChange={(value) => updateCriteria(criteria.id, { field: value })}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions[service].map((field) => (
                          <SelectItem key={field.value} value={field.value} className="text-xs">
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={criteria.operator}
                      onValueChange={(value) => updateCriteria(criteria.id, { operator: value })}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map((op) => (
                          <SelectItem key={op.value} value={op.value} className="text-xs">
                            <span className="mr-2">{op.icon}</span>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Value..."
                      value={criteria.value}
                      onChange={(e) => updateCriteria(criteria.id, { value: e.target.value })}
                      className="flex-1 h-8 text-xs"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(criteria.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {searchCriteria.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No advanced filters set</p>
                    <p className="text-xs">Click "Add Filter" to get started</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t bg-muted/30 flex justify-between">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCriteria}
                    className="h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Filter
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllCriteria}
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdvancedOpen(false)}
                  className="h-8 text-xs"
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
          
          {quickSearch && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <SearchIcon className="w-3 h-3" />
              "{quickSearch}"
              <button
                onClick={() => setQuickSearch("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          )}
          
          {searchCriteria.map((criteria) => (
            <Badge key={criteria.id} variant="outline" className="gap-1 text-xs">
              <span className="font-medium">{criteria.field}</span>
              <span className="text-muted-foreground">
                {operatorOptions.find(op => op.value === criteria.operator)?.icon}
              </span>
              <span>"{criteria.value}"</span>
              <button
                onClick={() => removeCriteria(criteria.id)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
          
          {(searchCriteria.length > 1 || quickSearch) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllCriteria}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CostsPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [ebsVolumes, setEbsVolumes] = useState<any[]>([]);
  const [rdsInstances, setRdsInstances] = useState<any[]>([]);
  const [basket, setBasket] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([]);
  const [sessionSearchTerm, setSessionSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<string>("OnDemand_desc");
  const [timeRange, setTimeRange] = useState("30d");
  const [service, setService] = useState<"ec2" | "ebs" | "rds">("ec2");
  const [region, setRegion] = useState("all");
  const [sessionName, setSessionName] = useState("");
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [ebsDialogOpen, setEbsDialogOpen] = useState(false);
  const [pendingEC2Instance, setPendingEC2Instance] = useState<any>(null);
  const [selectedEBSVolume, setSelectedEBSVolume] = useState<any>(null);
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
    setIsInitialized(true);
  }, []);

  // Save sessions to localStorage whenever savedSessions changes (but not on initial load)
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('awsDashboardSessions', JSON.stringify(savedSessions));
    }
  }, [savedSessions, isInitialized]);

  // Load EC2 data
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
  }, []);

  // Load EBS data
  useEffect(() => {
    fetch("/data/EBS_Pricing.json")
      .then(res => res.json())
      .then((data) => {
        const valid = (data || []).filter((item: any) => {
          if (!item || typeof item !== 'object') return false;
          if (!item["Volume Type"] || typeof item["Volume Type"] !== 'string') return false;
          const price = parseFloat(item.PricePerGBMonth);
          if (isNaN(price)) return false;
          return true;
        });
        setEbsVolumes(valid);
      });
  }, []);

  // Load RDS data
  useEffect(() => {
    fetch("/data/RDS_Pricing.json")
      .then(res => res.json())
      .then((data) => {
        const valid = (data || []).filter((item: any) => {
          if (!item || typeof item !== 'object') return false;
          if (!item["Instance Type"] || typeof item["Instance Type"] !== 'string') return false;
          const price = parseFloat(item.PricePerHour);
          if (isNaN(price)) return false;
          return true;
        });
        setRdsInstances(valid);
      });
  }, []);

  const handleDragEnd = (event: any) => {
    console.log('Drag end event:', event);
    try {
      if (!event.active || !event.active.data || !event.active.data.current) {
        console.log('Missing drag data:', { 
          active: event.active, 
          data: event.active?.data, 
          current: event.active?.data?.current 
        });
        return;
      }
      const instance = event.active.data.current;
      console.log('Dragged instance:', instance);
      if (event.over && event.over.id === "basket") {
        console.log('Dropped on basket, adding item');
        handleAddToBasket(instance);
        toast({
          title: "Service added to cart",
          description: `${instance["Instance Type"] || instance["Volume Type"]} has been added to your cart.`,
        });
      } else {
        console.log('Not dropped on basket, over:', event.over);
      }
    } catch (err) {
      console.error('Drag end error:', err, event);
    }
  };

  const handleRemove = (itemToRemove: BasketItem) => {
    setBasket(prev => {
      // If removing an EC2 instance, also remove any attached EBS volumes
      if (itemToRemove["Instance Type"]) {
        const ec2Type = itemToRemove["Instance Type"];
        return prev.filter(i => {
          // Remove the specific EC2 instance and any EBS volumes attached to it
          return i !== itemToRemove && i.attachedTo !== ec2Type;
        });
      }
      
      // If removing an EBS volume, just remove that specific volume
      return prev.filter(i => i !== itemToRemove);
    });
    
    const itemKey = itemToRemove["Instance Type"] || itemToRemove["Volume Type"] || "Unknown";
    toast({
      title: "Service removed",
      description: `${itemKey} has been removed from your cart.`,
    });
  };

  const handleQuantityChange = (itemToChange: BasketItem, qty: number) => {
    setBasket(prev => prev.map(i => {
      return i === itemToChange ? { ...i, quantity: Math.max(1, qty) } : i;
    }));
  };

  const handleNoteChange = (itemToChange: BasketItem, note: string) => {
    setBasket(prev => prev.map(i => {
      return i === itemToChange ? { ...i, note } : i;
    }));
  };

  const handleAddToBasket = (instance: any) => {
    const itemKey = instance["Instance Type"] || instance["Volume Type"];
    
    // If this is an EC2 instance with "EBS only" storage, show the EBS selection dialog
    if (instance["Instance Type"] && instance["Storage Edition"] === "EBS only") {
      setPendingEC2Instance(instance);
      setEbsDialogOpen(true);
      return;
    }
    
    // If this is an EBS volume being added directly, show the EBS selection dialog
    if (instance["Volume Type"]) {
      setPendingEC2Instance(null); // No EC2 instance for standalone EBS
      setEbsDialogOpen(true);
      // Store the selected EBS volume type for the dialog
      setSelectedEBSVolume(instance);
      return;
    }
    
    // For RDS and other non-EBS services
    setBasket(prev => {
      const exists = prev.find(i => {
        const existingKey = i["Instance Type"] || i["Volume Type"];
        return existingKey === itemKey;
      });
      
      if (exists) {
        return prev.map(i => {
          const existingKey = i["Instance Type"] || i["Volume Type"];
          return existingKey === itemKey
            ? { ...i, quantity: i.quantity + 1 }
            : i;
        });
      } else {
        return [...prev, { ...instance, quantity: 1 }];
      }
    });

    // Handle toast notifications
    const exists = basket.find(i => {
      const existingKey = i["Instance Type"] || i["Volume Type"];
      return existingKey === itemKey;
    });
    
    if (exists) {
      toast({
        title: "Quantity updated",
        description: `${itemKey} quantity increased in your cart.`,
      });
    } else {
      toast({
        title: "Service added to cart",
        description: `${itemKey} has been added to your cart.`,
      });
    }
  };

  const handleEBSConfirm = (volume: EBSVolume, size: number) => {
    const volumeKey = `${volume["Volume Type"]}-${size}gb-${Date.now()}`;
    
    if (pendingEC2Instance) {
      // Adding EBS storage for an EC2 instance
      const ec2Key = pendingEC2Instance["Instance Type"];
      
      setBasket(prev => {
        const ec2Exists = prev.find(i => i["Instance Type"] === ec2Key);
        let newBasket = prev;
        
        if (ec2Exists) {
          newBasket = prev.map(i => 
            i["Instance Type"] === ec2Key
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          newBasket = [...prev, { ...pendingEC2Instance, quantity: 1 }];
        }
        
        // Add EBS volume with custom size, attached to EC2
        const customVolume = {
          ...volume,
          "Size (GiB)": size,
          quantity: 1,
          attachedTo: ec2Key,
          note: `${size} GiB attached to ${ec2Key}`
        };
        
        return [...newBasket, customVolume];
      });
      
      toast({
        title: "Services added to cart",
        description: `${ec2Key} and ${size} GiB ${volume["Volume Type"]} storage have been added to your cart.`,
      });
      
      setPendingEC2Instance(null);
    } else {
      // Adding standalone EBS volume
      const customVolume = {
        ...volume,
        "Size (GiB)": size,
        quantity: 1,
        note: `${size} GiB ${volume["Volume Type"]} volume`
      };
      
      setBasket(prev => {
        const volumeTypeKey = `${volume["Volume Type"]}-${size}gb`;
        const exists = prev.find(i => 
          i["Volume Type"] === volume["Volume Type"] && 
          i["Size (GiB)"] === size &&
          !i.attachedTo
        );
        
        if (exists) {
          return prev.map(i => 
            i["Volume Type"] === volume["Volume Type"] && 
            i["Size (GiB)"] === size &&
            !i.attachedTo
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          return [...prev, customVolume];
        }
      });
      
      toast({
        title: "Storage added to cart",
        description: `${size} GiB ${volume["Volume Type"]} volume has been added to your cart.`,
      });
    }
    
    setSelectedEBSVolume(null);
  };

  const handleSkipStorage = () => {
    if (!pendingEC2Instance) return;
    
    // Add only the EC2 instance without any storage
    setBasket(prev => {
      const ec2Key = pendingEC2Instance["Instance Type"];
      const exists = prev.find(i => i["Instance Type"] === ec2Key);
      
      if (exists) {
        return prev.map(i => 
          i["Instance Type"] === ec2Key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { ...pendingEC2Instance, quantity: 1 }];
      }
    });
    
    toast({
      title: "EC2 instance added",
      description: `${pendingEC2Instance["Instance Type"]} has been added to your cart without storage.`,
    });
    
    // Clean up and close dialog
    setPendingEC2Instance(null);
    setEbsDialogOpen(false);
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

    const total = basket.reduce((sum, item) => {
      if (item.OnDemand) {
        return sum + parseFloat(String(item.OnDemand)) * item.quantity;
      } else if (item.PricePerHour) {
        return sum + parseFloat(String(item.PricePerHour)) * item.quantity;
      } else if (item.PricePerGBMonth) {
        // For EBS, calculate monthly cost based on size and price per GB, then convert to hourly
        const size = parseFloat(String(item["Size (GiB)"] || 0));
        const pricePerGB = parseFloat(String(item.PricePerGBMonth || 0));
        const monthlyPrice = size * pricePerGB;
        const hourlyPrice = monthlyPrice / (24 * 30.44); // Use 30.44 days per month for more accurate calculation
        return sum + (hourlyPrice * item.quantity);
      }
      return sum;
    }, 0);
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

  // Advanced filtering logic
  const applyFilters = (items: any[]) => {
    return items.filter(item => {
      // Quick search across all fields - treat spaces as separators
      if (searchTerm.trim()) {
        const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);
        const itemText = Object.values(item).join(' ').toLowerCase();
        
        // All search terms must be present (AND logic)
        const matchesQuickSearch = searchTerms.every(term => 
          itemText.includes(term)
        );
        if (!matchesQuickSearch) return false;
      }

      // Advanced search criteria
      for (const criteria of searchCriteria) {
        if (!criteria.value.trim()) continue;
        
        const fieldValue = String(item[criteria.field] || "").toLowerCase();
        const searchValue = criteria.value.toLowerCase();
        const numericFieldValue = parseFloat(String(item[criteria.field] || "0"));
        const numericSearchValue = parseFloat(criteria.value);

        let matches = false;
        
        switch (criteria.operator) {
          case "contains":
            matches = fieldValue.includes(searchValue);
            break;
          case "equals":
            matches = fieldValue === searchValue;
            break;
          case "gt":
            matches = !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue > numericSearchValue;
            break;
          case "lt":
            matches = !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue < numericSearchValue;
            break;
          case "gte":
            matches = !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue >= numericSearchValue;
            break;
          case "lte":
            matches = !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue <= numericSearchValue;
            break;
          case "startsWith":
            matches = fieldValue.startsWith(searchValue);
            break;
          case "endsWith":
            matches = fieldValue.endsWith(searchValue);
            break;
          case "not":
            matches = !fieldValue.includes(searchValue);
            break;
          default:
            matches = fieldValue.includes(searchValue);
        }
        
        if (!matches) return false;
      }

      return true;
    });
  };

  const filteredInstances = applyFilters(instances);

  const filteredEBSVolumes = applyFilters(ebsVolumes);
  const filteredRDSInstances = applyFilters(rdsInstances);

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

  const sortedEBSVolumes = [...filteredEBSVolumes].sort((a, b) => {
    const [field, dir] = sortBy.split("_");
    let aValue = a[field];
    let bValue = b[field];
    
    if (["PricePerGBMonth", "Size (GiB)", "IOPS", "Throughput (MB/s)"].includes(field)) {
      aValue = parseFloat(String(aValue));
      bValue = parseFloat(String(bValue));
    }
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (aValue === bValue) return 0;
    if (dir === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  const sortedRDSInstances = [...filteredRDSInstances].sort((a, b) => {
    const [field, dir] = sortBy.split("_");
    let aValue = a[field];
    let bValue = b[field];
    
    if (["PricePerHour", "vCPU", "Memory (GiB)", "Storage (GiB)"].includes(field)) {
      aValue = parseFloat(String(aValue));
      bValue = parseFloat(String(bValue));
    }
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (aValue === bValue) return 0;
    if (dir === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  const total = basket.reduce((sum, item) => {
    if (item.OnDemand) {
      return sum + parseFloat(item.OnDemand) * item.quantity;
    } else if (item.PricePerGBMonth) {
      // For EBS, calculate monthly cost based on size and price per GB
      const size = parseFloat(item["Size (GiB)"]) || 0;
      const pricePerGB = parseFloat(item.PricePerGBMonth) || 0;
      return sum + (size * pricePerGB * item.quantity) / (24 * 30); // Convert to hourly
    } else if (item.PricePerHour) {
      return sum + parseFloat(item.PricePerHour) * item.quantity;
    }
    return sum;
  }, 0);

  const getServiceInfo = () => {
    switch (service) {
      case "ec2":
        return {
          title: "EC2 Instance Catalog",
          description: "Drag instances to cart or click + to add",
          icon: <Server className="w-5 h-5 text-foreground" />,
          count: sortedInstances.length,
          data: sortedInstances
        };
      case "ebs":
        return {
          title: "EBS Volume Catalog",
          description: "Drag volumes to cart or click + to add",
          icon: <HardDrive className="w-5 h-5 text-foreground" />,
          count: sortedEBSVolumes.length,
          data: sortedEBSVolumes
        };
      case "rds":
        return {
          title: "RDS Instance Catalog",
          description: "Drag instances to cart or click + to add",
          icon: <Database className="w-5 h-5 text-foreground" />,
          count: sortedRDSInstances.length,
          data: sortedRDSInstances
        };
      default:
        return {
          title: "EC2 Instance Catalog",
          description: "Drag instances to cart or click + to add",
          icon: <Server className="w-5 h-5 text-foreground" />,
          count: sortedInstances.length,
          data: sortedInstances
        };
    }
  };

  const serviceInfo = getServiceInfo();

  return (
    <div className="flex h-screen bg-background overflow-hidden" data-costs-page>
      <SavedSessionsSidebar 
        sessions={savedSessions}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        searchTerm={sessionSearchTerm}
        setSearchTerm={setSessionSearchTerm}
      />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-2xl">
              <BarChart2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
                AWS Cost Calculator
              </h1>
              <p className="text-xl text-muted-foreground mt-1">
                Build and estimate costs for your AWS infrastructure with real-time pricing
              </p>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Total</p>
                  <p className="text-2xl font-bold text-foreground mt-1">${total.toFixed(2)}/hr</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Items in Cart</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{basket.length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Saved Sessions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{savedSessions.length}</p>
                </div>
                <Box className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <FilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchCriteria={searchCriteria}
          setSearchCriteria={setSearchCriteria}
          sortBy={sortBy}
          setSortBy={setSortBy}
          service={service}
        />
        <ServiceCatalog selectedService={service} onServiceSelect={setService} />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                {serviceInfo.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{serviceInfo.title}</h2>
                <p className="text-sm text-muted-foreground">{serviceInfo.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {serviceInfo.count} {service === "ec2" ? "instances" : service === "ebs" ? "volumes" : "instances"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => setSearchTerm("")}
              >
                <Download className="w-4 h-4" />
                Export List
              </Button>
            </div>
          </div>
          <DndContext onDragEnd={handleDragEnd}>
            {service === "ec2" && (
              <EC2Table instances={serviceInfo.data} onAdd={handleAddToBasket} sortBy={sortBy} setSortBy={setSortBy} />
            )}
            {service === "ebs" && (
              <EBSTable volumes={serviceInfo.data} onAdd={handleAddToBasket} sortBy={sortBy} setSortBy={setSortBy} />
            )}
            {service === "rds" && (
              <RDSTable instances={serviceInfo.data} onAdd={handleAddToBasket} sortBy={sortBy} setSortBy={setSortBy} />
            )}
          </DndContext>
        </div>
        </div>
      </div>
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
      
      <EBSSelectionDialog
        open={ebsDialogOpen}
        onOpenChange={setEbsDialogOpen}
        onConfirm={handleEBSConfirm}
        onSkipStorage={handleSkipStorage}
        availableVolumes={ebsVolumes}
        ec2InstanceType={pendingEC2Instance?.["Instance Type"]}
        defaultVolumeType={selectedEBSVolume?.["Volume Type"]}
        defaultSize={selectedEBSVolume?.["Size (GiB)"]}
      />
    </div>
  );
} 