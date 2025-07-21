"use client";

import { useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Cpu, HardDrive, Database, Server, Monitor, ShoppingCart, Trash2, Plus, Minus, Box, User, Layers, Cloud, AlertTriangle, BarChart2, Settings, ChevronDown, Search as SearchIcon, Download, Upload, X, Check, Activity, Clock } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

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
  onRemove: (type: string) => void;
  onQuantityChange: (type: string, qty: number) => void;
  onNoteChange: (type: string, note: string) => void;
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
      className={`min-h-[320px] flex flex-col rounded-3xl transition-all sticky top-8 shadow-2xl bg-gradient-to-b from-card to-muted ${isOver ? "ring-4 ring-primary ring-opacity-50 scale-[1.02]" : "ring-1 ring-border"}`}
      style={{ maxHeight: 600 }}
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
      
      {/* Items */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
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

  const handleExportSession = (session: SavedSession) => {
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
    
    toast({
      title: "Configuration exported",
      description: `${session.name} has been exported successfully.`,
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
      <aside className="w-[300px] bg-card border-r border-border flex flex-col h-full shadow-sm flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-full">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleExportSession(session);
                        }}
                        title="Export session"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
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
  service, setService, 
  region, setRegion,
  searchTerm, setSearchTerm,
  sortBy, setSortBy
}: any) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters & Search
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setService("all");
            setRegion("all");
            setSortBy("OnDemand_desc");
            setSearchTerm("");
          }}
          className="text-xs"
        >
          Reset Filters
        </Button>
      </div>
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Type</label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="w-full h-10 rounded-xl">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="ec2">EC2</SelectItem>
                <SelectItem value="ebs">EBS</SelectItem>
                <SelectItem value="rds">RDS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Region</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full h-10 rounded-xl">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-10 rounded-xl">
                <SelectValue placeholder="Sort by Cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OnDemand_desc">Cost (High to Low)</SelectItem>
                <SelectItem value="OnDemand_asc">Cost (Low to High)</SelectItem>
                <SelectItem value="PricePerGBMonth_desc">Price/GB (High to Low)</SelectItem>
                <SelectItem value="PricePerGBMonth_asc">Price/GB (Low to High)</SelectItem>
                <SelectItem value="PricePerHour_desc">Price/Hour (High to Low)</SelectItem>
                <SelectItem value="PricePerHour_asc">Price/Hour (Low to High)</SelectItem>
                <SelectItem value="Instance Type_asc">Instance Type (A-Z)</SelectItem>
                <SelectItem value="Volume Type_asc">Volume Type (A-Z)</SelectItem>
                <SelectItem value="vCPU_desc">vCPU (High to Low)</SelectItem>
                <SelectItem value="Memory_desc">Memory (High to Low)</SelectItem>
                <SelectItem value="Size (GiB)_desc">Size (High to Low)</SelectItem>
                <SelectItem value="IOPS_desc">IOPS (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search</label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search services..." 
                className="pl-10 h-10 rounded-xl" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div 
            key={i} 
            className={`group relative bg-card rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border ${
              selectedService === c.id 
                ? "border-foreground ring-2 ring-foreground ring-opacity-20" 
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => onServiceSelect(c.id)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-muted to-muted/50 opacity-0 group-hover:opacity-100 transition-opacity ${
              selectedService === c.id ? "opacity-100" : ""
            }`} />
            <div className="relative p-6">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${c.color} text-white mb-4 group-hover:scale-110 transition-transform ${
                selectedService === c.id ? "scale-110" : ""
              }`}>
                {c.icon}
              </div>
              <h3 className="font-bold text-xl text-foreground mb-1">{c.label}</h3>
              <p className="text-sm text-muted-foreground mb-2">{c.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.count}</span>
                {selectedService === c.id ? (
                  <Check className="w-4 h-4 text-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:translate-y-1 transition-transform" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EC2Table({ instances, onAdd }: { instances: any[]; onAdd: (instance: any) => void }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(instances.length / rowsPerPage);
  const paginatedInstances = instances.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
                vCPU
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Memory
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Storage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cost/hr
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

function EBSTable({ volumes, onAdd }: { volumes: any[]; onAdd: (volume: any) => void }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(volumes.length / rowsPerPage);
  const paginatedVolumes = volumes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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

function RDSTable({ instances, onAdd }: { instances: any[]; onAdd: (instance: any) => void }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(instances.length / rowsPerPage);
  const paginatedInstances = instances.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
        className={`w-[380px] bg-card border-l border-border flex flex-col h-full shadow-xl flex-shrink-0 transition-all duration-200 ${isOver ? "ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-950" : ""}`}
      >
        <div className="px-5 py-5 bg-gradient-to-r from-card to-muted text-foreground">
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
        <div className="flex-1 px-5 py-5 overflow-y-auto bg-gradient-to-b from-card to-muted min-h-0 max-h-full">
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
                  .map((item: BasketItem) => {
                    const itemKey = item["Instance Type"] || item["Volume Type"] || "Unknown";
                    const attachedItems = items.filter((i: BasketItem) => i.attachedTo === itemKey);
                    return (
                      <li key={itemKey} className="group bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all hover:border-muted-foreground">
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
                                </div>
                              </div>
                            </div>
                            <button 
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                              aria-label="Remove" 
                              title="Remove from cart" 
                              onClick={() => onRemove(itemKey)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <Input
                            type="text"
                            placeholder="Add a tag or note..."
                            value={String(item.note ?? "")}
                            onChange={e => onNoteChange(itemKey, e.target.value)}
                            className="text-xs bg-muted border-border focus:bg-card"
                          />
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                              <button 
                                className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                                aria-label="Decrease quantity" 
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    onRemove(itemKey);
                                  } else {
                                    onQuantityChange(itemKey, item.quantity - 1);
                                  }
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input 
                                type="number" 
                                min={1} 
                                value={String(item.quantity)} 
                                onChange={e => onQuantityChange(itemKey, parseInt(e.target.value) || 1)} 
                                className="w-12 text-center bg-card border border-border rounded-md px-1 py-1 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent" 
                              />
                              <button 
                                className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                                aria-label="Increase quantity" 
                                onClick={() => onQuantityChange(itemKey, item.quantity + 1)}
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
                              {attachedItems.map((attachedItem: any) => {
                                const attachedKey = attachedItem["Volume Type"] || "Unknown";
                                return (
                                  <div key={attachedKey} className="flex items-center justify-between bg-card rounded-lg p-2 mb-2 last:mb-0 border border-border/50">
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
                                              onRemove(attachedKey);
                                            } else {
                                              onQuantityChange(attachedKey, attachedItem.quantity - 1);
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
                                          onClick={() => onQuantityChange(attachedKey, attachedItem.quantity + 1)}
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
                                        onClick={() => onRemove(attachedKey)}
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
        <div className="px-5 py-5 border-t border-border bg-card flex-shrink-0">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-foreground mb-2.5 uppercase tracking-wider">Cost Summary</h3>
            <div className="bg-gradient-to-br from-muted to-muted/80 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  Hourly
                </span>
                <span className="text-lg font-bold text-foreground font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <Input 
              type="text" 
              placeholder="Name this configuration..." 
              value={sessionName} 
              onChange={e => setSessionName(e.target.value)} 
              className="h-9 text-sm bg-muted border-border focus:border-primary focus:bg-card rounded-lg" 
            />
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 font-semibold text-sm h-9 bg-primary hover:bg-primary/80 text-primary-foreground shadow-md rounded-lg" 
                onClick={onSave}
                disabled={items.length === 0 || !sessionName.trim()}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Save Configuration
              </Button>
              <Button 
                className="px-3 h-9 rounded-lg" 
                variant="outline" 
                onClick={handleClearClick}
                disabled={items.length === 0}
                title="Clear cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
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

export default function CostsPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [ebsVolumes, setEbsVolumes] = useState<any[]>([]);
  const [rdsInstances, setRdsInstances] = useState<any[]>([]);
  const [basket, setBasket] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionSearchTerm, setSessionSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<string>("OnDemand_desc");
  const [service, setService] = useState<"ec2" | "ebs" | "rds">("ec2");
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

  const handleRemove = (type: string) => {
    setBasket(prev => {
      // If removing an EC2 instance, also remove any attached EBS volumes
      const isEC2 = prev.find(i => i["Instance Type"] === type);
      if (isEC2) {
        return prev.filter(i => {
          const itemKey = i["Instance Type"] || i["Volume Type"];
          // Remove the EC2 instance and any EBS volumes attached to it
          return itemKey !== type && i.attachedTo !== type;
        });
      }
      
      // If removing an EBS volume, just remove that volume
      return prev.filter(i => {
        const itemKey = i["Instance Type"] || i["Volume Type"];
        return itemKey !== type;
      });
    });
    
    toast({
      title: "Service removed",
      description: `${type} has been removed from your cart.`,
    });
  };

  const handleQuantityChange = (type: string, qty: number) => {
    setBasket(prev => prev.map(i => {
      const itemKey = i["Instance Type"] || i["Volume Type"];
      return itemKey === type ? { ...i, quantity: Math.max(1, qty) } : i;
    }));
  };

  const handleNoteChange = (type: string, note: string) => {
    setBasket(prev => prev.map(i => {
      const itemKey = i["Instance Type"] || i["Volume Type"];
      return itemKey === type ? { ...i, note } : i;
    }));
  };

  const handleAddToBasket = (instance: any) => {
    const itemKey = instance["Instance Type"] || instance["Volume Type"];
    
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
        let newItems = [{ ...instance, quantity: 1 }];
        
        // If this is an EC2 instance with "EBS only" storage, automatically add a gp3 EBS volume
        if (instance["Instance Type"] && instance["Storage Edition"] === "EBS only") {
          // Find a suitable gp3 EBS volume from the loaded data
          const gp3Volume = ebsVolumes.find(vol => 
            vol["Volume Type"] === "gp3" && 
            vol["Size (GiB)"] === 100 && 
            vol.Region === "us-east-1"
          );
          
          if (gp3Volume) {
            // Check if gp3 volume already exists in cart
            const gp3Exists = prev.find(i => i["Volume Type"] === "gp3");
            if (!gp3Exists) {
              // Add EBS volume with attachment info
              newItems.push({ 
                ...gp3Volume, 
                quantity: 1, 
                attachedTo: instance["Instance Type"],
                note: `Attached to ${instance["Instance Type"]}`
              });
            }
          }
        }
        
        return [...prev, ...newItems];
      }
    });

    // Handle toast notifications after state update
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
      // Check if we're adding EC2 with EBS
      if (instance["Instance Type"] && instance["Storage Edition"] === "EBS only") {
        const gp3Volume = ebsVolumes.find(vol => 
          vol["Volume Type"] === "gp3" && 
          vol["Size (GiB)"] === 100 && 
          vol.Region === "us-east-1"
        );
        
        if (gp3Volume) {
          const gp3Exists = basket.find(i => i["Volume Type"] === "gp3");
          if (!gp3Exists) {
            toast({
              title: "Services added to cart",
              description: `${itemKey} and gp3 EBS volume have been added to your cart.`,
            });
          } else {
            toast({
              title: "Service added to cart",
              description: `${itemKey} has been added to your cart.`,
            });
          }
        } else {
          toast({
            title: "Service added to cart",
            description: `${itemKey} has been added to your cart.`,
          });
        }
      } else {
        toast({
          title: "Service added to cart",
          description: `${itemKey} has been added to your cart.`,
        });
      }
    }
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

  const filteredInstances = instances.filter(i => {
    // Search
    const matchesSearch = Object.values(i).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Add more filters here based on service, region, etc.
    return matchesSearch;
  });

  const filteredEBSVolumes = ebsVolumes.filter(v => {
    // Search
    const matchesSearch = Object.values(v).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesSearch;
  });

  const filteredRDSInstances = rdsInstances.filter(r => {
    // Search
    const matchesSearch = Object.values(r).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
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
    <div className="flex h-[calc(100vh-5rem)] min-h-[600px] bg-background" data-costs-page>
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
          service={service} 
          setService={setService} 
          region={region} 
          setRegion={setRegion}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
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
              <EC2Table instances={serviceInfo.data} onAdd={handleAddToBasket} />
            )}
            {service === "ebs" && (
              <EBSTable volumes={serviceInfo.data} onAdd={handleAddToBasket} />
            )}
            {service === "rds" && (
              <RDSTable instances={serviceInfo.data} onAdd={handleAddToBasket} />
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
    </div>
  );
} 