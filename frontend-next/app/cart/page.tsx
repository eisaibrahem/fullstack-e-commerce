"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeItem, updateQuantity, clearCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });
      dispatch(clearCart());
      setSuccess("Order placed successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 mb-4">Please login to view your cart</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">{error}</div>}
      {success && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md mb-4">{success}</div>}

      {items.length === 0 ? (
        <p className="text-zinc-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-zinc-500">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          dispatch(removeItem(item.productId));
                        } else {
                          dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
                        }
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="font-medium w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                  <Button variant="destructive" size="sm" onClick={() => dispatch(removeItem(item.productId))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Placing order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
