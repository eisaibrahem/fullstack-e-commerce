"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { Spinner } from "@/components/Spinner";
import { ShoppingCart } from "lucide-react";

interface ProductDetailsProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
}

interface ProductDetailsProps {
  product: ProductDetailsProduct;
  canBuy: boolean;
  adding: boolean;
  onAdd: () => void;
}

export function ProductDetails({ product, canBuy, adding, onAdd }: ProductDetailsProps) {
  return (
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
          {canBuy ? (
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={onAdd}
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
  );
}
