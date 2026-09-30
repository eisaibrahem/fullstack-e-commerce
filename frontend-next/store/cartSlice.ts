"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
}

interface CartState {
  items: CartItem[];
  status: "idle" | "loading" | "fulfilled" | "rejected";
  error: string | null;
}

const initialState: CartState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api<{ items: CartItem[] }>("/cart");
      return data?.items || [];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity }: { productId: number; quantity: number }, { rejectWithValue }) => {
    try {
      return await api<CartItem>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to add to cart");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ productId, quantity }: { productId: number; quantity: number }, { rejectWithValue }) => {
    try {
      return await api<CartItem>(`/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to update cart");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId: number, { rejectWithValue }) => {
    try {
      await api(`/cart/items/${productId}`, { method: "DELETE" });
      return productId;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to remove from cart");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await api("/cart", { method: "DELETE" });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to clear cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
        const existing = state.items.find((i) => i.productId === action.payload.productId);
        if (existing) {
          existing.quantity = action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartItem>) => {
        const item = state.items.find((i) => i.productId === action.payload.productId);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((i) => i.productId !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
