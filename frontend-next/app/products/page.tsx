"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/productsSlice";
import { addToCart } from "@/store/cartSlice";
import { Spinner } from "@/components/Spinner";
import { ProductCard } from "./_components/ProductCard";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, status, error } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
    } finally {
      setAddingId(null);
    }
  };

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
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Products
      </h1>
      {products.length === 0 ? (
        <p className="text-zinc-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canBuy={isAuthenticated}
              adding={addingId === product.id}
              onAdd={() => handleAddToCart(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
