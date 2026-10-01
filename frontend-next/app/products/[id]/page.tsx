"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/cartSlice";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { ProductDetails } from "./_components/ProductDetails";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<Product>(`/products/${id}`)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  if (error || !product) {
    return <div className="text-center py-12 text-red-500">{error || "Product not found"}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <ProductDetails
        product={product}
        canBuy={isAuthenticated}
        adding={adding}
        onAdd={handleAddToCart}
      />
    </div>
  );
}
