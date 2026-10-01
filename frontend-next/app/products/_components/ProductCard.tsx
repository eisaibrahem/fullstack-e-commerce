"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductImage } from "@/components/ProductImage";
import { Spinner } from "@/components/Spinner";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/store/productsSlice";

interface ProductCardProps {
  product: Product;
  canBuy: boolean;
  adding: boolean;
  onAdd: () => void;
}

export function ProductCard({ product, canBuy, adding, onAdd }: ProductCardProps) {
  return (
    <Card className="overflow-hidden pt-0! group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
      <div className="relative h-48 overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
          Stock: {product.stock}
        </div>
      </div>
      <CardHeader className="pb-2">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ${Number(product.price).toFixed(2)}
        </p>
      </CardContent>
      <CardFooter>
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
          <p className="text-sm text-zinc-500 w-full text-center">Login to add to cart</p>
        )}
      </CardFooter>
    </Card>
  );
}
