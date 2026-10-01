"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface ProductsState {
  items: Product[];
  status: "idle" | "loading" | "fulfilled" | "rejected";
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await api<Product[]>("/products");
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
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
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
