"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersState {
  items: Order[];
  status: "idle" | "loading" | "fulfilled" | "rejected";
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await api<Order[]>("/orders");
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch orders");
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      });
  },
});

export default ordersSlice.reducer;
