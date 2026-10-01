"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/store/productsSlice";

export interface ProductFormValues {
  name: string;
  price: number;
  stock: number;
  description: string;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct: (Product & { description?: string }) | null;
  saving: boolean;
  error: string | null;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  initialProduct,
  saving,
  error,
  onSubmit,
}: ProductFormDialogProps) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : "");
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialProduct ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            {initialProduct ? "Update the product details below." : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Saving...
                </span>
              ) : initialProduct ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
