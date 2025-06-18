"use client";

import { useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Cpu, HardDrive, Database, Server, Monitor, ShoppingCart, Trash2, Plus, Minus, Box } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

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
        <h2 className="text-lg font-bold tracking-wide">Panier</h2>
      </div>
      {/* Items */}
      <div className="flex-1 px-4 py-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Box className="w-10 h-10 mb-2" />
            <span className="text-base">Drag EC2 instances here</span>
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

export default function CostsPage() {
  const [instances, setInstances] = useState<EC2Instance[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<string>("OnDemand_desc");

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

  const handleDragEnd = (event: any) => {
    try {
      if (!event.active || !event.active.data || !event.active.data.current) return;
      const instance: EC2Instance = event.active.data.current;
      if (event.over && event.over.id === "basket") {
        setBasket(prev => {
          const exists = prev.find(i => i["Instance Type"] === instance["Instance Type"]);
          if (exists) {
            return prev.map(i =>
              i["Instance Type"] === instance["Instance Type"]
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          } else {
            return [...prev, { ...instance, quantity: 1 }];
          }
        });
      }
    } catch (err) {
      console.error('Drag end error:', err, event);
    }
  };

  const handleRemove = (type: string) => {
    setBasket(prev => prev.filter(i => i["Instance Type"] !== type));
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

  // Helper: get unique values for a field
  const getUniqueValues = (field: string) => {
    const values = new Set<string>();
    instances.forEach(item => {
      const value = item[field as keyof EC2Instance];
      if (value !== null && value !== undefined && value !== "") {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  // Filtering logic
  const filteredInstances = instances.filter(i => {
    // Search
    const matchesSearch = Object.values(i).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
    // Filters
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      return String(i[key as keyof EC2Instance]) === value;
    });
    return matchesSearch && matchesFilters;
  });

  // Sorting logic
  const sortedInstances = [...filteredInstances].sort((a, b) => {
    const [field, dir] = sortBy.split("_");
    let aValue = a[field as keyof EC2Instance];
    let bValue = b[field as keyof EC2Instance];
    // Numeric sort for numbers
    if (["OnDemand", "Reserved", "vCPU"].includes(field)) {
      aValue = parseFloat(String(aValue));
      bValue = parseFloat(String(bValue));
    }
    // Memory: parse number from '128 GiB'
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

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black">EC2 Cost Calculator</h1>
      {/* Search, Filters, Sort all in one row */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search all attributes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border rounded px-3 py-2 shadow-sm"
        />
        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[300px]">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Instance Type */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Instance Type</div>
              <Select
                value={filters["Instance Type"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Instance Type"];
                  } else {
                    newFilters["Instance Type"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Instance Type").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* vCPU */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">vCPU</div>
              <Select
                value={filters["vCPU"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["vCPU"];
                  } else {
                    newFilters["vCPU"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("vCPU").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Memory */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Memory</div>
              <Select
                value={filters["Memory"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Memory"];
                  } else {
                    newFilters["Memory"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Memory").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Storage Edition */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Storage Edition</div>
              <Select
                value={filters["Storage Edition"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Storage Edition"];
                  } else {
                    newFilters["Storage Edition"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Storage Edition").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Model */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Model</div>
              <Select
                value={filters["Model"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Model"];
                  } else {
                    newFilters["Model"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Model").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Operating System */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Operating System</div>
              <Select
                value={filters["Operating System"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Operating System"];
                  } else {
                    newFilters["Operating System"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Operating System").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Deployment Option */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Deployment Option</div>
              <Select
                value={filters["Deployment Option"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Deployment Option"];
                  } else {
                    newFilters["Deployment Option"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Deployment Option").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* OnDemand */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">OnDemand</div>
              <Select
                value={filters["OnDemand"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["OnDemand"];
                  } else {
                    newFilters["OnDemand"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("OnDemand").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Reserved */}
            <div className="p-2">
              <div className="text-xs font-medium mb-1">Reserved</div>
              <Select
                value={filters["Reserved"] || "__all__"}
                onValueChange={v => setFilters(f => {
                  const newFilters = { ...f };
                  if (v === "__all__") {
                    delete newFilters["Reserved"];
                  } else {
                    newFilters["Reserved"] = v;
                  }
                  return newFilters;
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {getUniqueValues("Reserved").map(val => (
                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Clear Filters */}
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setFilters({})}
              >
                Clear All Filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy("OnDemand_desc")}>OnDemand (High to Low)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("OnDemand_asc")}>OnDemand (Low to High)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("Reserved_desc")}>Reserved (High to Low)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("Reserved_asc")}>Reserved (Low to High)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("vCPU_desc")}>vCPU (High to Low)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("vCPU_asc")}>vCPU (Low to High)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("Memory_desc")}>Memory (High to Low)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("Memory_asc")}>Memory (Low to High)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Search and Instance List */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-black">EC2 Instances</h2>
            <div className="border-b mb-4" />
            <div className="border rounded-lg bg-white max-h-[600px] overflow-y-auto shadow-md p-2">
              {sortedInstances.length === 0 ? (
                <div className="p-4 text-gray-500">No instances found.</div>
              ) : (
                sortedInstances.map((instance, idx) => (
                  <InstanceListItem key={instance["Instance Type"] + idx} instance={instance} id={instance["Instance Type"] + idx} />
                ))
              )}
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <Basket
              items={basket}
              onRemove={handleRemove}
              onQuantityChange={handleQuantityChange}
              onNoteChange={handleNoteChange}
            />
          </div>
        </div>
      </DndContext>
    </div>
  );
} 