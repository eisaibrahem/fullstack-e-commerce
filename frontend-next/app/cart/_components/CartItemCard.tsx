"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/ProductImage";
import { Spinner } from "@/components/Spinner";
import { Trash2, Minus, Plus } from "lucide-react";
import type { CartItem } from "@/store/cartSlice";

interface CartItemCardProps {
  item: CartItem;
  busy: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}

export function CartItemCard({ item, busy, onDecrement, onIncrement, onRemove }: CartItemCardProps) {
  return (
    <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <ProductImage
          src={item.product.image}
          alt={item.product.name}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{item.product.name}</h3>
          <p className="text-sm text-zinc-500">${Number(item.product.price).toFixed(2)} each</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={onDecrement}>
              {busy ? <Spinner className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button variant="outline" size="sm" disabled={busy} onClick={onIncrement}>
              {busy ? <Spinner className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </Button>
          </div>
          <p className="font-semibold w-24 text-right">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
          <Button variant="destructive" size="sm" disabled={busy} onClick={onRemove}>
            {busy ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
