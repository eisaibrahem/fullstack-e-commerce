"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { ProductFiltersValue } from "@/components/ProductFilters";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface FetchProductsArgs {
  page?: number;
  filters?: ProductFiltersValue;
}

interface ProductsState {
  items: Product[];
  meta: PaginationMeta | null;
  status: "idle" | "loading" | "fulfilled" | "rejected";
  error: string | null;
  requestId: string | null;
}

const initialState: ProductsState = {
  items: [],
  meta: null,
  status: "idle",
  error: null,
  requestId: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (args: FetchProductsArgs = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: String(args.page ?? 1),
        limit: "12",
      });

      const filters = args.filters;
      if (filters) {
        const search = filters.search.trim();
        if (search) params.set("search", search);
        if (filters.sort !== "newest") params.set("sort", filters.sort);
        if (filters.minPrice !== "") params.set("minPrice", filters.minPrice);
        if (filters.maxPrice !== "") params.set("maxPrice", filters.maxPrice);
        if (filters.inStockOnly) params.set("inStock", "true");
      }

      return await api<Paginated<Product>>(`/products?${params.toString()}`);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch products");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (data: { name: string; price: number; stock: number }, { rejectWithValue }) => {
    try {
      return await api<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }: { id: number; data: { name: string; price: number; stock: number } }, { rejectWithValue }) => {
    try {
      return await api<Product>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to delete product");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "fulfilled";
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "rejected";
        state.error = action.payload as string;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.items = state.items.filter((p) => p.id !== action.payload.id);
        state.items.unshift(action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export default productsSlice.reducer;
