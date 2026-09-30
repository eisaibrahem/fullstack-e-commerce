"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders } from "@/store/ordersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { items: orders, status, error } = useAppSelector((state) => state.orders);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    dispatch(fetchOrders());
  }, [isAuthenticated, dispatch, router]);

  if (!isAuthenticated) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  if (status === "rejected") {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-zinc-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <span className="text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>Product #{item.productId} x{item.quantity}</span>
                      <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
