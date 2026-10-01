"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCart, updateCartItem, removeFromCart, clearCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { CartItemCard } from "./_components/CartItemCard";
import { OrderSummary } from "./_components/OrderSummary";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [orderStatus, setOrderStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [busyIds, setBusyIds] = useState<number[]>([]);

  const setBusy = (productId: number, busy: boolean) => {
    setBusyIds((prev) => (busy ? [...prev, productId] : prev.filter((id) => id !== productId)));
  };

  const isBusy = (productId: number) => busyIds.includes(productId);

  const runItemAction = async (productId: number, action: () => Promise<unknown>) => {
    setBusy(productId, true);
    try {
      await action();
    } finally {
      setBusy(productId, false);
    }
  };

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
            <CartItemCard
              key={item.productId}
              item={item}
              busy={isBusy(item.productId)}
              onDecrement={() => {
                if (item.quantity <= 1) {
                  runItemAction(item.productId, () => dispatch(removeFromCart(item.productId)).unwrap());
                } else {
                  runItemAction(item.productId, () => dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity - 1 })).unwrap());
                }
              }}
              onIncrement={() => runItemAction(item.productId, () => dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity + 1 })).unwrap())}
              onRemove={() => runItemAction(item.productId, () => dispatch(removeFromCart(item.productId)).unwrap())}
            />
          ))}

          <OrderSummary
            total={total}
            placing={orderStatus === "loading"}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      )}
    </div>
  );
}
