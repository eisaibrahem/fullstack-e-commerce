"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders } from "@/store/ordersSlice";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { ListPagination } from "@/components/ListPagination";
import { OrderCard } from "./_components/OrderCard";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { items: orders, meta, status, error } = useAppSelector((state) => state.orders);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    dispatch(fetchOrders({ page }));
  }, [isAuthenticated, dispatch, router, page]);

  if (!isAuthenticated) return null;

  if (status === "loading" && orders.length === 0) {
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
        <div className={`space-y-4 ${status === "loading" ? "opacity-60" : ""}`}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {meta && (
        <ListPagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          disabled={status === "loading"}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
