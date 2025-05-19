"use client";

import { useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Cpu, HardDrive, Database, Server, Monitor, ShoppingCart, Trash2, Plus, Minus, Box } from "lucide-react";

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

function Basket({ items, onRemove, onQuantityChange }: {
  items: BasketItem[];
  onRemove: (type: string) => void;
  onQuantityChange: (type: string, qty: number) => void;
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
                    value={item.quantity}
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

  // Filtered list based on search
  const filteredInstances = instances.filter(i =>
    i["Instance Type"].toLowerCase().includes(search.toLowerCase()) ||
    i["Operating System"].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black">EC2 Cost Calculator</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-black">EC2 Instances</h2>
            <input
              type="text"
              placeholder="Search instance type or OS..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-4 w-full max-w-md border rounded px-3 py-2 shadow-sm"
            />
            <div className="border-b mb-4" />
            <div className="border rounded-lg bg-white max-h-[600px] overflow-y-auto shadow-md p-2">
              {filteredInstances.length === 0 ? (
                <div className="p-4 text-gray-500">No instances found.</div>
              ) : (
                filteredInstances.map((instance, idx) => (
                  <InstanceListItem key={instance["Instance Type"] + idx} instance={instance} id={instance["Instance Type"] + idx} />
                ))
              )}
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <Basket items={basket} onRemove={handleRemove} onQuantityChange={handleQuantityChange} />
          </div>
        </div>
      </DndContext>
    </div>
  );
} 