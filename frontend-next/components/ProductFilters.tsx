"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Product } from "@/store/productsSlice";

export type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

export interface ProductFiltersValue {
  search: string;
  sort: SortKey;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
}

export const defaultProductFilters: ProductFiltersValue = {
  search: "",
  sort: "newest",
  minPrice: "",
  maxPrice: "",
  inStockOnly: false,
};

export function filterProducts(products: Product[], filters: ProductFiltersValue): Product[] {
  const search = filters.search.trim().toLowerCase();
  const min = filters.minPrice === "" ? null : Number(filters.minPrice);
  const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);

  const filtered = products.filter((product) => {
    const price = Number(product.price);
    if (search && !product.name.toLowerCase().includes(search)) return false;
    if (min !== null && !Number.isNaN(min) && price < min) return false;
    if (max !== null && !Number.isNaN(max) && price > max) return false;
    if (filters.inStockOnly && product.stock <= 0) return false;
    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    case "name-asc":
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    default:
      return filtered;
  }
}

interface ProductFiltersProps {
  value: ProductFiltersValue;
  onChange: (value: ProductFiltersValue) => void;
}

export function ProductFilters({ value, onChange }: ProductFiltersProps) {
  const set = (patch: Partial<ProductFiltersValue>) => onChange({ ...value, ...patch });

  const hasActiveFilters =
    value.search !== "" ||
    value.minPrice !== "" ||
    value.maxPrice !== "" ||
    value.inStockOnly ||
    value.sort !== "newest";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          placeholder="Search by name..."
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
          className="pl-8"
          aria-label="Search products by name"
        />
      </div>

      <select
        value={value.sort}
        onChange={(e) => set({ sort: e.target.value as SortKey })}
        aria-label="Sort products"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="newest">Newest first</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="name-asc">Name: A-Z</option>
      </select>

      <Input
        type="number"
        min={0}
        placeholder="Min $"
        value={value.minPrice}
        onChange={(e) => set({ minPrice: e.target.value })}
        className="w-24"
        aria-label="Minimum price"
      />
      <Input
        type="number"
        min={0}
        placeholder="Max $"
        value={value.maxPrice}
        onChange={(e) => set({ maxPrice: e.target.value })}
        className="w-24"
        aria-label="Maximum price"
      />

      <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.inStockOnly}
          onChange={(e) => set({ inStockOnly: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-blue-600"
        />
        In stock only
      </label>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={() => onChange({ ...defaultProductFilters })}>
          <X className="w-4 h-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
