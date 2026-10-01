"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { ProductImage } from "@/components/ProductImage";

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

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-zinc-500">Stock: {product.stock} units</p>
          </div>

          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${Number(product.price).toFixed(2)}
          </p>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-zinc-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="pt-4">
            {isAuthenticated ? (
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            ) : (
              <p className="text-sm text-zinc-500 text-center">
                <Link href="/login" className="text-blue-600 hover:underline">Login</Link> to add to cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
