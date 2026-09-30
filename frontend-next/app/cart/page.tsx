"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCart, updateCartItem, removeFromCart, clearCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { ProductImage } from "@/components/ProductImage";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [orderStatus, setOrderStatus] = useState<"idle" | "loading" | "rejected">("idle");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    dispatch(fetchCart());
  }, [isAuthenticated, dispatch, router]);

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setSuccess("");
    setOrderStatus("loading");
    try {
      const { api } = await import("@/lib/api");
      await api("/orders", { method: "POST" });
      dispatch(clearCart());
      setSuccess("Order placed successfully!");
    } catch (err: unknown) {
      setSuccess(err instanceof Error ? err.message : "Failed to place order");
      setOrderStatus("rejected");
    } finally {
      setOrderStatus("idle");
    }
  };

  if (!isAuthenticated) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Shopping Cart
      </h1>

      {status === "rejected" && error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">{error}</div>
      )}
      {success && (
        <div className={`p-3 text-sm rounded-md mb-4 ${success.includes("successfully") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
          {success}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="shadow-md border-0 hover:shadow-lg transition-shadow">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          dispatch(removeFromCart(item.productId));
                        } else {
                          dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity - 1 }));
                        }
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity + 1 }))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="font-semibold w-24 text-right">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                  <Button variant="destructive" size="sm" onClick={() => dispatch(removeFromCart(item.productId))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${Number(total).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handlePlaceOrder}
                disabled={orderStatus === "loading"}
              >
                {orderStatus === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Placing order...
                  </span>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
